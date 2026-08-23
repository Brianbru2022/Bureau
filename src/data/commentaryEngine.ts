/**
 * THE BUREAU COMMENTARY ENGINE
 *
 * Use the actual question, submitted answer and verified context first.
 * Score-only remarks are deliberately the last resort.
 */

export interface BureauPlayerHistory {
  roundsPlayed?: number;
  correctAnswers?: number;
  totalAnswers?: number;
  bestScore?: number;
  worstScore?: number;
}

export interface ScoreCommentaryInput {
  score: number;
  playerName: string;
  roundType: string;
  questionPrompt?: string;
  playerAnswer?: string | number;
  correctAnswer?: string | number;
  explanation?: string;
  errorKm?: number;
  errorPercent?: number;
  riskedValue?: number;
  isCorrect?: boolean;
  history?: BureauPlayerHistory;
}

const firstSentence = (text?: string): string => {
  if (!text) return '';
  const match = text.trim().match(/^.*?[.!?](?:\s|$)/);
  return (match?.[0] ?? text.trim()).trim();
};

const asFiniteNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, '').replace(/[^0-9.+-]/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const historyTail = (history?: BureauPlayerHistory): string => {
  if (!history || (history.totalAnswers ?? 0) < 4) return '';
  const total = history.totalAnswers ?? 0;
  const correct = history.correctAnswers ?? 0;
  const rate = total > 0 ? correct / total : 0;
  if (rate >= 0.8) return ' This is becoming an irritating pattern of competence.';
  if (rate <= 0.3) return ' The Bureau notes that this is no longer an isolated incident.';
  return '';
};

/** Small curated hooks for famous facts where the mistake itself creates the joke. */
const subjectAwareAssessment = (input: ScoreCommentaryInput): string | null => {
  if (input.isCorrect !== false) return null;
  const prompt = `${input.questionPrompt ?? ''} ${input.explanation ?? ''}`.toLowerCase();
  const guess = asFiniteNumber(input.playerAnswer);
  const correct = asFiniteNumber(input.correctAnswer);
  if (guess === null || correct === null) return null;
  const difference = Math.abs(guess - correct);

  if (prompt.includes('victoria') && (prompt.includes('die') || prompt.includes('death'))) {
    if (guess > correct) return `Queen Victoria died in ${correct}. Your answer of ${guess} keeps her alive for another ${difference} years, creating some exceptionally awkward royal family gatherings.`;
    return `Queen Victoria died in ${correct}. Your answer of ${guess} removes ${difference} years from her reign, which would require the Victorian era to submit a substantially revised timesheet.`;
  }

  if (prompt.includes('titanic') && (prompt.includes('sink') || prompt.includes('sank'))) {
    if (guess > correct) return `Titanic sank in ${correct}. Your answer of ${guess} grants the ship another ${difference} years of entirely undeserved buoyancy.`;
    return `Titanic sank in ${correct}. Your answer of ${guess} sends her to the bottom ${difference} years before the maiden voyage, which even White Star Line would regard as poor scheduling.`;
  }

  if (prompt.includes('ben nevis') && (prompt.includes('high') || prompt.includes('height') || prompt.includes('metre'))) {
    if (guess < correct) return `Ben Nevis reaches ${correct.toLocaleString()}. At ${guess.toLocaleString()} you've found a perfectly respectable Scottish hill; unfortunately the mountain continues upwards for another ${difference.toLocaleString()}.`;
    return `Ben Nevis reaches ${correct.toLocaleString()}. Your ${guess.toLocaleString()} adds another ${difference.toLocaleString()} to the summit, apparently because Scotland was not mountainous enough already.`;
  }

  if (prompt.includes('battle of hastings') || (prompt.includes('hastings') && prompt.includes('battle'))) {
    return `The Battle of Hastings was in ${correct}. Your answer of ${guess} misses by ${difference} years, leaving William the Conqueror waiting on the beach for history to catch up.`;
  }

  if (prompt.includes('magna carta')) {
    return `Magna Carta was sealed in ${correct}. Your answer of ${guess} moves one of England's most famous constitutional documents by ${difference} years; the barons have lodged an objection.`;
  }

  return null;
};

const mapAssessment = (input: ScoreCommentaryInput): string | null => {
  if (input.roundType !== 'WHERE_IN_BRITAIN' || input.errorKm === undefined) return null;
  const target = input.correctAnswer ? String(input.correctAnswer) : 'the target';
  const km = input.errorKm;
  if (km < 8) return `${km.toFixed(1)} km from ${target}. That is uncomfortably accurate. The Atlas Room has checked the pin twice and, disappointingly, cannot find grounds for an appeal.`;
  if (km < 25) return `${km.toFixed(1)} km from ${target}. Close enough that a determined taxi driver could repair the mistake, though probably not without commenting on it.`;
  if (km < 70) return `${km.toFixed(0)} km from ${target}. You have the right part of the country, which the Bureau is prepared to record as progress rather than triumph.`;
  if (km < 160) return `${km.toFixed(0)} km from ${target}. That is no longer a local misunderstanding; you have moved the place into a noticeably different part of the country.`;
  if (km < 320) return `${km.toFixed(0)} km from ${target}. At this distance the relocation requires paperwork, new road signs and several extremely confused residents.`;
  return `${km.toFixed(0)} km from ${target}. You did not so much locate it as propose an alternative Britain in which geography has become optional.`;
};

const estimateAssessment = (input: ScoreCommentaryInput): string | null => {
  if (input.roundType !== 'CLOSEST_WINS' || input.errorPercent === undefined) return null;
  const guess = asFiniteNumber(input.playerAnswer);
  const correct = asFiniteNumber(input.correctAnswer);
  const error = input.errorPercent;

  if (guess !== null && correct !== null) {
    const difference = Math.abs(guess - correct);
    const direction = guess > correct ? 'high' : guess < correct ? 'low' : 'exactly right';
    if (difference === 0) return `${guess.toLocaleString()} is exactly correct. The measuring apparatus has been opened to check for tampering.`;
    if (error < 5) return `You said ${guess.toLocaleString()}; the certified figure is ${correct.toLocaleString()}. Only ${error.toFixed(1)}% ${direction}. Annoyingly precise.`;
    if (error < 20) return `You said ${guess.toLocaleString()}; reality says ${correct.toLocaleString()}. That's ${error.toFixed(1)}% ${direction}—respectable, although the Statistics Office will not be naming a wing after you.`;
    if (error < 60) return `You said ${guess.toLocaleString()}; the answer is ${correct.toLocaleString()}, a difference of ${difference.toLocaleString()}. At ${error.toFixed(0)}% ${direction}, this has crossed from estimation into creative accounting.`;
    return `You said ${guess.toLocaleString()}; the certified answer is ${correct.toLocaleString()}. An error of ${error.toFixed(0)}% suggests the figure was derived from instinct, weather and possibly a dream.`;
  }

  if (error < 5) return `Only ${error.toFixed(1)}% out. The Bureau dislikes how little there is to criticise here.`;
  if (error < 20) return `${error.toFixed(1)}% out. Perfectly serviceable estimation, which is bureaucratic language for “do not become pleased with yourself.”`;
  if (error < 60) return `${error.toFixed(0)}% out. A confident approximation of a number that reality had already settled.`;
  return `${error.toFixed(0)}% out. The Statistics Office has classified this as numerical fiction.`;
};

const stopScoreAssessment = (input: ScoreCommentaryInput): string | null => {
  if (input.roundType !== 'STOP_THE_SCORE') return null;
  const risked = input.riskedValue ?? input.score;
  const answer = input.playerAnswer !== undefined ? `“${String(input.playerAnswer)}”` : 'your answer';
  const correct = input.correctAnswer !== undefined ? `“${String(input.correctAnswer)}”` : 'the correct answer';

  if (input.isCorrect) {
    if (risked >= 850) return `You risked ${risked} points on ${answer}, and it was correct. The confidence was outrageous; more irritatingly, it was justified.`;
    if (risked <= 300) return `${answer} was correct, but you only trusted it with ${risked} points. Excellent knowledge accompanied by the financial courage of a damp envelope.`;
    return `${answer} was correct and you banked ${risked}. Sensible confidence: competent enough to score, restrained enough to deny us a spectacular failure.`;
  }

  if (input.correctAnswer !== undefined) {
    if (risked >= 800) return `You staked ${risked} points on ${answer}. The answer was ${correct}. This is the rare administrative achievement of being both extremely confident and entirely wrong.`;
    return `You backed ${answer} for ${risked} points. The certified answer was ${correct}; the gauge has therefore converted your confidence into zero with admirable efficiency.`;
  }
  return `You risked ${risked} points and were wrong. The machine has returned the full amount to the Bureau, where it will be better looked after.`;
};

const imageAssessment = (input: ScoreCommentaryInput): string | null => {
  if (input.roundType !== 'IMAGE_REVEAL' || input.playerAnswer === undefined || input.correctAnswer === undefined) return null;
  if (input.isCorrect) return `You identified ${String(input.correctAnswer)} while ${input.score} points were still available. The optical department was hoping to keep the shutters closed a little longer.`;
  return `You identified the image as “${String(input.playerAnswer)}”. It was ${String(input.correctAnswer)}. The apparatus can improve focus; it cannot negotiate with the conclusion you reached.`;
};

const listAssessment = (input: ScoreCommentaryInput): string | null => {
  if (input.roundType !== 'THE_LIST') return null;
  const answer = input.playerAnswer !== undefined ? String(input.playerAnswer) : '';
  if (input.isCorrect && input.score >= 900) return `${answer || 'The run'} survived to ${input.score} points. The filing cabinet is nearly empty and, against expectation, you are not.`;
  if (input.isCorrect && input.score > 0) return `${answer || 'The run'} was banked for ${input.score}. Prudence has defeated greed, which is not the result the entertainment department was hoping for.`;
  if (!input.isCorrect && answer) return `The run ended on “${answer}”. Everything accumulated before it has been converted into an educational memory worth precisely zero points.`;
  if (!input.isCorrect) return `The list collapsed before anything could be banked. An impressively efficient route from knowledge to nothing.`;
  return null;
};

const bidAssessment = (input: ScoreCommentaryInput): string | null => {
  if (input.roundType !== 'PUT_UP_OR_SHUT_UP') return null;
  if (input.isCorrect) return `The claim was fulfilled and ${input.score} points have been awarded. Unfortunately, the bidding confidence now has documentary evidence behind it.`;
  if (input.playerAnswer !== undefined) return `The contract collapsed on “${String(input.playerAnswer)}”. One invalid entry was all it took to transform public confidence into a very official zero.`;
  return `The contract was not fulfilled. The Bureau appreciates the ambition; reality has declined to countersign it.`;
};

const rankAssessment = (input: ScoreCommentaryInput): string | null => {
  if (input.roundType !== 'RANK_IT') return null;
  if (input.score >= 900) return `${input.score} points. The sequence is almost entirely where history, geography or physics left it. Disturbingly orderly.`;
  if (input.score >= 650) return `${input.score} points. Most relationships survived your rearrangement, though several items have filed formal complaints about their new positions.`;
  if (input.score >= 350) return `${input.score} points. There is recognisable structure here, in much the same way that a dropped filing cabinet still contains files.`;
  return `${input.score} points. The sorting rail has requested a full recount and a quiet moment alone.`;
};

const topTenAssessment = (input: ScoreCommentaryInput): string | null => {
  if (input.roundType !== 'TOP_10') return null;
  if (input.playerAnswer !== undefined) {
    const text = String(input.playerAnswer);
    if (input.isCorrect) return `${text}. The Records Office is reluctantly impressed by how much of the board you managed to expose.`;
    return `${text}. The remaining shutters will now be opened by staff with access to the answer key.`;
  }
  return null;
};

const contextualAssessment = (input: ScoreCommentaryInput): string | null =>
  subjectAwareAssessment(input) ??
  mapAssessment(input) ??
  estimateAssessment(input) ??
  stopScoreAssessment(input) ??
  imageAssessment(input) ??
  listAssessment(input) ??
  bidAssessment(input) ??
  rankAssessment(input) ??
  topTenAssessment(input);

const scoreFallback = (input: ScoreCommentaryInput): string => {
  const { score, isCorrect } = input;
  if (isCorrect === false && input.playerAnswer !== undefined && input.correctAnswer !== undefined) return `You submitted “${String(input.playerAnswer)}”; the certified answer was “${String(input.correctAnswer)}”. The discrepancy has been recorded in ink rather than sympathy.`;
  if (score >= 950) return `${score} points. The calculation has been checked twice in the hope of finding an error. None was available.`;
  if (score >= 750) return `${score} points. Strong work. The Bureau has issued a small nod and immediately withdrawn it.`;
  if (score >= 450) return `${score} points. Adequate enough to avoid an inquiry, not impressive enough to cause one.`;
  if (score > 0) return `${score} points. They are legally yours, even if nobody is entirely proud of the circumstances.`;
  return 'Zero points. A remarkably uncluttered contribution to the scoreboard.';
};

export function generateBureauAssessment(input: ScoreCommentaryInput): string {
  const contextual = contextualAssessment(input);
  const fact = firstSentence(input.explanation);
  const tail = historyTail(input.history);

  if (contextual) return `${contextual}${tail}`;
  if (fact && input.isCorrect === false && input.correctAnswer === undefined) return `${fact} ${scoreFallback(input)}${tail}`;
  return `${scoreFallback(input)}${tail}`;
}
