import React from "react";
import { InLineDatePicker } from "../InLineDatePicker";

const makeProps = (overrides: Partial<any> = {}) => {
  const row = { _valuesCache: { active_from: "" } };
  const table = {
    setCreatingRow: cy.stub().as("setCreatingRow"),
    setEditingRow: cy.stub().as("setEditingRow"),
  };

  return {
    props: {
      column: { id: "active_from" },
      row,
      table,
      isCreating: false,
      name: "active_from",
      ...overrides,
    },
    row,
    table,
  };
};

describe("InLineDatePicker", () => {
  it("renders null value as an empty input with Today placeholder", () => {
    const { props } = makeProps({
      row: { _valuesCache: { active_from: "not-a-date" } },
    });

    cy.mount(<InLineDatePicker {...(props as any)} />);

    cy.get("input[name='active_from']")
      .should("have.attr", "placeholder", "Today")
      .and("have.value", "");
  });

  it("renders valid cached date value and applies error state", () => {
    const { props } = makeProps({
      row: { _valuesCache: { active_from: "2026-06-01" } },
      error: true,
    });

    cy.mount(<InLineDatePicker {...(props as any)} />);

    cy.get("input[name='active_from']")
      .should("have.value", "2026-06-01")
      .and("have.attr", "aria-invalid", "true");
  });
});
