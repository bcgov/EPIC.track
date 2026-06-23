import { AppConfig } from "config";
import FirstNationForm from "../FirstNationForm";
import { WorkplanContext, initialWorkPlanContext } from "../../WorkPlanContext";
import {
  Endpoint,
  setupIntercepts,
} from "../../../../../cypress/support/utils";

const endpoints: Endpoint[] = [
  {
    name: "getAllFirstNations",
    method: "GET",
    url: `${AppConfig.apiUrl}indigenous-nations/details*`,
    response: {
      body: [
        {
          id: 11,
          name: "Nation A",
          pip_link: "PIP-1",
          relationship_holder: {
            full_name: "Holder Name",
          },
        },
      ],
    },
  },
  {
    name: "getConsultationLevels",
    method: "GET",
    url: `${AppConfig.apiUrl}indigenous-nations-consultation-levels*`,
    response: {
      body: [
        {
          id: 1,
          name: "Consult",
          description: "Consult",
          is_active: true,
        },
      ],
    },
  },
];

describe("FirstNationForm", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
  });

  it("loads nation and consultation options", () => {
    cy.mount(
      <WorkplanContext.Provider
        value={{
          ...initialWorkPlanContext,
          work: {
            id: 101,
          } as any,
        }}
      >
        <FirstNationForm onSave={() => {}} />
      </WorkplanContext.Provider>,
    );

    cy.wait("@getAllFirstNations");
    cy.wait("@getConsultationLevels");

    cy.contains("Nation").should("exist");
    cy.contains("Relationship Holder").should("exist");
    cy.contains("PIP Link").should("exist");
    cy.contains("Consultation Level").should("exist");
    cy.contains("Active").should("exist");
  });
});
