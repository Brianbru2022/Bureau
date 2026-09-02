import React, { lazy, Suspense, useCallback, useEffect, useReducer, useRef, useState } from 'react';
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
  StopTheScoreChallenge,
  MisfiledRecordsChallenge,
  RedactedRecordsChallenge,
  CommonDossierChallenge,
  MissingMinutesChallenge,
  PublicEnquiryChallenge,
  ChainOfCommandChallenge,
  ComplaintsDeskChallenge,
  SeatingCommitteeChallenge,
  DispatchBoxChallenge,
  DifficultyProfile, GameLengthPreset, MatchConfig, PoliticsMode, RoundType, ScorePaceProfile, TurnTimerSeconds, AdjudicationRecord, CommitteePrediction, RivalryOutcome, ScoreSnapshot, MiniGameType, ArmedAssetState, MiniGameEffect
} from './types';
import { sound } from './sound/audioEngine';
import { allChallenges } from './data/questions';
import { FINAL_CASES } from './data/finalCases';
import { assignSecretDirectives } from './data/secretDirectives';
import { selectSecretCommendations } from './data/commendations';
import { MINI_GAME_TYPES } from './data/miniGames';
import { BureauRoomBackdrop } from './components/common/BureauRoomBackdrop';
import { Header } from './components/common/Header';
import { AssetDrawer } from './components/common/AssetDrawer';
import { TitleScreen } from './components/screens/TitleScreen';
import { SetupScreen } from './components/screens/SetupScreen';
import { SecretDirectivesScreen } from './components/screens/SecretDirectivesScreen';
import { RoomTransition } from './components/screens/RoomTransition';
import { AwardsPodium } from './components/screens/AwardsPodium';
import { InterstitialMiniGame } from './components/screens/InterstitialMiniGame';
import { CommitteeWindow } from './components/screens/CommitteeWindow';
import { BureauReviewModal } from './components/rounds/BureauReviewModal';
import { HostControlsModal } from './components/common/HostControlsModal';
import { TurnTimer } from './components/common/TurnTimer';
import { DispatchNotice, type DispatchNoticeCopy } from './components/common/DispatchNotice';
import { MatchStatusAnnouncer } from './components/common/MatchStatusAnnouncer';
import { hasAnotherCandidateTurn, selectReviewCandidate, nextStarterIndex } from './game/progression';
import { gameRandom } from './game/random';
import { clearSavedGame, consumeLoadNotice, loadDepartmentPreferences, loadGame, loadRecentChallengeIds, loadRecentDepartmentIds, rememberAssessmentDepartments, rememberChallenge, saveGame, type SavedGame } from './game/session';
import { createMatchConfig, createMatchConfigFromSchedule, createMatchState, DEFAULT_ROUND_ORDER, matchReducer, miniGameBoundaries, shouldRunOfficePolitics } from './game/match';
import { resolveRivalry } from './game/rivalry';
import { difficultyForRound, inferredDifficulty } from './data/editorial';
import { abandonActivePlaytestSession, configureActivePlaytestSession, getActivePlaytestSession, markActivePlaytestMatchComplete, playtestRequirementFor, recordPlaytestEvent } from './game/playtest';
import { ROUND_DEFINITIONS } from './game/roundCatalog';
import { dispatchCopy, motionDuration, PRESENTATION_TIMING } from './game/presentation';
import { createReplayMatchConfig } from './game/replay';
import { calibrateDepartmentScore } from './game/scoring';
import { applyFinalBonuses, applyMiniGameEffects, applyRoundResult, resetPlayersForReplay, resolveBureauReview, roundContextPatch } from './game/matchOrchestration';

const WhereInBritainRound = lazy(() => import('./components/rounds/WhereInBritainRound').then(module => ({ default: module.WhereInBritainRound })));
const Top10Round = lazy(() => import('./components/rounds/Top10Round').then(module => ({ default: module.Top10Round })));
const PutUpOrShutUpRound = lazy(() => import('./components/rounds/PutUpOrShutUpRound').then(module => ({ default: module.PutUpOrShutUpRound })));
const TheListRound = lazy(() => import('./components/rounds/TheListRound').then(module => ({ default: module.TheListRound })));
const ClosestWinsRound = lazy(() => import('./components/rounds/ClosestWinsRound').then(module => ({ default: module.ClosestWinsRound })));
const RankItRound = lazy(() => import('./components/rounds/RankItRound').then(module => ({ default: module.RankItRound })));
const ImageRevealRound = lazy(() => import('./components/rounds/ImageRevealRound').then(module => ({ default: module.ImageRevealRound })));
const StopTheScoreRound = lazy(() => import('./components/rounds/StopTheScoreRound').then(module => ({ default: module.StopTheScoreRound })));
const MisfiledRecordsRound = lazy(() => import('./components/rounds/MisfiledRecordsRound').then(module => ({ default: module.MisfiledRecordsRound })));
const RedactedRecordsRound = lazy(() => import('./components/rounds/RedactedRecordsRound').then(module => ({ default: module.RedactedRecordsRound })));
const CommonDossierRound = lazy(() => import('./components/rounds/CommonDossierRound').then(module => ({ default: module.CommonDossierRound })));
const MissingMinutesRound = lazy(() => import('./components/rounds/MissingMinutesRound').then(module => ({ default: module.MissingMinutesRound })));
const PublicEnquiryRound = lazy(() => import('./components/rounds/PublicEnquiryRound').then(module => ({ default: module.PublicEnquiryRound })));
const ChainOfCommandRound = lazy(() => import('./components/rounds/ChainOfCommandRound').then(module => ({ default: module.ChainOfCommandRound })));
const ComplaintsDeskRound = lazy(() => import('./components/rounds/ComplaintsDeskRound').then(module => ({ default: module.ComplaintsDeskRound })));
const SeatingCommitteeRound = lazy(() => import('./components/rounds/SeatingCommitteeRound').then(module => ({ default: module.SeatingCommitteeRound })));
const DispatchBoxRound = lazy(() => import('./components/rounds/DispatchBoxRound').then(module => ({ default: module.DispatchBoxRound })));
const FinalCaseRound = lazy(() => import('./components/rounds/FinalCaseRound').then(module => ({ default: module.FinalCaseRound })));

const clampPlayerCount = (count: number) => Math.max(1, Math.min(4, Math.round(count)));

export default function App() {
  const [matchState, dispatchMatch] = useReducer(matchReducer, createMatchState(createMatchConfig('FIRST')));
  const {
    phase, config:matchConfig, selectedPlayerCount, players, currentRoundIndex, roundStarterIndex,
    playersCompletedThisRound, usedChallengeIdsThisRound, currentChallengeId, hiddenCommendations,
    scoreHistory, bureauReviewUsed, reviewEligiblePlayerId, armedAssets, priorityStarterPlayerId,
    miniGameType, miniGamesPlayed, freeMotionPlayerId, rivalryTargetScore, finalCaseIndex,
    timerPaused, adjudicationHistory, committeePredictions, rivalryOutcomes
  } = matchState;
  const preset=matchConfig.preset;
  const currentChallenge=allChallenges.find(challenge=>challenge.id===currentChallengeId)??null;
  const reviewEligiblePlayer=players.find(player=>player.id===reviewEligiblePlayerId)??null;
  const patchMatch=(patch:Partial<typeof matchState>)=>dispatchMatch({type:'PATCH_MATCH',patch});
  const setPhase=(next:GamePhase)=>patchMatch({phase:next});
  const setPlayers=(next:Player[])=>patchMatch({players:next});
  const setCurrentRoundIndex=(next:number)=>patchMatch({currentRoundIndex:next});
  const setRoundStarterIndex=(next:number)=>patchMatch({roundStarterIndex:next});
  const setPlayersCompletedThisRound=(next:number)=>patchMatch({playersCompletedThisRound:next});
  const setUsedChallengeIdsThisRound=(next:string[])=>patchMatch({usedChallengeIdsThisRound:next});
  const setCurrentChallenge=(next:Challenge|null)=>patchMatch({currentChallengeId:next?.id??null});
  const setBureauReviewUsed=(next:boolean)=>patchMatch({bureauReviewUsed:next});
  const setReviewEligiblePlayer=(next:Player|null)=>patchMatch({reviewEligiblePlayerId:next?.id??null});
  const setArmedAssets=(next:ArmedAssetState)=>patchMatch({armedAssets:next});
  const setPriorityStarterPlayerId=(next:string|null)=>patchMatch({priorityStarterPlayerId:next});
  const setMiniGameType=(next:MiniGameType|null)=>patchMatch({miniGameType:next});
  const setMiniGamesPlayed=(next:MiniGameType[])=>patchMatch({miniGamesPlayed:next});
  const setFreeMotionPlayerId=(next:string|null)=>patchMatch({freeMotionPlayerId:next});
  const setRivalryTargetScore=(next:number|null)=>patchMatch({rivalryTargetScore:next});
  const appendScoreSnapshot=(snapshot:ScoreSnapshot)=>dispatchMatch({type:'APPEND_SCORE_SNAPSHOT',snapshot});
  const roundLimit = matchConfig.roundTypes.length;
  const [roundRestartNonce, setRoundRestartNonce] = useState(0);
  const setCommitteePredictions=(predictions:CommitteePrediction[])=>dispatchMatch({type:'SET_COMMITTEE',predictions});
  const setRivalryOutcomes=(outcomes:RivalryOutcome[])=>dispatchMatch({type:'RESOLVE_RIVALRY',outcomes});
  const [savedGame, setSavedGame] = useState<SavedGame | null>(() => loadGame());
  const [sessionNotice] = useState<string|null>(()=>consumeLoadNotice());
  const [isHostControlsOpen, setIsHostControlsOpen] = useState(false);
  const [isAssetDrawerOpen, setIsAssetDrawerOpen] = useState(false);
  const [assetNotice, setAssetNotice] = useState<string | null>(null);
  const [dispatchNotice,setDispatchNotice]=useState<DispatchNoticeCopy|null>(null);
  const dispatchTimerRef=useRef<number|null>(null);
  const mainFocusRef=useRef<HTMLElement>(null);
  const onboardingStartedAtRef=useRef<number|null>(null);
  const onboardingReadyRecordedRef=useRef(false);
  const attemptStartedAtRef=useRef(Date.now());

  const showDispatchNotice=useCallback((notice:DispatchNoticeCopy)=>{
    if(dispatchTimerRef.current!==null)window.clearTimeout(dispatchTimerRef.current);
    setDispatchNotice(notice);
    const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
    dispatchTimerRef.current=window.setTimeout(()=>{setDispatchNotice(null);dispatchTimerRef.current=null;},motionDuration(PRESENTATION_TIMING.dispatchMs,reduced));
  },[]);

  useEffect(()=>()=>{if(dispatchTimerRef.current!==null)window.clearTimeout(dispatchTimerRef.current);},[]);

  useEffect(() => {
    if (phase === 'TITLE' || players.length === 0) return;
    const snapshot: SavedGame = {version:4,savedAt:Date.now(),state:matchState};
    saveGame(snapshot);
    setSavedGame(snapshot);
  }, [matchState,phase,players.length]);

  const currentRoundType = matchConfig.roundTypes[currentRoundIndex] ?? DEFAULT_ROUND_ORDER[0];
  const currentRoundDefinition = ROUND_DEFINITIONS.find(definition=>definition.type===currentRoundType) ?? ROUND_DEFINITIONS[0];
  const activePlayerIndex = players.length > 0 ? (roundStarterIndex + playersCompletedThisRound) % players.length : 0;
  const activePlayer = players[activePlayerIndex] || players[0];
  const lastScrollRecordRef = useRef(0);

  useEffect(() => {
    const focusTimer = window.setTimeout(() => {
      const currentFocus = document.activeElement;
      const focusIsUnclaimed = !currentFocus || currentFocus === document.body || !currentFocus.isConnected;
      if (!document.querySelector('[role="dialog"]') && focusIsUnclaimed) mainFocusRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(focusTimer);
  }, [activePlayerIndex, currentRoundIndex, phase, roundRestartNonce]);

  useEffect(() => {
    if (phase === 'TITLE') return;
    const recordScroll = () => {
      if (window.innerWidth < 900 || window.scrollY === 0 || Date.now() - lastScrollRecordRef.current < 2_000) return;
      lastScrollRecordRef.current = Date.now();
      recordPlaytestEvent({ type:'PAGE_SCROLL', phase, roundType:currentRoundType, challengeId:currentChallenge?.id, playerCount:players.length||selectedPlayerCount, detail:`Desktop document scrolled to ${Math.round(window.scrollY)}px` });
    };
    window.addEventListener('scroll', recordScroll, { passive:true });
    return () => window.removeEventListener('scroll', recordScroll);
  }, [currentChallenge?.id, currentRoundType, phase, players.length, selectedPlayerCount]);

  useEffect(() => {
    if (phase === 'PLAYING_ROUND' && !currentChallenge && players.length) recordPlaytestEvent({ type:'PROGRESSION_FAILURE', phase, roundType:currentRoundType, playerCount:players.length, detail:'No challenge was available for the active department.' });
  }, [currentChallenge, currentRoundType, phase, players.length]);

  useEffect(()=>{
    if(phase==='PLAYING_ROUND')attemptStartedAtRef.current=Date.now();
  },[activePlayerIndex,currentChallenge?.id,phase]);

  useEffect(() => {
    if (phase !== 'PLAYING_ROUND' || currentRoundIndex !== 0 || onboardingReadyRecordedRef.current || onboardingStartedAtRef.current === null) return;
    onboardingReadyRecordedRef.current = true;
    recordPlaytestEvent({
      type:'FIRST_QUESTION_READY',
      phase,
      roundType:currentRoundType,
      challengeId:currentChallenge?.id,
      playerCount:players.length,
      durationMs:Date.now()-onboardingStartedAtRef.current,
      detail:'Elapsed time from selecting a player count to the first interactive question.'
    });
  }, [currentChallenge?.id, currentRoundIndex, currentRoundType, phase, players.length]);

  const handleStartGame = (playerCount: number, selectedPreset: GameLengthPreset, roundTypes: RoundType[], timerSeconds: TurnTimerSeconds, politicsMode:PoliticsMode, guidedMode:boolean, difficultyProfile:DifficultyProfile, scorePaceProfile:ScorePaceProfile) => {
    sound.playStamp();
    const safePlayerCount=clampPlayerCount(playerCount);
    const nextConfig=createMatchConfigFromSchedule(selectedPreset, roundTypes, timerSeconds, politicsMode, guidedMode, difficultyProfile, scorePaceProfile);
    dispatchMatch({type:'RESET_MATCH',config:nextConfig});
    patchMatch({selectedPlayerCount:safePlayerCount,phase:'SETUP'});
    configureActivePlaytestSession(nextConfig,safePlayerCount);
    onboardingStartedAtRef.current=Date.now();
    onboardingReadyRecordedRef.current=false;
  };

  const handleResumeGame = () => {
    if (!savedGame) return;
    const restored=savedGame.state;
    const restoredChallenge=allChallenges.find(challenge=>challenge.id===restored.currentChallengeId)??pickChallengeForConfig(restored.config,restored.currentRoundIndex,restored.usedChallengeIdsThisRound);
    dispatchMatch({type:'HYDRATE_MATCH',state:{...restored,phase:restored.phase==='PLAYING_ROUND'&&!restored.reviewEligiblePlayerId?'ROOM_TRANSITION':restored.phase,currentChallengeId:restoredChallenge?.id??null,usedChallengeIdsThisRound:restoredChallenge&&!restored.usedChallengeIdsThisRound.includes(restoredChallenge.id)?[...restored.usedChallengeIdsThisRound,restoredChallenge.id]:restored.usedChallengeIdsThisRound}});
  };

  const discardSavedGame = () => { clearSavedGame(); setSavedGame(null); };

  const handleSetupComplete = (createdPlayers: Player[]) => {
    dispatchMatch({type:'RESET_MATCH',config:matchConfig});
    const firstChallenge = matchConfig.preset === 'FIRST' ? pickChallengeForConfig(matchConfig, 0) : null;
    patchMatch({players:createdPlayers,selectedPlayerCount:createdPlayers.length,hiddenCommendations:matchConfig.preset==='FIRST'?[]:createdPlayers.length>1?selectSecretCommendations(2,gameRandom):[],finalCaseIndex:Math.floor(gameRandom()*FINAL_CASES.length),currentChallengeId:firstChallenge?.id??null,usedChallengeIdsThisRound:firstChallenge?[firstChallenge.id]:[],phase:matchConfig.preset==='FIRST'?'ROOM_TRANSITION':'DIRECTIVES'});
    if (matchConfig.preset === 'FIRST') {
      return;
    }
  };

  const pickRoundChallenge = (roundIdx: number, excludedIds: string[] = []): Challenge => {
    return pickChallengeForConfig(matchConfig, roundIdx, excludedIds);
  };

  const pickChallengeForConfig = (config: MatchConfig, roundIdx: number, excludedIds: string[] = []): Challenge => {
    const type = config.roundTypes[roundIdx] ?? DEFAULT_ROUND_ORDER[roundIdx % DEFAULT_ROUND_ORDER.length];
    const roundDef = ROUND_DEFINITIONS.find(definition=>definition.type===type) ?? ROUND_DEFINITIONS[0];
    const matching = allChallenges.filter(q => q.roundType === roundDef.type);
    const recentIds = loadRecentChallengeIds();
    const unused = matching.filter(q => !excludedIds.includes(q.id) && !recentIds.includes(q.id));
    const notUsedThisRound = matching.filter(q => !excludedIds.includes(q.id));
    const pool = unused.length > 0 ? unused : notUsedThisRound.length > 0 ? notUsedThisRound : matching;
    const targetDifficulty=config.difficultyProfile==='ACCESSIBLE'?'EASY':config.difficultyProfile==='EXPERT'?'HARD':difficultyForRound(roundIdx,config.roundTypes.length);
    const preferred=pool.filter(challenge=>inferredDifficulty(challenge)===targetDifficulty);
    const finalPool=preferred.length>0?preferred:pool;
    return finalPool.length > 0 ? finalPool[Math.floor(gameRandom() * finalPool.length)] : allChallenges[0];
  };

  const pickMiniGame = (): MiniGameType => {
    const unused = MINI_GAME_TYPES.filter(type => !miniGamesPlayed.includes(type));
    const pool = unused.length > 0 ? unused : MINI_GAME_TYPES;
    return pool[Math.floor(gameRandom() * pool.length)];
  };

  const handleDirectivesComplete = () => {
    const firstChallenge = pickRoundChallenge(0);
    setCurrentRoundIndex(0);
    setRoundStarterIndex(0);
    setPlayersCompletedThisRound(0);
    setCurrentChallenge(firstChallenge);
    setUsedChallengeIdsThisRound(firstChallenge ? [firstChallenge.id] : []);
    const firstTarget=players[0];const trailing=selectReviewCandidate(players.filter(player=>player.id!==firstTarget?.id));setFreeMotionPlayerId(trailing?.id??null);
    setPhase(matchConfig.officePolitics&&players.length>1&&shouldRunOfficePolitics(matchConfig.politicsMode,0,roundLimit)?'COMMITTEE':'ROOM_TRANSITION');
  };

  const handleEnterRoom = () => {
    if (!currentChallenge || currentChallenge.roundType !== currentRoundDefinition.type) {
      const replacement = pickRoundChallenge(currentRoundIndex, usedChallengeIdsThisRound);
      setCurrentChallenge(replacement);
      setUsedChallengeIdsThisRound(usedChallengeIdsThisRound.includes(replacement.id) ? usedChallengeIdsThisRound : [...usedChallengeIdsThisRound, replacement.id]);
    }
    setPhase('PLAYING_ROUND');
  };
  const handleCommitteeComplete = (predictions:CommitteePrediction[]) => { setCommitteePredictions(predictions); setRivalryOutcomes([]); setPhase('ROOM_TRANSITION'); };

  const removeOwnedAsset = (playerId: string, assetType: BureauAssetKey) => {
    setPlayers(players.map(player => {
      if (player.id !== playerId) return player;
      const removedIndex = player.assets.indexOf(assetType);
      const nextAssets = [...player.assets];
      if (removedIndex >= 0) nextAssets.splice(removedIndex, 1);
      const stats = player.stats as Player['stats'] & { assetsUsed?: string[] };
      return { ...player, assets: nextAssets, stats: { ...stats, assetsUsed: [...(stats.assetsUsed ?? []), assetType] } };
    }));
  };

  const armAsset = (playerId: string, assetType: BureauAssetKey) => {
    setArmedAssets({ ...armedAssets, [playerId]: [...(armedAssets[playerId] ?? []), assetType] });
  };

  const handleUseAsset = (assetType: BureauAssetKey) => {
    if (!activePlayer || phase !== 'PLAYING_ROUND') return;
    sound.playStamp();
    setAssetNotice(null);

    if (currentRoundDefinition.participationMode !== 'EVERYONE_TAKES_A_TURN' && assetType !== 'PRIORITY_ACCESS') {
      setAssetNotice('Individual-attempt Assets are locked during shared or sealed-answer rounds. The Bureau has prevented an administrative accident.');
      setIsAssetDrawerOpen(false);
      return;
    }

    if (assetType === 'REFILE') {
      const replacement = pickRoundChallenge(currentRoundIndex, [...usedChallengeIdsThisRound, currentChallenge?.id ?? '']);
      removeOwnedAsset(activePlayer.id, assetType);
      setCurrentChallenge(replacement);
      setUsedChallengeIdsThisRound([...usedChallengeIdsThisRound, replacement.id]);
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
    setAssetNotice(`${activePlayer.name} armed ${assetType.replaceAll('_', ' ')} for this attempt.`);
    setIsAssetDrawerOpen(false);
  };

  const recordRoundSnapshot = (updatedPlayers: Player[]) => {
    appendScoreSnapshot({ roundNumber: currentRoundIndex + 1, scores: Object.fromEntries(updatedPlayers.map(player => [player.id, player.score])) });
  };

  const startMiniGameIfDue = (updatedPlayers: Player[]): boolean => {
    if (matchConfig.preset === 'FIRST') return false;
    const completedRoundNumber = currentRoundIndex + 1;
    if (!miniGameBoundaries(roundLimit).has(completedRoundNumber) || miniGamesPlayed.length >= (roundLimit <= 4 ? 1 : 2)) return false;
    const selected = pickMiniGame();
    setPlayers(updatedPlayers);
    setMiniGameType(selected);
    setPhase('MINI_GAME');
    showDispatchNotice(dispatchCopy({destination:'MINI_GAME'}));
    return true;
  };

  const completeFullRound = (updatedPlayers: Player[], targetScoreOverride?:number) => {
    rememberChallenge(currentChallenge);
    const targetId=players[roundStarterIndex%Math.max(1,players.length)]?.id??activePlayer?.id;
    const scoreForPolitics=targetScoreOverride??rivalryTargetScore??0;
    const rivalry=matchConfig.officePolitics&&targetId&&committeePredictions.length?resolveRivalry(updatedPlayers,committeePredictions,targetId,scoreForPolitics,currentRoundDefinition.type,freeMotionPlayerId):{players:updatedPlayers,outcomes:[]};
    const politicallyUpdated=rivalry.players;
    setPlayers(politicallyUpdated);setRivalryOutcomes(rivalry.outcomes);setRivalryTargetScore(null);
    recordRoundSnapshot(politicallyUpdated);
    const scores = politicallyUpdated.map(player => player.score);
    const maxScore = Math.max(...scores, 0);
    const trailing = selectReviewCandidate(politicallyUpdated);
    const minScore = trailing?.score ?? 0;

    if (!bureauReviewUsed && politicallyUpdated.length > 1 && currentRoundIndex >= 2 && (maxScore - minScore) >= 1200 && trailing) {
      setReviewEligiblePlayer(trailing);
      showDispatchNotice(dispatchCopy({destination:'BUREAU_REVIEW'}));
      return;
    }

    if (!startMiniGameIfDue(politicallyUpdated)) advanceToNextRound(politicallyUpdated);
  };

  const handleRoundComplete = (scoreOrScores: number | Record<string, number>, extraData?: Record<string, unknown>) => {
    sound.playBrassChime();
    const calibratedScoreOrScores = typeof scoreOrScores === 'number'
      ? calibrateDepartmentScore(currentRoundDefinition.type, scoreOrScores)
      : Object.fromEntries(Object.entries(scoreOrScores).map(([playerId, score]) => [playerId, calibrateDepartmentScore(currentRoundDefinition.type, score)]));
    const recordedScores=typeof calibratedScoreOrScores==='number'
      ? players.map(player=>player.id===activePlayer?.id?calibratedScoreOrScores:null)
      : players.map(player=>calibratedScoreOrScores[player.id]??null);
    recordPlaytestEvent({
      type: 'ROUND_COMPLETED',
      phase,
      roundType: currentRoundDefinition.type,
      challengeId: currentChallenge?.id,
      playerCount: players.length,
      roundNumber:currentRoundIndex+1,
      durationMs:Math.max(0,Date.now()-attemptStartedAtRef.current),
      seatScores:recordedScores,
      detail: extraData?.timedOut ? 'Turn expired' : extraData?.skipped ? 'Challenge skipped' : 'Result filed',
    });
    const resolution = applyRoundResult({players,scoreOrScores:calibratedScoreOrScores,activePlayerId:activePlayer?.id??null,armedAssets,participationMode:currentRoundDefinition.participationMode,roundType:currentRoundDefinition.type,category:currentChallenge?.category,extraData});
    const updatedPlayers=resolution.players;
    patchMatch({players:updatedPlayers,armedAssets:resolution.armedAssets});
    const roundScores=typeof calibratedScoreOrScores==='number'?{[activePlayer?.id??'']:calibratedScoreOrScores}:calibratedScoreOrScores;
    const politicsTargetId=players[roundStarterIndex%Math.max(1,players.length)]?.id;
    const observedTargetScore=politicsTargetId!==undefined&&roundScores[politicsTargetId]!==undefined?roundScores[politicsTargetId]:null;
    if(observedTargetScore!==null)setRivalryTargetScore(observedTargetScore);

    if (hasAnotherCandidateTurn(currentRoundDefinition.participationMode, playersCompletedThisRound, players.length)) {
      const nextChallenge = pickRoundChallenge(currentRoundIndex, usedChallengeIdsThisRound);
      const nextPlayer=players[(roundStarterIndex+playersCompletedThisRound+1)%players.length];
      setPlayersCompletedThisRound(playersCompletedThisRound + 1);
      setCurrentChallenge(nextChallenge);
      setUsedChallengeIdsThisRound([...usedChallengeIdsThisRound, nextChallenge.id]);
      showDispatchNotice(dispatchCopy({nextCandidateName:nextPlayer?.name??'Next candidate'}));
      return;
    }

    completeFullRound(updatedPlayers,observedTargetScore??undefined);
  };

  const handleResolveBureauReview = (optionType: 'SAFE' | 'RISKY' | 'QUESTIONABLE', delta: number) => {
    if (!reviewEligiblePlayer) return;
    const updated=resolveBureauReview(players,reviewEligiblePlayer.id,optionType,delta);

    setPlayers(updated);
    setBureauReviewUsed(true);
    setReviewEligiblePlayer(null);
    appendScoreSnapshot({ roundNumber: currentRoundIndex + 1.5, scores: Object.fromEntries(updated.map(player => [player.id, player.score])) });
    if (!startMiniGameIfDue(updated)) advanceToNextRound(updated);
  };

  const handleMiniGameComplete = (effects: MiniGameEffect[]) => {
    const {players:updated,priorityWinnerId:priorityWinner}=applyMiniGameEffects(players,effects);

    if (priorityWinner) setPriorityStarterPlayerId(priorityWinner);
    if (miniGameType) setMiniGamesPlayed([...miniGamesPlayed, miniGameType]);
    setPlayers(updated);
    appendScoreSnapshot({ roundNumber: currentRoundIndex + 1.75, scores: Object.fromEntries(updated.map(player => [player.id, player.score])) });
    setMiniGameType(null);
    advanceToNextRound(updated);
  };

  const advanceToNextRound = (playerState = players) => {
    const nextRound = currentRoundIndex + 1;
    if (nextRound >= roundLimit) {
      if (matchConfig.preset === 'FIRST') {
        rememberAssessmentDepartments(matchConfig.roundTypes);
        markActivePlaytestMatchComplete(playerState.length);
        setPhase('PODIUM');
        showDispatchNotice({eyebrow:'First assessment filed',title:'Proceed to the Bureau Result',detail:'Four introductory departments have been certified.'});
      } else {
        setPhase('FINAL_CASE');
        showDispatchNotice(dispatchCopy({destination:'FINAL_CASE'}));
      }
      return;
    }

    let priorityIndex: number | null = null;
    if (priorityStarterPlayerId) {
      priorityIndex = playerState.findIndex(player => player.id === priorityStarterPlayerId);
      setPriorityStarterPlayerId(null);
    }
    const nextStarter = nextStarterIndex(playerState.length, nextRound, priorityIndex);

    const nextChallenge = pickRoundChallenge(nextRound);
    const nextDefinition=ROUND_DEFINITIONS.find(definition=>definition.type===matchConfig.roundTypes[nextRound]);
    setAssetNotice(null);
    const nextPhase=matchConfig.preset==='FIRST'?'ROOM_TRANSITION':matchConfig.officePolitics&&playerState.length>1&&shouldRunOfficePolitics(matchConfig.politicsMode,nextRound,roundLimit)?'COMMITTEE':'ROOM_TRANSITION';
    patchMatch(roundContextPatch(playerState,nextRound,nextStarter,nextChallenge.id,nextPhase));
    showDispatchNotice(dispatchCopy({nextDepartmentName:nextDefinition?.name??'Next department'}));
  };

  const handleFinalCaseComplete = (playerBonuses: Record<string, number>) => {
    sound.playVictoryFanfare();
    const updated = applyFinalBonuses(players,playerBonuses);
    setPlayers(updated);
    appendScoreSnapshot({ roundNumber: roundLimit + 1, scores: Object.fromEntries(updated.map(player => [player.id, player.score])) });
    rememberAssessmentDepartments(matchConfig.roundTypes);
    markActivePlaytestMatchComplete(updated.length);
    setPhase('PODIUM');
    showDispatchNotice({eyebrow:'Ceremonial dispatch',title:'Proceed to the Grand Bureau Ceremony',detail:'Final totals and commendations are being certified.'});
  };

  const handlePlayAgain = () => {
    if (getActivePlaytestSession()) abandonActivePlaytestSession();
    clearSavedGame();
    setSavedGame(null);
    setAssetNotice(null);
    dispatchMatch({type:'RESET_MATCH',config:createMatchConfig('FIRST')});
  };

  const handleExitGame = () => {
    setIsHostControlsOpen(false);
    handlePlayAgain();
  };

  const handlePlayAgainSameCandidates = () => {
    if (getActivePlaytestSession()) abandonActivePlaytestSession();
    const directives = assignSecretDirectives(players.length, gameRandom);
    const replayConfig = createReplayMatchConfig(matchConfig, loadRecentDepartmentIds(), loadDepartmentPreferences(), gameRandom);
    const retained = resetPlayersForReplay(players,directives,replayConfig.preset==='FIRST');
    const replayChallenge = replayConfig.preset==='FIRST' ? pickChallengeForConfig(replayConfig,0) : null;
    clearSavedGame(); dispatchMatch({type:'RESET_MATCH',config:replayConfig}); patchMatch({players:retained,selectedPlayerCount:retained.length,currentChallengeId:replayChallenge?.id??null,usedChallengeIdsThisRound:replayChallenge?[replayChallenge.id]:[],hiddenCommendations:replayConfig.preset==='FIRST'?[]:players.length>1?selectSecretCommendations(2,gameRandom):[],phase:replayConfig.preset==='FIRST'?'PLAYING_ROUND':'DIRECTIVES'});
  };

  const currentRoundConfig: RoundConfig = {
    roundNumber: currentRoundIndex + 1,
    type: currentRoundDefinition.type,
    participationMode: currentRoundDefinition.participationMode,
    name: currentRoundDefinition.name,
    roomName: currentRoundDefinition.roomName,
    roomTheme: currentRoundDefinition.roomTheme
  };

  const roundInstanceKey = currentChallenge ? `${currentRoundIndex}-${activePlayer?.id ?? 'shared'}-${currentChallenge.id}-${roundRestartNonce}` : `${currentRoundIndex}-empty`;
  const recordAdjudication = (record: Omit<AdjudicationRecord,'challengeId'|'recordedAt'>) => { dispatchMatch({type:'RECORD_ADJUDICATION',record:{...record,challengeId:currentChallenge?.id??'unknown',recordedAt:Date.now()}}); recordPlaytestEvent({type:'HOST_ASSISTANCE',phase,roundType:currentRoundType,challengeId:currentChallenge?.id,playerCount:players.length,detail:`Answer adjudicated: ${record.decision}`}); };
  const reverseLastAdjudication = () => { if(!currentChallenge)return;dispatchMatch({type:'REVERSE_LAST_ADJUDICATION',challengeId:currentChallenge.id,reversedAt:Date.now()});recordPlaytestEvent({type:'HOST_ASSISTANCE',phase,roundType:currentRoundType,challengeId:currentChallenge.id,playerCount:players.length,detail:'Latest answer ruling reversed'}); };
  const skipChallenge = () => { if(!window.confirm('Skip this challenge and file a zero-point result?'))return; recordPlaytestEvent({type:'HOST_ASSISTANCE',phase,roundType:currentRoundType,challengeId:currentChallenge?.id,playerCount:players.length,detail:'Challenge skipped for zero'}); setIsHostControlsOpen(false); handleRoundComplete(0,{correct:false,skipped:true}); };
  const setTimerPaused = (paused:boolean) => dispatchMatch({type:'SET_TIMER_PAUSED',paused});
  const restartRound = () => { if(!window.confirm('Restart the current attempt? Any unfiled answers will be lost.'))return; recordPlaytestEvent({type:'HOST_ASSISTANCE',phase,roundType:currentRoundType,challengeId:currentChallenge?.id,playerCount:players.length,detail:'Current attempt restarted'}); setRoundRestartNonce(value=>value+1); setTimerPaused(false); setIsHostControlsOpen(false); };
  const expireTurn = useCallback(()=>handleRoundComplete(0,{correct:false,timedOut:true}), [players,currentChallenge,currentRoundIndex,playersCompletedThisRound]);
  const showRoundHeader = !['TITLE', 'SETUP', 'MINI_GAME'].includes(phase);
  const armedPlaytestSession = phase === 'TITLE' ? getActivePlaytestSession() : null;
  const armedPlaytestRequirement = armedPlaytestSession?.status === 'ARMED' ? playtestRequirementFor(armedPlaytestSession.cohortSlot) : undefined;
  const betaRequirement = armedPlaytestSession && armedPlaytestRequirement ? {groupCode:armedPlaytestSession.groupCode,...armedPlaytestRequirement} : undefined;

  useEffect(() => { window.bureauDesktop?.setAssessmentActive(!['TITLE','PODIUM'].includes(phase)); }, [phase]);

  return (
    <BureauRoomBackdrop roomName={phase === 'MINI_GAME' ? 'Unscheduled Bureau Annex' : currentRoundConfig.roomName}>
      <MatchStatusAnnouncer players={players} phase={phase} activePlayerName={activePlayer?.name} roundName={currentRoundDefinition.name}/>
      <Header
        roundConfig={showRoundHeader ? currentRoundConfig : undefined}
        totalRounds={roundLimit}
        players={players}
        currentPlayerIndex={activePlayerIndex}
        onOpenAssets={matchConfig.preset === 'FIRST' ? undefined : () => setIsAssetDrawerOpen(true)}
        canReview={!!reviewEligiblePlayer}
        onTriggerReview={() => {}}
        onOpenHelp={() => setIsHostControlsOpen(true)}
      />

      {assetNotice && phase === 'PLAYING_ROUND' && (
        <div role="status" aria-live="polite" className="mx-auto mb-2 max-w-3xl rounded-lg border border-[#4fd1c5]/50 bg-[#0d2530] px-4 py-2 text-center font-['Courier_Prime'] text-xs text-[#a7f3e8]">{assetNotice}</div>
      )}
      {rivalryOutcomes.length>0&&phase==='ROOM_TRANSITION'&&<div role="status" aria-live="polite" className="mx-auto mb-2 max-w-4xl rounded-xl border-2 border-[#765139] bg-[#f3d66d] px-4 py-2 text-center font-['Courier_Prime'] text-[10px] text-[#60462f]"><strong>Committee filed:</strong> {rivalryOutcomes.map(outcome=>outcome.description).join(' ')}</div>}

      <main ref={mainFocusRef} tabIndex={-1} data-bureau-focus-target data-game-phase={phase} data-round-type={showRoundHeader ? currentRoundDefinition.type : undefined} data-challenge-id={currentChallenge?.id} className={`w-full min-h-0 flex-1 flex flex-col justify-center px-2 sm:px-4 ${['COMMITTEE','ROOM_TRANSITION','PLAYING_ROUND','MINI_GAME','FINAL_CASE'].includes(phase) ? 'bureau-play-main py-2 sm:py-3' : 'py-4'}`}>
        {phase === 'TITLE' && <TitleScreen onStartGame={handleStartGame} canResume={!!savedGame} sessionNotice={sessionNotice} onResume={handleResumeGame} onDiscardResume={discardSavedGame} betaRequirement={betaRequirement} />}
        {phase === 'SETUP' && <SetupScreen playerCount={selectedPlayerCount} firstAssessment={matchConfig.preset==='FIRST'} onProceedToDirectives={handleSetupComplete} />}
        {phase === 'DIRECTIVES' && <SecretDirectivesScreen players={players} onFinishDirectives={handleDirectivesComplete} />}
        {phase === 'COMMITTEE' && activePlayer && <CommitteeWindow players={players} target={players[roundStarterIndex%players.length]??activePlayer} roundType={currentRoundDefinition.type} freeMotionPlayerId={freeMotionPlayerId} politicsMode={matchConfig.politicsMode} onComplete={handleCommitteeComplete}/>} 
        {phase === 'ROOM_TRANSITION' && <RoomTransition roundConfig={currentRoundConfig} totalRounds={roundLimit} guided={matchConfig.guidedMode || matchConfig.preset==='FIRST'} onEnterRoom={handleEnterRoom} />}

        {phase === 'PLAYING_ROUND' && (!currentChallenge || !activePlayer) && (
          <section role="alert" className="mx-auto max-w-xl rounded-[24px] border-[4px] border-[#65442c] bg-[#fff7df] p-6 text-center shadow-[0_9px_0_#65442c]">
            <h2 className="font-['Cinzel'] text-xl font-black text-[#244b55]">Department file incomplete</h2>
            <p className="mt-2 font-['Fraunces'] text-sm text-[#665348]">The Bureau could not retrieve this challenge. Return to the departmental door to issue a replacement file.</p>
            <button type="button" onClick={() => setPhase('ROOM_TRANSITION')} className="bureau-button mt-5 rounded-xl bg-[#376d9b] px-7 py-3 font-['Cinzel'] text-xs font-black uppercase text-white">Retrieve replacement file</button>
          </section>
        )}

        <Suspense fallback={<div role="status" className="mx-auto rounded-xl border-2 border-[#765139] bg-[#fff7df] px-6 py-4 font-['Courier_Prime'] text-sm text-[#244b55]">Retrieving departmental apparatus…</div>}>
        {phase === 'PLAYING_ROUND' && currentChallenge && activePlayer && (
          <div className="w-full flex flex-col items-center">
            {currentChallenge.roundType === 'WHERE_IN_BRITAIN' && <WhereInBritainRound key={roundInstanceKey} challenge={currentChallenge as WhereInBritainChallenge} currentPlayer={activePlayer} onComplete={(score, km) => handleRoundComplete(score, { km })} />}
            {currentChallenge.roundType === 'TOP_10' && <Top10Round key={roundInstanceKey} challenge={currentChallenge as Top10Challenge} players={players} currentPlayerIndex={roundStarterIndex} onAdjudication={recordAdjudication} onUndoAdjudication={reverseLastAdjudication} onCompleteRound={scores => handleRoundComplete(scores)} />}
            {currentChallenge.roundType === 'PUT_UP_OR_SHUT_UP' && <PutUpOrShutUpRound key={roundInstanceKey} challenge={currentChallenge as PutUpOrShutUpChallenge} players={players} currentPlayerIndex={roundStarterIndex} onAdjudication={recordAdjudication} onUndoAdjudication={reverseLastAdjudication} onComplete={(winnerId, score) => handleRoundComplete({ [winnerId]: score })} />}
            {currentChallenge.roundType === 'THE_LIST' && <TheListRound key={roundInstanceKey} challenge={currentChallenge as TheListChallenge} currentPlayer={activePlayer} onAdjudication={recordAdjudication} onUndoAdjudication={reverseLastAdjudication} onComplete={(score, banked) => handleRoundComplete(score, { banked })} />}
            {currentChallenge.roundType === 'CLOSEST_WINS' && <ClosestWinsRound key={`${currentRoundIndex}-${currentChallenge.id}`} challenge={currentChallenge as ClosestWinsChallenge} players={players} onCompleteRound={(scores, errors) => handleRoundComplete(scores, { errors })} />}
            {currentChallenge.roundType === 'RANK_IT' && <RankItRound key={roundInstanceKey} challenge={currentChallenge as RankItChallenge} currentPlayer={activePlayer} onComplete={score => handleRoundComplete(score)} />}
            {currentChallenge.roundType === 'IMAGE_REVEAL' && <ImageRevealRound key={roundInstanceKey} challenge={currentChallenge as ImageRevealChallenge} currentPlayer={activePlayer} onComplete={score => handleRoundComplete(score)} />}
            {currentChallenge.roundType === 'STOP_THE_SCORE' && <StopTheScoreRound key={roundInstanceKey} challenge={currentChallenge as StopTheScoreChallenge} currentPlayer={activePlayer} onComplete={(score, correct, riskedValue) => handleRoundComplete(score, { correct, riskedValue })} />}
            {currentChallenge.roundType === 'MISFILED_RECORDS' && <MisfiledRecordsRound key={roundInstanceKey} challenge={currentChallenge as MisfiledRecordsChallenge} currentPlayer={activePlayer} onComplete={score => handleRoundComplete(score)} />}
            {currentChallenge.roundType === 'REDACTED_RECORDS' && <RedactedRecordsRound key={roundInstanceKey} challenge={currentChallenge as RedactedRecordsChallenge} currentPlayer={activePlayer} onComplete={score => handleRoundComplete(score)} />}
            {currentChallenge.roundType === 'COMMON_DOSSIER' && <CommonDossierRound key={roundInstanceKey} challenge={currentChallenge as CommonDossierChallenge} currentPlayer={activePlayer} onComplete={score => handleRoundComplete(score)} />}
            {currentChallenge.roundType === 'MISSING_MINUTES' && <MissingMinutesRound key={roundInstanceKey} challenge={currentChallenge as MissingMinutesChallenge} currentPlayer={activePlayer} scorePaceProfile={matchConfig.scorePaceProfile} onComplete={score => handleRoundComplete(score)} />}
            {currentChallenge.roundType === 'PUBLIC_ENQUIRY' && <PublicEnquiryRound key={roundInstanceKey} challenge={currentChallenge as PublicEnquiryChallenge} players={players} currentPlayerIndex={roundStarterIndex} onComplete={scores => handleRoundComplete(scores)} />}
            {currentChallenge.roundType === 'CHAIN_OF_COMMAND' && <ChainOfCommandRound key={roundInstanceKey} challenge={currentChallenge as ChainOfCommandChallenge} currentPlayer={activePlayer} scorePaceProfile={matchConfig.scorePaceProfile} onComplete={score => handleRoundComplete(score)} />}
            {currentChallenge.roundType === 'COMPLAINTS_DESK' && <ComplaintsDeskRound key={roundInstanceKey} challenge={currentChallenge as ComplaintsDeskChallenge} currentPlayer={activePlayer} scorePaceProfile={matchConfig.scorePaceProfile} onComplete={score => handleRoundComplete(score)} />}
            {currentChallenge.roundType === 'SEATING_COMMITTEE' && <SeatingCommitteeRound key={roundInstanceKey} challenge={currentChallenge as SeatingCommitteeChallenge} currentPlayer={activePlayer} scorePaceProfile={matchConfig.scorePaceProfile} onComplete={score => handleRoundComplete(score)} />}
            {currentChallenge.roundType === 'DISPATCH_BOX' && <DispatchBoxRound key={roundInstanceKey} challenge={currentChallenge as DispatchBoxChallenge} currentPlayer={activePlayer} scorePaceProfile={matchConfig.scorePaceProfile} onComplete={score => handleRoundComplete(score)} />}
          </div>
        )}

        {phase === 'MINI_GAME' && miniGameType && <InterstitialMiniGame key={`${currentRoundIndex}-${miniGameType}`} type={miniGameType} players={players} onComplete={handleMiniGameComplete} />}
        {phase === 'FINAL_CASE' && <FinalCaseRound finalCase={FINAL_CASES[finalCaseIndex%FINAL_CASES.length]} players={players} influenceContributor={players.find(player=>(player.influence??0)>0)} onSpendInfluence={playerId=>setPlayers(players.map(player=>player.id===playerId?{...player,influence:Math.max(0,(player.influence??0)-1)}:player))} onCompleteCase={handleFinalCaseComplete} />}
        {phase === 'PODIUM' && <AwardsPodium players={players} hiddenCommendations={hiddenCommendations} scoreHistory={scoreHistory} adjudicationHistory={adjudicationHistory} simplified={matchConfig.preset==='FIRST'} onPlayAgain={handlePlayAgain} onPlayAgainSame={handlePlayAgainSameCandidates} />}
        </Suspense>
      </main>

      {activePlayer && phase === 'PLAYING_ROUND' && matchConfig.preset !== 'FIRST' && <AssetDrawer isOpen={isAssetDrawerOpen} activePlayer={activePlayer} onClose={() => setIsAssetDrawerOpen(false)} onUseAsset={handleUseAsset} />}

      {reviewEligiblePlayer && (
        <BureauReviewModal
          trailingPlayer={reviewEligiblePlayer}
          onSelectOption={handleResolveBureauReview}
          onClose={() => {
            setBureauReviewUsed(true);
            setReviewEligiblePlayer(null);
            if (!startMiniGameIfDue(players)) advanceToNextRound(players);
          }}
        />
      )}
      {phase==='PLAYING_ROUND'&&<TurnTimer seconds={matchConfig.timerSeconds} paused={timerPaused} resetKey={roundInstanceKey} onPausedChange={setTimerPaused} onExpire={expireTurn}/>} 
      {dispatchNotice&&<DispatchNotice notice={dispatchNotice}/>} 
      <HostControlsModal isOpen={isHostControlsOpen} canExit={phase !== 'TITLE'} canControlRound={phase==='PLAYING_ROUND'} phase={phase} playerCount={players.length||selectedPlayerCount} roundType={showRoundHeader?currentRoundDefinition.type:undefined} challengeId={currentChallenge?.id} timerPaused={timerPaused} onTimerPausedChange={setTimerPaused} onSkip={skipChallenge} onRestart={restartRound} onClose={() => setIsHostControlsOpen(false)} onExit={handleExitGame}/>
    </BureauRoomBackdrop>
  );
}
