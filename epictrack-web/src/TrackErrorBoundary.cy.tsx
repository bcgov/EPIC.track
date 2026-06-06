import { MemoryRouter as Router, Route, Routes } from "react-router-dom";
import { TrackErrorBoundary } from "./TrackErrorBoundary";

const FineComponent = () => <div data-cy="ok">No errors</div>;

const ErrorComponent = () => {
  throw new Error("Boom");
};

describe("TrackErrorBoundary", () => {
  it("renders children when no error is thrown", () => {
    cy.mount(
      <Router initialEntries={["/"]}>
        <Routes>
          <Route
            path="/"
            element={
              <TrackErrorBoundary>
                <FineComponent />
              </TrackErrorBoundary>
            }
          />
        </Routes>
      </Router>,
    );

    cy.get("[data-cy='ok']").should("be.visible");
  });

  it("renders fallback and navigates home on reset", () => {
    cy.on("uncaught:exception", (err) => {
      if (err.message.includes("Boom")) {
        return false;
      }
      return true;
    });

    cy.mount(
      <Router initialEntries={["/boom"]}>
        <Routes>
          <Route path="/" element={<div data-cy="home">Home</div>} />
          <Route
            path="/boom"
            element={
              <TrackErrorBoundary>
                <ErrorComponent />
              </TrackErrorBoundary>
            }
          />
        </Routes>
      </Router>,
    );

    cy.contains("An unexpected error happened.").should("be.visible");
    cy.contains("Go to home page").click();
    cy.get("[data-cy='home']").should("be.visible");
  });
});
