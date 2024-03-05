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
    cy.setupUser([ROLES.CREATE]);
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
