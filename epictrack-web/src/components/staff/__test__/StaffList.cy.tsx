import { MemoryRouter as Router } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import StaffList from "../StaffList";
import { faker } from "@faker-js/faker";
import { Staff } from "models/staff";
import { MasterContext } from "components/shared/MasterContext";
import staffService from "services/staffService/staffService";
import {
  createMockMasterContext,
  mockStaffs,
  testTableFiltering,
} from "../../../../cypress/support/common";
import { setupIntercepts } from "../../../../cypress/support/utils";

//ensure staffs are never the same by incrementing the counter
let staffCounter = 0;

const generateMockStaff = (): Staff => {
  staffCounter += 1;
  return {
    id: faker.datatype.number() + staffCounter,
    full_name: `${faker.name.firstName()} ${faker.name.lastName()} ${staffCounter}`,
    is_active: faker.datatype.boolean(),
    position_id: faker.datatype.number() + staffCounter,
    position: { name: "test", id: 1, sort_order: 0 },
    phone: faker.phone.number(),
    email: faker.internet.email(),
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    // ... other staff properties
  };
};

const staff1 = generateMockStaff();
const staff2 = generateMockStaff();
const staffs = [staff1, staff2];

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

describe("StaffList", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
    cy.mount(
      <SnackbarProvider maxSnack={3}>
        <Router>
          <MasterContext.Provider
            value={createMockMasterContext(staffs, staffs)}
          >
            <StaffList />
          </MasterContext.Provider>
        </Router>
      </SnackbarProvider>
    );
  });

  it("should display the staff list", () => {
    // Select the table container
    cy.get(".MuiInputBase-root");
  });

  it("should filter the staff list based on the staff name input", () => {
    testTableFiltering("Name", staff1.full_name);
    cy.get("table").contains("tr", staff1.full_name).should("be.visible");
    cy.get("table").contains("tr", staff2.full_name).should("not.exist");
  });

  it("should filter the staff list based on the staff phone number input", () => {
    testTableFiltering("Phone Number", staff1.phone);
    cy.get("table").contains("tr", staff1.phone).should("be.visible");
    cy.get("table").contains("tr", staff2.phone).should("not.exist");
  });

  it("should filter the staff list based on the staff email input", () => {
    testTableFiltering("Email", staff1.email);
    cy.get("table").contains("tr", staff1.email).should("be.visible");
    cy.get("table").contains("tr", staff2.email).should("not.exist");
  });

  // Add more tests as needed
});
