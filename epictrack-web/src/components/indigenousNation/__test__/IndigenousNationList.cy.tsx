import { MemoryRouter as Router } from "react-router-dom";
import IndigenousNationList from "../IndigenousNationList";
import { faker } from "@faker-js/faker";
import { FirstNation } from "models/firstNation";
import { Staff } from "models/staff";
import {
  mockStaffs,
  testTableFiltering,
} from "../../../../cypress/support/common";
import { AppConfig } from "config";
import { Endpoint, setupIntercepts } from "../../../../cypress/support/utils";

//ensure first nations are never the same by incrementing the counter
let firstNationCounter = 0;

const generateMockFirstNation = (): FirstNation => {
  firstNationCounter += 1;
  return {
    id: firstNationCounter,
    is_active: faker.datatype.boolean(),
    name: `${faker.commerce.productName()} ${firstNationCounter}`,
    pip_org_type_id: faker.number.int() + firstNationCounter,
    pip_org_type: {
      id: faker.number.int() + firstNationCounter,
      name: `${faker.commerce.productName()} ${firstNationCounter}`,
    },
    relationship_holder_id: faker.number.int() + firstNationCounter,
    relationship_holder: mockStaffs[firstNationCounter - 1] as Staff,
  };
};

const firstNation1 = generateMockFirstNation();
const firstNation2 = generateMockFirstNation();
const firstNations = [firstNation1, firstNation2];

const endpoints: Endpoint[] = [
  {
    name: "getFirstNations",
    method: "GET",
    url: `${AppConfig.apiUrl}indigenous-nations/details?is_active=*`,
    response: {
      body: firstNations,
    },
  },
  {
    name: "getFirstNationsOptions",
    method: "OPTIONS",
    url: `${AppConfig.apiUrl}indigenous-nations/details?is_active=*`,
  },
  {
    name: "getActiveStaffsOptions",
    method: "OPTIONS",
    url: `${AppConfig.apiUrl}staffs?is_active=*`,
  },
  {
    name: "getActiveStaff",
    method: "GET",
    url: `${AppConfig.apiUrl}staffs?is_active=*`,
    response: { body: mockStaffs },
  },
];

describe("IndigenousNationList", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
    cy.mount(
      <Router>
        <IndigenousNationList />
      </Router>,
    );
    cy.wait("@getFirstNations");
  });

  it("should display the First Nations list", () => {
    // Select the table container
    cy.get(".MuiInputBase-root");
    cy.get("table").should("be.visible");
  });

  it("should filter the First Nation list based on the name input", () => {
    testTableFiltering("Name", firstNation1.name);
    cy.get("table").contains("tr", firstNation1.name).should("be.visible");
    cy.get("table").contains("tr", firstNation2.name).should("not.exist");
  });

  it("should filter the First Nation list based on the relationship holder input", () => {
    testTableFiltering(
      "Relationship Holder",
      firstNation1.relationship_holder?.full_name as Staff["full_name"],
    );
    cy.get("table")
      .contains(
        "tr",
        firstNation1.relationship_holder?.full_name as Staff["full_name"],
      )
      .should("be.visible");
    cy.get("table")
      .contains(
        "tr",
        firstNation2.relationship_holder?.full_name as Staff["full_name"],
      )
      .should("not.exist");
  });
});
