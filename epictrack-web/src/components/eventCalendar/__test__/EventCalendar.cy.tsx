import React from "react";
import moment from "moment";
import EventCalendar from "components/eventCalendar/EventCalendar";
import ReportService from "services/reportService";

describe("EventCalendar", () => {
  it("loads events and opens project details dialog on event click", () => {
    const start = moment().startOf("month").add(2, "day").toISOString();
    const end = moment().startOf("month").add(4, "day").toISOString();

    cy.stub(ReportService, "getEventCalendar").resolves({
      status: 200,
      data: [
        {
          id: 501,
          name: "Initial Review",
          start_date: start,
          end_date: end,
          project: "Project North",
          project_description: "Northern transmission alignment update",
          project_address: "100 Main St",
          project_short_code: "PN",
          phase: "Review",
          color: "#4F81BD",
          work_type: "EA",
          link: "",
        },
      ],
    } as any);

    cy.mount(<EventCalendar />);

    cy.contains("Projects").should("exist");
    cy.contains("Week 1").should("exist");
    cy.contains("Week 6").should("exist");

    cy.get("[title*='Initial Review']").first().click({ force: true });

    cy.contains("Project Details").should("exist");
    cy.contains("Project North").should("exist");
    cy.contains("Initial Review").should("exist");
    cy.contains("100 Main St").should("exist");
  });
});
