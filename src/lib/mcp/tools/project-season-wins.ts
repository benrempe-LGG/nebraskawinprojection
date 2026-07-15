import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { ALL_TEAMS, computeDistribution, isConferenceGame } from "../../oddsmaker";

export default defineTool({
  name: "project_season_wins",
  title: "Project season wins",
  description:
    "Given per-game win percentages (0-100) for a team's 12 regular-season games, return expected wins, the full 0-12 win distribution (dynamic programming over Bernoulli trials), and conference win totals.",
  inputSchema: {
    team: z.string().min(1).describe("Team name (see list_teams)."),
    win_percentages: z
      .array(z.number().min(0).max(100))
      .describe(
        "Win percentage per game in schedule order (see get_schedule). Length must match the team's schedule (typically 12).",
      ),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ team, win_percentages }) => {
    const info = ALL_TEAMS[team];
    if (!info) {
      return {
        content: [{ type: "text", text: `Unknown team "${team}".` }],
        isError: true,
      };
    }
    const games = info.schedule;
    if (win_percentages.length !== games.length) {
      return {
        content: [
          {
            type: "text",
            text: `Expected ${games.length} win percentages for ${team}, got ${win_percentages.length}.`,
          },
        ],
        isError: true,
      };
    }
    const probs = win_percentages.map((p) => p / 100);
    const dist = computeDistribution(probs);
    const expected = probs.reduce((a, b) => a + b, 0);
    const confProbs = probs.filter((_, i) => isConferenceGame(games[i].opponent, team));
    const confExpected = confProbs.reduce((a, b) => a + b, 0);
    const distribution = dist.map((prob, wins) => ({
      wins,
      probability: Number(prob.toFixed(6)),
    }));
    const bowlEligible = dist.slice(6).reduce((a, b) => a + b, 0);
    return {
      content: [
        {
          type: "text",
          text: `Expected wins: ${expected.toFixed(2)} (conference: ${confExpected.toFixed(2)}). Bowl-eligible (≥6 wins): ${(bowlEligible * 100).toFixed(1)}%.`,
        },
      ],
      structuredContent: {
        team,
        expected_wins: Number(expected.toFixed(4)),
        expected_conference_wins: Number(confExpected.toFixed(4)),
        bowl_eligible_probability: Number(bowlEligible.toFixed(4)),
        win_distribution: distribution,
      },
    };
  },
});