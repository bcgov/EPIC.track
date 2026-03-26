import { MemoryRouter as Router } from "react-router-dom";
import { AppConfig } from "config";
import ImportFirstNation from "../ImportFirstNation";
import { WorkplanContext, initialWorkPlanContext } from "../../WorkPlanContext";
import {
  Endpoint,
  setupIntercepts,
} from "../../../../../cypress/support/utils";

const endpoints: Endpoint[] = [
  {
    name: "getWorkTypes",
    method: "GET",
    url: `${AppConfig.apiUrl}projects/88/work-types*`,
    response: {
      body: [
        { id: 10, name: "Type A", is_active: true },
        { id: 20, name: "Type B", is_active: true },
      ],
    },
  },
  {
    name: "getFirstNations",
    method: "GET",
    url: `${AppConfig.apiUrl}projects/88/first-nations*`,
    response: {
      body: [
        { id: 201, name: "Nation One" },
        { id: 202, name: "Nation Two" },
      ],
    },
  },
];

describe("ImportFirstNation", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
  });

  it("loads nations and submits selected ids", () => {
    const onSave = cy.stub().as("onSave");

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            work: {
              id: 101,
              project_id: 88,
            } as any,
          }}
        >
          <ImportFirstNation onSave={onSave} />
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.wait("@getWorkTypes");
    cy.wait("@getFirstNations");

    cy.contains("All Work Types (2)").should("exist");
    cy.contains("Nation One").should("exist");
    cy.contains("button", "Import").should("be.disabled");

    cy.get('input[type="checkbox"][value="201"]').check({ force: true });

    cy.contains("button", "Import").should("not.be.disabled").click();
    cy.get("@onSave").should("have.been.calledWith", [201]);
  });
});
