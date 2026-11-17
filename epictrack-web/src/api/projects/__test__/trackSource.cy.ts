import { AppConfig } from "config";
import {
  TrackProjectDto,
  toProjectWriteDto,
  trackProjectsSource,
} from "../sources/track";
import { describeProjectsSource } from "./projectsSourceContract";

const apiPath = new URL(AppConfig.apis.track.baseUrl, window.location.origin)
  .pathname;
const path = (suffix: string) => `${apiPath}${suffix}`;

// Matches ProjectResponseSchema, including fields the mapper drops.
const trackProject: TrackProjectDto & Record<string, unknown> = {
  id: 1,
  name: "Copper Mine",
  description: "An open pit copper mine",
  abbreviation: "CMINE",
  address: "Near Smithers",
  created_at: "2024-01-15T10:00:00",
  is_active: true,
  is_project_closed: false,
  latitude: "54.78",
  longitude: "-127.17",
  epic_guid: "abc123",
  ea_certificate: "M24-01",
  capital_investment: 1000000,
  fte_positions_construction: 200,
  fte_positions_operation: 80,
  eac_signed: "2024-05-01",
  eac_expires: null,
  type_id: 3,
  sub_type_id: 4,
  proponent_id: 5,
  region_id_env: 6,
  region_id_flnro: 7,
  type: { id: 3, name: "Mines", short_name: "MIN", sort_order: 1 } as any,
  sub_type: { id: 4, name: "Copper", short_name: "CU", sort_order: 1 } as any,
  proponent: { id: 5, name: "Mining Co", is_active: true } as any,
  region_env: { id: 6, name: "Skeena", entity: "ENV" } as any,
  region_flnro: { id: 7, name: "Northwest", entity: "FLNR" } as any,
  project_state_id: 2,
  project_state: { id: 2, name: "Pre Work" },
  created_by: "someone",
};

const stubTrackWire = () => {
  const named = (id: number, name: string) => ({ id, name });
  cy.intercept({ method: "GET", pathname: path("projects") }, [trackProject]);
  cy.intercept(
    {
      method: "GET",
      pathname: path("projects"),
      query: { return_type: "list_type" },
    },
    [named(1, "Copper Mine")],
  ).as("listOptions");
  cy.intercept({ method: "GET", pathname: path("projects/1") }, trackProject);
  cy.intercept(
    { method: "GET", pathname: path("projects/999") },
    { statusCode: 404, body: { message: "Project not found" } },
  );
  cy.intercept(
    { method: "POST", pathname: path("projects") },
    { ...trackProject, id: 2 },
  ).as("create");
  cy.intercept(
    { method: "PUT", pathname: path("projects/1") },
    trackProject,
  ).as("update");
  cy.intercept({ method: "GET", pathname: path("projects/exists") }, (req) =>
    req.reply({ exists: req.query.name === "Taken Project" }),
  ).as("exists");
  cy.intercept(
    { method: "POST", pathname: path("projects/abbreviation") },
    JSON.stringify("NEWPROJ"),
  );
  cy.intercept({ method: "GET", pathname: path("project-types") }, [
    named(3, "Mines"),
  ]);
  cy.intercept({ method: "GET", pathname: path("types") }, [named(3, "Mines")]);
  cy.intercept({ method: "GET", pathname: path("proponents") }, [
    named(5, "Mining Co"),
  ]);
  cy.intercept({ method: "GET", pathname: path("regions") }, (req) =>
    req.reply([
      named(req.query.type === "ENV" ? 6 : 7, String(req.query.type)),
    ]),
  ).as("regions");
  cy.intercept({ method: "GET", pathname: path("sub-types") }, [
    named(4, "Copper"),
  ]).as("subTypes");
};

describeProjectsSource("Track", trackProjectsSource, stubTrackWire);

describe("Track projects source", () => {
  beforeEach(stubTrackWire);

  it("maps a project to its summary", () => {
    cy.then(() => trackProjectsSource.getSummary(1)).should("deep.equal", {
      id: 1,
      name: "Copper Mine",
      description: "An open pit copper mine",
      abbreviation: "CMINE",
      address: "Near Smithers",
      created_at: "2024-01-15T10:00:00",
      type: { name: "Mines" },
      sub_type: { name: "Copper" },
      proponent: { name: "Mining Co" },
      region_env: { name: "Skeena" },
      region_flnro: { name: "Northwest" },
    });
  });

  it("sends only the fields the API accepts, with EAC dates as YYYY-MM-DD", () => {
    const formValues = {
      ...trackProject,
      eac_signed: "2024-05-01T07:00:00.000Z",
      eac_expires: "",
    };
    cy.then(() => trackProjectsSource.update(1, formValues));
    cy.wait("@update")
      .its("request.body")
      .should((body) => {
        expect(body).not.to.have.any.keys(
          "id",
          "type",
          "proponent",
          "created_at",
          "project_state",
          "created_by",
        );
        expect(body.eac_signed).to.equal("2024-05-01");
        expect(body.eac_expires).to.equal("");
        expect(body.name).to.equal("Copper Mine");
        expect(body.region_id_flnro).to.equal(7);
      });
  });

  it("leaves out fields the form didn't set", () => {
    expect(toProjectWriteDto({ name: "Only name" })).to.deep.equal({
      name: "Only name",
    });
  });

  it("keeps the Track query parameters", () => {
    cy.then(() => trackProjectsSource.listOptions());
    cy.wait("@listOptions");
    cy.then(() => trackProjectsSource.checkExists("Taken Project", 1));
    cy.wait("@exists")
      .its("request.query")
      .should("deep.equal", { name: "Taken Project", project_id: "1" });
    cy.then(() => trackProjectsSource.checkExists("Taken Project"));
    cy.wait("@exists")
      .its("request.query")
      .should("deep.equal", { name: "Taken Project" });
    cy.then(() => trackProjectsSource.getFormOptions());
    cy.wait(["@regions", "@regions"]).then((calls) =>
      expect(
        (calls as any[]).map((call) => call.request.query.type).sort(),
      ).to.deep.equal(["ENV", "FLNR"]),
    );
    cy.then(() => trackProjectsSource.listSubTypes(3));
    cy.wait("@subTypes").its("request.query.type_id").should("equal", "3");
  });
});
