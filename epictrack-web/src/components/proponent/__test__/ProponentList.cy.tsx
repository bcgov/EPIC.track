import { MemoryRouter as Router } from "react-router-dom";
import { SnackbarProvider } from "notistack";
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
import { setupIntercepts } from "../../../../cypress/support/utils";
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

const endpoints = [
  {
    method: "OPTIONS",
    url: "http://localhost:3200/api/v1/staffs?is_active=false",
  },
  {
    method: "OPTIONS",
    url: "http://localhost:3200/api/v1/codes/pip_org_types",
  },
  {
    method: "OPTIONS",
    url: "http://localhost:3200/api/v1/first_nations",
  },
  {
    method: "GET",
    url: "http://localhost:3200/api/v1/staffs?is_active=false",
    body: { data: mockStaffs },
  },
  {
    method: "GET",
    url: "http://localhost:3200/api/v1/codes/pip_org_types",
    body: [],
  },
  {
    method: "GET",
    url: "http://localhost:3200/api/v1/first_nations",
    body: [],
  },
];

describe("ProponentList", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
    cy.mount(
      <SnackbarProvider maxSnack={3}>
        <Router>
          <MasterContext.Provider
            value={createMockMasterContext(proponents, proponents)}
          >
            <ProponentList />
          </MasterContext.Provider>
        </Router>
      </SnackbarProvider>
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
