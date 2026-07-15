import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { ALL_TEAMS, CONFERENCES } from "@/lib/oddsmaker";

export default defineTool({
  name: "list_teams",
  title: "List P4 teams",
  description:
    "List the 67 Power 4 (ACC, Big 12, Big Ten, SEC) college football teams covered by this app, optionally filtered by conference.",
  inputSchema: {
    conference: z
      .enum(["ACC", "Big 12", "Big Ten", "SEC"])
      .optional()
      .describe("Optional conference filter."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ conference }) => {
    const teams = conference
      ? (CONFERENCES[conference] ?? [])
      : Object.keys(ALL_TEAMS).sort();
    const rows = teams.map((team) => ({
      team,
      conference: ALL_TEAMS[team]?.conference ?? "",
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { count: rows.length, teams: rows },
    };
  },
});