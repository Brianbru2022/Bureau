import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { RoundType } from '../types';

const ROUND_COMPONENTS:Record<RoundType,string>={
  WHERE_IN_BRITAIN:'WhereInBritainRound.tsx',TOP_10:'Top10Round.tsx',PUT_UP_OR_SHUT_UP:'PutUpOrShutUpRound.tsx',THE_LIST:'TheListRound.tsx',
  CLOSEST_WINS:'ClosestWinsRound.tsx',RANK_IT:'RankItRound.tsx',IMAGE_REVEAL:'ImageRevealRound.tsx',STOP_THE_SCORE:'StopTheScoreRound.tsx',
  MISFILED_RECORDS:'MisfiledRecordsRound.tsx',REDACTED_RECORDS:'RedactedRecordsRound.tsx',COMMON_DOSSIER:'CommonDossierRound.tsx',MISSING_MINUTES:'MissingMinutesRound.tsx',
  PUBLIC_ENQUIRY:'PublicEnquiryRound.tsx',CHAIN_OF_COMMAND:'ChainOfCommandRound.tsx',COMPLAINTS_DESK:'ComplaintsDeskRound.tsx',SEATING_COMMITTEE:'SeatingCommitteeRound.tsx',DISPATCH_BOX:'DispatchBoxRound.tsx'
};

describe('shared result dossier coverage',()=>{
  it.each(Object.entries(ROUND_COMPONENTS))('%s uses the shared Bureau Finding dossier',(_roundType,fileName)=>{
    const source=readFileSync(new URL(`../components/rounds/${fileName}`,import.meta.url),'utf8');
    expect(source).toContain('CommentaryPlaque');
  });

  it('keeps the shared dossier sections in one component',()=>{
    const source=readFileSync(new URL('../components/common/CommentaryPlaque.tsx',import.meta.url),'utf8');
    for(const label of ['Points certified','Submitted','Certified answer','Archival record and source',"Supervisor's finding"])expect(source).toContain(label);
  });
});
