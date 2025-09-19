import {
  MemoryRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import MonthWorkLegendItem from "../MonthWorkLegendItem";

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-cy="location">{location.pathname + location.search}</div>;
};

describe("MonthWorkLegendItem", () => {
  const mockWorkItem = {
    name: "Big ol' Test Work",
    work_id: 123,
  };

  it("renders the work name correctly", () => {
    cy.mount(
      <Router>
        <MonthWorkLegendItem {...mockWorkItem} />
      </Router>
    );

    cy.contains(mockWorkItem.name).should("be.visible");
  });

  it("shows the tooltip on hover", () => {
    cy.mount(
      <Router>
        <MonthWorkLegendItem {...mockWorkItem} />
      </Router>
    );

    // Hover over the component for the tooltip
    cy.get("div").contains(mockWorkItem.name).trigger("mouseover");

    cy.get("div[role='tooltip']").should("contain.text", mockWorkItem.name);
  });

  it("navigates to the correct URL and passes state on click", () => {
    cy.mount(
      <Router initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<MonthWorkLegendItem {...mockWorkItem} />} />
          <Route path="/work-plan" element={<LocationDisplay />} />
        </Routes>
      </Router>
    );

    // Click the work item
    cy.contains(mockWorkItem.name).closest("div").click();

    // Assert the navigation
    cy.get("[data-cy=location]").should(
      "contain.text",
      `/work-plan?work_id=${mockWorkItem.work_id}`
    );
  });
});
