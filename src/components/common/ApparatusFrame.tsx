import React, { createContext, useContext } from 'react';
import type { RoundType, RoundVisualState, ScorePaceProfile, VisualAssetVariant } from '../../types';
import { getApparatusArt, getApparatusRound } from '../../data/visualAssetManifest';
import { markArtworkUnavailable } from '../../game/visualState';
import { ApparatusStateGlyph, ApparatusStateTreatment } from './ApparatusStateTreatment';
import { MECHANIC_IDENTITIES } from '../../game/mechanicIdentity';
import { MechanicIdentityPlate } from './MechanicIdentityPlate';
import { SCORE_PACE_DESCRIPTIONS, SCORE_PACE_LABELS } from '../../game/scorePacing';

interface ApparatusFrameProps {
  eyebrow: string;
  title: string;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  accent?: string;
  instrumentLabel?: string;
  controlLabel?: string;
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
  state?: RoundVisualState;
  decorativeArt?: VisualAssetVariant;
  dataRoundType?: RoundType;
  eliminated?: boolean;
  scorePaceProfile?: ScorePaceProfile;
}

const APPARATUS_STATE_LABELS: Record<RoundVisualState, string> = {
  IDLE: 'Ready',
  ACTIVE: 'Active',
  PROCESSING: 'Processing',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  RESULT: 'Result filed',
};

/** Development certification can force the presentation state while retaining
 * the real department component, controls and artwork. Production rendering
 * leaves this context unset and continues to use each round's own state. */
export const ApparatusStateOverrideContext = createContext<RoundVisualState | null>(null);

export const APPARATUS_CONTROL_LABELS: Record<string,string> = {
  'MAP TABLE':'Plotting map and coordinate lock','FLIP REGISTER':'Registry answer entry and life lamps','ARCHIVE OPEN':'Certified registry shutters',
  'BID CONSOLE':'Claim ladder and contract register','CONTRACT RESULT':'Contract outcome ledger','PRESSURE DRUM':'Answer feed and bank control',
  'CALIBRATOR':'Sealed estimate capsule','METRIC ENGINE':'Certified comparison board','ORDER RAIL':'Sorting rail and move controls',
  'SORTER LOCKED':'Certified order rail','OPTICAL IRIS':'Iris controls and subject choices','VOLATILITY GAUGE':'Stake gauge and confirmation seal',
  'ARCHIVE SORTER':'Record and connection selectors','REDACTION DESK':'Disclosure controls and subject selector','CORRELATION ENGINE':'Evidence connection selector',
  'FACT RECORDER':'Fact register and recall answer','ENQUIRY LECTERN':'Private brief and confidence ballot','KNOWLEDGE RELAY':'Chronology selection rail',
  'COMPLAINTS DESK':'Statement objection and confidence','ORDERING COMMITTEE':'Committee sorting rail','DISPATCH BOX':'Rapid answer controls',
};

export const ApparatusFrame: React.FC<ApparatusFrameProps> = ({
  eyebrow,
  title,
  subtitle,
  icon,
  accent = '#1e9fa8',
  instrumentLabel,
  controlLabel,
  children,
  className = '',
  compact = false,
  state = 'ACTIVE',
  decorativeArt: decorativeArtOverride,
  dataRoundType,
  eliminated = false,
  scorePaceProfile,
}) => {
  const stateOverride = useContext(ApparatusStateOverrideContext);
  const visualState = stateOverride ?? state;
  const decorativeArt = stateOverride
    ? getApparatusArt(instrumentLabel, visualState) ?? decorativeArtOverride
    : decorativeArtOverride ?? getApparatusArt(instrumentLabel, visualState);
  const roundType = dataRoundType ?? getApparatusRound(instrumentLabel);
  const resolvedControlLabel = controlLabel ?? (instrumentLabel ? APPARATUS_CONTROL_LABELS[instrumentLabel] : undefined) ?? 'Primary interaction controls';
  return (
  <section data-apparatus-state={visualState.toLowerCase()} data-apparatus-outcome={eliminated ? 'eliminated' : undefined} data-round-type={roundType?.toLowerCase()} data-compact={compact || undefined} className={`bureau-apparatus-frame relative w-full overflow-hidden rounded-[28px] border-[4px] border-[#6e4b31] bg-[#f3e5c4] shadow-[0_20px_0_#5a3925,0_30px_55px_rgba(57,35,20,.3)] ${className}`}>
    <div className="absolute inset-x-0 top-0 h-4" style={{ background: accent }} />
    <div className="absolute left-3 top-3 h-4 w-4 rounded-full border-2 border-[#74522f] bg-[#d8af58] shadow-inner" />
    <div className="absolute right-3 top-3 h-4 w-4 rounded-full border-2 border-[#74522f] bg-[#d8af58] shadow-inner" />
    <div className="absolute bottom-3 left-3 h-4 w-4 rounded-full border-2 border-[#74522f] bg-[#d8af58] shadow-inner" />
    <div className="absolute bottom-3 right-3 h-4 w-4 rounded-full border-2 border-[#74522f] bg-[#d8af58] shadow-inner" />
    <header className={`bureau-apparatus-header relative z-10 border-b-[3px] border-[#7b5a38] bg-[#fff7df] text-[#253744] ${compact ? 'px-4 pb-3 pt-6 sm:px-6' : 'px-6 pb-5 pt-8 sm:px-8'}`}>
      <div className="flex items-start gap-4">
        {icon && (
          <div className={`${compact ? 'h-11 w-11 rounded-xl' : 'h-14 w-14 rounded-2xl'} flex shrink-0 items-center justify-center border-[3px] border-[#6e4b31] text-white shadow-[0_5px_0_#6e4b31]`} style={{ background: accent }}>
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="font-['Courier_Prime'] text-[10px] font-bold uppercase tracking-[.22em] text-[#7a5940]">{eyebrow}</div>
          <h2 className={`font-['Cinzel'] font-black leading-tight text-[#263b48] ${compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'}`}>{title}</h2>
          {subtitle && <div className={`bureau-instruction-copy mt-1 font-['Fraunces'] text-[#5d5346] ${compact ? 'text-xs' : 'text-sm'}`}>{subtitle}</div>}
        </div>
        {(instrumentLabel || decorativeArt?.attachments?.length) && (
          <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
            <div className="flex items-center gap-2">
              {instrumentLabel ? (
            <span className="rotate-2 rounded-md border-2 border-[#6e4b31] bg-[#f7d86d] px-3 py-1 font-['Courier_Prime'] text-xs font-black uppercase tracking-widest text-[#5e432b] shadow-[0_3px_0_#6e4b31]">
              {instrumentLabel}
            </span>
              ) : null}
              <span className="bureau-apparatus-state bureau-operational-copy flex items-center gap-2 rounded-full border-2 border-[#65442c] px-3 py-1 font-['Courier_Prime'] font-black uppercase tracking-widest"><span className="h-2 w-2 rounded-full bg-current"/>{eliminated ? 'Eliminated' : APPARATUS_STATE_LABELS[visualState]}</span>
              {scorePaceProfile ? <span className="bureau-score-pace" title={SCORE_PACE_DESCRIPTIONS[scorePaceProfile]} aria-label={`Scoring pace: ${SCORE_PACE_LABELS[scorePaceProfile]}`}>{SCORE_PACE_LABELS[scorePaceProfile]} pace</span> : null}
            </div>
            {decorativeArt?.attachments?.length ? (
              <div className="bureau-apparatus-console" aria-hidden="true">
                {decorativeArt.attachments.map(attachment => <span key={attachment.id} data-kind={attachment.kind.toLowerCase()} className="bureau-console-indicator" />)}
              </div>
            ) : null}
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 sm:hidden">
        {instrumentLabel ? <span className="truncate font-['Courier_Prime'] text-xs font-black uppercase tracking-widest text-[#6e4b31]">{instrumentLabel}</span> : <span />}
        <span className="bureau-apparatus-state bureau-operational-copy flex shrink-0 items-center gap-2 rounded-full border-2 border-[#65442c] px-3 py-1 font-['Courier_Prime'] font-black uppercase tracking-widest"><span className="h-2 w-2 rounded-full bg-current"/>{eliminated ? 'Eliminated' : APPARATUS_STATE_LABELS[visualState]}</span>
        {scorePaceProfile ? <span className="bureau-score-pace" title={SCORE_PACE_DESCRIPTIONS[scorePaceProfile]} aria-label={`Scoring pace: ${SCORE_PACE_LABELS[scorePaceProfile]}`}>{SCORE_PACE_LABELS[scorePaceProfile]} pace</span> : null}
      </div>
    </header>

    {roundType && MECHANIC_IDENTITIES[roundType]
      ? <MechanicIdentityPlate roundType={roundType} controlLabel={resolvedControlLabel}/>
      : <div className="bureau-control-legend relative z-10 flex items-center justify-between gap-3 border-b-[3px] border-[#7b5a38] px-4 py-2 sm:px-6">
          <span className="bureau-operational-copy font-['Courier_Prime'] font-black uppercase tracking-[.14em] text-[#76533a]">Active control</span>
          <strong className="text-right font-['Cinzel'] text-[10px] font-black text-[#294b55] sm:text-xs">{resolvedControlLabel}</strong>
        </div>}

    {eliminated || !['IDLE','ACTIVE'].includes(visualState) ? (
      <div role="status" aria-live="polite" className="bureau-state-ribbon relative z-10 flex items-center justify-center gap-3 border-b-[3px] px-4 py-2 text-center font-['Courier_Prime'] text-[10px] font-black uppercase tracking-[.16em]" data-state={eliminated ? 'eliminated' : visualState.toLowerCase()}>
        <ApparatusStateGlyph state={visualState} roundType={roundType} eliminated={eliminated}/>
        {eliminated ? 'Candidate eliminated; remaining candidates continue' : visualState === 'PROCESSING' ? 'Apparatus consulting the register' : visualState === 'ACCEPTED' ? 'Entry accepted and certified' : visualState === 'REJECTED' ? 'Entry rejected by the register' : 'Result filed for inspection'}
      </div>
    ) : null}

    <div className={`bureau-apparatus-body relative z-10 overflow-hidden ${compact ? 'p-3 sm:p-4' : 'p-4 sm:p-6'}`} data-has-art={decorativeArt ? '' : undefined}>
      {decorativeArt && <picture className="pointer-events-none absolute inset-0 z-0"><source media="(max-width: 800px)" srcSet={decorativeArt.compact}/><img src={decorativeArt.desktop} alt={decorativeArt.alt} aria-hidden="true" onError={event => markArtworkUnavailable(event.currentTarget)} className="bureau-apparatus-art h-full w-full object-cover mix-blend-multiply" /></picture>}
      {decorativeArt?.overlay && <picture className="pointer-events-none absolute inset-0 z-[2]"><source media="(max-width: 800px)" srcSet={decorativeArt.overlay.compact}/><img src={decorativeArt.overlay.desktop} alt="" aria-hidden="true" onError={event => markArtworkUnavailable(event.currentTarget)} className="h-full w-full object-cover" /></picture>}
      {decorativeArt?.attachments?.map(attachment => (
        <span
          key={attachment.id}
          aria-hidden="true"
          data-attachment-id={attachment.id}
          data-kind={attachment.kind.toLowerCase()}
          className="bureau-apparatus-attachment pointer-events-none absolute z-[5]"
          style={{
            left: `${attachment.xPercent}%`,
            top: `${attachment.yPercent}%`,
            '--aperture-width': attachment.widthPercent ? `${attachment.widthPercent}%` : undefined,
            '--aperture-height': attachment.heightPercent ? `${attachment.heightPercent}%` : undefined,
          } as React.CSSProperties}
        >
          <span className="bureau-mechanism-core" />
          <span className="bureau-mechanism-detail" />
        </span>
      ))}
      {decorativeArt?.stateTreatment ? <ApparatusStateTreatment state={decorativeArt.stateTreatment} roundType={roundType} eliminated={eliminated} /> : null}
      <div className="pointer-events-none absolute inset-x-5 top-0 h-2 rounded-b-full bg-[#cda96a]/55" />
      <div className="bureau-apparatus-interaction relative z-10">{children}</div>
    </div>
  </section>
  );
};
