import React, { useState } from 'react';
import {
  GamePhase,
  Player,
  RoundConfig,
  Challenge,
  BureauAssetKey,
  HiddenCommendation,
  WhereInBritainChallenge,
  Top10Challenge,
  PutUpOrShutUpChallenge,
  TheListChallenge,
  ClosestWinsChallenge,
  RankItChallenge,
  ImageRevealChallenge,
  StopTheScoreChallenge
} from './types';
import { sound } from './sound/audioEngine';
import { allChallenges } from './data/questions';
import { FINAL_CASES } from './data/finalCases';
import { selectSecretCommendations, type ScoreSnapshot } from './data/commendations';
import { BureauRoomBackdrop } from './components/common/BureauRoomBackdrop';
import { Header } from './components/common/Header';
import { AssetDrawer } from './components/common/AssetDrawer';
import { TitleScreen } from './components/screens/TitleScreen';
import { SetupScreen } from './components/screens/SetupScreen';
import { SecretDirectivesScreen } from './components/screens/SecretDirectivesScreen';
import { RoomTransition } from './components/screens/RoomTransition';
import { AwardsPodium } from './components/screens/AwardsPodium';
import { BureauReviewModal } from './components/rounds/BureauReviewModal';
import { WhereInBritainRound } from './components/rounds/WhereInBritainRound';
import { Top10Round } from './components/rounds/Top10Round';
import { PutUpOrShutUpRound } from './components/rounds/PutUpOrShutUpRound';
import { TheListRound } from './components/rounds/TheListRound';
import { ClosestWinsRound } from './components/rounds/ClosestWinsRound';
import { RankItRound } from './components/rounds/RankItRound';
import { ImageRevealRound } from './components/rounds/ImageRevealRound';
import { StopTheScoreRound } from './components/rounds/StopTheScoreRound';
import { FinalCaseRound } from './components/rounds/FinalCaseRound';

const ROUND_DEFINITIONS: Array<Omit<RoundConfig, 'roundNumber' | 'challenge'>> = [
  { type: 'WHERE_IN_BRITAIN', participationMode: 'EVERYONE_TAKES_A_TURN', name: 'Where in the UK?', roomName: 'Department of Ordnance & Cartography', roomTheme: 'Real geography. No labels. No excuses.' },
  { type: 'TOP_10', participationMode: 'SHARED_ROTATION', name: 'Hall of Records: Top 10', roomName: 'Central Archival Repository', roomTheme: 'Name entries from the official records. Obscurity is financially rewarded.' },
  { type: 'PUT_UP_OR_SHUT_UP', participationMode: 'SHARED_ROTATION', name: 'Put Up or Shut Up', roomName: 'The High Bidding Chamber', roomTheme: 'Make a claim, then discover whether confidence was justified.' },
  { type: 'THE_LIST', participationMode: 'EVERYONE_TAKES_A_TURN', name: 'The List', roomName: 'The Escalation Vault', roomTheme: 'Bank safely or continue until knowledge runs out before nerve does.' },
  { type: 'CLOSEST_WINS', participationMode: 'HIDDEN_SEQUENTIAL', name: 'Closest Wins', roomName: 'The Statistics Office', roomTheme: 'Confidential estimates. Reality will eventually be consulted.' },
  { type: 'RANK_IT', participationMode: 'EVERYONE_TAKES_A_TURN', name: 'Rank It', roomName: 'Sequential Registry Division', roomTheme: 'Put things in the correct order, which is apparently harder than it sounds.' },
  { type: 'IMAGE_REVEAL', participationMode: 'EVERYONE_TAKES_A_TURN', name: 'Image Reveal', roomName: 'Visual Reconnaissance Ward', roomTheme: 'Identify the subject before the machine has to make it embarrassingly obvious.' },
  { type: 'STOP_THE_SCORE', participationMode: 'EVERYONE_TAKES_A_TURN', name: 'Stop The Score', roomName: 'Confidence & Risk Chamber', roomTheme: 'Choose exactly how expensive your confidence is about to become.' }
];

const clampPlayerCount = (count: number) => Math.max(1, Math.min(4, Math.round(count)));

type ExtendedStats = Player['stats'] & {
  challengeScores?: number[];
  mapScores?: number[];
  successfulListBanks?: number[];
  categoryScores?: Record<string, number[]>;
  assetsUsed?: string[];
};

type ArmedAssetState = Record<string, BureauAssetKey[]>;

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('TITLE');
  const [selectedPlayerCount, setSelectedPlayerCount] = useState(2);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [roundStarterIndex, setRoundStarterIndex] = useState(0);
  const [playersCompletedThisRound, setPlayersCompletedThisRound] = useState(0);
  const [usedChallengeIdsThisRound, setUsedChallengeIdsThisRound] = useState<string[]>([]);
  const [isAssetDrawerOpen, setIsAssetDrawerOpen] = useState(false);
  const [armedAssets, setArmedAssets] = useState<ArmedAssetState>({});
  const [priorityStarterPlayerId, setPriorityStarterPlayerId] = useState<string | null>(null);
  const [assetNotice, setAssetNotice] = useState<string | null>(null);
  const [reviewEligiblePlayer, setReviewEligiblePlayer] = useState<Player | null>(null);
  const [bureauReviewUsed, setBureauReviewUsed] = useState(false);
  const [hiddenCommendations, setHiddenCommendations] = useState<HiddenCommendation[]>([]);
  const [scoreHistory, setScoreHistory] = useState<ScoreSnapshot[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);

  const currentRoundDefinition = ROUND_DEFINITIONS[currentRoundIndex % ROUND_DEFINITIONS.length];
  const activePlayerIndex = players.length > 0 ? (roundStarterIndex + playersCompletedThisRound) % players.length : 0;
  const activePlayer = players[activePlayerIndex] || players[0];

  const handleStartGame = (playerCount: number) => {
    sound.playStamp();
    setSelectedPlayerCount(clampPlayerCount(playerCount));
    setPhase('SETUP');
  };

  const handleSetupComplete = (createdPlayers: Player[]) => {
    setPlayers(createdPlayers);
    setHiddenCommendations(createdPlayers.length > 1 ? selectSecretCommendations(2) : []);
    setScoreHistory([]);
    setArmedAssets({});
    setBureauReviewUsed(false);
    setPriorityStarterPlayerId(null);
    setPhase('DIRECTIVES');
  };

  const pickRoundChallenge = (roundIdx: number, excludedIds: string[] = []): Challenge => {
    const roundDef = ROUND_DEFINITIONS[roundIdx % ROUND_DEFINITIONS.length];
    const matching = allChallenges.filter(q => q.roundType === roundDef.type);
    const unused = matching.filter(q => !excludedIds.includes(q.id));
    const pool = unused.length > 0 ? unused : matching;
    return pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : allChallenges[0];
  };

  const handleDirectivesComplete = () => {
    const firstChallenge = pickRoundChallenge(0);
    setCurrentRoundIndex(0);
    setRoundStarterIndex(0);
    setPlayersCompletedThisRound(0);
    setCurrentChallenge(firstChallenge);
    setUsedChallengeIdsThisRound(firstChallenge ? [firstChallenge.id] : []);
    setPhase('ROOM_TRANSITION');
  };

  const handleEnterRoom = () => setPhase('PLAYING_ROUND');

  const removeOwnedAsset = (playerId: string, assetType: BureauAssetKey) => {
    setPlayers(prev => prev.map(player => {
      if (player.id !== playerId) return player;
      const removedIndex = player.assets.indexOf(assetType);
      const nextAssets = [...player.assets];
      if (removedIndex >= 0) nextAssets.splice(removedIndex, 1);
      const stats = player.stats as ExtendedStats;
      return {
        ...player,
        assets: nextAssets,
        stats: { ...stats, assetsUsed: [...(stats.assetsUsed ?? []), assetType] }
      };
    }));
  };

  const armAsset = (playerId: string, assetType: BureauAssetKey) => {
    setArmedAssets(prev => ({ ...prev, [playerId]: [...(prev[playerId] ?? []), assetType] }));
  };

  const clearArmedAsset = (playerId: string, assetType: BureauAssetKey) => {
    setArmedAssets(prev => ({
      ...prev,
      [playerId]: (prev[playerId] ?? []).filter(asset => asset !== assetType)
    }));
  };

  const handleUseAsset = (assetType: BureauAssetKey) => {
    if (!activePlayer || phase !== 'PLAYING_ROUND') return;
    sound.playStamp();
    setAssetNotice(null);

    if (assetType === 'REFILE') {
      const replacement = pickRoundChallenge(currentRoundIndex, [...usedChallengeIdsThisRound, currentChallenge?.id ?? '']);
      removeOwnedAsset(activePlayer.id, assetType);
      setCurrentChallenge(replacement);
      setUsedChallengeIdsThisRound(prev => [...prev, replacement.id]);
      setAssetNotice(`${activePlayer.name} refiled the challenge. The Bureau has reluctantly found another one.`);
      setIsAssetDrawerOpen(false);
      return;
    }

    if (assetType === 'PRIORITY_ACCESS') {
      removeOwnedAsset(activePlayer.id, assetType);
      setPriorityStarterPlayerId(activePlayer.id);
      setAssetNotice(`${activePlayer.name} will start the next round. Bureaucracy has briefly rewarded queue-jumping.`);
      setIsAssetDrawerOpen(false);
      return;
    }

    armAsset(activePlayer.id, assetType);
    removeOwnedAsset(activePlayer.id, assetType);
    setAssetNotice(`${activePlayer.name} armed ${assetType.replaceAll('_', ' ')} for the next applicable result.`);
    setIsAssetDrawerOpen(false);
  };

  const resolveScoresWithAssets = (
    scoreOrScores: number | Record<string, number>,
    extraData?: Record<string, unknown>
  ) => {
    const baseScores: Record<string, number> = typeof scoreOrScores === 'number'
      ? (activePlayer ? { [activePlayer.id]: scoreOrScores } : {})
      : { ...scoreOrScores };
    const finalScores = { ...baseScores };
    const assetBonuses: Record<string, number> = {};

    Object.entries(baseScores).forEach(([playerId, baseScore]) => {
      const armed = armedAssets[playerId] ?? [];
      if (baseScore > 0 && armed.includes('SECOND_OPINION')) {
        const bonus = Math.min(120, Math.round(baseScore * 0.15));
        finalScores[playerId] += bonus;
        assetBonuses[playerId] = (assetBonuses[playerId] || 0) + bonus;
        clearArmedAsset(playerId, 'SECOND_OPINION');
      }
      if (baseScore > 0 && armed.includes('DOUBLE_ENTRY')) {
        const bonus = Math.min(750, Math.round(baseScore * 0.75));
        finalScores[playerId] += bonus;
        assetBonuses[playerId] = (assetBonuses[playerId] || 0) + bonus;
        clearArmedAsset(playerId, 'DOUBLE_ENTRY');
      }
      if (baseScore === 0 && armed.includes('INSURANCE')) {
        const riskedValue = typeof extraData?.riskedValue === 'number' ? extraData.riskedValue : 0;
        const payout = Math.max(150, Math.round(riskedValue * 0.35));
        finalScores[playerId] += payout;
        assetBonuses[playerId] = (assetBonuses[playerId] || 0) + payout;
        clearArmedAsset(playerId, 'INSURANCE');
      }
    });

    if (currentRoundDefinition.participationMode === 'EVERYONE_TAKES_A_TURN') {
      const scoringOpponent = Object.entries(baseScores).find(([, score]) => score > 0);
      if (scoringOpponent) {
        const [victimId, victimBase] = scoringOpponent;
        const interceptor = players.find(player => player.id !== victimId && (armedAssets[player.id] ?? []).includes('INTERCEPT'));
        if (interceptor) {
          const transfer = Math.max(1, Math.round(victimBase * 0.20));
          finalScores[victimId] = Math.max(0, finalScores[victimId] - transfer);
          finalScores[interceptor.id] = (finalScores[interceptor.id] || 0) + transfer;
          assetBonuses[interceptor.id] = (assetBonuses[interceptor.id] || 0) + transfer;
          clearArmedAsset(interceptor.id, 'INTERCEPT');
        }
      }
    }

    return { baseScores, finalScores, assetBonuses };
  };

  const applyRoundResult = (
    basePlayers: Player[],
    scoreOrScores: number | Record<string, number>,
    extraData?: Record<string, unknown>
  ): Player[] => {
    const { baseScores, finalScores } = resolveScoresWithAssets(scoreOrScores, extraData);
    const participantIds = new Set(Object.keys(baseScores));

    return basePlayers.map(player => {
      const finalEarned = finalScores[player.id] ?? 0;
      const baseEarned = baseScores[player.id];
      const interceptedOnly = !participantIds.has(player.id) && finalEarned > 0;
      if (!participantIds.has(player.id) && !interceptedOnly) return player;

      const stats = player.stats as ExtendedStats;
      if (interceptedOnly) {
        return {
          ...player,
          score: player.score + finalEarned,
          stats: { ...stats, interceptCount: stats.interceptCount + 1 }
        };
      }

      const explicitCorrect = typeof extraData?.correct === 'boolean' && activePlayer?.id === player.id ? extraData.correct : undefined;
      const isSuccess = explicitCorrect ?? (baseEarned ?? 0) > 0;
      const mapDistance = currentRoundDefinition.type === 'WHERE_IN_BRITAIN' && activePlayer?.id === player.id && typeof extraData?.km === 'number' ? extraData.km : null;
      const estimateErrors = currentRoundDefinition.type === 'CLOSEST_WINS' && extraData?.errors && typeof extraData.errors === 'object' ? extraData.errors as Record<string, number> : null;
      const isList = currentRoundDefinition.type === 'THE_LIST' && activePlayer?.id === player.id;
      const listBanked = isList && isSuccess ? finalEarned : null;
      const isStopTheScore = currentRoundDefinition.type === 'STOP_THE_SCORE' && activePlayer?.id === player.id;
      const category = currentChallenge?.category;
      const categoryScores = { ...(stats.categoryScores ?? {}) };
      if (category) categoryScores[category] = [...(categoryScores[category] ?? []), baseEarned ?? 0];

      return {
        ...player,
        score: Math.max(0, player.score + finalEarned),
        stats: {
          ...stats,
          roundsPlayed: stats.roundsPlayed + 1,
          correctAnswers: isSuccess ? stats.correctAnswers + 1 : stats.correctAnswers,
          totalAnswers: stats.totalAnswers + 1,
          bestScore: Math.max(stats.bestScore, baseEarned ?? 0),
          worstScore: Math.min(stats.worstScore, baseEarned ?? 0),
          mapDistancesKm: mapDistance !== null ? [...stats.mapDistancesKm, mapDistance] : stats.mapDistancesKm,
          estimateErrorsPercent: estimateErrors?.[player.id] !== undefined ? [...stats.estimateErrorsPercent, estimateErrors[player.id]] : stats.estimateErrorsPercent,
          risksTaken: isStopTheScore ? stats.risksTaken + 1 : stats.risksTaken,
          successfulRisks: isStopTheScore && isSuccess ? stats.successfulRisks + 1 : stats.successfulRisks,
          highestBankedList: listBanked !== null ? Math.max(stats.highestBankedList, listBanked) : stats.highestBankedList,
          categoriesAttempted: category ? new Set([...stats.categoriesAttempted, category]) : stats.categoriesAttempted,
          challengeScores: [...(stats.challengeScores ?? []), baseEarned ?? 0],
          mapScores: currentRoundDefinition.type === 'WHERE_IN_BRITAIN' ? [...(stats.mapScores ?? []), baseEarned ?? 0] : (stats.mapScores ?? []),
          successfulListBanks: listBanked !== null ? [...(stats.successfulListBanks ?? []), listBanked] : (stats.successfulListBanks ?? []),
          categoryScores
        } as Player['stats']
      };
    });
  };

  const recordRoundSnapshot = (updatedPlayers: Player[]) => {
    setScoreHistory(prev => [
      ...prev,
      { roundNumber: currentRoundIndex + 1, scores: Object.fromEntries(updatedPlayers.map(player => [player.id, player.score])) }
    ]);
  };

  const completeFullRound = (updatedPlayers: Player[]) => {
    recordRoundSnapshot(updatedPlayers);
    const scores = updatedPlayers.map(player => player.score);
    const maxScore = Math.max(...scores, 0);
    const minScore = Math.min(...scores, 0);
    const trailing = updatedPlayers.find(player => player.score === minScore);

    if (!bureauReviewUsed && updatedPlayers.length > 1 && currentRoundIndex >= 2 && (maxScore - minScore) >= 1200 && trailing) {
      setReviewEligiblePlayer(trailing);
    } else {
      advanceToNextRound(updatedPlayers);
    }
  };

  const handleRoundComplete = (scoreOrScores: number | Record<string, number>, extraData?: Record<string, unknown>) => {
    sound.playBrassChime();
    const updatedPlayers = applyRoundResult(players, scoreOrScores, extraData);
    setPlayers(updatedPlayers);

    if (currentRoundDefinition.participationMode === 'EVERYONE_TAKES_A_TURN' && playersCompletedThisRound + 1 < players.length) {
      const nextChallenge = pickRoundChallenge(currentRoundIndex, usedChallengeIdsThisRound);
      setPlayersCompletedThisRound(prev => prev + 1);
      setCurrentChallenge(nextChallenge);
      setUsedChallengeIdsThisRound(prev => [...prev, nextChallenge.id]);
      return;
    }

    completeFullRound(updatedPlayers);
  };

  const handleResolveBureauReview = (optionType: 'SAFE' | 'RISKY' | 'QUESTIONABLE', delta: number) => {
    if (!reviewEligiblePlayer) return;
    let updated = [...players];

    if (optionType === 'QUESTIONABLE' && delta > 0) {
      const leader = [...updated].sort((a, b) => b.score - a.score).find(player => player.id !== reviewEligiblePlayer.id);
      const steal = leader ? Math.min(delta, leader.score) : 0;
      updated = updated.map(player => {
        if (player.id === reviewEligiblePlayer.id) return { ...player, score: player.score + steal };
        if (leader && player.id === leader.id) return { ...player, score: Math.max(0, player.score - steal) };
        return player;
      });
    } else {
      updated = updated.map(player => player.id === reviewEligiblePlayer.id ? { ...player, score: Math.max(0, player.score + delta) } : player);
    }

    setPlayers(updated);
    setBureauReviewUsed(true);
    setReviewEligiblePlayer(null);
    setScoreHistory(prev => [...prev, { roundNumber: currentRoundIndex + 1.5, scores: Object.fromEntries(updated.map(player => [player.id, player.score])) }]);
    advanceToNextRound(updated);
  };

  const advanceToNextRound = (playerState = players) => {
    const nextRound = currentRoundIndex + 1;
    if (nextRound >= ROUND_DEFINITIONS.length) {
      setPhase('FINAL_CASE');
      return;
    }

    let nextStarter = playerState.length > 0 ? nextRound % playerState.length : 0;
    if (priorityStarterPlayerId) {
      const priorityIndex = playerState.findIndex(player => player.id === priorityStarterPlayerId);
      if (priorityIndex >= 0) nextStarter = priorityIndex;
      setPriorityStarterPlayerId(null);
    }

    const nextChallenge = pickRoundChallenge(nextRound);
    setCurrentRoundIndex(nextRound);
    setRoundStarterIndex(nextStarter);
    setPlayersCompletedThisRound(0);
    setCurrentChallenge(nextChallenge);
    setUsedChallengeIdsThisRound([nextChallenge.id]);
    setAssetNotice(null);
    setPhase('ROOM_TRANSITION');
  };

  const handleFinalCaseComplete = (playerBonuses: Record<string, number>) => {
    sound.playVictoryFanfare();
    const updated = players.map(player => ({ ...player, score: player.score + (playerBonuses[player.id] || 0) }));
    setPlayers(updated);
    setScoreHistory(prev => [...prev, { roundNumber: ROUND_DEFINITIONS.length + 1, scores: Object.fromEntries(updated.map(player => [player.id, player.score])) }]);
    setPhase('PODIUM');
  };

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
    setBureauReviewUsed(false);
    setHiddenCommendations([]);
    setScoreHistory([]);
    setArmedAssets({});
    setPriorityStarterPlayerId(null);
    setAssetNotice(null);
  };

  const currentRoundConfig: RoundConfig = {
    roundNumber: currentRoundIndex + 1,
    type: currentRoundDefinition.type,
    participationMode: currentRoundDefinition.participationMode,
    name: currentRoundDefinition.name,
    roomName: currentRoundDefinition.roomName,
    roomTheme: currentRoundDefinition.roomTheme
  };

  const roundInstanceKey = currentChallenge ? `${currentRoundIndex}-${activePlayer?.id ?? 'shared'}-${currentChallenge.id}` : `${currentRoundIndex}-empty`;

  return (
    <BureauRoomBackdrop roomName={currentRoundConfig.roomName}>
      <Header
        roundConfig={phase === 'TITLE' || phase === 'SETUP' ? undefined : currentRoundConfig}
        totalRounds={ROUND_DEFINITIONS.length}
        players={players}
        currentPlayerIndex={activePlayerIndex}
        onOpenAssets={() => setIsAssetDrawerOpen(true)}
        canReview={!!reviewEligiblePlayer}
        onTriggerReview={() => {}}
      />

      {assetNotice && phase === 'PLAYING_ROUND' && (
        <div className="mx-auto mb-2 max-w-3xl rounded-lg border border-[#4fd1c5]/50 bg-[#0d2530] px-4 py-2 text-center font-['Courier_Prime'] text-xs text-[#a7f3e8]">
          {assetNotice}
        </div>
      )}

      <main className="w-full flex-1 flex flex-col justify-center py-4 px-2 sm:px-4">
        {phase === 'TITLE' && <TitleScreen onStartGame={handleStartGame} />}
        {phase === 'SETUP' && <SetupScreen playerCount={selectedPlayerCount} onProceedToDirectives={handleSetupComplete} />}
        {phase === 'DIRECTIVES' && <SecretDirectivesScreen players={players} onFinishDirectives={handleDirectivesComplete} />}
        {phase === 'ROOM_TRANSITION' && <RoomTransition roundConfig={currentRoundConfig} totalRounds={ROUND_DEFINITIONS.length} onEnterRoom={handleEnterRoom} />}

        {phase === 'PLAYING_ROUND' && currentChallenge && activePlayer && (
          <div className="w-full flex flex-col items-center">
            {currentChallenge.roundType === 'WHERE_IN_BRITAIN' && <WhereInBritainRound key={roundInstanceKey} challenge={currentChallenge as WhereInBritainChallenge} currentPlayer={activePlayer} onComplete={(score, km) => handleRoundComplete(score, { km })} />}
            {currentChallenge.roundType === 'TOP_10' && <Top10Round key={`${currentRoundIndex}-${currentChallenge.id}`} challenge={currentChallenge as Top10Challenge} players={players} currentPlayerIndex={roundStarterIndex} onCompleteRound={scores => handleRoundComplete(scores)} />}
            {currentChallenge.roundType === 'PUT_UP_OR_SHUT_UP' && <PutUpOrShutUpRound key={`${currentRoundIndex}-${currentChallenge.id}`} challenge={currentChallenge as PutUpOrShutUpChallenge} players={players} currentPlayerIndex={roundStarterIndex} onComplete={(winnerId, score) => handleRoundComplete({ [winnerId]: score })} />}
            {currentChallenge.roundType === 'THE_LIST' && <TheListRound key={roundInstanceKey} challenge={currentChallenge as TheListChallenge} currentPlayer={activePlayer} onComplete={(score, banked) => handleRoundComplete(score, { banked })} />}
            {currentChallenge.roundType === 'CLOSEST_WINS' && <ClosestWinsRound key={`${currentRoundIndex}-${currentChallenge.id}`} challenge={currentChallenge as ClosestWinsChallenge} players={players} onCompleteRound={(scores, errors) => handleRoundComplete(scores, { errors })} />}
            {currentChallenge.roundType === 'RANK_IT' && <RankItRound key={roundInstanceKey} challenge={currentChallenge as RankItChallenge} currentPlayer={activePlayer} onComplete={score => handleRoundComplete(score)} />}
            {currentChallenge.roundType === 'IMAGE_REVEAL' && <ImageRevealRound key={roundInstanceKey} challenge={currentChallenge as ImageRevealChallenge} currentPlayer={activePlayer} onComplete={score => handleRoundComplete(score)} />}
            {currentChallenge.roundType === 'STOP_THE_SCORE' && <StopTheScoreRound key={roundInstanceKey} challenge={currentChallenge as StopTheScoreChallenge} currentPlayer={activePlayer} onComplete={(score, correct) => handleRoundComplete(score, { correct, riskedValue: correct ? score : undefined })} />}
          </div>
        )}

        {phase === 'FINAL_CASE' && <FinalCaseRound finalCase={FINAL_CASES[0]} players={players} onCompleteCase={handleFinalCaseComplete} />}
        {phase === 'PODIUM' && <AwardsPodium players={players} hiddenCommendations={hiddenCommendations} scoreHistory={scoreHistory} onPlayAgain={handlePlayAgain} />}
      </main>

      {activePlayer && <AssetDrawer isOpen={isAssetDrawerOpen} activePlayer={activePlayer} onClose={() => setIsAssetDrawerOpen(false)} onUseAsset={handleUseAsset} />}

      {reviewEligiblePlayer && (
        <BureauReviewModal
          trailingPlayer={reviewEligiblePlayer}
          onSelectOption={handleResolveBureauReview}
          onClose={() => {
            setBureauReviewUsed(true);
            setReviewEligiblePlayer(null);
            advanceToNextRound(players);
          }}
        />
      )}
    </BureauRoomBackdrop>
  );
}
