import { describe, expect, it } from "vitest";
import { safeInternalPath } from "@/lib/internalPath";

describe("safeInternalPath", () => {
  it("preserves internal paths with queries and hashes", () => {
    expect(safeInternalPath("/groups?code=ABC12345#invite")).toBe(
      "/groups?code=ABC12345#invite"
    );
  });

  it.each([
    "https://attacker.example",
    "//attacker.example",
    "/\\attacker.example",
    "\\\\attacker.example",
    "groups",
  ])("rejects unsafe redirect target %s", (value) => {
    expect(safeInternalPath(value, "/account")).toBe("/account");
  });

  it("uses the fallback for a missing target", () => {
    expect(safeInternalPath(null, "/account")).toBe("/account");
  });
});
