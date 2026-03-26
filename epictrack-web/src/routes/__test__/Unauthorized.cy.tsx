import { MemoryRouter, Route, Routes } from "react-router-dom";
import Unauthorized from "routes/Unauthorized";

describe("Unauthorized", () => {
  it("renders the unauthorized message", () => {
    cy.mount(
      <MemoryRouter initialEntries={["/unauthorized"]}>
        <Routes>
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    cy.contains("Unauthorized").should("exist");
    cy.contains("You do not have the permission to view this page.").should(
      "exist",
    );
    cy.contains("Go to home page").should("exist");
  });

  it("navigates to home page when button is clicked", () => {
    cy.mount(
      <MemoryRouter initialEntries={["/unauthorized"]}>
        <Routes>
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    cy.contains("Go to home page").click();
    cy.contains("Home Page").should("exist");
  });
});
