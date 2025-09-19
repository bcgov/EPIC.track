import { getWorkColour, darkenHex } from "components/calendar/Legends/utils";
import { WORK_LEGEND_COLOURS } from "components/calendar/constants";

describe("work colour utils", () => {
  beforeEach(() => {
    // Reset module state (workColorMap, nextColorIndex)
    cy.window().then((win) => {
      // Dynamically re-import to reset state for each test
      return import("components/calendar/Legends/utils").then((mod) => {
        (mod as any).__resetForTests?.();
      });
    });
  });

  it("returns sequential colours for new works", () => {
    const colour1 = getWorkColour("Work A");
    const colour2 = getWorkColour("Work B");

    cy.wrap(colour1).should("eq", WORK_LEGEND_COLOURS[0]);
    cy.wrap(colour2).should("eq", WORK_LEGEND_COLOURS[1]);
  });

  it("returns same colour for the same work", () => {
    const colour1 = getWorkColour("Work A");
    const colour2 = getWorkColour("Work A");

    cy.wrap(colour1).should("eq", colour2);
  });

  it("falls back to hash when colours are exhausted", () => {
    // Exhaust palette
    WORK_LEGEND_COLOURS.forEach((_, idx) => {
      getWorkColour(`Work ${idx}`);
    });

    const colour = getWorkColour("Extra Work");
    cy.wrap(WORK_LEGEND_COLOURS).should("include", colour);
  });

  it("darkens a 6-digit hex", () => {
    const result = darkenHex("#336699", 0.2);
    // Should still be a valid hex string
    cy.wrap(result).should("match", /^#[0-9a-f]{6}$/);
  });

  it("darkens a 3-digit hex", () => {
    const result = darkenHex("#369", 0.3);
    cy.wrap(result).should("match", /^#[0-9a-f]{6}$/);
  });

  it("clamps to black if darkened too much", () => {
    const result = darkenHex("#111111", 1);
    cy.wrap(result).should("eq", "#000000");
  });
});
