import { AppConfig } from "config";
import { ProjectDialog } from "..";
import {
  Endpoint,
  setupIntercepts,
} from "../../../../../cypress/support/utils";

const endpoints: Endpoint[] = [
  {
    name: "getRegions",
    method: "GET",
    url: `${AppConfig.apiUrl}regions*`,
    response: {
      body: [{ id: 1, name: "Region A" }],
    },
  },
  {
    name: "getTypes",
    method: "GET",
    url: `${AppConfig.apiUrl}types`,
    response: {
      body: [{ id: 1, name: "Type A" }],
    },
  },
  {
    name: "getProponents",
    method: "GET",
    url: `${AppConfig.apiUrl}proponents`,
    response: {
      body: [{ id: 1, name: "Proponent A" }],
    },
  },
];

describe("ProjectDialog", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
  });

  it("renders create project dialog and closes on cancel", () => {
    const setOpen = cy.stub().as("setOpen");

    cy.mount(<ProjectDialog open={true} setOpen={setOpen} />);

    cy.contains("Create Project").should("exist");
    cy.contains("button", "Cancel").click();

    cy.get("@setOpen").should("have.been.calledWith", false);
  });
});
