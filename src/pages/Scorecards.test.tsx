import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Scorecards from "@/pages/Scorecards";

const scorecardMocks = vi.hoisted(() => ({
  rows: [] as unknown[],
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "test-user" },
    loading: false,
  }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: scorecardMocks.rows, error: null }),
        }),
      }),
    }),
  },
}));

function renderScorecards() {
  return render(
    <MemoryRouter>
      <Scorecards />
    </MemoryRouter>,
  );
}

describe("Scorecards confidence display", () => {
  beforeEach(() => {
    scorecardMocks.rows = [];
  });

  it("shows the unscored empty state instead of a zero score", async () => {
    renderScorecards();

    expect(await screen.findByText(/Not scored yet/i)).toBeInTheDocument();
    expect(screen.queryByText("0.0")).not.toBeInTheDocument();
  });

  it("renders weekly and game-weighted season scores to one decimal", async () => {
    scorecardMocks.rows = [
      {
        ballot_id: "ballot",
        season: 2026,
        week: 1,
        games_final: 2,
        correct_picks: 1,
        incorrect_picks: 1,
        confidence_games: 2,
        confidence_score: 66,
      },
      {
        ballot_id: "ballot",
        season: 2026,
        week: 2,
        games_final: 1,
        correct_picks: 1,
        incorrect_picks: 0,
        confidence_games: 1,
        confidence_score: 100,
      },
    ];

    renderScorecards();

    expect(await screen.findByText("77.3")).toBeInTheDocument();
    expect(screen.getByText("66.0")).toBeInTheDocument();
    expect(screen.getByText("100.0")).toBeInTheDocument();
    expect(screen.getByText(/75 is the 50\/50 benchmark/i)).toBeInTheDocument();
    expect(screen.getByText("2 of 3 correct")).toBeInTheDocument();
  });
});
