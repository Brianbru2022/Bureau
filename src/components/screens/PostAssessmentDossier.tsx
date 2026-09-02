import type { AdjudicationRecord, Player } from '../../types';
import type { ScoreSnapshot } from '../../data/commendations';
import { buildPlayerDossier, createScoreProgressionPoints } from '../../game/dossier';
import { BureauAvatar } from '../common/BureauAvatar';

interface Props {
  player: Player;
  rank: number;
  isWinner: boolean;
  scoreHistory: ScoreSnapshot[];
  adjudicationHistory: AdjudicationRecord[];
  solo?: boolean;
}

const decisionLabel = (record: AdjudicationRecord): string => record.reversedAt !== undefined
  ? 'Reversed'
  : record.decision === 'AUTOMATIC' ? 'Automatic'
  : record.decision === 'HOST_ACCEPTED' ? 'Host accepted'
  : record.decision === 'HOST_EDITED' ? 'Host edited'
  : 'Host rejected';

const metric = (label: string, value: string) => <div><dt className="font-black uppercase">{label}</dt><dd>{value}</dd></div>;

export const PostAssessmentDossier = ({ player, rank, isWinner, scoreHistory, adjudicationHistory, solo = false }: Props) => {
  const dossier = buildPlayerDossier(player, scoreHistory, adjudicationHistory);
  const activeRulings = dossier.adjudications.filter(record => record.reversedAt === undefined);
  const hostAccepted = activeRulings.filter(record => record.decision === 'HOST_ACCEPTED' || record.decision === 'HOST_EDITED').length;
  const progressionLabel = dossier.scoreProgression.map((score, index) => `${index === 0 ? 'Start' : `Filing ${index}`}: ${score}`).join(', ');

  return <article className={`bureau-post-dossier rounded-xl border-2 p-3 ${isWinner ? 'border-[#765139] bg-[#e8d36a]' : 'border-[#b48f61] bg-[#fff7df]'}`}>
    <div className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-2"><span className="font-['Space_Mono'] font-black">{solo?'SOLO':`#${rank}`}</span><BureauAvatar player={player} size={38}/><strong className="truncate font-['Cinzel'] text-[#244b55]">{player.name}</strong></div><span className="shrink-0 font-['Space_Mono'] font-black text-[#376d9b]">{player.score.toLocaleString()}</span></div>
    <dl className="mt-3 grid grid-cols-2 gap-2 font-['Courier_Prime'] text-xs text-[#5f4b3c] sm:grid-cols-3">
      {metric('Best department', dossier.bestDepartment ? `${dossier.bestDepartment.label} • ${Math.round(dossier.bestDepartment.averageScore ?? 0)} avg` : 'No department filed')}
      {metric('Knowledge area', dossier.strongestKnowledgeArea ? `${dossier.strongestKnowledgeArea.category} • ${Math.round(dossier.strongestKnowledgeArea.averageScore)} avg` : 'No category filed')}
      {metric('Closest map', dossier.closestMapKm === null ? 'Not attempted' : `${dossier.closestMapKm.toFixed(1)} km`)}
      {metric('Closest estimate', dossier.closestEstimatePercent === null ? 'Not attempted' : `${dossier.closestEstimatePercent.toFixed(1)}% error`)}
      {metric('Strongest risk', dossier.strongestRiskScore === null ? `${player.stats.successfulRisks}/${player.stats.risksTaken} survived` : `${dossier.strongestRiskScore.toLocaleString()} pts banked`)}
      {metric('Best chronology', dossier.bestChronology ? `${dossier.bestChronology.label} • ${dossier.bestChronology.bestScore}` : 'Not attempted')}
      {metric('Host rulings', `${hostAccepted} accepted of ${activeRulings.length}${dossier.adjudications.length !== activeRulings.length ? ` • ${dossier.adjudications.length - activeRulings.length} reversed` : ''}`)}
      {metric('Directive', player.secretDirective.isCompleted ? 'Completed' : 'Not completed')}
    </dl>
    <div className="bureau-dossier-progression mt-3 rounded-lg border border-[#b48f61] bg-[#fff7df]/75 p-2"><div className="flex items-center justify-between font-['Courier_Prime'] text-xs font-black uppercase text-[#5f4b3c]"><span>Score progression</span><span>{dossier.scoreProgression.at(-1)?.toLocaleString() ?? 0} pts</span></div><svg role="img" aria-label={progressionLabel} viewBox="0 0 300 72" className="mt-1 h-14 w-full overflow-visible"><title>{progressionLabel}</title><path d="M0 72 H300" stroke="#b48f61" strokeWidth="1"/><polyline points={createScoreProgressionPoints(dossier.scoreProgression)} fill="none" stroke="#2f8f95" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
    <details className="mt-3 rounded-lg border border-[#b48f61] bg-[#fff7df]/70 p-2 font-['Courier_Prime'] text-xs text-[#5f4b3c]"><summary className="cursor-pointer font-black uppercase">Department record ({dossier.departmentPerformance.filter(item => item.attempts > 0).length}/17 attempted)</summary><div className="mt-2 grid gap-1 sm:grid-cols-2">{dossier.departmentPerformance.map(item=><div key={item.roundType} className="flex justify-between gap-2 border-t border-[#d6bf91] pt-1"><span>{item.label}</span><strong>{item.attempts ? `${Math.round(item.averageScore ?? 0)} avg` : 'Not drawn'}</strong></div>)}</div></details>
    {dossier.adjudications.length > 0 ? <details className="mt-3 rounded-lg border border-[#b48f61] bg-[#fff7df]/70 p-2 font-['Courier_Prime'] text-xs text-[#5f4b3c]"><summary className="cursor-pointer font-black uppercase">Answer rulings ({dossier.adjudications.length})</summary><ul className="mt-2 space-y-2">{dossier.adjudications.map(record=><li key={`${record.challengeId}-${record.recordedAt}`} className="border-t border-[#d6bf91] pt-2"><strong>{decisionLabel(record)}:</strong> “{record.submittedAnswer}”{record.acceptedAnswer ? ` → ${record.acceptedAnswer}` : ''}<span className="mt-0.5 block">{record.reason ?? 'No explanation was stored in this legacy record.'}</span></li>)}</ul></details> : null}
  </article>;
};
