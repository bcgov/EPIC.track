import { MemoryRouter as Router } from "react-router-dom";
import ReportHeader from "components/reports/shared/report-header/ReportHeader";

describe("ReportHeader", () => {
  beforeEach(() => {
    const fakeSetReportDate = cy.stub().as("setReportDate");
    const fakeFetchReportData = cy.stub().as("fetchReportData");
    const fakeDownloadPDFReport = cy.stub().as("downloadPDFReport");

    cy.mount(
      <Router>
        <ReportHeader
          setReportDate={fakeSetReportDate}
          fetchReportData={fakeFetchReportData}
          downloadPDFReport={fakeDownloadPDFReport}
          showReportDateBanner={false}
        />
      </Router>,
    );
  });

  it("renders report header with date picker", () => {
    cy.contains("Report Date").should("exist");
    cy.contains("Generate").should("exist");
    cy.contains("Download").should("exist");
  });

  it("shows an error message if no date is selected on Generate", () => {
    cy.contains("Generate").click();
    cy.get('[role="alert"]').should(
      "contain.text",
      "Please select a date before generating the report.",
    );
  });

  it("allows selecting a date via date picker and Generates the report", () => {
    cy.get('[aria-label="Choose date"]').click();

    // Click today's date and close the calendar
    cy.get('[aria-current="date"]').click();
    cy.get("body").click(0, 0);
    cy.get('[role="dialog"]').should("not.exist");

    cy.contains("Generate").click();
    cy.get("@fetchReportData").should("have.been.called");
  });

  it("renders stale banner when showReportDateBanner is true", () => {
    const fakeSetReportDate = cy.stub().as("setReportDate");
    const fakeFetchReportData = cy.stub().as("fetchReportData");
    const fakeDownloadPDFReport = cy.stub().as("downloadPDFReport");

    cy.mount(
      <Router>
        <ReportHeader
          setReportDate={fakeSetReportDate}
          fetchReportData={fakeFetchReportData}
          downloadPDFReport={fakeDownloadPDFReport}
          showReportDateBanner={true}
        />
      </Router>,
    );

    cy.get('[role="alert"]').should(
      "contain.text",
      "Currently EPIC.track only contains EA Act (2018) data",
    );
  });
});
