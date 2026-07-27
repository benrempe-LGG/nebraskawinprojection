import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Groups from "@/pages/Groups";

const groupMocks = vi.hoisted(() => ({
  leaders: [
    {
      user_id: "alpha",
      display_name: "Alpha",
      role: "owner",
      weeks_scored: 2,
      games_final: 3,
      correct_picks: 2,
      accuracy: 66.666,
      confidence_games: 3,
      confidence_score: 77.333,
    },
    {
      user_id: "gamma",
      display_name: "Gamma",
      role: "member",
      weeks_scored: 2,
      games_final: 2,
      correct_picks: 2,
      accuracy: 100,
      confidence_games: 1,
      confidence_score: 75,
    },
    {
      user_id: "beta",
      display_name: "Beta",
      role: "member",
      weeks_scored: 1,
      games_final: 1,
      correct_picks: 1,
      accuracy: 100,
      confidence_games: 1,
      confidence_score: 75,
    },
  ],
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "alpha" },
    loading: false,
  }),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({
          data: [{
            id: "group",
            name: "Test Group",
            season: 2026,
            owner_id: "alpha",
            invite_code: "TESTCODE",
          }],
          error: null,
        }),
      }),
    }),
    rpc: () => Promise.resolve({ data: groupMocks.leaders, error: null }),
  },
}));

describe("Groups confidence leaderboard", () => {
  it("preserves RPC ranking order and renders confidence context", async () => {
    render(
      <MemoryRouter>
        <Groups />
      </MemoryRouter>,
    );

    const alpha = await screen.findByText(/Alpha \(you\)/);
    const gamma = screen.getByText("Gamma");
    const beta = screen.getByText("Beta");

    expect(alpha.compareDocumentPosition(gamma) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(gamma.compareDocumentPosition(beta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText("77.3")).toBeInTheDocument();
    expect(screen.getAllByText("75.0")).toHaveLength(2);
    expect(screen.getByText(/75 is the 50\/50 benchmark/i)).toBeInTheDocument();
  });
});
