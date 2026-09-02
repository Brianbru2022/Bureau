import { useState } from 'react';
import type { MatchConfig, Player, RoundType } from '../../types';
import { AwardsPodium } from '../screens/AwardsPodium';
import { createMatchConfigFromSchedule } from '../../game/match';
import { createReplayMatchConfig } from '../../game/replay';
import { seededRandom } from '../../game/progression';
import { ROUND_LABELS } from '../../game/roundCatalog';

const completedSchedule: RoundType[] = ['WHERE_IN_BRITAIN','TOP_10','THE_LIST','CLOSEST_WINS','RANK_IT','STOP_THE_SCORE'];
const baseStats = (offset: number): Player['stats'] => ({
  roundsPlayed:6, correctAnswers:4, totalAnswers:6, bestScore:780-offset, worstScore:120,
  mapDistancesKm:[42+offset], estimateErrorsPercent:[5.4+offset/10], risksTaken:1, successfulRisks:1,
  highestBankedList:520-offset, categoriesAttempted:new Set(['History','Geography']), interceptCount:0,
  challengeScores:[620,480,520,700,660,580].map(score=>score-offset), mapScores:[620-offset],
  successfulListBanks:[520-offset], categoryScores:{History:[620-offset,660-offset],Geography:[480-offset]}, assetsUsed:[],
  successfulRiskScores:[580-offset], roundScores:Object.fromEntries(completedSchedule.map((type,index)=>[type,[620-index*20-offset]]))
});
const players: Player[] = [
  {id:'candidate-1',name:'Candidate 1',avatar:'🧭',color:'#2f8f95',department:'Cartography',score:3820,influence:1,assets:[],secretDirective:{id:'dir-precisionist',codeName:'OPERATION MICROMETER',title:'The Precisionist',description:'Achieve an estimate error under 12%.',targetMetric:'< 12% estimate error',bonusPoints:650,isCompleted:false,progressText:'Assessing operational progress...'},stats:baseStats(0)},
  {id:'candidate-2',name:'Candidate 2',avatar:'📚',color:'#376d9b',department:'Archives',score:3510,influence:0,assets:[],secretDirective:{id:'dir-survivor',codeName:'OPERATION RETENTION',title:'The Survivor',description:'Bank at least 600 points in The List.',targetMetric:'Bank 600+ on The List',bonusPoints:550,isCompleted:false,progressText:'Assessing operational progress...'},stats:baseStats(70)},
  {id:'candidate-3',name:'Candidate 3',avatar:'🔬',color:'#d9644f',department:'Measurements',score:3290,influence:2,assets:[],secretDirective:{id:'dir-steady',codeName:'OPERATION LEVEL DESK',title:'The Steady Hand',description:'Finish every department with a filed score.',targetMetric:'File every department',bonusPoints:500,isCompleted:false,progressText:'Assessing operational progress...'},stats:baseStats(105)},
  {id:'candidate-4',name:'Candidate 4',avatar:'🔎',color:'#7ca66f',department:'Oversight',score:3070,influence:1,assets:[],secretDirective:{id:'dir-risk',codeName:'OPERATION BRASS NECK',title:'The Calculated Risk',description:'Complete a successful risk.',targetMetric:'Complete one successful risk',bonusPoints:525,isCompleted:false,progressText:'Assessing operational progress...'},stats:baseStats(140)}
];
const completedConfig = createMatchConfigFromSchedule('STANDARD', completedSchedule, 45, 'LIGHT', true, 'MIXED');

export default function PostAssessmentLab() {
  const [replay, setReplay] = useState<MatchConfig | null>(null);
  if (replay) return <main className="grid min-h-dvh place-items-center bg-[#efe3be] p-6"><section role="status" className="bureau-paper max-w-2xl rounded-[24px] border-[4px] border-[#765139] p-6 text-center"><p className="font-['Courier_Prime'] text-[10px] font-black uppercase text-[#a9443d]">Replay dispatch certified</p><h1 className="mt-1 font-['Cinzel'] text-2xl font-black text-[#244b55]">Same candidates, fresh assessment</h1><p className="mt-2 font-['Fraunces'] text-[#665348]">{players.map(player=>player.name).join(' and ')} retained. Timer, guidance, politics and difficulty settings preserved.</p><ol className="mt-4 grid gap-2 sm:grid-cols-2">{replay.roundTypes.map((type,index)=><li key={type} className="rounded-lg border-2 border-[#b48f61] bg-[#fff7df] px-3 py-2 font-['Courier_Prime'] text-xs"><strong>{index+1}.</strong> {ROUND_LABELS[type]}</li>)}</ol></section></main>;
  return <main className="min-h-dvh bg-[#efe3be] p-3 lg:flex lg:h-dvh lg:flex-col lg:overflow-hidden"><div className="mx-auto mb-2 max-w-5xl shrink-0 font-['Courier_Prime'] text-[10px] font-black uppercase text-[#765139]">Development file • four-candidate post-assessment viewport laboratory</div><AwardsPodium players={players} hiddenCommendations={[]} scoreHistory={[{roundNumber:1,scores:{'candidate-1':620,'candidate-2':550,'candidate-3':510,'candidate-4':470}},{roundNumber:3,scores:{'candidate-1':1680,'candidate-2':1510,'candidate-3':1430,'candidate-4':1360}},{roundNumber:6,scores:{'candidate-1':3820,'candidate-2':3510,'candidate-3':3290,'candidate-4':3070}}]} adjudicationHistory={[{challengeId:'top-test',playerId:'candidate-1',submittedAnswer:'St Pauls',acceptedAnswer:"St Paul's Cathedral",decision:'HOST_EDITED',reason:'Host corrected punctuation and accepted the canonical answer.',recordedAt:1}]} onPlayAgain={()=>setReplay(createMatchConfigFromSchedule('STANDARD',completedSchedule))} onPlayAgainSame={()=>setReplay(createReplayMatchConfig(completedConfig,completedSchedule,{favouriteRoundTypes:['DISPATCH_BOX'],excludedRoundTypes:['PUBLIC_ENQUIRY']},seededRandom(91)))}/></main>;
}
