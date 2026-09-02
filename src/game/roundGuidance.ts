import type { RoundType } from '../types';

export interface RoundGuidance {
  participation: string;
  scoring: string;
  duration: string;
  example: string;
  hostCue: string;
}

export const ROUND_GUIDANCE: Record<RoundType, RoundGuidance> = {
  WHERE_IN_BRITAIN: { participation:'Each candidate places one private pin', scoring:'Closer pins earn more, up to 1,000', duration:'2–4 minutes', example:'Asked for St Andrews? Tap its approximate position, then lock the coordinates.', hostCue:'Let the route animation finish before discussing the answer.' },
  TOP_10: { participation:'Candidates alternate entries and have three lives each', scoring:'Obscure lower-ranked entries are worth more', duration:'3–5 minutes', example:'Name one valid Top 10 entry; a wrong or repeated answer costs a life.', hostCue:'An eliminated candidate stops answering, but everyone else continues.' },
  PUT_UP_OR_SHUT_UP: { participation:'Raise the claim or pass; the highest bidder proves it', scoring:'Larger successful claims earn more', duration:'3–5 minutes', example:'“I can name four” means four valid answers with no mistake.', hostCue:'Read bids as claims, not points: I can name 1, 2, 3 and so on.' },
  THE_LIST: { participation:'Each candidate builds and banks a separate list', scoring:'Longer safely banked lists earn more', duration:'2–4 minutes', example:'Give another valid answer or bank the current total before risking it.', hostCue:'Remind the candidate that one rejected answer loses the unbanked run.' },
  CLOSEST_WINS: { participation:'Every candidate enters a sealed estimate', scoring:'Percentage accuracy determines the score', duration:'About 2 minutes', example:'Estimate the figure privately; reveal only after everyone has filed.', hostCue:'Keep later candidates from seeing earlier estimates.' },
  RANK_IT: { participation:'Each candidate orders the same kind of sequence', scoring:'Exact positions and correct pair order both score', duration:'2–4 minutes', example:'Arrange the cards from earliest to latest, smallest to largest, or as instructed.', hostCue:'Read the requested direction aloud before the candidate confirms.' },
  IMAGE_REVEAL: { participation:'Each candidate chooses when to identify the image', scoring:'Earlier identification retains more points', duration:'2–4 minutes', example:'Identify now for a high score, or open the iris and sacrifice points.', hostCue:'Do not name visible features that would give the subject away.' },
  STOP_THE_SCORE: { participation:'Each candidate chooses how many points to risk', scoring:'Correct answers bank the chosen value; wrong answers score zero', duration:'2–4 minutes', example:'Stop at 600, then answer the multiple-choice question for those 600 points.', hostCue:'Confirm the stake before showing or accepting the answer.' },
  MISFILED_RECORDS: { participation:'Each candidate identifies an odd record and its proper connection', scoring:'Accuracy and response time determine the award continuously', duration:'2–4 minutes', example:'Find the item that does not belong, then choose the group it properly joins.', hostCue:'Both parts must be filed before the sorter can certify the answer.' },
  REDACTED_RECORDS: { participation:'Each candidate identifies one subject from progressively revealed clues', scoring:'Earlier correct identification retains more points', duration:'2–4 minutes', example:'Answer from the first clue, or reveal another clue at a cost.', hostCue:'Allow another clue rather than paraphrasing the current one.' },
  COMMON_DOSSIER: { participation:'Each candidate finds the connection between four exhibits', scoring:'Fewer revealed hints and faster answers retain more points', duration:'2–4 minutes', example:'Four names may share a place, event, author or category.', hostCue:'Ask for the precise connection rather than a vague theme.' },
  MISSING_MINUTES: { participation:'Each candidate studies a factual register before one entry is removed', scoring:'Correct recall earns more when viewing time is shorter', duration:'2–4 minutes', example:'Study six facts, close the register, then identify the missing one.', hostCue:'The candidate decides when the original register closes.' },
  PUBLIC_ENQUIRY: { participation:'One candidate is the witness while the others form a confidence jury', scoring:'Scores follow calibrated belief and the claim’s actual truth', duration:'3–5 minutes', example:'Judge a factual claim and record how likely you think it is to be true.', hostCue:'Keep percentages private until every juror has filed.' },
  CHAIN_OF_COMMAND: { participation:'Each candidate completes a factual chronology from six possible records', scoring:'Correct order and elapsed time determine the award continuously', duration:'2–4 minutes', example:'Continue a sequence of monarchs, inventions or events from earliest to latest.', hostCue:'Two available records are decoys and do not belong in the sequence.' },
  COMPLAINTS_DESK: { participation:'Each candidate identifies the single inaccurate statement', scoring:'Correctness, confidence and elapsed time all affect the award', duration:'2–4 minutes', example:'Select the false fact, then state how certain you are.', hostCue:'Confidence changes the exact score but cannot rescue a wrong objection.' },
  SEATING_COMMITTEE: { participation:'Each candidate orders five factual records', scoring:'Every displaced record proportionally reduces the award', duration:'2–4 minutes', example:'Arrange people by birth or events by date, earliest to latest.', hostCue:'Read the requested direction before the candidate certifies the order.' },
  DISPATCH_BOX: { participation:'Each candidate answers five rapid general-knowledge briefs', scoring:'Each correct answer earns its continuously declining available value', duration:'3–5 minutes', example:'Choose one answer for each brief before its value falls further.', hostCue:'Move straight to the next brief after each filed response.' }
};

export const guidanceFor = (type: RoundType): RoundGuidance => ROUND_GUIDANCE[type];
