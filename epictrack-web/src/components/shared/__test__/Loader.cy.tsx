import { Loader } from "../loader";
import { Provider } from "react-redux";
import { store } from "../../../store";
import { setLoadingState } from "services/loadingService";

// Mock reducer
declare global {
  interface Window {
    store: any; // replace 'any' with the type of your Redux store if you have one
  }
}

describe("Loader", () => {
  it("renders successfully", () => {
    if (window.Cypress) {
      // expose the store to the Cypress window object when running Cypress tests
      window.store = store;
    }

    cy.window().its("store").invoke("dispatch", setLoadingState(true));
    cy.mount(
      <Provider store={store}>
        <Loader />
      </Provider>
    );
    cy.get("div").should("have.class", "MuiBackdrop-root");
    cy.get("svg").should("have.class", "MuiCircularProgress-svg");
  });
});
