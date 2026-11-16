import React from "react";
import { MemoryRouter as Router } from "react-router-dom";
import { AppConfig } from "config";
import { Work } from "models/work";
import { workService } from "services/workService/workService";
import { WorkplanContext, initialWorkPlanContext } from "../WorkPlanContext";
import {
  IssuesContext,
  initialIssueContextValue,
} from "../issues/IssuesContext";
import { StatusContext } from "../status/StatusContext";
import Notes from "../issues/Notes";
import StatusNotes from "../status/StatusContainer/StatusNotes";
import FirstNationContainer from "../firstNations/FirstNationContainer";

const work = {
  id: 5,
  title: "Original title",
  project_id: 88,
  project: { id: 88, name: "Project 88" },
  issue_notes: "",
  status_notes: "",
  first_nation_notes: "",
} as unknown as Work;

const serverWork = { ...work, title: "Title from the notes response" };

const WorkHarness = ({ children }: { children: JSX.Element }) => {
  const [current, setCurrent] = React.useState<Work | undefined>(work);
  return (
    <WorkplanContext.Provider
      value={{
        ...initialWorkPlanContext,
        loading: false,
        work: current,
        setWork: setCurrent,
      }}
    >
      {children}
      <pre data-cy="work">{JSON.stringify(current)}</pre>
    </WorkplanContext.Provider>
  );
};

const expectSavedField = (field: keyof Work) =>
  cy.get("[data-cy='work']").should(($pre) => {
    const saved = JSON.parse($pre.text());
    expect(saved[field]).to.contain("Typed note");
    expect(saved.title).to.equal("Original title");
  });

describe("Notes saves", () => {
  it("merges saved issue notes into the work", () => {
    cy.stub(workService, "saveNotes")
      .as("saveNotes")
      .resolves({ status: 200, data: serverWork } as any);
    cy.mount(
      <WorkHarness>
        <IssuesContext.Provider
          value={{ ...initialIssueContextValue, workId: "5" } as any}
        >
          <Notes />
        </IssuesContext.Provider>
      </WorkHarness>,
    );

    cy.get('[role="textbox"]').type("Typed note");

    cy.get("@saveNotes").should("have.been.calledWith", 5);
    expectSavedField("issue_notes");
  });

  it("merges saved status notes into the work", () => {
    cy.stub(workService, "saveNotes")
      .as("saveNotes")
      .resolves({ status: 200, data: serverWork } as any);
    cy.mount(
      <WorkHarness>
        <StatusContext.Provider value={{ workId: "5" } as any}>
          <StatusNotes />
        </StatusContext.Provider>
      </WorkHarness>,
    );

    cy.get('[role="textbox"]').type("Typed note");

    cy.get("@saveNotes").should("have.been.calledWith", 5);
    expectSavedField("status_notes");
  });

  it("merges saved first nation notes into the work", () => {
    cy.intercept(
      {
        method: "GET",
        pathname: `${new URL(AppConfig.apis.track.baseUrl, window.location.origin).pathname}projects/88/first-nation-available`,
      },
      { first_nation_available: true },
    );
    cy.stub(workService, "saveFirstNationNotes")
      .as("saveFirstNationNotes")
      .resolves({ status: 200, data: serverWork } as any);
    cy.mount(
      <Router>
        <WorkHarness>
          <FirstNationContainer />
        </WorkHarness>
      </Router>,
    );

    cy.contains("Notes").click();
    cy.get('[role="textbox"]').type("Typed note");

    cy.get("@saveFirstNationNotes").should("have.been.calledWith", 5);
    expectSavedField("first_nation_notes");
  });
});
