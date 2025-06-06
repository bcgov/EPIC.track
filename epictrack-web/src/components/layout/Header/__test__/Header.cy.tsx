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

  it("displays user menu on click", () => {
    cy.get('[data-testid="user-menu-box"]').click();
    cy.get('[data-testid="user-menu"]').should("be.visible");
  });
});
