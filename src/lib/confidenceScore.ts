export interface ConfidenceScoreSummary {
  games: number;
  points: number;
  score: number | null;
}

function assertFiniteInRange(
  value: number,
  minimum: number,
  maximum: number,
  label: string,
) {
  if (!Number.isFinite(value) || value < minimum || value > maximum) {
    throw new RangeError(`${label} must be between ${minimum} and ${maximum}.`);
  }
}

/**
 * Scores confidence assigned to the predicted winner.
 *
 * A null result means the game is not eligible for confidence scoring, such as
 * a nonfinal/tied game or a legacy prediction without confidence.
 */
export function calculateConfidenceGameScore(
  confidencePercent: number | null,
  predictedCorrect: boolean | null,
): number | null {
  if (confidencePercent === null || predictedCorrect === null) return null;

  assertFiniteInRange(confidencePercent, 50, 100, "Confidence");

  const confidence = confidencePercent / 100;
  const outcome = predictedCorrect ? 1 : 0;

  return 100 * (1 - (confidence - outcome) ** 2);
}

export function summarizeConfidenceScores(
  scores: Iterable<number | null | undefined>,
): ConfidenceScoreSummary {
  let games = 0;
  let points = 0;

  for (const score of scores) {
    if (score === null || score === undefined) continue;

    assertFiniteInRange(score, 0, 100, "Game confidence score");
    games += 1;
    points += score;
  }

  return {
    games,
    points,
    score: games === 0 ? null : points / games,
  };
}

export function combineConfidenceScoreSummaries(
  summaries: Iterable<ConfidenceScoreSummary>,
): ConfidenceScoreSummary {
  let games = 0;
  let points = 0;

  for (const summary of summaries) {
    if (!Number.isInteger(summary.games) || summary.games < 0) {
      throw new RangeError("Confidence games must be a nonnegative integer.");
    }
    if (!Number.isFinite(summary.points) || summary.points < 0) {
      throw new RangeError("Confidence points must be a nonnegative finite number.");
    }
    if (summary.games === 0 && summary.points !== 0) {
      throw new RangeError("An empty confidence summary cannot contain points.");
    }
    if (summary.games > 0 && summary.points > summary.games * 100) {
      throw new RangeError("Confidence points cannot exceed 100 per game.");
    }

    games += summary.games;
    points += summary.points;
  }

  return {
    games,
    points,
    score: games === 0 ? null : points / games,
  };
}
