import { Provider } from "react-redux";
import { store } from "../../../store";
import { Restricted } from "../restricted";
import { ROLES } from "../../../constants/application-constant";
import { userDetails } from "services/userService/userSlice";

declare global {
  interface Window {
    store: any; // replace 'any' with the type of your Redux store if you have one
  }
}

describe("Restricted Component", () => {
  beforeEach(() => {
    if (window.Cypress) {
      // expose the store to the Cypress window object when running Cypress tests
      window.store = store;
    }

    const fakeUserDetail = {
      sub: "fakeSub",
      groups: ["fakeGroup1", "fakeGroup2"],
      preferred_username: "fakeUsername",
      firstName: "fakeFirstName",
      lastName: "fakeLastName",
      email: "fakeEmail@example.com",
      staffId: 123,
      phone: "1234567890",
      position: "fakePosition",
      roles: [ROLES.CREATE, "fakeRole1", "fakeRole2"],
    };

    cy.window().its("store").invoke("dispatch", userDetails(fakeUserDetail));
  });

  it("renders children when user has required permissions", () => {
    cy.mount(
      <Provider store={store}>
        <Restricted allowed={[ROLES.CREATE]} errorProps={{ disabled: true }}>
          <div data-cy="restricted-content">Restricted Content</div>
        </Restricted>
      </Provider>
    );

    cy.get("[data-cy=restricted-content]").should("be.visible");
  });

  it("renders error component when user does not have required permissions", () => {
    cy.mount(
      <Provider store={store}>
        <Restricted allowed={["test"]}>
          <div data-cy="restricted-content">Restricted Content</div>
        </Restricted>
      </Provider>
    );

    cy.get("[data-cy=restricted-content]").should("not.exist");
  });
});
