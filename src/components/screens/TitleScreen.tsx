import React from 'react';
import { BureauInsignia } from '../common/BureauInsignia';
import { GeneratedArtBackdrop } from '../common/GeneratedArtBackdrop';
import { sound } from '../../sound/audioEngine';
import { ArrowDown, ArrowRight, ArrowUp, Ban, ChevronDown, Clock3, Eye, RotateCcw, Shuffle, Sparkles, Star, Users, X } from 'lucide-react';
import type { DifficultyProfile, GameLengthPreset, PoliticsMode, RoundType, ScorePaceProfile, TurnTimerSeconds } from '../../types';
import { ALL_ROUND_TYPES, composeAssessmentSchedule, DEFAULT_ROUND_ORDER, FIRST_ASSESSMENT_ROUND_ORDER, PRESET_ROUND_COUNTS, ROUND_FAMILIES, ROUND_FAMILY_LABELS } from '../../game/match';
import { loadDepartmentPreferences, loadRecentDepartmentIds, saveDepartmentPreferences } from '../../game/session';
import { ROUND_LABELS } from '../../game/roundCatalog';
import { useModalFocus } from '../common/useModalFocus';
import { DesktopDataControls } from '../common/DesktopDataControls';
import { estimateAssessmentDuration } from '../../game/pacing';
import { SCORE_PACE_DESCRIPTIONS, SCORE_PACE_LABELS } from '../../game/scorePacing';

interface TitleScreenProps {
  onStartGame: (playerCount: number, preset: GameLengthPreset, roundTypes: RoundType[], timerSeconds: TurnTimerSeconds, politicsMode:PoliticsMode, guidedMode:boolean, difficultyProfile:DifficultyProfile, scorePaceProfile:ScorePaceProfile) => void;
  canResume?: boolean;
  onResume?: () => void;
  onDiscardResume?: () => void;
  sessionNotice?: string|null;
  betaRequirement?: {groupCode:string;label:string;playerCount:1|2|4;preset:'FIRST'|'QUICK'|'STANDARD'|'FULL';politicsMode:'OFF'|'LIGHT'|'STANDARD'};
}

const PRESETS: Array<{ id: GameLengthPreset; label: string; detail: string }> = [
  { id: 'FIRST', label: 'First Assessment', detail: 'Start here · 4 rounds' },
  { id: 'QUICK', label: 'Quick', detail: '4 rounds' },
  { id: 'STANDARD', label: 'Standard', detail: '6 rounds' },
  { id: 'FULL', label: 'Full Bureau', detail: '8 rounds' },
  { id: 'CUSTOM', label: 'Custom', detail: 'Choose 4–8' }
];

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStartGame, canResume = false, onResume, onDiscardResume, sessionNotice, betaRequirement }) => {
  const [preset, setPreset] = React.useState<GameLengthPreset>('FIRST');
  const [selectedRounds, setSelectedRounds] = React.useState<RoundType[]>(DEFAULT_ROUND_ORDER);
  const [departmentPreferences, setDepartmentPreferences] = React.useState(loadDepartmentPreferences);
  const [randomSchedule, setRandomSchedule] = React.useState<RoundType[]>(FIRST_ASSESSMENT_ROUND_ORDER);
  const [showItinerary, setShowItinerary] = React.useState(false);
  const [showPreferences, setShowPreferences] = React.useState(false);
  const [showHostOptions, setShowHostOptions] = React.useState(false);
  const [showAdvancedSetup, setShowAdvancedSetup] = React.useState(false);
  const [timerSeconds, setTimerSeconds] = React.useState<TurnTimerSeconds>(0);
  const [politicsMode,setPoliticsMode]=React.useState<PoliticsMode>('OFF');
  const [guidedMode,setGuidedMode]=React.useState(false);
  const [difficultyProfile,setDifficultyProfile]=React.useState<DifficultyProfile>('ACCESSIBLE');
  const [scorePaceProfile,setScorePaceProfile]=React.useState<ScorePaceProfile>('RELAXED');
  const itineraryButtonRef = React.useRef<HTMLButtonElement>(null);
  const toggleRound = (type: RoundType) => setSelectedRounds(current => current.includes(type) ? (current.length > 4 ? current.filter(item => item !== type) : current) : (current.length < 8 ? [...current, type] : current));
  const moveRound = (index:number, delta:number) => setSelectedRounds(current => { const target=index+delta; if(target<0||target>=current.length)return current; const next=[...current]; [next[index],next[target]]=[next[target],next[index]]; return next; });
  const drawSchedule = (nextPreset: Exclude<GameLengthPreset, 'CUSTOM'>, preferences = departmentPreferences) => setRandomSchedule(nextPreset === 'FIRST' ? [...FIRST_ASSESSMENT_ROUND_ORDER] : composeAssessmentSchedule(PRESET_ROUND_COUNTS[nextPreset], undefined, loadRecentDepartmentIds(), preferences));
  const selectPreset = (nextPreset: GameLengthPreset) => {
    const leavingFirstAssessment = preset === 'FIRST' && nextPreset !== 'FIRST';
    setPreset(nextPreset);
    if (nextPreset === 'FIRST') {
      setTimerSeconds(0); setPoliticsMode('OFF'); setGuidedMode(false); setDifficultyProfile('ACCESSIBLE'); setScorePaceProfile('RELAXED'); setShowHostOptions(false);
    } else if (leavingFirstAssessment) {
      setPoliticsMode(nextPreset === 'QUICK' ? 'LIGHT' : 'STANDARD'); setGuidedMode(true); setDifficultyProfile('MIXED'); setScorePaceProfile('STANDARD');
    }
    if (nextPreset !== 'CUSTOM') drawSchedule(nextPreset);
  };
  const activeSchedule = preset === 'CUSTOM' ? selectedRounds : randomSchedule;
  const startSelectedAssessment = (playerCount: number) => {
    sound.playStamp();
    onStartGame(playerCount, preset, activeSchedule, timerSeconds, playerCount === 1 ? 'OFF' : politicsMode, guidedMode, difficultyProfile, scorePaceProfile);
  };
  const startFirstAssessment = (playerCount: number) => {
    sound.playStamp();
    onStartGame(playerCount, 'FIRST', [...FIRST_ASSESSMENT_ROUND_ORDER], 0, 'OFF', true, 'ACCESSIBLE', 'RELAXED');
  };
  const startRecommendedAssessment = (playerCount: 2 | 3 | 4) => {
    const schedule = composeAssessmentSchedule(PRESET_ROUND_COUNTS.QUICK, undefined, loadRecentDepartmentIds(), departmentPreferences);
    sound.playStamp();
    onStartGame(playerCount, 'QUICK', schedule, 0, 'LIGHT', true, 'MIXED', 'STANDARD');
  };
  const closeItinerary = React.useCallback(() => {
    setShowItinerary(false);
  }, []);
  const itineraryDialogRef = useModalFocus<HTMLElement>({ isOpen: showItinerary, onEscape: closeItinerary });
  const closePreferences = React.useCallback(() => setShowPreferences(false), []);
  const preferencesDialogRef = useModalFocus<HTMLElement>({ isOpen: showPreferences, onEscape: closePreferences });
  React.useEffect(() => {
    if (!betaRequirement) return;
    setPreset(betaRequirement.preset);
    setTimerSeconds(0);
    setPoliticsMode(betaRequirement.politicsMode);
    setGuidedMode(betaRequirement.preset !== 'FIRST');
    setDifficultyProfile(betaRequirement.preset === 'FIRST' ? 'ACCESSIBLE' : 'MIXED');
    setScorePaceProfile(betaRequirement.preset === 'FIRST' ? 'RELAXED' : 'STANDARD');
    setShowHostOptions(false);
    setShowAdvancedSetup(true);
    setRandomSchedule(betaRequirement.preset === 'FIRST' ? [...FIRST_ASSESSMENT_ROUND_ORDER] : composeAssessmentSchedule(PRESET_ROUND_COUNTS[betaRequirement.preset], undefined, loadRecentDepartmentIds(), departmentPreferences));
  }, [betaRequirement?.groupCode, betaRequirement?.politicsMode, betaRequirement?.preset]);
  const updateDepartmentPreference = (type: RoundType, mode: 'FAVOURITE' | 'EXCLUDED') => {
    const isFavourite = departmentPreferences.favouriteRoundTypes.includes(type);
    const isExcluded = departmentPreferences.excludedRoundTypes.includes(type);
    const next = saveDepartmentPreferences({
      favouriteRoundTypes: mode === 'FAVOURITE'
        ? (isFavourite ? departmentPreferences.favouriteRoundTypes.filter(item => item !== type) : [...departmentPreferences.favouriteRoundTypes.filter(item => item !== type), type])
        : departmentPreferences.favouriteRoundTypes.filter(item => item !== type),
      excludedRoundTypes: mode === 'EXCLUDED'
        ? (isExcluded ? departmentPreferences.excludedRoundTypes.filter(item => item !== type) : [...departmentPreferences.excludedRoundTypes.filter(item => item !== type), type])
        : departmentPreferences.excludedRoundTypes.filter(item => item !== type)
    });
    setDepartmentPreferences(next);
    if (preset !== 'CUSTOM') drawSchedule(preset, next);
  };
  return (
    <div className="bureau-title-screen bureau-scrollbar relative flex-1 overflow-x-hidden overflow-y-auto rounded-[24px]">
      <GeneratedArtBackdrop src="/assets/generated/grand-hall.jpg" dim={0.42} animate />
      <div className="bureau-title-content relative z-10 flex min-h-[78vh] flex-col items-center justify-center text-center max-w-5xl mx-auto py-6 sm:py-9 px-3">
        <div className="bureau-title-insignia bureau-float mb-3 rounded-[28px] border-[4px] border-[#7e5c24] bg-[#fff7df]/94 px-7 py-4 shadow-[0_8px_0_#7b4f32,0_18px_32px_rgba(76,52,33,.2)]">
          <BureauInsignia size={104} />
        </div>

        <div className="bureau-title-hero relative max-w-3xl bureau-paper rounded-[28px] border-[4px] border-[#7e5c24] px-7 pt-14 pb-6 sm:px-12 sm:py-8 mb-6 bg-[#fff7df]/94">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full border-2 border-[#7e5c24] bg-[#2f8f95] px-5 py-1.5 text-[#fff7df] font-['Courier_Prime'] text-[10px] font-bold uppercase tracking-[0.25em] shadow-[0_4px_0_#7b4f32]">
            Independent Bureau of Assessment &amp; Cataloguing
          </div>
          <h1 className="font-['Cinzel'] font-black uppercase leading-none text-[#244b55] drop-shadow-[0_3px_0_rgba(255,255,255,.7)]">
            <span className="block text-xl tracking-[0.2em] sm:text-2xl">The Bureau of</span>
            <span className="bureau-title-primary mt-1 block text-4xl tracking-[0.035em] sm:text-6xl md:text-7xl">Questionable Knowledge</span>
          </h1>
          <p className="font-['Fraunces'] text-base sm:text-xl text-[#6b4f3a] max-w-2xl mx-auto leading-relaxed mt-4 italic">Britain's most overqualified institution for testing knowledge, judgement, nerve and your ability to be confidently wrong in public.</p>
          <p className="mt-3 font-['Courier_Prime'] text-xs font-bold uppercase tracking-[0.12em] text-[#745d46]">A fictional institution · No government or Royal Household affiliation</p>
        </div>

        <div className="bureau-title-setup w-full max-w-2xl rounded-[26px] border-[4px] border-[#6c4931] bg-[#67c4c1]/96 p-5 sm:p-7 bureau-enamel">
          {sessionNotice && <div role="status" className="mb-4 rounded-xl border-2 border-[#a9443d] bg-[#f6d5ca] p-3 text-left font-['Courier_Prime'] text-[10px] font-bold text-[#7a3934]">{sessionNotice}</div>}
          {betaRequirement && <div role="status" className="mb-4 rounded-xl border-[3px] border-[#4f7457] bg-[#eef1d9] p-3 text-left"><strong className="font-['Cinzel'] text-sm text-[#244b55]">Independent beta session armed: {betaRequirement.groupCode}</strong><p className="mt-1 font-['Fraunces'] text-sm text-[#52604d]">Required configuration: {betaRequirement.label}. Other format and candidate controls are locked for this evidence session.</p></div>}
          {canResume && <div className="mb-5 rounded-2xl border-[3px] border-[#6c4931] bg-[#fff7df] p-3 text-left shadow-[0_4px_0_#6c4931]">
            <strong className="font-['Cinzel'] text-sm text-[#244b55]">Unfinished assessment located</strong>
            <p className="mt-1 font-['Courier_Prime'] text-[10px] text-[#6b4f3a]">Resume from the last filed round, or discard the paperwork.</p>
            <div className="mt-3 flex flex-wrap gap-2"><button onClick={onResume} className="bureau-button rounded-xl bg-[#4f7457] px-4 py-2 text-xs font-black uppercase text-white"><RotateCcw size={14} className="mr-1 inline"/>Resume game</button><button onClick={()=>{if(window.confirm('Discard the unfinished assessment and start again?'))onDiscardResume?.();}} className="rounded-xl px-3 py-2 font-['Courier_Prime'] text-[10px] font-bold uppercase text-[#a9443d]">Start again</button></div>
          </div>}
          <DesktopDataControls />
          {!showAdvancedSetup && !betaRequirement && <div className="bureau-simple-setup space-y-4 text-left" aria-label="Simple assessment setup">
            <div className="bureau-simple-intro">
              <p className="font-['Courier_Prime'] text-xs font-black uppercase tracking-[0.2em] text-[#765232]">Choose a straightforward filing route</p>
              <h2 className="font-['Cinzel'] text-xl font-black text-[#244b55]">Who is playing?</h2>
              <p className="mt-1 font-['Fraunces'] text-sm text-[#52604d]">The Bureau will choose suitable settings. Advanced choices stay out of the way unless you ask for them.</p>
            </div>
            <section className="bureau-simple-first rounded-2xl border-[3px] border-[#4f7457] bg-[#eef1d9] p-4" aria-labelledby="first-assessment-heading">
              <div className="flex items-start gap-3"><Sparkles className="mt-0.5 shrink-0 text-[#4f7457]" size={20}/><div><h3 id="first-assessment-heading" className="font-['Cinzel'] text-sm font-black text-[#244b55]">First Assessment</h3><p className="mt-1 font-['Fraunces'] text-sm text-[#52604d]">Best for new candidates: four approachable departments, guided control demonstrations and no timer, directives, assets or Office Politics.</p></div></div>
              <div className="mt-3 grid grid-cols-4 gap-2">{[1,2,3,4].map(num=><button key={num} type="button" aria-label={`Start First Assessment with ${num} ${num===1?'candidate':'candidates'}`} onClick={()=>startFirstAssessment(num)} className="bureau-button min-h-12 rounded-xl border-2 border-[#6c4931] bg-[#fff7df] px-2 py-2 text-[#244b55]"><strong className="block font-['Space_Mono'] text-lg">{num}</strong><span className="block font-['Courier_Prime'] text-xs font-black uppercase">{num===1?'Solo':'Candidates'}</span></button>)}</div>
            </section>
            <section className="bureau-simple-recommended rounded-2xl border-[3px] border-[#6c4931] bg-[#f6d77a] p-4" aria-labelledby="recommended-heading">
              <div className="flex items-start gap-3"><Users className="mt-0.5 shrink-0 text-[#a9443d]" size={20}/><div><h3 id="recommended-heading" className="font-['Cinzel'] text-sm font-black text-[#244b55]">Recommended Multiplayer</h3><p className="mt-1 font-['Fraunces'] text-sm text-[#5f4b39]">A balanced four-department match with mixed questions, guided demonstrations, no timer and light Office Politics.</p></div></div>
              <div className="mt-3 grid grid-cols-3 gap-2">{([2,3,4] as const).map(num=><button key={num} type="button" aria-label={`Start recommended multiplayer with ${num} players`} onClick={()=>startRecommendedAssessment(num)} className="bureau-button min-h-12 rounded-xl border-2 border-[#6c4931] bg-[#376d9b] px-2 py-2 text-white"><strong className="block font-['Space_Mono'] text-lg">{num}</strong><span className="block font-['Courier_Prime'] text-xs font-black uppercase">Players</span></button>)}</div>
            </section>
            <button type="button" aria-expanded="false" onClick={()=>setShowAdvancedSetup(true)} className="bureau-simple-customise bureau-button flex w-full items-center justify-between rounded-xl border-2 border-[#6c4931] bg-[#fff7df] px-4 py-3 text-left text-[#244b55]"><span><strong className="block font-['Cinzel'] text-xs">Customise assessment</strong><span className="font-['Fraunces'] text-xs text-[#665348]">Choose length, question profile, departments, timer and Office Politics</span></span><ChevronDown size={18}/></button>
          </div>}
          {(showAdvancedSetup || betaRequirement) && <>
          {!betaRequirement && <button type="button" onClick={()=>setShowAdvancedSetup(false)} className="mb-4 font-['Courier_Prime'] text-[10px] font-black uppercase text-[#244b55] underline decoration-2 underline-offset-4">← Back to simple setup</button>}
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-center gap-2 text-[#244b55]"><Clock3 size={17}/><span className="font-['Cinzel'] text-xs font-black uppercase tracking-wider">Match length · number of departments</span></div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{PRESETS.map(option => <button key={option.id} disabled={Boolean(betaRequirement&&option.id!==betaRequirement.preset)} aria-pressed={preset === option.id} onClick={() => selectPreset(option.id)} className={`rounded-xl border-2 border-[#6c4931] px-2 py-2 disabled:cursor-not-allowed disabled:opacity-35 ${preset === option.id ? 'bg-[#e0a83f] text-[#49361e] shadow-[0_3px_0_#6c4931]' : 'bg-[#fff7df] text-[#244b55]'}`}><strong className="block font-['Cinzel'] text-[10px] sm:text-xs">{option.label}</strong><span className="font-['Courier_Prime'] text-xs uppercase">{option.detail}</span></button>)}</div>
            <p className="mt-2 font-['Fraunces'] text-xs text-[#52604d]"><strong>Question familiarity · not match length:</strong> the profile under Host options changes how familiar or obscure questions are, never how many departments you play.</p>
            {preset === 'FIRST' && <div className="mt-3 rounded-xl border-[3px] border-[#4f7457] bg-[#eef1d9] p-3 text-left"><strong className="flex items-center gap-2 font-['Cinzel'] text-sm text-[#244b55]"><Sparkles size={16}/>Recommended for new candidates</strong><p className="mt-1 font-['Fraunces'] text-sm text-[#52604d]">Register names, follow a short control demonstration, then play four approachable departments with no timer, private directives, assets, committee votes or extra final case.</p></div>}
            {preset !== 'CUSTOM' && preset !== 'FIRST' && <><p className="mt-2 font-['Courier_Prime'] text-xs font-bold uppercase text-[#244b55]">The Bureau will draw a balanced itinerary of {PRESET_ROUND_COUNTS[preset]} departments, avoiding the previous two assessments where possible.</p><div className="mt-2 flex flex-wrap justify-center gap-2"><button ref={itineraryButtonRef} onClick={()=>setShowItinerary(true)} className="bureau-button rounded-lg border-2 border-[#6c4931] bg-[#fff7df] px-3 py-2 font-['Courier_Prime'] text-xs font-black uppercase text-[#244b55]"><Eye size={13} className="mr-1 inline"/>Reveal itinerary</button><button onClick={()=>drawSchedule(preset)} className="bureau-button rounded-lg border-2 border-[#6c4931] bg-[#f3d66d] px-3 py-2 font-['Courier_Prime'] text-xs font-black uppercase text-[#49361e]"><Shuffle size={13} className="mr-1 inline"/>Reroll</button><button type="button" onClick={()=>setShowPreferences(true)} className="bureau-button rounded-lg border-2 border-[#6c4931] bg-[#d8efdf] px-3 py-2 font-['Courier_Prime'] text-xs font-black uppercase text-[#244b55]"><Star size={13} className="mr-1 inline"/>Preferences ({departmentPreferences.favouriteRoundTypes.length}/{departmentPreferences.excludedRoundTypes.length})</button></div></>}
          </div>
          {preset === 'CUSTOM' && <div className="mb-5 max-h-52 overflow-y-auto rounded-xl border-2 border-[#6c4931] bg-[#fff7df] p-3 text-left bureau-scrollbar"><div className="mb-2 font-['Courier_Prime'] text-xs font-black uppercase text-[#6b4f3a]">Selected departments: {selectedRounds.length}/8</div>{ALL_ROUND_TYPES.map(type=>{const index=selectedRounds.indexOf(type);const selected=index>=0;return <div key={type} className="mb-1 flex items-center gap-2"><button aria-pressed={selected} onClick={()=>toggleRound(type)} className={`flex-1 rounded-lg border-2 px-3 py-2 text-left font-['Cinzel'] text-[10px] font-black ${selected?'border-[#2f8f95] bg-[#d8efdf] text-[#244b55]':'border-[#b9a888] bg-[#eee5cc] text-[#796a57]'}`}>{selected?`${index+1}. `:''}{ROUND_LABELS[type]}</button>{selected&&<><button aria-label={`Move ${ROUND_LABELS[type]} earlier`} onClick={()=>moveRound(index,-1)} disabled={index===0} className="rounded-lg border-2 border-[#6c4931] p-2 disabled:opacity-30"><ArrowUp size={14}/></button><button aria-label={`Move ${ROUND_LABELS[type]} later`} onClick={()=>moveRound(index,1)} disabled={index===selectedRounds.length-1} className="rounded-lg border-2 border-[#6c4931] p-2 disabled:opacity-30"><ArrowDown size={14}/></button></>}</div>})}</div>}
          {preset !== 'FIRST' && <div className="mb-5 rounded-xl border-[3px] border-[#6c4931] bg-[#fff7df]/85 text-left">
            <button type="button" aria-expanded={showHostOptions} onClick={()=>setShowHostOptions(value=>!value)} className="flex w-full items-center justify-between gap-3 p-3 text-[#244b55]"><span><strong className="block font-['Cinzel'] text-xs">Host options</strong><span className="font-['Fraunces'] text-xs text-[#665348]">Scoring pace, timer, question profile, guidance and optional Office Politics</span></span><ChevronDown size={18} className={showHostOptions?'rotate-180 transition-transform':'transition-transform'}/></button>
            {showHostOptions && <div className="border-t-2 border-[#c8a775] p-3">
              <div className="mb-4 rounded-xl border-2 border-[#6c4931] bg-[#fff7df] p-3"><strong className="block font-['Cinzel'] text-xs text-[#244b55]">Scoring pace</strong><span className="mt-1 block font-['Fraunces'] text-xs text-[#665348]">Controls reading-speed influence in five timed departments. This is separate from the optional countdown timer.</span><div className="mt-2 grid grid-cols-3 gap-2">{(['RELAXED','STANDARD','RAPID'] as ScorePaceProfile[]).map(profile=><button key={profile} type="button" aria-pressed={scorePaceProfile===profile} onClick={()=>setScorePaceProfile(profile)} className={`rounded-lg border-2 border-[#6c4931] px-2 py-2 font-['Courier_Prime'] text-xs font-black ${scorePaceProfile===profile?'bg-[#376d9b] text-white':'bg-[#eee5cc] text-[#74634f]'}`}>{SCORE_PACE_LABELS[profile]}</button>)}</div><span className="mt-2 block font-['Fraunces'] text-xs text-[#665348]">{SCORE_PACE_DESCRIPTIONS[scorePaceProfile]}</span></div>
              <div className="mb-4"><div className="mb-2 font-['Cinzel'] text-xs font-black uppercase text-[#244b55]">Turn timer</div><div className="grid grid-cols-4 gap-2">{([0,30,45,60] as TurnTimerSeconds[]).map(seconds=><button key={seconds} aria-pressed={timerSeconds===seconds} onClick={()=>setTimerSeconds(seconds)} className={`rounded-lg border-2 border-[#6c4931] py-2 font-['Courier_Prime'] text-xs font-black ${timerSeconds===seconds?'bg-[#376d9b] text-white':'bg-[#fff7df] text-[#244b55]'}`}>{seconds===0?'OFF':`${seconds}s`}</button>)}</div></div>
              <div className="mb-4 rounded-xl border-2 border-[#6c4931] bg-[#fff7df] p-3"><strong className="block font-['Cinzel'] text-xs text-[#244b55]">Question familiarity · not match length</strong><span className="mt-1 block font-['Fraunces'] text-xs text-[#665348]">This changes how familiar or obscure the questions are. It never adds departments.</span><div className="mt-2 grid grid-cols-3 gap-2">{(['ACCESSIBLE','MIXED','EXPERT'] as DifficultyProfile[]).map(profile=><button key={profile} aria-pressed={difficultyProfile===profile} onClick={()=>setDifficultyProfile(profile)} className={`rounded-lg border-2 border-[#6c4931] px-2 py-2 font-['Courier_Prime'] text-xs font-black ${difficultyProfile===profile?'bg-[#376d9b] text-white':'bg-[#eee5cc] text-[#74634f]'}`}>{profile==='ACCESSIBLE'?'Familiar':profile==='MIXED'?'Mixed':'Expert'}</button>)}</div><span className="mt-2 block font-['Fraunces'] text-xs text-[#665348]">{difficultyProfile==='ACCESSIBLE'?'Favours recognisable subjects and generous tolerances.':difficultyProfile==='EXPERT'?'Favours obscure registers and tighter estimates.':'Difficulty rises naturally through the assessment.'}</span></div>
              <button aria-pressed={guidedMode} onClick={()=>setGuidedMode(value=>!value)} className={`mb-4 w-full rounded-xl border-2 border-[#6c4931] p-3 text-left ${guidedMode?'bg-[#f3d66d]':'bg-[#eee5cc]'}`}><strong className="font-['Cinzel'] text-xs text-[#244b55]">Host guidance: {guidedMode?'Guided':'Compact'}</strong><span className="mt-1 block font-['Fraunces'] text-xs text-[#665348]">{guidedMode?'Show an example and tactical reminder before each department.':'Show only participation, scoring and duration.'}</span></button>
              <div className="rounded-xl border-2 border-[#6c4931] bg-[#fff7df] p-3"><strong className="block font-['Cinzel'] text-xs text-[#244b55]">Office Politics</strong><div className="mt-2 grid grid-cols-3 gap-2">{(['OFF','LIGHT','STANDARD'] as PoliticsMode[]).map(mode=><button key={mode} disabled={Boolean(betaRequirement&&mode!==betaRequirement.politicsMode)} aria-pressed={politicsMode===mode} onClick={()=>setPoliticsMode(mode)} className={`rounded-lg border-2 border-[#6c4931] px-2 py-2 font-['Courier_Prime'] text-xs font-black disabled:cursor-not-allowed disabled:opacity-35 ${politicsMode===mode?'bg-[#d8efdf] text-[#244b55]':'bg-[#eee5cc] text-[#74634f]'}`}>{mode==='OFF'?'Off':mode==='LIGHT'?'Light':'Standard'}</button>)}</div><span className="mt-2 block font-['Fraunces'] text-xs text-[#665348]">{politicsMode==='OFF'?'No committee interruptions.':politicsMode==='LIGHT'?'Quick predictions appear when a department is ready.':'Committee motions are explained when the Committee Window first opens.'}</span></div>
            </div>}
          </div>}
          <div className="flex items-center justify-center gap-2 mb-4 text-[#244b55]"><Users size={19}/><span className="font-['Cinzel'] font-black text-sm uppercase tracking-[0.13em]">How many candidates survived the journey here?</span></div>
          <div className="grid grid-cols-4 gap-3">{[1,2,3,4].map(num => { const duration=estimateAssessmentDuration(activeSchedule,num,preset,num===1?'OFF':politicsMode); return <button key={num} disabled={Boolean(betaRequirement&&num!==betaRequirement.playerCount)} aria-label={`${num===1?'Solo':`${num} players`}, approximately ${duration.lowerMinutes} to ${duration.upperMinutes} minutes`} onClick={() => startSelectedAssessment(num)} className="bureau-button bureau-mechanical rounded-2xl bg-[#fff7df] px-2 py-3 text-[#244b55] flex flex-col items-center gap-1 cursor-pointer disabled:cursor-not-allowed disabled:opacity-35"><span className="font-['Space_Mono'] font-black text-3xl">{num}</span><span className="font-['Courier_Prime'] text-xs font-bold uppercase tracking-wider text-[#765c47]">{num===1?'Solo':`${num} Players`}</span><span className="font-['Courier_Prime'] text-xs font-black uppercase text-[#376d9b]">{duration.label}</span></button>;})}</div>
          </>}
          <div className="bureau-title-footer mt-5 flex items-center justify-center gap-2 rounded-xl border-2 border-[#7e5c24]/40 bg-[#2f8f95] px-4 py-2.5 text-[#fff7df] shadow-inner"><ArrowRight size={15}/><p className="font-['Courier_Prime'] text-[10px] sm:text-xs font-bold uppercase tracking-wider">One shared screen. No frantic handovers. Institutional mercy unavailable.</p></div>
        </div>
      </div>
      {showItinerary && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18343d]/75 p-4" onMouseDown={event=>{if(event.target===event.currentTarget)closeItinerary();}}><section ref={itineraryDialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="assessment-itinerary-title" className="w-full max-w-2xl rounded-[24px] border-[4px] border-[#6c4931] bg-[#fff7df] p-5 text-left shadow-[0_10px_0_#5a3826,0_28px_60px_rgba(20,20,10,.45)]"><div className="flex items-start justify-between gap-4"><div><p className="font-['Courier_Prime'] text-xs font-black uppercase tracking-[.2em] text-[#87603b]">Sealed scheduling docket</p><h2 id="assessment-itinerary-title" className="font-['Cinzel'] text-xl font-black text-[#244b55]">Assessment itinerary</h2><p className="mt-1 font-['Fraunces'] text-sm text-[#665348]">A varied route through knowledge, estimation, memory, risk and visual challenges.</p></div><button type="button" data-modal-autofocus aria-label="Close assessment itinerary" onClick={closeItinerary} className="bureau-button rounded-full border-2 border-[#6c4931] bg-white p-2 text-[#244b55]"><X size={20}/></button></div><ol className="mt-4 grid gap-2 sm:grid-cols-2">{activeSchedule.map((type,index)=><li key={type} className="flex items-center gap-3 rounded-xl border-2 border-[#b99a64] bg-[#f5e6bc] px-3 py-2"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2f8f95] font-['Space_Mono'] text-sm font-black text-white">{index+1}</span><span><strong className="block font-['Cinzel'] text-xs text-[#244b55]">{ROUND_LABELS[type]}</strong><span className="font-['Courier_Prime'] text-xs font-bold uppercase text-[#7a5d43]">{ROUND_FAMILY_LABELS[ROUND_FAMILIES[type]]}</span></span></li>)}</ol><div className="mt-5 flex flex-wrap justify-end gap-2"><button type="button" onClick={()=>drawSchedule(preset as Exclude<GameLengthPreset, 'CUSTOM'>)} className="bureau-button rounded-xl border-2 border-[#6c4931] bg-[#f3d66d] px-4 py-2 font-['Courier_Prime'] text-[10px] font-black uppercase text-[#49361e]"><Shuffle size={14} className="mr-1 inline"/>Reroll itinerary</button><button type="button" onClick={closeItinerary} className="bureau-button rounded-xl bg-[#376d9b] px-5 py-2 font-['Courier_Prime'] text-[10px] font-black uppercase text-white">File itinerary</button></div></section></div>}
      {showPreferences && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18343d]/75 p-4"><section ref={preferencesDialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="department-preferences-title" className="flex max-h-[88vh] w-full max-w-3xl flex-col rounded-[24px] border-[4px] border-[#6c4931] bg-[#fff7df] p-5 text-left shadow-[0_10px_0_#5a3826,0_28px_60px_rgba(20,20,10,.45)]"><div className="flex items-start justify-between gap-4"><div><p className="font-['Courier_Prime'] text-xs font-black uppercase tracking-[.2em] text-[#87603b]">Host scheduling preferences</p><h2 id="department-preferences-title" className="font-['Cinzel'] text-xl font-black text-[#244b55]">Favourite or exclude departments</h2><p className="mt-1 font-['Fraunces'] text-sm text-[#665348]">Favourites receive extra weight in random assessments. Exclusions are omitted while at least eight departments remain available.</p></div><button type="button" data-modal-autofocus aria-label="Close department preferences" onClick={closePreferences} className="bureau-button rounded-full border-2 border-[#6c4931] bg-white p-2 text-[#244b55]"><X size={20}/></button></div><div className="bureau-scrollbar mt-4 grid min-h-0 flex-1 gap-2 overflow-y-auto sm:grid-cols-2">{ALL_ROUND_TYPES.map(type=>{const favourite=departmentPreferences.favouriteRoundTypes.includes(type);const excluded=departmentPreferences.excludedRoundTypes.includes(type);const exclusionLimitReached=departmentPreferences.excludedRoundTypes.length>=ALL_ROUND_TYPES.length-8&&!excluded;return <div key={type} className="rounded-xl border-2 border-[#b99a64] bg-[#f5e6bc] p-2"><strong className="block truncate font-['Cinzel'] text-[10px] text-[#244b55]">{ROUND_LABELS[type]}</strong><div className="mt-2 grid grid-cols-2 gap-2"><button type="button" aria-label={`Favourite ${ROUND_LABELS[type]}`} aria-pressed={favourite} onClick={()=>updateDepartmentPreference(type,'FAVOURITE')} className={`bureau-button rounded-lg border-2 border-[#6c4931] px-2 py-2 font-['Courier_Prime'] text-xs font-black uppercase ${favourite?'bg-[#e0a83f] text-[#49361e]':'bg-white text-[#6b5946]'}`}><Star size={13} className="mr-1 inline"/>Favourite</button><button type="button" aria-label={`Exclude ${ROUND_LABELS[type]}`} aria-pressed={excluded} disabled={exclusionLimitReached} onClick={()=>updateDepartmentPreference(type,'EXCLUDED')} className={`bureau-button rounded-lg border-2 border-[#6c4931] px-2 py-2 font-['Courier_Prime'] text-xs font-black uppercase disabled:opacity-40 ${excluded?'bg-[#a9443d] text-white':'bg-white text-[#6b5946]'}`}><Ban size={13} className="mr-1 inline"/>Exclude</button></div></div>})}</div><div className="mt-4 flex items-center justify-between gap-3"><span className="font-['Courier_Prime'] text-xs font-bold uppercase text-[#6b5946]">{departmentPreferences.favouriteRoundTypes.length} favourite • {departmentPreferences.excludedRoundTypes.length} excluded</span><button type="button" onClick={closePreferences} className="bureau-button rounded-xl bg-[#376d9b] px-5 py-2 font-['Courier_Prime'] text-[10px] font-black uppercase text-white">File preferences</button></div></section></div>}
    </div>
  );
};
