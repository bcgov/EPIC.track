import { AppConfig } from "config";
import { workTypesApi } from "../workTypesApi";

const apiPath = new URL(AppConfig.apis.track.baseUrl, window.location.origin)
  .pathname;
const path = (suffix: string) => `${apiPath}${suffix}`;

// Matches WorkTypeResponseSchema.
const trackWorkType = {
  id: 6,
  name: "Assessment",
  sort_order: 3,
  report_title: "Environmental Assessment",
  all_phases_require_overage_responsibility: false,
  default_report_description: "On [date], [initiator] entered the process.",
  report_sort_order: 1,
  is_active: true,
};

describe("Track work types api", () => {
  beforeEach(() => {
    cy.intercept({ method: "GET", pathname: path("work-types") }, [
      trackWorkType,
    ]);
    cy.intercept({ method: "GET", pathname: path("projects/7/work-types") }, [
      { ...trackWorkType, is_active: false },
    ]).as("inProject");
  });

  it("maps work types", () => {
    cy.then(() => workTypesApi.list()).should("deep.equal", [
      {
        id: 6,
        name: "Assessment",
        is_active: true,
        sort_order: 3,
        default_report_description:
          "On [date], [initiator] entered the process.",
      },
    ]);
  });

  it("lists the work types of the project's other works", () => {
    cy.then(() => workTypesApi.listInProject(7, 101)).should("deep.equal", [
      {
        id: 6,
        name: "Assessment",
        is_active: false,
        sort_order: 3,
        default_report_description:
          "On [date], [initiator] entered the process.",
      },
    ]);
    cy.wait("@inProject")
      .its("request.query")
      .should("deep.equal", { work_id: "101" });
  });
});
