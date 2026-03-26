import React from "react";
import moment from "moment";
import { TimeScale } from "components/gantt/TimeScale";
import { GanttContext } from "components/gantt/GanttContext";

const renderTimeScale = (start: Date, end: Date, sectionHeight = 240) => {
  cy.mount(
    <GanttContext.Provider
      value={{
        start,
        end,
        rows: [],
        sectionHeight,
        enableLazyLoading: false,
        totalRows: 0,
        onLazyLoad: () => {},
        isLoadingMore: false,
        ganttChartRef: null,
        CustomTaskBarTooltip: () => null,
      }}
    >
      <TimeScale>
        <div data-cy="bars-child">bars content</div>
      </TimeScale>
    </GanttContext.Provider>,
  );
};

describe("TimeScale", () => {
  it("renders month headers, year headers, and bars children", () => {
    const start = moment().startOf("month").subtract(1, "month").toDate();
    const end = moment().startOf("month").add(2, "month").toDate();

    renderTimeScale(start, end);

    cy.get("#time-scale").should("exist");
    cy.get("#months > div").should("have.length", 3);
    cy.contains(moment(start).format("MMM")).should("exist");
    cy.contains(moment(start).add(1, "month").format("MMM")).should("exist");
    cy.contains(moment(start).add(2, "month").format("MMM")).should("exist");
    cy.contains(String(moment(start).year())).should("exist");
    cy.get("#bars").find("[data-cy='bars-child']").should("exist");
  });

  it("highlights the current month and renders a current-day marker", () => {
    const start = moment().startOf("month").subtract(1, "month").toDate();
    const end = moment().startOf("month").add(2, "month").toDate();

    renderTimeScale(start, end, 320);

    cy.get("#months > div[style*='color: white']").should(
      "have.length.at.least",
      1,
    );
    cy.get("#months > div")
      .contains(moment().format("MMM"))
      .parent()
      .find("div")
      .should("have.length.at.least", 1);
  });

  it("groups months into separate years across year boundary", () => {
    const start = moment("2025-12-01").toDate();
    const end = moment("2026-03-01").toDate();

    renderTimeScale(start, end);

    cy.get("#months > div").should("have.length", 3);
    cy.contains("2025").should("exist");
    cy.contains("2026").should("exist");
  });
});
