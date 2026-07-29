import { describe, expect, it } from "vitest";
import {
  calculateConfidenceGameScore,
  combineConfidenceScoreSummaries,
  summarizeConfidenceScores,
} from "@/lib/confidenceScore";

describe("calculateConfidenceGameScore", () => {
  it.each([
    [100, true, 100],
    [100, false, 0],
    [90, true, 99],
    [90, false, 19],
    [80, true, 96],
    [80, false, 36],
    [60, true, 84],
    [60, false, 64],
    [50, true, 75],
    [50, false, 75],
  ])("scores %i%% confidence with correctness %s as %i", (confidence, correct, expected) => {
    expect(calculateConfidenceGameScore(confidence, correct)).toBeCloseTo(expected, 12);
  });

  it("excludes missing confidence and unresolved results", () => {
    expect(calculateConfidenceGameScore(null, true)).toBeNull();
    expect(calculateConfidenceGameScore(80, null)).toBeNull();
  });

  it.each([49.9, 100.1, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid confidence %s",
    (confidence) => {
      expect(() => calculateConfidenceGameScore(confidence, true)).toThrow(RangeError);
    },
  );
});

describe("confidence score aggregation", () => {
  it("calculates a weekly arithmetic mean and excludes ineligible games", () => {
    expect(summarizeConfidenceScores([100, 75, null, undefined, 50])).toEqual({
      games: 3,
      points: 225,
      score: 75,
    });
  });

  it("returns an unscored summary when no games are eligible", () => {
    expect(summarizeConfidenceScores([null, undefined])).toEqual({
      games: 0,
      points: 0,
      score: null,
    });
  });

  it("weights cumulative scores by games rather than weeks", () => {
    const twoGameWeek = summarizeConfidenceScores([100, 80]);
    const oneGameWeek = summarizeConfidenceScores([30]);

    expect(combineConfidenceScoreSummaries([twoGameWeek, oneGameWeek])).toEqual({
      games: 3,
      points: 210,
      score: 70,
    });
  });

  it("preserves full precision for ranking calculations", () => {
    const summary = summarizeConfidenceScores([99, 96, 84.1]);

    expect(summary.score).toBeCloseTo(93.03333333333333, 12);
    expect(summary.points).toBeCloseTo(279.1, 12);
  });

  it("combines empty summaries safely", () => {
    const empty = summarizeConfidenceScores([]);

    expect(combineConfidenceScoreSummaries([empty, empty])).toEqual(empty);
  });

  it("rejects invalid game scores and inconsistent summaries", () => {
    expect(() => summarizeConfidenceScores([101])).toThrow(RangeError);
    expect(() =>
      combineConfidenceScoreSummaries([{ games: 0, points: 1, score: null }]),
    ).toThrow(RangeError);
  });
});
