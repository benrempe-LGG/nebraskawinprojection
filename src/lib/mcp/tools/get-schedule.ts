import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { ALL_TEAMS } from "../../oddsmaker";

export default defineTool({
  name: "get_schedule",
  title: "Get 2026 schedule",
  description:
    "Return the 2026 regular-season schedule for a Power 4 team: week, date, opponent, and home/away/neutral location.",
  inputSchema: {
    team: z
      .string()
      .min(1)
      .describe("Team name exactly as returned by list_teams, e.g. \"Nebraska\"."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ team }) => {
    const info = ALL_TEAMS[team];
    if (!info) {
      return {
        content: [
          {
            type: "text",
            text: `Unknown team "${team}". Call list_teams for valid names.`,
          },
        ],
        isError: true,
      };
    }
    const games = info.schedule.map((g) => ({
      week: g.week,
      date: g.date,
      opponent: g.opponent,
      location: g.loc,
      venue: g.venue,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(games, null, 2) }],
      structuredContent: { team, conference: info.conference, games },
    };
  },
});