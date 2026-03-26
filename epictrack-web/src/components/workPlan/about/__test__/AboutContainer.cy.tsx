import { MemoryRouter as Router } from "react-router-dom";
import AboutContainer from "../AboutContainer";
import { AboutContext } from "../AboutContext";
import { WorkplanContext, initialWorkPlanContext } from "../../WorkPlanContext";

describe("AboutContainer", () => {
  it("renders details/resources and opens add resource flow", () => {
    const setShowCreateDialog = cy.stub().as("setShowCreateDialog");

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            loading: false,
            work: {
              id: 101,
              project: {
                name: "North Valley Project",
              },
            } as any,
          }}
        >
          <AboutContext.Provider
            value={{
              workResources: [],
              setShowDeleteDialog: () => {},
              setShowEditDialog: () => {},
              setShowCreateDialog,
              setSelectedWorkResource: () => {},
              selectedWorkResource: null,
              onSave: () => {},
              getWorkResources: () => {},
            }}
          >
            <AboutContainer />
          </AboutContext.Provider>
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains("Details").should("exist");
    cy.contains("Resources").should("exist");
    cy.contains("Link to EPIC.Public").should("exist");

    cy.contains("button", "Add Resource").click();
    cy.get("@setShowCreateDialog").should("have.been.calledWith", true);
  });
});
