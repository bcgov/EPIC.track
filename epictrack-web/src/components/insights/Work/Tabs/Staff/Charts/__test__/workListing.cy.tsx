import { MemoryRouter as Router } from "react-router-dom";
import WorkList from "../workListing";
import { InsightsContext } from "components/insights/InsightsContext";
import { useEffect } from "react";
import {
  TableFilterProvider,
  useTableFilterContext,
} from "components/insights/TableFilterContext";
import { ColumnFilter } from "components/shared/MasterTrackTable/type";
import { AppConfig } from "config";
import {
  Endpoint,
  setupIntercepts,
} from "../../../../../../../../cypress/support/utils";
import { WorkStaffRole } from "models/role";

const workStaffs = [
  {
    id: 1,
    title: "Alpha Work",
    eao_team: { id: 1, name: "Team One" },
    responsible_epd: { id: 31, full_name: "Epd One" },
    work_lead: { full_name: "Lead One" },
    staff: [
      {
        id: 7,
        first_name: "Alex",
        last_name: "Analyst",
        role: { id: WorkStaffRole.OFFICER_ANALYST },
      },
      {
        id: 8,
        first_name: "Casey",
        last_name: "Colead",
        role: { id: WorkStaffRole.TEAM_CO_LEAD },
      },
    ],
  },
  {
    id: 2,
    title: "Beta Work",
    eao_team: { id: 2, name: "Team Two" },
    responsible_epd: { id: 32, full_name: "Epd Two" },
    work_lead: { full_name: "Lead Two" },
    staff: [
      {
        id: 22,
        first_name: "Riley",
        last_name: "Reviewer",
        role: { id: WorkStaffRole.OFFICER_ANALYST },
      },
    ],
  },
] as any[];

const endpoints: Endpoint[] = [
  {
    name: "getWorkStaffs",
    method: "GET",
    url: `${AppConfig.apiUrl}works/resources?is_active=true`,
    response: { body: workStaffs },
  },
];

const SeedFilters = ({ filters }: { filters: ColumnFilter[] }) => {
  const { setColumnFilters } = useTableFilterContext();
  useEffect(() => {
    setColumnFilters(filters);
  }, [filters, setColumnFilters]);
  return null;
};

const mountComponent = (
  isUserInsights = false,
  staffId?: number,
  initialFilters: ColumnFilter[] = [],
) => {
  cy.mount(
    <Router>
      <InsightsContext.Provider
        value={{
          activeTab: "Work" as any,
          setActiveTab: cy.stub(),
          isUserInsights,
          setIsUserInsights: cy.stub(),
          isUserAssignedToWork: true,
          staffId,
        }}
      >
        <TableFilterProvider>
          <WorkList />
          {/* after the table: its filters reset column filters when they mount */}
          <SeedFilters filters={initialFilters} />
        </TableFilterProvider>
      </InsightsContext.Provider>
    </Router>,
  );
};

describe("Staff WorkListing", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
  });

  it("renders listing and loads hook data", () => {
    mountComponent();
    cy.wait("@getWorkStaffs");
    cy.contains("Name").should("exist");
    cy.contains("Team").should("exist");
    cy.contains("Staff").should("exist");
    cy.contains("Lead").should("exist");
    cy.contains("Team One").should("exist");
    cy.contains("Lead One").should("exist");
  });

  it("places the EPD column between Team and Lead", () => {
    mountComponent();
    cy.contains("Epd One").should("exist");
    cy.contains("Epd Two").should("exist");
    cy.get("thead th").then(($headers) => {
      const labels = $headers
        .toArray()
        .map((th) => th.innerText.trim().split("\n")[0]);
      const team = labels.indexOf("Team");
      expect(labels[team + 1]).to.equal("EPD");
      expect(labels[team + 2]).to.equal("Lead");
    });
  });

  it("filters the listing by EPD", () => {
    mountComponent(false, undefined, [
      { id: "responsible_epd.full_name", value: ["Epd Two"] },
    ]);
    cy.contains("Beta Work").should("exist");
    cy.contains("Alpha Work").should("not.exist");
  });

  it("offers each EPD once in the filter and narrows the listing", () => {
    mountComponent();
    cy.contains("Alpha Work").should("exist");
    cy.contains("thead th", "EPD").find("input").first().click({ force: true });
    cy.get('[id*="-option-"]').then(($options) => {
      const labels = $options.toArray().map((el) => el.innerText.trim());
      expect(labels).to.deep.equal(["Select All", "Epd One", "Epd Two"]);
    });
    cy.contains('[id*="-option-"]', "Epd Two").click();
    cy.contains("button", "Apply").click();
    cy.contains("Beta Work").should("exist");
    cy.contains("Alpha Work").should("not.exist");
  });

  it("exports an EPD column between team and lead", () => {
    cy.window().then((win) => {
      const createObjectURL = win.URL.createObjectURL.bind(win.URL);
      cy.stub(win.URL, "createObjectURL")
        .callsFake((blob: Blob) => {
          (win as any).__csvBlob = blob;
          return createObjectURL(blob);
        })
        .as("createObjectURL");
    });
    mountComponent();
    cy.contains("Alpha Work").should("exist");
    cy.get('[aria-label="Export to csv"]').click();
    cy.get("@createObjectURL").should("have.been.called");
    cy.window()
      .then((win) => (win as any).__csvBlob.text())
      .then((csv: string) => {
        const [header, firstRow] = csv.split("\n");
        expect(header).to.contain(
          "eao_team.name,responsible_epd.full_name,work_lead.full_name",
        );
        expect(firstRow).to.contain("Team One,Epd One,Lead One");
      });
  });

  it("filters works client-side by staffId for user insights", () => {
    mountComponent(true, 7);
    cy.contains("Team One").should("exist");
    cy.contains("Team Two").should("not.exist");
  });

  it("shows export action in top toolbar", () => {
    mountComponent();
    cy.get("button .icon").first().parent("button").should("exist");
  });
});
