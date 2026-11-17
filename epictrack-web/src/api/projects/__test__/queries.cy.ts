import { AppConfig } from "config";
import { store } from "store";
import { projectsQueryApi } from "../queries";

const apiPath = new URL(AppConfig.apis.track.baseUrl, window.location.origin)
  .pathname;
const projectPath = `${apiPath}projects/1`;
const selectSummary = () =>
  projectsQueryApi.endpoints.getProjectSummary.select(1)(store.getState());

describe("projects queries", () => {
  let summaryRequests: number;

  beforeEach(() => {
    store.dispatch(projectsQueryApi.util.resetApiState());
    summaryRequests = 0;
    cy.intercept({ method: "GET", pathname: projectPath }, (req) => {
      summaryRequests += 1;
      req.reply({ id: 1, name: summaryRequests === 1 ? "Before" : "After" });
    }).as("summary");
  });

  it("refetches the cached summary after an update saves", () => {
    cy.intercept({ method: "PUT", pathname: projectPath }, { id: 1 });
    const subscription = store.dispatch(
      projectsQueryApi.endpoints.getProjectSummary.initiate(1),
    );
    cy.wait("@summary");
    cy.then(() => expect(selectSummary().data?.name).to.equal("Before"));

    cy.then(() =>
      store
        .dispatch(
          projectsQueryApi.endpoints.updateProject.initiate({
            id: 1,
            input: { name: "After" },
          }),
        )
        .unwrap(),
    );
    cy.wait("@summary");
    cy.then(() => selectSummary().data?.name).should("equal", "After");
    cy.then(() => subscription.unsubscribe());
  });

  it("keeps the cached summary when an update fails", () => {
    cy.intercept(
      { method: "PUT", pathname: projectPath },
      { statusCode: 500, body: {} },
    ).as("update");
    const subscription = store.dispatch(
      projectsQueryApi.endpoints.getProjectSummary.initiate(1),
    );
    cy.wait("@summary");

    cy.then(() =>
      store.dispatch(
        projectsQueryApi.endpoints.updateProject.initiate({
          id: 1,
          input: { name: "After" },
        }),
      ),
    ).then((result) => {
      expect(result).to.have.property("error");
      // A refetch would already be pending by now.
      expect(selectSummary().status).to.equal("fulfilled");
    });
    cy.wait("@update");
    cy.then(() => {
      expect(summaryRequests).to.equal(1);
      expect(selectSummary().data?.name).to.equal("Before");
      subscription.unsubscribe();
    });
  });
});
