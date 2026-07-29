import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import FpiModel from "@/pages/FpiModel";

describe("public FPI-based model page", () => {
  it("shows the transparent Nebraska benchmark without authentication", () => {
    render(
      <MemoryRouter>
        <FpiModel />
      </MemoryRouter>,
    );

    expect(screen.getByText("2026 FPI-based model entry")).toBeInTheDocument();
    expect(screen.getByText("6.7–5.3")).toBeInTheDocument();
    expect(screen.getByText("ESPN source, updated 2026-07-21")).toBeInTheDocument();
    expect(screen.getByText("83.3%")).toBeInTheDocument();
    expect(screen.getByText(/not an official ESPN matchup prediction/i)).toBeInTheDocument();
  });
});
