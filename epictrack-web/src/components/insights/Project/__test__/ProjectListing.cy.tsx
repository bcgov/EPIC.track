import ProjectListing from "../ProjectListing";
import { ProjectsContext } from "../ProjectsContext";
import { TableFilterProvider } from "../../TableFilterContext";

const projects = [
  {
    id: 1,
    name: "Alpha Mine Expansion",
    type: { id: 10, name: "Mine", sort_order: 2 },
    sub_type: { id: 20, name: "Expansion", sort_order: 3 },
    proponent: { id: 30, name: "NorthStar Corp" },
    region_env: { id: 40, name: "North Coast" },
    region_flnro: { id: 50, name: "Skeena" },
    is_active: true,
  },
  {
    id: 2,
    name: "Beta Wind Farm",
    type: { id: 11, name: "Energy", sort_order: 1 },
    sub_type: { id: 21, name: "New", sort_order: 1 },
    proponent: { id: 31, name: "WestWind Ltd" },
    region_env: { id: 41, name: "Thompson" },
    region_flnro: { id: 51, name: "Cariboo" },
    is_active: true,
  },
] as any;

const mountWithProviders = (loadingProjects = false) => {
  cy.mount(
    <ProjectsContext.Provider value={{ projects, loadingProjects }}>
      <TableFilterProvider>
        <ProjectListing />
      </TableFilterProvider>
    </ProjectsContext.Provider>,
  );
};

describe("ProjectListing", () => {
  it("renders project rows and key columns", () => {
    mountWithProviders(false);

    cy.contains("Project Name").should("exist");
    cy.contains("Type").should("exist");
    cy.contains("Sub Type").should("exist");
    cy.contains("Proponent").should("exist");

    cy.contains("Alpha Mine Expansion").should("exist");
    cy.contains("Beta Wind Farm").should("exist");
    cy.contains("NorthStar Corp").should("exist");
    cy.contains("WestWind Ltd").should("exist");
  });

  it("renders and allows clicking the csv export action", () => {
    mountWithProviders(false);

    cy.get("button .icon").first().parent("button").click({ force: true });
    cy.contains("Alpha Mine Expansion").should("exist");
  });

  it("renders table shell when project data is loading", () => {
    mountWithProviders(true);

    cy.contains("Project Name").should("exist");
    cy.contains("Type").should("exist");
  });
});
