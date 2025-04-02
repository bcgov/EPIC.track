import { MemoryRouter as Router } from "react-router-dom";
import SideNav from "components/layout/SideNav/SideNav";
import { Routes } from "components/layout/SideNav/SideNavElements";

describe("<SideNav />", () => {
  it("renders and navigates correctly", () => {
    cy.viewport(1980, 1080);

    cy.mount(
      <Router initialEntries={["/initial/path"]}>
        // Create store and pass above props to the store
        <SideNav />
      </Router>
    );

    Routes.forEach((route) => {
      // If the route has an empty allowedRoles array
      if (route.allowedRoles && route.allowedRoles.length === 0) {
        // Perform a cy.get for the route
        cy.get(`[data-testid="SideNav/${route.name}-button"]`).should(
          "be.visible"
        );
      }

      // If the route has nested routes, iterate over them as well
      if (route.routes) {
        // Check if all nested routes have empty allowedRoles
        const allNestedRoutesAllowed = route.routes.every(
          (nestedRoute) =>
            nestedRoute.allowedRoles && nestedRoute.allowedRoles.length === 0
        );

        if (allNestedRoutesAllowed) {
          // Click on the parent route to expand it
          cy.get(`[data-testid="SideNav/${route.name}-button"]`).click();

          route.routes.forEach((nestedRoute) => {
            // Then check that the nested route is visible
            cy.get(`[data-testid="SideNav/${nestedRoute.name}-button"]`).should(
              "be.visible"
            );
          });
        }
      }
    });
  });
});
