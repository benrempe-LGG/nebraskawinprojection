import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { buildFpiModelEntry } from "@/lib/fpiModel";
import { compareEntryToFpi } from "@/lib/entryFpiComparison";
import { EntryVsFpiComparison } from "@/pages/EntryVsFpi";

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
});
