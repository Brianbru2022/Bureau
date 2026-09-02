import type { DifficultyProfile, QuestionPackManifest } from '../types';
import { inferredDifficulty } from './editorial';
import { EDITORIAL_APPROVALS } from './editorialApprovals';
import { allChallenges } from './questions';
import { sourceReference } from './sourceAuthorities';

const PREPARED_ON = '2026-08-31';
const TIME_SENSITIVE_REVIEW_BY = '2027-02-28';

const profile = (difficulty: ReturnType<typeof inferredDifficulty>): DifficultyProfile =>
  difficulty === 'EASY' ? 'ACCESSIBLE' : difficulty === 'HARD' ? 'EXPERT' : 'MIXED';

const aliasesFor = (challenge: (typeof allChallenges)[number]): string[] => {
  switch (challenge.roundType) {
    case 'TOP_10': return challenge.items.flatMap(item=>item.aliases);
    case 'PUT_UP_OR_SHUT_UP': case 'THE_LIST': return challenge.validAnswers.flatMap(item=>item.aliases);
    case 'IMAGE_REVEAL': case 'REDACTED_RECORDS': case 'COMMON_DOSSIER': return challenge.aliases;
    default: return [];
  }
};

const acceptedAnswersFor = (challenge: (typeof allChallenges)[number]): string[] => {
  switch (challenge.roundType) {
    case 'TOP_10': return challenge.items.map(item => item.name);
    case 'PUT_UP_OR_SHUT_UP':
    case 'THE_LIST': return challenge.validAnswers.map(item => item.name);
    case 'WHERE_IN_BRITAIN': return [challenge.targetName];
    case 'CLOSEST_WINS': return [challenge.formatDisplay?.(challenge.correctValue) ?? `${challenge.unitPrefix ?? ''}${challenge.correctValue}${challenge.unitSuffix ?? challenge.unit}`];
    case 'RANK_IT': return [...challenge.items].sort((a, b) => a.correctRank - b.correctRank).map(item => item.label);
    case 'IMAGE_REVEAL': return [challenge.subjectName];
    case 'STOP_THE_SCORE': return [challenge.options[challenge.correctIndex]];
    case 'MISFILED_RECORDS': {
      const record = challenge.records.find(item => item.id === challenge.misfiledRecordId);
      return [record?.label ?? challenge.misfiledRecordId, challenge.connectionOptions[challenge.correctConnectionIndex]];
    }
    case 'REDACTED_RECORDS': return [challenge.subjectName];
    case 'COMMON_DOSSIER': return [challenge.connection];
    case 'MISSING_MINUTES': return [challenge.entries[challenge.missingEntryIndex]];
    case 'PUBLIC_ENQUIRY': return [challenge.isTrue ? 'True' : 'False'];
    case 'CHAIN_OF_COMMAND': return [...challenge.chain];
    case 'COMPLAINTS_DESK': return [challenge.statements[challenge.falseStatementIndex]];
    case 'SEATING_COMMITTEE': return [...challenge.correctOrder];
    case 'DISPATCH_BOX': return challenge.questions.map(question => question.options[question.correctIndex]);
  }
};

const splitSources=(source:string)=>source.split(';').map(value=>value.trim()).filter(Boolean);
const sourcesFor = (challenge:(typeof allChallenges)[number]) => challenge.roundType==='DISPATCH_BOX' ? challenge.questions.flatMap(question=>splitSources(question.source)) : splitSources(challenge.source);
const rationaleFor = (challenge:(typeof allChallenges)[number]) => challenge.roundType==='DISPATCH_BOX' ? challenge.questions.map((question,index)=>`${index+1}. ${question.explanation}`).join(' ') : challenge.explanation;
const isTimeSensitive = (challenge:(typeof allChallenges)[number],sources:string[]) => challenge.roundType==='TOP_10'||/current|latest|population|census|visitor|attendance|record|largest|longest|highest|most |premier league|ranking|official figures/i.test(`${challenge.prompt} ${sources.join(' ')}`);
const difficultyRationale = (challenge:(typeof allChallenges)[number],difficulty:DifficultyProfile) => `${difficulty} profile assigned by the filed ${challenge.roundType.toLowerCase().replaceAll('_',' ')} complexity rules; independent reviewer confirmation is required.`;
const contentFingerprint = (parts:unknown[]):string => {
  const value=JSON.stringify(parts);let hash=2166136261;
  for(let index=0;index<value.length;index+=1){hash^=value.charCodeAt(index);hash=Math.imul(hash,16777619);}
  return `fnv1a32-${(hash>>>0).toString(16).padStart(8,'0')}`;
};

export const QUESTION_PACK_MANIFEST: QuestionPackManifest = {
  schemaVersion: 3,
  packId: 'questionable-knowledge-core-2026.3',
  title: 'The Bureau of Questionable Knowledge — Core British Assessment Pack',
  challengeCount: allChallenges.length,
  preparedOn:PREPARED_ON,
  entries: allChallenges.map(challenge => {
    const sources=sourcesFor(challenge);
    const difficulty=profile(inferredDifficulty(challenge));
    const approval=EDITORIAL_APPROVALS[challenge.id];
    const timeSensitive=isTimeSensitive(challenge,sources);
    const acceptedAnswers=acceptedAnswersFor(challenge);
    const aliases=aliasesFor(challenge);
    const rationale=rationaleFor(challenge);
    const reviewBy=timeSensitive?TIME_SENSITIVE_REVIEW_BY:undefined;
    const fingerprint=contentFingerprint([challenge.id,challenge.roundType,challenge.prompt,acceptedAnswers,aliases,rationale,sources,difficulty,timeSensitive,reviewBy]);
    const currentApproval=approval?.contentFingerprint===fingerprint?approval:undefined;
    return {
      challengeId:challenge.id,
      contentFingerprint:fingerprint,
      roundType:challenge.roundType,
      sourceRecordPreparedOn:PREPARED_ON,
      verificationDate:currentApproval?.status==='APPROVED'?currentApproval.reviewedOn:undefined,
      difficulty,
      difficultyReview:{profile:difficulty,method:currentApproval?.status==='APPROVED'?'INDEPENDENT_REVIEW':'RULES_ENGINE',rationale:difficultyRationale(challenge,difficulty)},
      source:sources.join('; '),
      sourceReferences:sources.map(sourceReference),
      answerRationale:rationale,
      acceptedAnswers,
      aliases,
      timeSensitive,
      reviewBy,
      editorialStatus:currentApproval?.status??'READY_FOR_INDEPENDENT_REVIEW',
      independentReview:approval?{reviewerId:approval.reviewerId,reviewedOn:approval.reviewedOn,contentFingerprint:approval.contentFingerprint,notes:approval.notes,attestation:approval.attestation}:undefined,
      mediaLicence:challenge.roundType==='IMAGE_REVEAL'?challenge.mediaLicence??'Wikimedia Commons; individual attribution recorded in public/assets/reconnaissance/CORE-LICENCES.json':undefined,
    };
  }),
};
