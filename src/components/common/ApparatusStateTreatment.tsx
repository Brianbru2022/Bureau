import React from 'react';
import type { RoundType, RoundVisualState } from '../../types';

export type ApparatusMechanism = 'ROUTE' | 'SHUTTER' | 'PAPER' | 'PRESSURE' | 'CAPSULE' | 'RAIL' | 'IRIS' | 'GAUGE' | 'SORTER' | 'BALLOT';

export interface ApparatusTreatmentProfile {
  mechanism: ApparatusMechanism;
  anchorX: number;
  anchorY: number;
  accent: string;
}

export const APPARATUS_TREATMENT_PROFILES: Record<RoundType, ApparatusTreatmentProfile> = {
  WHERE_IN_BRITAIN: { mechanism:'ROUTE', anchorX:760, anchorY:520, accent:'#2fa8ae' },
  TOP_10: { mechanism:'SHUTTER', anchorX:760, anchorY:520, accent:'#e28a45' },
  PUT_UP_OR_SHUT_UP: { mechanism:'PAPER', anchorX:790, anchorY:540, accent:'#b94f58' },
  THE_LIST: { mechanism:'PRESSURE', anchorX:760, anchorY:520, accent:'#d8a72e' },
  CLOSEST_WINS: { mechanism:'CAPSULE', anchorX:760, anchorY:520, accent:'#3f9b74' },
  RANK_IT: { mechanism:'RAIL', anchorX:760, anchorY:535, accent:'#4c82c3' },
  IMAGE_REVEAL: { mechanism:'IRIS', anchorX:730, anchorY:510, accent:'#7b64b4' },
  STOP_THE_SCORE: { mechanism:'GAUGE', anchorX:745, anchorY:520, accent:'#dd5e55' },
  MISFILED_RECORDS: { mechanism:'SORTER', anchorX:730, anchorY:520, accent:'#c78337' },
  REDACTED_RECORDS: { mechanism:'SHUTTER', anchorX:760, anchorY:520, accent:'#8b516f' },
  COMMON_DOSSIER: { mechanism:'ROUTE', anchorX:750, anchorY:520, accent:'#327d70' },
  MISSING_MINUTES: { mechanism:'PAPER', anchorX:760, anchorY:520, accent:'#4a7290' },
  PUBLIC_ENQUIRY: { mechanism:'BALLOT', anchorX:760, anchorY:535, accent:'#a14f61' },
  CHAIN_OF_COMMAND: { mechanism:'RAIL', anchorX:760, anchorY:520, accent:'#ba7041' },
  COMPLAINTS_DESK: { mechanism:'GAUGE', anchorX:760, anchorY:520, accent:'#b94d56' },
  SEATING_COMMITTEE: { mechanism:'SORTER', anchorX:760, anchorY:520, accent:'#477b5a' },
  DISPATCH_BOX: { mechanism:'PAPER', anchorX:760, anchorY:535, accent:'#a7423d' },
};

interface ApparatusStateTreatmentProps {
  state: RoundVisualState;
  roundType?: RoundType;
  eliminated?: boolean;
}

export const ApparatusStateGlyph: React.FC<ApparatusStateTreatmentProps> = ({ state, roundType, eliminated = false }) => {
  const profile = APPARATUS_TREATMENT_PROFILES[roundType ?? 'WHERE_IN_BRITAIN'];
  const treatment = eliminated ? 'eliminated' : state.toLowerCase();
  return (
    <span className="bureau-state-glyph bureau-state-ribbon-mark" data-treatment={treatment} data-mechanism={profile.mechanism.toLowerCase()} aria-hidden="true" style={{'--treatment-accent':profile.accent} as React.CSSProperties}>
      <svg viewBox="-285 -225 570 450" focusable="false">
        {eliminated ? <g className="bureau-treatment-eliminated"><rect x="-235" y="-74" width="470" height="148" rx="24"/><path d="M-184-42L-92 42M-72-42L20 42M40-42L132 42M152-42L210 12"/><g transform="translate(0 -105)">{[-54,0,54].map(x=><circle key={x} cx={x} r="19"/>)}</g></g> : <g className="bureau-treatment-machine"><Mechanism kind={profile.mechanism}/></g>}
      </svg>
    </span>
  );
};

const Mechanism: React.FC<{ kind:ApparatusMechanism }> = ({ kind }) => {
  switch (kind) {
    case 'ROUTE': return <><path className="bureau-treatment-route" d="M-170 65C-105-55-20 130 55-22S170-52 188 48"/><circle className="bureau-treatment-terminal" cx="-170" cy="65" r="18"/><path className="bureau-treatment-certified-pin" d="M188 20c-22 0-39 17-39 38 0 31 39 68 39 68s39-37 39-68c0-21-17-38-39-38zm0 24a14 14 0 110 28 14 14 0 010-28z"/></>;
    case 'SHUTTER': return <><rect className="bureau-treatment-housing" x="-205" y="-112" width="410" height="224" rx="24"/><g className="bureau-treatment-shutter-door">{[-72,-36,0,36,72].map(y=><rect key={y} x="-177" y={y-10} width="354" height="20" rx="5"/>)}</g><path className="bureau-treatment-shutter-handle" d="M-55 94h110v38H-55z"/></>;
    case 'PAPER': return <><rect className="bureau-treatment-feed" x="-120" y="-118" width="240" height="42" rx="10"/><path className="bureau-treatment-paper" d="M-98-75h196v228l-28-14-28 14-28-14-28 14-28-14-28 14-28-14z"/><path className="bureau-treatment-paper-lines" d="M-63-25h126M-63 14h126M-63 53h94M-63 92h112"/></>;
    case 'PRESSURE': return <><circle className="bureau-treatment-housing" r="164"/><path className="bureau-treatment-gauge-arc" d="M-112 76A136 136 0 012112 76"/><path className="bureau-treatment-needle" d="M0 58V-98"/><circle className="bureau-treatment-hub" cy="58" r="22"/><g className="bureau-treatment-valve" transform="translate(0 180)"><circle r="43"/><path d="M-58 0h116M0-58v116M-40-40l80 80M40-40l-80 80"/></g></>;
    case 'CAPSULE': return <><path className="bureau-treatment-capsule-left" d="M-205 65v-82a112 112 0 01224 0v82z"/><path className="bureau-treatment-capsule-right" d="M19 65v-82a112 112 0 01224 0v82z"/><path className="bureau-treatment-seal-line" d="M-181 25H-5M43 25h176"/></>;
    case 'RAIL': return <><path className="bureau-treatment-rail" d="M-250-48H250M-250 48H250"/><g className="bureau-treatment-carriage">{[-168,-84,0,84,168].map(x=><rect key={x} x={x-32} y="-69" width="64" height="138" rx="10"/>)}</g><path className="bureau-treatment-lock" d="M-42 78h84v72h-84zM-25 78v-22a25 25 0 0150 0v22"/></>;
    case 'IRIS': return <><circle className="bureau-treatment-housing" r="184"/><g className="bureau-treatment-iris">{Array.from({length:8}).map((_,i)=><path key={i} transform={`rotate(${i*45})`} d="M0-162C58-145 97-105 117-48L18-8C-5-58-9-108 0-162z"/>)}</g><circle className="bureau-treatment-aperture" r="60"/></>;
    case 'GAUGE': return <><path className="bureau-treatment-gauge-arc" d="M-190 94A214 214 0 01190 94"/><path className="bureau-treatment-ticks" d="M-177 66l-25 10M-126-52l-20-19M0-102v-29M126-52l20-19M177 66l25 10"/><path className="bureau-treatment-needle" d="M0 92V-84"/><circle className="bureau-treatment-hub" cy="92" r="25"/></>;
    case 'SORTER': return <><path className="bureau-treatment-rail" d="M-245 92H245"/>{[-180,-90,0,90,180].map((x,i)=><g key={x} className="bureau-treatment-sort-card" style={{'--sort-index':i} as React.CSSProperties}><rect x={x-36} y="-80" width="72" height="148" rx="9"/><circle cx={x} cy="-46" r="10"/></g>)}<path className="bureau-treatment-lock" d="M-40 93h80v58h-80z"/></>;
    case 'BALLOT': return <><rect className="bureau-treatment-housing" x="-218" y="-112" width="436" height="224" rx="28"/><path className="bureau-treatment-scale" d="M0-66v132M-150-30h300M-150-30l-56 82h112zM150-30l-56 82h112z"/><g className="bureau-treatment-ballots">{[-96,-32,32,96].map(x=><circle key={x} cx={x} cy="92" r="17"/>)}</g></>;
  }
};

/** Decorative machinery only. The adjacent live status ribbon carries every
 * state in text, so blocked artwork never removes gameplay information. */
export const ApparatusStateTreatment: React.FC<ApparatusStateTreatmentProps> = ({ state, roundType, eliminated = false }) => {
  if (!eliminated && (state === 'IDLE' || state === 'ACTIVE')) return null;
  const profile = APPARATUS_TREATMENT_PROFILES[roundType ?? 'WHERE_IN_BRITAIN'];
  const treatment = eliminated ? 'eliminated' : state.toLowerCase();

  return (
    <div className="bureau-state-treatment pointer-events-none absolute inset-0 z-[6]" data-treatment={treatment} data-mechanism={profile.mechanism.toLowerCase()} aria-hidden="true" style={{'--treatment-accent':profile.accent} as React.CSSProperties}>
      <svg viewBox="0 0 1536 1024" preserveAspectRatio="none" className="h-full w-full" focusable="false">
        <path className="bureau-treatment-edge" d="M34 176V42h174M1328 42h174v134M34 848v134h174M1328 982h174V848" />
        <g className="bureau-treatment-machine" transform={`translate(${profile.anchorX} ${profile.anchorY})`}><Mechanism kind={profile.mechanism}/></g>
        <g className="bureau-treatment-lamp-bank" transform="translate(1368 142)">{[0,1,2].map(i=><g key={i} transform={`translate(${i*48-48} 0)`}><circle r="20"/><circle className="bureau-treatment-lamp-core" r="11"/></g>)}</g>
        {state === 'PROCESSING' && !eliminated ? <g className="bureau-treatment-processing" transform="translate(1380 244)"><circle r="58"/><path d="M0-45V-67M32-32l16-16M45 0h22M32 32l16 16M0 45v22M-32 32l-16 16M-45 0h-22M-32-32l-16-16"/><circle r="20"/></g> : null}
        {eliminated ? <g className="bureau-treatment-eliminated" transform="translate(768 850)"><rect x="-235" y="-74" width="470" height="148" rx="24"/><path d="M-184-42L-92 42M-72-42L20 42M40-42L132 42M152-42L210 12"/><g transform="translate(0 -105)">{[-54,0,54].map(x=><circle key={x} cx={x} r="19"/>)}</g></g> : null}
        {state === 'RESULT' && !eliminated ? <g className="bureau-treatment-result" transform="translate(1320 760)"><path d="M0 0h150v190H0z"/><path d="M24 45h102M24 76h102M24 107h78M24 138h92"/><path d="M-20 18h150v190H-20z"/></g> : null}
      </svg>
    </div>
  );
};
