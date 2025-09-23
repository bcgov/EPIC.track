import EmptyCardBody from "components/myUpdates/myStatuses/StatusCard/EmptyCardBody";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { ROLES } from "constants/application-constant";

const mockReducer = {
  user: {
    userDetail: {
      roles: [ROLES.EDIT],
    },
  },
};

function makeStore(initialState = mockReducer) {
  return configureStore({
    reducer: () => initialState,
    preloadedState: initialState,
  });
}

describe("Status Card - EmptyCardBody ", () => {
  it("renders add button if user has EDIT role", () => {
    const store = makeStore();

    cy.mount(
      <Provider store={store}>
        <EmptyCardBody onAddClick={cy.stub().as("onAddClick")} />
      </Provider>
    );

    cy.contains("button", "Add Status").should("exist").click();
    cy.get("@onAddClick").should("have.been.called");
  });

  it("does not render add button without EDIT role", () => {
    const store = makeStore({
      user: { userDetail: { roles: [] } },
    });

    cy.mount(
      <Provider store={store}>
        <EmptyCardBody onAddClick={cy.stub()} />
      </Provider>
    );

    cy.contains("button", "Add Status").should("not.exist");
  });
});
