/**
 * THE BUREAU COMMENTARY ENGINE
 * Generates dry, merciless, context-specific British assessment remarks.
 */

interface ScoreCommentaryInput {
  score: number;
  playerName: string;
  roundType: string;
  questionPrompt?: string;
  errorKm?: number;
  errorPercent?: number;
  isCorrect?: boolean;
}

export function generateBureauAssessment(input: ScoreCommentaryInput): string {
  const { score, playerName, roundType, errorKm, errorPercent, isCorrect } = input;

  // 1. Specific Map Distance Commentary
  if (roundType === 'WHERE_IN_BRITAIN' && errorKm !== undefined) {
    if (errorKm < 15) {
      return `A distance error of just ${errorKm.toFixed(1)} km. An unnervingly competent drop. The Bureau suspects either formal cartographic training or deeply suspicious local espionage.`;
    }
    if (errorKm < 45) {
      return `Missed by ${errorKm.toFixed(1)} km. You have landed in the adjacent parish. A respectable effort, though the locals would almost certainly pelt you with turnip tops for claiming they are the same county.`;
    }
    if (errorKm < 120) {
      return `An error of ${errorKm.toFixed(0)} km. You have confounded two entirely distinct cultural regions of Great Britain. The Department of Boundary Disputes has logged this insult.`;
    }
    if (errorKm < 300) {
      return `Missed by ${errorKm.toFixed(0)} km. That is not merely wrong; that is an entirely different dialect, tax code, and geopolitical climate.`;
    }
    return `An astounding ${errorKm.toFixed(0)} km wide of the mark. You appear to have aimed for the North Sea or a remote Celtic sea-trough. The Bureau will dispatch lifeboats on your behalf.`;
  }

  // 2. Specific Numerical Estimate Commentary
  if (roundType === 'CLOSEST_WINS' && errorPercent !== undefined) {
    if (errorPercent < 5) {
      return `An estimate error of only ${errorPercent.toFixed(1)}%. Mathematically offensive in its accuracy. The calculation has been logged with profound reluctance.`;
    }
    if (errorPercent < 20) {
      return `An inaccuracy margin of ${errorPercent.toFixed(1)}%. Tolerable. You would survive a minor civil engineering contract, though the bridge might squeak.`;
    }
    if (errorPercent < 60) {
      return `Out by ${errorPercent.toFixed(0)}%. A courageous display of pure fiction. You appear to have calculated this value using emotional resonance rather than arithmetic.`;
    }
    return `An inaccuracy of ${errorPercent.toFixed(0)}%. Spectacular. You have vastly reorganised the laws of physics and demographic reality to accommodate your guess.`;
  }

  // 3. Stop The Score / Confidence Commentary
  if (roundType === 'STOP_THE_SCORE') {
    if (isCorrect && score > 850) {
      return `You stopped the dial at ${score} and answered correctly. We applaud your unmitigated audacity, while quietly regretting having to award the points.`;
    }
    if (isCorrect && score < 400) {
      return `You answered correctly but banked a pathetic ${score} points. The Bureau commends your factual recall while mourning your complete lack of moral backbone.`;
    }
    if (!isCorrect && score > 800) {
      return `Risked ${score} points on an erroneous answer and walked away with precisely zero. The Treasury thanks you for your fiscal donation.`;
    }
    if (!isCorrect) {
      return `Incorrect. The gauge resets to zero. Your profound silence on the matter is warmly appreciated.`;
    }
  }

  // 4. Score Bracket Commentary
  if (score >= 950) {
    const highRemarks = [
      `You scored ${score}. The Bureau has reviewed the calculation three times in the hope of finding a clerical error. None was found.`,
      `You scored ${score}. A triumph of disturbing proportion. Please do not let this foster unwarranted self-esteem.`,
      `You scored ${score}. Flawless execution. Your assessment supervisor has been reprimanded for making the prompt too accessible.`
    ];
    return highRemarks[Math.floor(Math.random() * highRemarks.length)];
  }

  if (score >= 700) {
    const goodRemarks = [
      `You scored ${score}. A thoroughly sound performance. A polite nod from Whitehall, though nobody is standing to applaud.`,
      `You scored ${score}. Above standard civil service baseline. You may continue to operate the machinery without immediate supervision.`,
      `You scored ${score}. Reasonably adequate. Her Majesty's inspectors are neither delighted nor reaching for the disciplinary files.`
    ];
    return goodRemarks[Math.floor(Math.random() * goodRemarks.length)];
  }

  if (score >= 400) {
    const midRemarks = [
      `You scored ${score}. The mathematical median of mediocrity. Not a catastrophe, but certainly not going on the celebratory letterhead.`,
      `You scored ${score}. You have achieved what the committee describes as "technically present in the room".`,
      `You scored ${score}. An outcome devoid of both triumph and dramatic tragedy. Simply a bureaucratic blur.`
    ];
    return midRemarks[Math.floor(Math.random() * midRemarks.length)];
  }

  if (score > 0) {
    const lowRemarks = [
      `You scored ${score}. The Bureau has awarded these points purely out of administrative pity. Do not spend them all in one parish.`,
      `You scored ${score}. We have rounded down where possible. Your appeal against this decision will be filed in the shredder.`,
      `You scored ${score}. A token gesture. The Treasury has recorded this transaction with visible grimacing.`
    ];
    return lowRemarks[Math.floor(Math.random() * lowRemarks.length)];
  }

  const zeroRemarks = [
    `Zero points awarded. An unblemished record of complete failure. The Bureau admires your total commitment to nothingness.`,
    `Zero. A score so pristine and devoid of merit that it qualifies for preservation in the National Archives.`,
    `Zero points. The committee sat in silence for forty seconds before deciding not to console you.`
  ];
  return zeroRemarks[Math.floor(Math.random() * zeroRemarks.length)];
}
