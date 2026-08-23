import React, { useState } from 'react';
import {
  GamePhase,
  Player,
  RoundConfig,
  Challenge,
  BureauAssetKey,
  WhereInBritainChallenge,
  Top10Challenge,
  PutUpOrShutUpChallenge,
  TheListChallenge,
  ClosestWinsChallenge,
  RankItChallenge,
  ImageRevealChallenge,
  StopTheScoreChallenge
} from './types';

// Audio
import { sound } from './sound/audioEngine';

// Data
import { allChallenges } from './data/questions';
import { FINAL_CASES } from './data/finalCases';

// Components
import { BureauRoomBackdrop } from './components/common/BureauRoomBackdrop';
import { Header } from './components/common/Header';
import { AssetDrawer } from './components/common/AssetDrawer';

// Screens
import { TitleScreen } from './components/screens/TitleScreen';
import { SetupScreen } from './components/screens/SetupScreen';
import { SecretDirectivesScreen } from './components/screens/SecretDirectivesScreen';
import { RoomTransition } from './components/screens/RoomTransition';
import { AwardsPodium } from './components/screens/AwardsPodium';
import { BureauReviewModal } from './components/rounds/BureauReviewModal';

// Round Components
import { WhereInBritainRound } from './components/rounds/WhereInBritainRound';
import { Top10Round } from './components/rounds/Top10Round';
import { PutUpOrShutUpRound } from './components/rounds/PutUpOrShutUpRound';
import { TheListRound } from './components/rounds/TheListRound';
import { ClosestWinsRound } from './components/rounds/ClosestWinsRound';
import { RankItRound } from './components/rounds/RankItRound';
import { ImageRevealRound } from './components/rounds/ImageRevealRound';
import { StopTheScoreRound } from './components/rounds/StopTheScoreRound';
import { FinalCaseRound } from './components/rounds/FinalCaseRound';

// Each round explicitly declares how local players participate on one shared device.
const ROUND_DEFINITIONS: Array<Omit<RoundConfig, 'roundNumber' | 'challenge'>> = [
  {
    type: 'WHERE_IN_BRITAIN',
    participationMode: 'EVERYONE_TAKES_A_TURN',
    name: 'Where in Britain',
    roomName: 'Department of Ordnance & Cartography',
    roomTheme: 'Her Majesty’s land survey. Drop your pins with nautical and topographical precision.'
  },
  {
    type: 'TOP_10',
    participationMode: 'SHARED_ROTATION',
    name: 'Hall of Records: Top 10',
    roomName: 'Central Archival Repository',
    roomTheme: 'Name items from the official records. Rare entries award maximum merit.'
  },
  {
    type: 'PUT_UP_OR_SHUT_UP',
    participationMode: 'SHARED_ROTATION',
    name: 'Put Up or Shut Up',
    roomName: 'The High Bidding Chamber',
    roomTheme: 'Stake a claim on your capacity. Overreach will be met with immediate voiding of contract.'
  },
  {
    type: 'THE_LIST',
    participationMode: 'EVERYONE_TAKES_A_TURN',
    name: 'The List: Vault of Escalation',
    roomName: 'The Imperial Escalation Vault',
    roomTheme: 'Name items in succession. Bank points safely or risk complete forfeit for the next tier.'
  },
  {
    type: 'CLOSEST_WINS',
    participationMode: 'HIDDEN_SEQUENTIAL',
    name: 'Closest Wins',
    roomName: 'His Majesty’s Statistics Office',
    roomTheme: 'Confidential numerical estimates. Closeness to certified metric determines merit.'
  },
  {
    type: 'RANK_IT',
    participationMode: 'EVERYONE_TAKES_A_TURN',
    name: 'Rank It',
    roomName: 'Sequential Registry Division',
    roomTheme: 'Order the items according to historical, physical, or bureaucratic progression.'
  },
  {
    type: 'IMAGE_REVEAL',
    participationMode: 'EVERYONE_TAKES_A_TURN',
    name: 'Image Reveal',
    roomName: 'Visual Reconnaissance Ward',
    roomTheme: 'Identify the visual subject through the mechanical aperture before full clarification.'
  },
  {
    type: 'STOP_THE_SCORE',
    participationMode: 'EVERYONE_TAKES_A_TURN',
    name: 'Stop The Score',
    roomName: 'Confidence & Risk Chamber',
    roomTheme: 'Engage the volatile score machine, halt the needle on a high stake, and confirm your answer.'
  }
];

const clampPlayerCount = (count: number) => Math.max(1, Math.min(4, Math.round(count)));

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('TITLE');
  const [selectedPlayerCount, setSelectedPlayerCount] = useState(2);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [roundStarterIndex, setRoundStarterIndex] = useState(0);
  const [playersCompletedThisRound, setPlayersCompletedThisRound] = useState(0);
  const [usedChallengeIdsThisRound, setUsedChallengeIdsThisRound] = useState<string[]>([]);
  const [isAssetDrawerOpen, setIsAssetDrawerOpen] = useState(false);

  // Underdog Bureau Review State
  const [reviewEligiblePlayer, setReviewEligiblePlayer] = useState<Player | null>(null);

  // Active Challenge Cache
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);

  const currentRoundDefinition = ROUND_DEFINITIONS[currentRoundIndex % ROUND_DEFINITIONS.length];
  const activePlayerIndex = players.length > 0
    ? (roundStarterIndex + playersCompletedThisRound) % players.length
    : 0;
  const activePlayer = players[activePlayerIndex] || players[0];

  // 1. Start Game from Title
  const handleStartGame = (playerCount: number) => {
    sound.playStamp();
    setSelectedPlayerCount(clampPlayerCount(playerCount));
    setPhase('SETUP');
  };

  // 2. Complete Setup -> Directives
  const handleSetupComplete = (createdPlayers: Player[]) => {
    setPlayers(createdPlayers);
    setPhase('DIRECTIVES');
  };

  // Pick a question matching round type. Individual-turn rounds avoid repeating a
  // challenge within that round when the question bank contains enough choices.
  const pickRoundChallenge = (roundIdx: number, excludedIds: string[] = []): Challenge => {
    const roundDef = ROUND_DEFINITIONS[roundIdx % ROUND_DEFINITIONS.length];
    const matchingQuestions = allChallenges.filter(q => q.roundType === roundDef.type);
    const unusedQuestions = matchingQuestions.filter(q => !excludedIds.includes(q.id));
    const pool = unusedQuestions.length > 0 ? unusedQuestions : matchingQuestions;

    if (pool.length === 0) return allChallenges[0];
    return pool[Math.floor(Math.random() * pool.length)];
  };

  // 3. Complete Directives -> Round 1 Transition
  const handleDirectivesComplete = () => {
    const firstChallenge = pickRoundChallenge(0);
    setCurrentRoundIndex(0);
    setRoundStarterIndex(0);
    setPlayersCompletedThisRound(0);
    setCurrentChallenge(firstChallenge);
    setUsedChallengeIdsThisRound(firstChallenge ? [firstChallenge.id] : []);
    setPhase('ROOM_TRANSITION');
  };

  // 4. Enter Room from Transition
  const handleEnterRoom = () => {
    setPhase('PLAYING_ROUND');
  };

  // Asset Usage. Stage 1 preserves existing behaviour; gameplay effects are a later engine stage.
  const handleUseAsset = (assetType: BureauAssetKey) => {
    if (!activePlayer) return;

    sound.playStamp();
    setPlayers(prev => prev.map(p => {
      if (p.id === activePlayer.id) {
        return {
          ...p,
          assets: p.assets.filter(a => a !== assetType)
        };
      }
      return p;
    }));
  };

  const applyRoundResult = (
    basePlayers: Player[],
    scoreOrScores: number | Record<string, number>,
    extraData?: Record<string, unknown>
  ): Player[] => {
    const participantIds = typeof scoreOrScores === 'number'
      ? new Set(activePlayer ? [activePlayer.id] : [])
      : new Set(Object.keys(scoreOrScores));

    return basePlayers.map(p => {
      if (!participantIds.has(p.id)) return p;

      const earned = typeof scoreOrScores === 'number'
        ? (activePlayer?.id === p.id ? scoreOrScores : 0)
        : (scoreOrScores[p.id] ?? 0);

      const explicitCorrect = typeof extraData?.correct === 'boolean' && activePlayer?.id === p.id
        ? extraData.correct
        : undefined;
      const isSuccess = explicitCorrect ?? earned > 0;

      const mapDistance = currentRoundDefinition.type === 'WHERE_IN_BRITAIN' && activePlayer?.id === p.id && typeof extraData?.km === 'number'
        ? extraData.km
        : null;
      const estimateErrors = currentRoundDefinition.type === 'CLOSEST_WINS' && extraData?.errors && typeof extraData.errors === 'object'
        ? extraData.errors as Record<string, number>
        : null;
      const bankedItems = currentRoundDefinition.type === 'THE_LIST' && activePlayer?.id === p.id && typeof extraData?.banked === 'number'
        ? extraData.banked
        : null;
      const isStopTheScore = currentRoundDefinition.type === 'STOP_THE_SCORE' && activePlayer?.id === p.id;

      return {
        ...p,
        score: p.score + earned,
        stats: {
          ...p.stats,
          roundsPlayed: p.stats.roundsPlayed + 1,
          correctAnswers: isSuccess ? p.stats.correctAnswers + 1 : p.stats.correctAnswers,
          totalAnswers: p.stats.totalAnswers + 1,
          bestScore: Math.max(p.stats.bestScore, earned),
          worstScore: Math.min(p.stats.worstScore, earned),
          mapDistancesKm: mapDistance !== null ? [...p.stats.mapDistancesKm, mapDistance] : p.stats.mapDistancesKm,
          estimateErrorsPercent: estimateErrors?.[p.id] !== undefined
            ? [...p.stats.estimateErrorsPercent, estimateErrors[p.id]]
            : p.stats.estimateErrorsPercent,
          risksTaken: isStopTheScore ? p.stats.risksTaken + 1 : p.stats.risksTaken,
          successfulRisks: isStopTheScore && isSuccess ? p.stats.successfulRisks + 1 : p.stats.successfulRisks,
          highestBankedList: bankedItems !== null ? Math.max(p.stats.highestBankedList, earned) : p.stats.highestBankedList,
          categoriesAttempted: currentChallenge
            ? new Set([...p.stats.categoriesAttempted, currentChallenge.category])
            : p.stats.categoriesAttempted
        }
      };
    });
  };

  const completeFullRound = (updatedPlayers: Player[]) => {
    // Check for Underdog Comeback Review only after the whole round is complete.
    const scores = updatedPlayers.map(p => p.score);
    const maxScore = Math.max(...scores, 0);
    const minScore = Math.min(...scores, 0);
    const trailing = updatedPlayers.find(p => p.score === minScore);

    if (updatedPlayers.length > 1 && currentRoundIndex >= 2 && (maxScore - minScore) >= 1200 && trailing) {
      setReviewEligiblePlayer(trailing);
    } else {
      advanceToNextRound();
    }
  };

  // Round Completion Callback
  const handleRoundComplete = (
    scoreOrScores: number | Record<string, number>,
    extraData?: Record<string, unknown>
  ) => {
    sound.playBrassChime();

    const updatedPlayers = applyRoundResult(players, scoreOrScores, extraData);
    setPlayers(updatedPlayers);

    // Individual-turn rounds remain in the same room until every player has had
    // an equivalent attempt. A fresh same-type challenge is selected per player.
    if (
      currentRoundDefinition.participationMode === 'EVERYONE_TAKES_A_TURN' &&
      playersCompletedThisRound + 1 < players.length
    ) {
      const nextCompletedCount = playersCompletedThisRound + 1;
      const nextChallenge = pickRoundChallenge(currentRoundIndex, usedChallengeIdsThisRound);

      setPlayersCompletedThisRound(nextCompletedCount);
      setCurrentChallenge(nextChallenge);
      setUsedChallengeIdsThisRound(prev => nextChallenge ? [...prev, nextChallenge.id] : prev);
      return;
    }

    completeFullRound(updatedPlayers);
  };

  // Bureau Review Resolution
  const handleResolveBureauReview = (_optionType: 'SAFE' | 'RISKY' | 'QUESTIONABLE', bonus: number) => {
    if (reviewEligiblePlayer) {
      setPlayers(prev => prev.map(p => {
        if (p.id === reviewEligiblePlayer.id) {
          return {
            ...p,
            score: p.score + bonus
          };
        }
        return p;
      }));
    }
    setReviewEligiblePlayer(null);
    advanceToNextRound();
  };

  const advanceToNextRound = () => {
    const nextRound = currentRoundIndex + 1;
    if (nextRound >= ROUND_DEFINITIONS.length) {
      setPhase('FINAL_CASE');
      return;
    }

    const nextStarter = players.length > 0 ? nextRound % players.length : 0;
    const nextChallenge = pickRoundChallenge(nextRound);

    setCurrentRoundIndex(nextRound);
    setRoundStarterIndex(nextStarter);
    setPlayersCompletedThisRound(0);
    setCurrentChallenge(nextChallenge);
    setUsedChallengeIdsThisRound(nextChallenge ? [nextChallenge.id] : []);
    setPhase('ROOM_TRANSITION');
  };

  // Final Case Completion
  const handleFinalCaseComplete = (playerBonuses: Record<string, number>) => {
    sound.playVictoryFanfare();
    setPlayers(prev => prev.map(p => ({
      ...p,
      score: p.score + (playerBonuses[p.id] || 0)
    })));
    setPhase('PODIUM');
  };

  // Reset / Play Again
  const handlePlayAgain = () => {
    setPhase('TITLE');
    setSelectedPlayerCount(2);
    setPlayers([]);
    setCurrentRoundIndex(0);
    setRoundStarterIndex(0);
    setPlayersCompletedThisRound(0);
    setUsedChallengeIdsThisRound([]);
    setCurrentChallenge(null);
    setReviewEligiblePlayer(null);
  };

  const currentRoundConfig: RoundConfig = {
    roundNumber: currentRoundIndex + 1,
    type: currentRoundDefinition.type,
    participationMode: currentRoundDefinition.participationMode,
    name: currentRoundDefinition.name,
    roomName: currentRoundDefinition.roomName,
    roomTheme: currentRoundDefinition.roomTheme
  };

  const roundInstanceKey = currentChallenge
    ? `${currentRoundIndex}-${activePlayer?.id ?? 'shared'}-${currentChallenge.id}`
    : `${currentRoundIndex}-empty`;

  return (
    <BureauRoomBackdrop roomName={currentRoundConfig.roomName}>
      {/* Top Header Bar */}
      <Header
        roundConfig={phase === 'TITLE' || phase === 'SETUP' ? undefined : currentRoundConfig}
        totalRounds={ROUND_DEFINITIONS.length}
        players={players}
        currentPlayerIndex={activePlayerIndex}
        onOpenAssets={() => setIsAssetDrawerOpen(true)}
        canReview={!!reviewEligiblePlayer}
        onTriggerReview={() => {}}
      />

      {/* Main Play Area */}
      <main className="w-full flex-1 flex flex-col justify-center py-4 px-2 sm:px-4">
        {phase === 'TITLE' && <TitleScreen onStartGame={handleStartGame} />}

        {phase === 'SETUP' && (
          <SetupScreen
            playerCount={selectedPlayerCount}
            onProceedToDirectives={handleSetupComplete}
          />
        )}

        {phase === 'DIRECTIVES' && (
          <SecretDirectivesScreen
            players={players}
            onFinishDirectives={handleDirectivesComplete}
          />
        )}

        {phase === 'ROOM_TRANSITION' && (
          <RoomTransition
            roundConfig={currentRoundConfig}
            totalRounds={ROUND_DEFINITIONS.length}
            onEnterRoom={handleEnterRoom}
          />
        )}

        {phase === 'PLAYING_ROUND' && currentChallenge && activePlayer && (
          <div className="w-full flex flex-col items-center">
            {currentChallenge.roundType === 'WHERE_IN_BRITAIN' && (
              <WhereInBritainRound
                key={roundInstanceKey}
                challenge={currentChallenge as WhereInBritainChallenge}
                currentPlayer={activePlayer}
                onComplete={(score, km) => handleRoundComplete(score, { km })}
              />
            )}

            {currentChallenge.roundType === 'TOP_10' && (
              <Top10Round
                key={`${currentRoundIndex}-${currentChallenge.id}`}
                challenge={currentChallenge as Top10Challenge}
                players={players}
                currentPlayerIndex={roundStarterIndex}
                onCompleteRound={(scores) => handleRoundComplete(scores)}
              />
            )}

            {currentChallenge.roundType === 'PUT_UP_OR_SHUT_UP' && (
              <PutUpOrShutUpRound
                key={`${currentRoundIndex}-${currentChallenge.id}`}
                challenge={currentChallenge as PutUpOrShutUpChallenge}
                players={players}
                currentPlayerIndex={roundStarterIndex}
                onComplete={(winnerId, score) => handleRoundComplete({ [winnerId]: score })}
              />
            )}

            {currentChallenge.roundType === 'THE_LIST' && (
              <TheListRound
                key={roundInstanceKey}
                challenge={currentChallenge as TheListChallenge}
                currentPlayer={activePlayer}
                onComplete={(score, banked) => handleRoundComplete(score, { banked })}
              />
            )}

            {currentChallenge.roundType === 'CLOSEST_WINS' && (
              <ClosestWinsRound
                key={`${currentRoundIndex}-${currentChallenge.id}`}
                challenge={currentChallenge as ClosestWinsChallenge}
                players={players}
                onCompleteRound={(scores, errors) => handleRoundComplete(scores, { errors })}
              />
            )}

            {currentChallenge.roundType === 'RANK_IT' && (
              <RankItRound
                key={roundInstanceKey}
                challenge={currentChallenge as RankItChallenge}
                currentPlayer={activePlayer}
                onComplete={(score) => handleRoundComplete(score)}
              />
            )}

            {currentChallenge.roundType === 'IMAGE_REVEAL' && (
              <ImageRevealRound
                key={roundInstanceKey}
                challenge={currentChallenge as ImageRevealChallenge}
                currentPlayer={activePlayer}
                onComplete={(score) => handleRoundComplete(score)}
              />
            )}

            {currentChallenge.roundType === 'STOP_THE_SCORE' && (
              <StopTheScoreRound
                key={roundInstanceKey}
                challenge={currentChallenge as StopTheScoreChallenge}
                currentPlayer={activePlayer}
                onComplete={(score, correct) => handleRoundComplete(score, { correct })}
              />
            )}
          </div>
        )}

        {phase === 'FINAL_CASE' && (
          <FinalCaseRound
            finalCase={FINAL_CASES[0]}
            players={players}
            onCompleteCase={handleFinalCaseComplete}
          />
        )}

        {phase === 'PODIUM' && (
          <AwardsPodium
            players={players}
            onPlayAgain={handlePlayAgain}
          />
        )}
      </main>

      {/* Bureau Assets Drawer */}
      {activePlayer && (
        <AssetDrawer
          isOpen={isAssetDrawerOpen}
          activePlayer={activePlayer}
          onClose={() => setIsAssetDrawerOpen(false)}
          onUseAsset={handleUseAsset}
        />
      )}

      {/* Underdog Bureau Review Modal */}
      {reviewEligiblePlayer && (
        <BureauReviewModal
          trailingPlayer={reviewEligiblePlayer}
          onSelectOption={handleResolveBureauReview}
          onClose={() => {
            setReviewEligiblePlayer(null);
            advanceToNextRound();
          }}
        />
      )}
    </BureauRoomBackdrop>
  );
}
