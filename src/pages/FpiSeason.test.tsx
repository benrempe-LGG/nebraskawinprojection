import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import FpiSeason from "@/pages/FpiSeason";

describe("public FPI season projection page", () => {
  it("renders standings, conference champions, and the playoff without auth", () => {
    render(
      <MemoryRouter>
        <FpiSeason />
      </MemoryRouter>,
    );

    expect(screen.getByText("2026 FPI end-of-year projection")).toBeInTheDocument();
    expect(screen.getByText("Projected Championship Week")).toBeInTheDocument();
    expect(screen.getByText("Projected 12-team playoff")).toBeInTheDocument();
    expect(screen.getByText(/Highest-ranked G6 champion/)).toBeInTheDocument();
    expect(screen.getAllByText("SEC").length).toBeGreaterThan(0);
  });
});
