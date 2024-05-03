import { MemoryRouter as Router } from "react-router-dom";
import ProponentList from "../ProponentList";
import { faker } from "@faker-js/faker";
import { Proponent } from "models/proponent";
import { MasterContext } from "components/shared/MasterContext";
import { Staff } from "models/staff";
import {
  createMockMasterContext,
  mockStaffs,
  testTableFiltering,
} from "../../../../cypress/support/common";
import { AppConfig } from "config";

//ensure proponents are never the same by incrementing the counter
let proponentCounter = 0;

const generateMockProponent = (): Proponent => {
  proponentCounter += 1;
  return {
    id: faker.datatype.number() + proponentCounter,
    name: `${faker.commerce.productName()} ${proponentCounter}`,
    is_active: faker.datatype.boolean(),
    relationship_holder_id: faker.datatype.number() + proponentCounter,
    relationship_holder: mockStaffs[proponentCounter - 1] as Staff,
  };
};

const proponent1 = generateMockProponent();
const proponent2 = generateMockProponent();
const proponents = [proponent1, proponent2];

function setupIntercepts(endpoints: any[]) {
  endpoints.forEach(({ method, url, response, name }) => {
    response = {
      ...response,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow all domains
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", // Specify allowed methods
        "Access-Control-Allow-Headers": "Content-Type, Authorization", // Specify allowed headers
      },
      statusCode: 200, // Ensure the response is marked as successful
    };
    cy.intercept(method, url, response).as(name);
  });
}

const endpoints = [
  {
    name: "getActiveStaffsOptions",
    method: "OPTIONS",
    url: `${AppConfig.apiUrl}staffs?is_active=false`,
  },
  {
    name: "getPIPTypeOptions",
    method: "OPTIONS",
    url: `${AppConfig.apiUrl}codes/pip_org_types`,
  },

  {
    name: "getFirstNationsOptions",
    method: "OPTIONS",
    url: `${AppConfig.apiUrl}first_nations`,
  },
  {
    name: "getActiveStaff",
    method: "GET",
    url: `${AppConfig.apiUrl}staffs?is_active=false`,
    response: { body: { data: mockStaffs } },
  },
  {
    name: "getPIPType",
    method: "GET",
    url: `${AppConfig.apiUrl}pip-org-types`,
    response: { body: [] },
  },
  {
    name: "getFirstNations",
    method: "GET",
    url: `${AppConfig.apiUrl}first_nations`,
    response: { body: [] },
  },
];

describe("ProponentList", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
    cy.mount(
      <Router>
        <MasterContext.Provider
          value={createMockMasterContext(proponents, proponents)}
        >
          <ProponentList />
        </MasterContext.Provider>
      </Router>
    );
  });

  it("should display the proponent list", () => {
    // Select the table container
    cy.get(".MuiInputBase-root");
  });

  it("should filter the proponent list based on the proponent name input", () => {
    testTableFiltering("Name", proponent1.name);
    cy.get("table").contains("tr", proponent1.name).should("be.visible");
    cy.get("table").contains("tr", proponent2.name).should("not.exist");
  });

  it("should filter the proponent list based on the proponent relationship holder  input", () => {
    testTableFiltering(
      "Relationship Holder",
      proponent1.relationship_holder?.full_name as Staff["full_name"]
    );
    cy.get("table")
      .contains(
        "tr",
        proponent1.relationship_holder?.full_name as Staff["full_name"]
      )
      .should("be.visible");
    cy.get("table")
      .contains(
        "tr",
        proponent2.relationship_holder?.full_name as Staff["full_name"]
      )
      .should("not.exist");
  });
});
