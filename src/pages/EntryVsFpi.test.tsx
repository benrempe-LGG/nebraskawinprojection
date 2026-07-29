import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { buildFpiModelEntry } from "@/lib/fpiModel";
import { compareEntryToFpi } from "@/lib/entryFpiComparison";
import EntryVsFpi, { EntryVsFpiComparison } from "@/pages/EntryVsFpi";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: null, loading: false }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));

describe("You vs. FPI comparison UI", () => {
  it("renders the core comparison surfaces", () => {
    const comparison = compareEntryToFpi(buildFpiModelEntry());
    render(
      <MemoryRouter>
        <EntryVsFpiComparison comparison={comparison} />
      </MemoryRouter>,
    );

    expect(screen.getByText("476/476")).toBeInTheDocument();
    expect(screen.getByText("Your biggest team convictions")).toBeInTheDocument();
    expect(screen.getAllByText("Opposite winners")).toHaveLength(2);
    expect(screen.getByText("Conference races")).toBeInTheDocument();
    expect(screen.getByText("Playoff-field differences")).toBeInTheDocument();
  });

  it("keeps the official-entry comparison behind sign-in", () => {
    render(
      <MemoryRouter>
        <EntryVsFpi />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("Sign in to compare your official entry"),
    ).toBeInTheDocument();
    expect(screen.getByText(/visible only to your account/i)).toBeInTheDocument();
  });
});
