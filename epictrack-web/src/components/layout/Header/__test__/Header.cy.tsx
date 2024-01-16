import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "store"; // adjust this import to your store location
import Header from "components/layout/Header/Header";

describe("Header", () => {
  beforeEach(() => {
    cy.mount(
      <Provider store={store}>
        <Router>
          <Header />
        </Router>
      </Provider>
    );
  });

  it("renders AppBar", () => {
    cy.get('[data-testid="appbar-header"]').should("be.visible");
  });

  it("displays user menu on hover", () => {
    // Assuming the user menu box has a test id of 'user-menu-box'
    cy.get('[data-testid="user-menu-box"]').trigger("mouseover");
    // Assuming the UserMenu component has a test id of 'user-menu'
    cy.get('[data-testid="user-menu"]').should("be.visible");
  });
});
