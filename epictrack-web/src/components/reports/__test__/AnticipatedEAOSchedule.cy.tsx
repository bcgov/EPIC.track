import { AppConfig } from "config";
import { Endpoint, setupIntercepts } from "../../../../cypress/support/utils";
import { generateMockASReportData, AS_GROUP_HEADERS } from "./mockData";
import AnticipatedEAOSchedule from "../eaReferral/AnticipatedEAOSchedule";

const reportData = generateMockASReportData();

const endpoints: Endpoint[] = [
  {
    name: "getAnticipatedSchedule",
    method: "POST",
    url: `${AppConfig.apiUrl}reports/ea_anticipated_schedule`,
    response: {
      body: reportData,
    },
  },
  {
    name: "downloadAnticipatedSchedule",
    method: "POST",
    url: `${AppConfig.apiUrl}reports/file/ea_anticipated_schedule`,
  },
];

describe("Anticipated/Referral Schedule", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
    cy.mount(<AnticipatedEAOSchedule />);
  });

  it("loads and displays groups", () => {
    // Pick today's date in datepicker
    cy.get('[aria-label="Choose date"]').click();
    cy.get('[aria-current="date"]').click();
    cy.get("body").type("{esc}");
    cy.get("button").contains("Submit").click();

    // Confirm groups rendered
    AS_GROUP_HEADERS.forEach((header) => {
      cy.contains(header).should("exist");
    });
  });

  it("displays tab content when clicked", () => {
    // Pick today's date in datepicker
    cy.get('[aria-label="Choose date"]').click();
    cy.get('[aria-current="date"]').click();
    cy.get("body").type("{esc}");
    cy.get("button").contains("Submit").click();

    // Expand first work
    cy.contains(AS_GROUP_HEADERS[0])
      .parentsUntil('[role="region"]')
      .parent()
      .first()
      .within(() => {
        cy.get('[role="region"]').first().click();
      });

    // Basic tab
    cy.get('[role="tabpanel"]:visible')
      .contains("Decision to be made by")
      .should("exist");

    // Project Description tab
    cy.get('[role="tab"]')
      .contains("Project Description")
      .click({ force: true });
    cy.get('[role="tabpanel"]:visible')
      .contains("Project Description:")
      .should("exist");

    // Status tab
    cy.get('[role="tab"]')
      .contains("Anticipated Referral Date/Next PCP/Status")
      .click({ force: true });
    // Check that Referral Date or Decision Date exists
    cy.get('[role="tabpanel"]:visible').then(($panel) => {
      const decisionReferralDate =
        $panel.text().includes("Referral Date") ||
        $panel.text().includes("Decision Date");
      expect(decisionReferralDate).to.equal(true);
    });
    cy.get('[role="tabpanel"]:visible').contains("Status").should("exist");
  });

  it("downloads the pdf report after selecting a date", () => {
    // Click today's date
    cy.get('[aria-label="Choose date"]').click();
    cy.get('[aria-current="date"]').click();
    cy.get("body").type("{esc}");
    cy.get('[role="dialog"]').should("not.exist");
    // Download the report
    cy.contains("Download").click();

    cy.wait("@downloadAnticipatedSchedule").then((interception) => {
      expect(interception.request.method).to.equal("POST");
      expect(interception.response?.statusCode).to.equal(200);
    });
  });
});
