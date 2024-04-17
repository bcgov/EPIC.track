import { MemoryRouter as Router } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import UserList from "../UserList";
import { faker } from "@faker-js/faker";
import { User } from "models/user";
import { MasterContext } from "components/shared/MasterContext";
import {
  createMockMasterContext,
  mockStaffs,
  testTableFiltering,
} from "../../../../cypress/support/common";
import { setupIntercepts } from "../../../../cypress/support/utils";
import { AppConfig } from "config";

let userCounter = 0;

const generateMockUser = (): User => {
  userCounter += 1;
  return {
    id: faker.datatype.string() + userCounter,
    email: faker.internet.email(),
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    group_id: faker.datatype.string() + userCounter,
    group: {
      name: "test" + userCounter,
      path: "/test" + userCounter,
      id: faker.datatype.string() + userCounter,
      level: 0,
      display_name: "test" + userCounter,
    },
    // ... other user properties
  };
};

const user1 = generateMockUser();
const user2 = generateMockUser();
const users = [user1, user2];

const endpoints = [
  {
    method: "OPTIONS",
    url: `${AppConfig.apiUrl}staffs?is_active=false`,
  },
  {
    method: "OPTIONS",
    url: `${AppConfig.apiUrl}codes/pip_org_types`,
  },
  {
    method: "OPTIONS",
    url: `${AppConfig.apiUrl}first_nations`,
  },
  {
    method: "GET",
    url: `${AppConfig.apiUrl}staffs?is_active=false`,
    body: mockStaffs,
  },
  {
    method: "GET",
    url: `${AppConfig.apiUrl}codes/pip_org_types`,
    body: [],
  },
  {
    method: "GET",
    url: `${AppConfig.apiUrl}first_nations`,
    body: [],
  },
  {
    method: "OPTIONS",
    url: `${AppConfig.apiUrl}users/groups`,
  },
  {
    method: "GET",
    url: `${AppConfig.apiUrl}users`,
    body: users,
  },
  {
    method: "GET",
    url: `${AppConfig.apiUrl}users/groups`,
    body: [user1.group, user2.group],
  },
];

describe("UserList", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
    cy.mount(
      <SnackbarProvider maxSnack={3}>
        <Router>
          <MasterContext.Provider value={createMockMasterContext(users, users)}>
            <UserList />
          </MasterContext.Provider>
        </Router>
      </SnackbarProvider>
    );
  });

  it("should display the user list", () => {
    // Select the table container
    cy.get(".MuiInputBase-root");
  });

  it("should filter the user list based on the user name input", () => {
    testTableFiltering("Name", user1.first_name);
  });

  it("should filter the user list based on the user display name", () => {
    testTableFiltering("Group", user1.group.display_name);
  });

  // Add more tests as needed
});
