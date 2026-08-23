import React, { useState, useEffect } from 'react';
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

// Built-in sequence of 8 Bureau rounds
const ROUND_DEFINITIONS: Array<{ type: RoundConfig['type']; name: string; roomName: string; roomTheme: string }> = [
  {
    type: 'WHERE_IN_BRITAIN',
    name: 'Where in Britain',
    roomName: 'Department of Ordnance & Cartography',
    roomTheme: 'Her Majesty’s land survey. Drop your pins with nautical and topographical precision.'
  },
  {
    type: 'TOP_10',
    name: 'Hall of Records: Top 10',
    roomName: 'Central Archival Repository',
    roomTheme: 'Name items from the official records. Rare entries award maximum merit.'
  },
  {
    type: 'PUT_UP_OR_SHUT_UP',
    name: 'Put Up or Shut Up',
    roomName: 'The High Bidding Chamber',
    roomTheme: 'Stake a claim on your capacity. Overreach will be met with immediate voiding of contract.'
  },
  {
    type: 'THE_LIST',
    name: 'The List: Vault of Escalation',
    roomName: 'The Imperial Escalation Vault',
    roomTheme: 'Name items in succession. Bank points safely or risk complete forfeit for the next tier.'
  },
  {
    type: 'CLOSEST_WINS',
    name: 'Closest Wins',
    roomName: 'His Majesty’s Statistics Office',
    roomTheme: 'Confidential numerical estimates. Closeness to certified metric determines merit.'
  },
  {
    type: 'RANK_IT',
    name: 'Rank It',
    roomName: 'Sequential Registry Division',
    roomTheme: 'Order the items according to historical, physical, or bureaucratic progression.'
  },
  {
    type: 'IMAGE_REVEAL',
    name: 'Image Reveal',
    roomName: 'Visual Reconnaissance Ward',
    roomTheme: 'Identify the visual subject through the mechanical aperture before full clarification.'
  },
  {
    type: 'STOP_THE_SCORE',
    name: 'Stop The Score',
    roomName: 'Confidence & Risk Chamber',
    roomTheme: 'Engage the volatile score machine, halt the needle on a high stake, and confirm your answer.'
  }
];

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('TITLE');
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [currentPlayerTurnIndex, setCurrentPlayerTurnIndex] = useState(0);
  const [isAssetDrawerOpen, setIsAssetDrawerOpen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Underdog Bureau Review State
  const [reviewEligiblePlayer, setReviewEligiblePlayer] = useState<Player | null>(null);

  // Active Challenge Cache
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);

  // Toggle Mute
  const handleToggleMute = () => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    sound.setMuted(next);
  };

  // 1. Start Game from Title
  const handleStartGame = (playerCount: number) => {
    sound.playStamp();
    setPhase('SETUP');
  };

  // 2. Complete Setup -> Directives
  const handleSetupComplete = (createdPlayers: Player[]) => {
    setPlayers(createdPlayers);
    setPhase('DIRECTIVES');
  };

  // 3. Complete Directives -> Round 1 Transition
  const handleDirectivesComplete = () => {
    setCurrentRoundIndex(0);
    setCurrentPlayerTurnIndex(0);
    prepareRoundChallenge(0);
    setPhase('ROOM_TRANSITION');
  };

  // Pick question matching round type
  const prepareRoundChallenge = (roundIdx: number) => {
    const roundDef = ROUND_DEFINITIONS[roundIdx % ROUND_DEFINITIONS.length];
    const matchingQuestions = allChallenges.filter(q => q.roundType === roundDef.type);
    const chosen = matchingQuestions.length > 0
      ? matchingQuestions[Math.floor(Math.random() * matchingQuestions.length)]
      : allChallenges[0];
    setCurrentChallenge(chosen);
  };

  // 4. Enter Room from Transition
  const handleEnterRoom = () => {
    setPhase('PLAYING_ROUND');
  };

  // Asset Usage
  const handleUseAsset = (assetType: BureauAssetKey) => {
    sound.playStamp();
    const activeP = players[currentPlayerTurnIndex % players.length];
    setPlayers(prev => prev.map(p => {
      if (p.id === activeP.id) {
        return {
          ...p,
          assets: p.assets.filter(a => a !== assetType)
        };
      }
      return p;
    }));
  };

  // Round Completion Callback
  const handleRoundComplete = (scoreOrScores: number | Record<string, number>, extraData?: any) => {
    sound.playBrassChime();

    // Update Player Scores and Stats
    setPlayers(prev => {
      const activeP = prev[currentPlayerTurnIndex % prev.length];
      return prev.map(p => {
        let earned = 0;
        if (typeof scoreOrScores === 'number') {
          if (p.id === activeP.id) earned = scoreOrScores;
        } else if (typeof scoreOrScores === 'object' && scoreOrScores[p.id] !== undefined) {
          earned = scoreOrScores[p.id];
        }

        const isSuccess = earned > 0;
        return {
          ...p,
          score: p.score + earned,
          stats: {
            ...p.stats,
            roundsPlayed: p.stats.roundsPlayed + 1,
            correctAnswers: isSuccess ? p.stats.correctAnswers + 1 : p.stats.correctAnswers,
            totalAnswers: p.stats.totalAnswers + 1,
            bestScore: Math.max(p.stats.bestScore, earned),
            worstScore: Math.min(p.stats.worstScore, earned)
          }
        };
      });
    });

    // Check for Underdog Comeback Review:
    // If round >= 2 and maxScore - minScore > 1000 and player count > 1
    const scores = players.map(p => p.score);
    const maxScore = Math.max(...scores, 0);
    const minScore = Math.min(...scores, 0);

    const trailing = players.find(p => p.score === minScore);
    if (players.length > 1 && currentRoundIndex >= 2 && (maxScore - minScore) >= 1200 && trailing) {
      setReviewEligiblePlayer(trailing);
    } else {
      advanceToNextRound();
    }
  };

  // Bureau Review Resolution
  const handleResolveBureauReview = (optionType: 'SAFE' | 'RISKY' | 'QUESTIONABLE', bonus: number) => {
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
      // Advance to Final Grand Chamber Case
      setPhase('FINAL_CASE');
    } else {
      setCurrentRoundIndex(nextRound);
      setCurrentPlayerTurnIndex(prev => prev + 1);
      prepareRoundChallenge(nextRound);
      setPhase('ROOM_TRANSITION');
    }
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
    setPlayers([]);
    setCurrentRoundIndex(0);
    setCurrentPlayerTurnIndex(0);
  };

  const activePlayer = players[currentPlayerTurnIndex % (players.length || 1)] || players[0];
  const currentRoundConfig: RoundConfig = {
    roundNumber: currentRoundIndex + 1,
    type: ROUND_DEFINITIONS[currentRoundIndex % ROUND_DEFINITIONS.length].type,
    name: ROUND_DEFINITIONS[currentRoundIndex % ROUND_DEFINITIONS.length].name,
    roomName: ROUND_DEFINITIONS[currentRoundIndex % ROUND_DEFINITIONS.length].roomName,
    roomTheme: ROUND_DEFINITIONS[currentRoundIndex % ROUND_DEFINITIONS.length].roomTheme
  };

  return (
    <BureauRoomBackdrop roomName={currentRoundConfig.roomName}>
      {/* Top Header Bar */}
      <Header
        roundConfig={phase === 'TITLE' || phase === 'SETUP' ? undefined : currentRoundConfig}
        totalRounds={ROUND_DEFINITIONS.length}
        players={players}
        currentPlayerIndex={currentPlayerTurnIndex % (players.length || 1)}
        onOpenAssets={() => setIsAssetDrawerOpen(true)}
        canReview={!!reviewEligiblePlayer}
        onTriggerReview={() => {}}
      />

      {/* Main Play Area */}
      <main className="w-full flex-1 flex flex-col justify-center py-4 px-2 sm:px-4">
        {phase === 'TITLE' && <TitleScreen onStartGame={handleStartGame} />}

        {phase === 'SETUP' && (
          <SetupScreen
            playerCount={players.length || 2}
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

        {phase === 'PLAYING_ROUND' && currentChallenge && (
          <div className="w-full flex flex-col items-center">
            {currentChallenge.type === 'WHERE_IN_BRITAIN' && (
              <WhereInBritainRound
                challenge={currentChallenge as WhereInBritainChallenge}
                currentPlayer={activePlayer}
                onComplete={(score, km) => handleRoundComplete(score, { km })}
              />
            )}

            {currentChallenge.type === 'TOP_10' && (
              <Top10Round
                challenge={currentChallenge as Top10Challenge}
                players={players}
                currentPlayerIndex={currentPlayerTurnIndex}
                onCompleteRound={(scores) => handleRoundComplete(scores)}
              />
            )}

            {currentChallenge.type === 'PUT_UP_OR_SHUT_UP' && (
              <PutUpOrShutUpRound
                challenge={currentChallenge as PutUpOrShutUpChallenge}
                players={players}
                currentPlayerIndex={currentPlayerTurnIndex}
                onComplete={(winnerId, score) => handleRoundComplete({ [winnerId]: score })}
              />
            )}

            {currentChallenge.type === 'THE_LIST' && (
              <TheListRound
                challenge={currentChallenge as TheListChallenge}
                currentPlayer={activePlayer}
                onComplete={(score, banked) => handleRoundComplete(score, { banked })}
              />
            )}

            {currentChallenge.type === 'CLOSEST_WINS' && (
              <ClosestWinsRound
                challenge={currentChallenge as ClosestWinsChallenge}
                players={players}
                onCompleteRound={(scores, errors) => handleRoundComplete(scores, { errors })}
              />
            )}

            {currentChallenge.type === 'RANK_IT' && (
              <RankItRound
                challenge={currentChallenge as RankItChallenge}
                currentPlayer={activePlayer}
                onComplete={(score) => handleRoundComplete(score)}
              />
            )}

            {currentChallenge.type === 'IMAGE_REVEAL' && (
              <ImageRevealRound
                challenge={currentChallenge as ImageRevealChallenge}
                currentPlayer={activePlayer}
                onComplete={(score) => handleRoundComplete(score)}
              />
            )}

            {currentChallenge.type === 'STOP_THE_SCORE' && (
              <StopTheScoreRound
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
