import { AppConfig } from "config";
import { Endpoint, setupIntercepts } from "../../../../cypress/support/utils";
import { generateMock306090ReportData } from "./mockData";
import ThirtySixtyNinety from "../30-60-90Report/ThirtySixtyNinety";

const reportData = generateMock306090ReportData();

const endpoints: Endpoint[] = [
  {
    name: "get306090Report",
    method: "POST",
    url: `${AppConfig.apiUrl}reports/30-60-90`,
    response: {
      body: reportData,
    },
  },
  {
    name: "download306090Report",
    method: "POST",
    url: `${AppConfig.apiUrl}reports/file/30-60-90`,
  },
];

describe("30-60-90 Report", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
    cy.mount(<ThirtySixtyNinety />);
  });

  it("displays report sections correctly", () => {
    // Click today's date
    cy.get('[aria-label="Choose date"]').click();
    cy.get('[aria-current="date"]').click();
    cy.get("body").type("{esc}");
    cy.get('[role="dialog"]').should("not.exist");
    cy.contains("Generate").click();

    // Check that the report sections are displayed
    cy.get('[role="region"]').should("have.length.at.least", 1);
    cy.contains("30").should("exist");
    cy.contains("60").should("exist");
    cy.contains("90").should("exist");
  });

  it("shows Basic information when work is expanded", () => {
    // Click today's date
    cy.get('[aria-label="Choose date"]').click();
    cy.get('[aria-current="date"]').click();
    cy.get("body").type("{esc}");
    cy.get('[role="dialog"]').should("not.exist");
    cy.contains("Generate").click();

    // Expand first work
    cy.contains("30")
      .parentsUntil('[role="region"]')
      .parent()
      .first()
      .within(() => {
        cy.get('[role="region"]').first().click();
      });

    cy.get("table").should("exist");
    cy.contains("td", "Project Name").should("exist");
    cy.contains("td", "Anticipated Decision Date").should("exist");
    cy.contains(/\b\d{1,2} [A-Z][a-z]{2} \d{4}\b/).should("exist");
  });

  it("shows Work Short Description when tab clicked", () => {
    // Click today's date and Generate
    cy.get('[aria-label="Choose date"]').click();
    cy.get('[aria-current="date"]').click();
    cy.get("body").type("{esc}");
    cy.get('[role="dialog"]').should("not.exist");
    cy.contains("Generate").click();

    // Expand first work
    cy.contains("30")
      .parentsUntil('[role="region"]')
      .parent()
      .first()
      .within(() => {
        cy.get('[role="region"]').first().click();
      });

    // Click the "Work Short Description" tab
    cy.get('[role="tab"]').contains("Work Short Description").click();
    cy.get('[role="tabpanel"]:visible').should("exist").should("not.be.empty");
  });

  it("shows Status with correct staleness chip", () => {
    // Click today's date and Generate
    cy.get('[aria-label="Choose date"]').click();
    cy.get('[aria-current="date"]').click();
    cy.get("body").type("{esc}");
    cy.get('[role="dialog"]').should("not.exist");
    cy.contains("Generate").click();

    // Expand first work
    cy.contains("30")
      .parentsUntil('[role="region"]')
      .parent()
      .first()
      .within(() => {
        cy.get('[role="region"]').first().click();
      });

    // Click the status tab
    cy.get('[role="tab"]').contains("Status").click();
    cy.get('[role="tabpanel"]:visible')
      .first()
      .find(".MuiChip-root")
      .invoke("text")
      .should("match", /\b\d{1,2} [A-Z][a-z]{2} \d{4}\b/);
  });

  it("downloads the pdf report after selecting a date", () => {
    // Click today's date
    cy.get('[aria-label="Choose date"]').click();
    cy.get('[aria-current="date"]').click();
    cy.get("body").type("{esc}");
    cy.get('[role="dialog"]').should("not.exist");
    // Download the report
    cy.contains("Download").click();

    cy.wait("@download306090Report").then((interception) => {
      expect(interception.request.method).to.equal("POST");
      expect(interception.response?.statusCode).to.equal(200);
    });
  });
});
