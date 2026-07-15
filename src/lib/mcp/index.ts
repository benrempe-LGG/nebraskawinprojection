import { defineMcp } from "@lovable.dev/mcp-js";
import listTeams from "./tools/list-teams";
import getSchedule from "./tools/get-schedule";
import projectSeasonWins from "./tools/project-season-wins";
import getProgramAnalytics from "./tools/get-program-analytics";

export default defineMcp({
  name: "p4-oddsmaker-mcp",
  title: "P4 Oddsmaker (2026)",
  version: "0.1.0",
  instructions:
    "Public read-only tools for the 2026 Power 4 college football season projection app. Use list_teams to discover team names, get_schedule for a team's 2026 schedule, project_season_wins to compute the win distribution given per-game win percentages, and get_program_analytics for 2016-2025 SP+/247Sports/Delta metrics. All data is public and this server is not affiliated with the University of Nebraska.",
  tools: [listTeams, getSchedule, projectSeasonWins, getProgramAnalytics],
});