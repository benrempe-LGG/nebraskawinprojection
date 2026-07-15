import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { ANALYTICS_DATA } from "../../analyticsData";

export default defineTool({
  name: "get_program_analytics",
  title: "Get program analytics",
  description:
    "Return 2016-2025 program analytics for a Power 4 team: SP+ ranks, 247Sports recruiting composite ranks, and the Delta (recruiting minus performance) metric with average and standard deviation.",
  inputSchema: {
    team: z.string().min(1).describe("Team name (see list_teams)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ team }) => {
    const row = ANALYTICS_DATA.find(
      (t) => t.team.toLowerCase() === team.toLowerCase(),
    );
    if (!row) {
      return {
        content: [
          {
            type: "text",
            text: `No analytics found for "${team}". Call list_teams for valid names.`,
          },
        ],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(row, null, 2) }],
      structuredContent: row as unknown as Record<string, unknown>,
    };
  },
});