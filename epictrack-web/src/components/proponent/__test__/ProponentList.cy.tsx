import { MemoryRouter as Router } from "react-router-dom";
import ProponentList from "../ProponentList";
import { faker } from "@faker-js/faker";
import { Proponent } from "models/proponent";
import { Staff } from "models/staff";
import {
  mockStaffs,
  testTableFiltering,
} from "../../../../cypress/support/common";
import { AppConfig } from "config";
import {
  HttpMethod,
  Endpoint,
  setupIntercepts,
} from "../../../../cypress/support/utils";

//ensure proponents are never the same by incrementing the counter
let proponentCounter = 0;

const generateMockProponent = (): Proponent => {
  proponentCounter += 1;
  return {
    id: faker.number.int() + proponentCounter,
    name: `${faker.commerce.productName()} ${proponentCounter}`,
    is_active: faker.datatype.boolean(),
    relationship_holder_id: faker.number.int() + proponentCounter,
    relationship_holder: mockStaffs[proponentCounter - 1] as Staff,
  };
};

const proponent1 = generateMockProponent();
const proponent2 = generateMockProponent();
const proponents = [proponent1, proponent2];

const endpoints: Endpoint[] = [
  {
    name: "getProponents",
    method: "GET" as HttpMethod,
    url: `${AppConfig.apiUrl}proponents`,
    response: {
      body: proponents,
    },
  },
  {
    name: "getActiveStaffsOptions",
    method: "OPTIONS" as HttpMethod,
    url: `${AppConfig.apiUrl}staffs?is_active=false`,
  },
  {
    name: "getActiveStaff",
    method: "GET" as HttpMethod,
    url: `${AppConfig.apiUrl}staffs?is_active=false`,
    response: { body: mockStaffs },
  },
];

describe("ProponentList", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
    cy.mount(
      <Router>
        <ProponentList />
      </Router>,
    );
  });

  it("should display the proponent list", () => {
    cy.get("table").should("exist").and("be.visible");
  });

  it("should filter the proponent list based on the proponent name input", () => {
    testTableFiltering("Name", proponent1.name);
    cy.get("table").contains("tr", proponent1.name).should("be.visible");
    cy.get("table").contains("tr", proponent2.name).should("not.exist");
  });

  it("should filter the proponent list based on the proponent relationship holder  input", () => {
    testTableFiltering(
      "Relationship Holder",
      proponent1.relationship_holder?.full_name as Staff["full_name"],
    );
    cy.get("table")
      .contains(
        "tr",
        proponent1.relationship_holder?.full_name as Staff["full_name"],
      )
      .should("be.visible");
    cy.get("table")
      .contains(
        "tr",
        proponent2.relationship_holder?.full_name as Staff["full_name"],
      )
      .should("not.exist");
  });
});
