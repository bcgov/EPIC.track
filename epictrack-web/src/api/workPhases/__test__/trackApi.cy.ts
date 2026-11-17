import { AppConfig } from "config";
import { isApiError } from "apiManager/apiError";
import { OverageResponsibilityEnum } from "models/phaseOverageResponsibilities";
import { workPhasesApi } from "../workPhasesApi";

const apiPath = new URL(AppConfig.apis.track.baseUrl, window.location.origin)
  .pathname;
const path = (suffix: string) => `${apiPath}${suffix}`;

// Matches PhaseResponseSchema.
const trackPhase = {
  id: 3,
  name: "Early Engagement",
  work_type_id: 6,
  ea_act_id: 3,
  number_of_days: 90,
  legislated: true,
  sort_order: 2,
  color: "#0d6efd",
  visibility: "REGULAR",
  is_active: true,
  ea_act: { id: 3, name: "EA Act (2018)" },
  work_type: { id: 6, name: "Assessment" },
};

// Matches WorkPhaseResponseSchema.
const trackWorkPhase = {
  id: 44,
  name: "Early Engagement",
  start_date: "2024-01-15T08:00:00+00:00",
  end_date: "2024-04-14T07:00:00+00:00",
  work_id: 101,
  phase_id: 3,
  legislated: true,
  task_added: false,
  number_of_days: 90,
  is_completed: false,
  is_suspended: false,
  suspended_date: null,
  sort_order: 2,
  visibility: "REGULAR",
  responsibility_notes: "Proponent was late",
  is_active: true,
  phase: trackPhase,
};

const trackOverage = {
  id: 1,
  work_phase_id: 44,
  responsibility: "Proponent",
  is_active: true,
};

// Matches WorkPhaseAdditionalInfoResponseSchema.
const trackPhaseInfo = {
  work_phase: trackWorkPhase,
  total_number_of_days: 90,
  end_milestone: {
    name: "Early Engagement Complete",
    actual_date: null,
    anticipated_date: "2024-04-14T07:00:00+00:00",
  },
  current_milestone: "Early Engagement Start",
  next_milestone: "Early Engagement Complete",
  next_milestone_date: "2024-04-14T07:00:00+00:00",
  milestone_progress: 50,
  decision_milestone: null,
  decision: null,
  decision_milestone_date: null,
  is_last_phase: 1,
  days_left: 40,
  days_taken: 50,
  overage_responsibility: [trackOverage],
};

const workPhase = {
  id: 44,
  name: "Early Engagement",
  start_date: "2024-01-15T08:00:00+00:00",
  end_date: "2024-04-14T07:00:00+00:00",
  phase: { id: 3, name: "Early Engagement" },
  is_completed: false,
  is_suspended: false,
  legislated: true,
  suspended_date: null,
  number_of_days: 90,
  responsibility_notes: "Proponent was late",
};

const overage = {
  id: 1,
  work_phase_id: 44,
  responsibility: OverageResponsibilityEnum.PROPONENT,
  is_active: true,
};

const phaseInfo = {
  work_phase: workPhase,
  total_number_of_days: 90,
  end_milestone: {
    name: "Early Engagement Complete",
    actual_date: null,
    anticipated_date: "2024-04-14T07:00:00+00:00",
  },
  current_milestone: "Early Engagement Start",
  next_milestone: "Early Engagement Complete",
  milestone_progress: 50,
  is_last_phase: true,
  days_left: 40,
  days_taken: 50,
  overage_responsibility: [overage],
};

describe("Track work phases api", () => {
  beforeEach(() => {
    cy.intercept({ method: "GET", pathname: path("works/101/phases") }, [
      trackPhaseInfo,
      { ...trackPhaseInfo, is_last_phase: 0, end_milestone: null },
    ]);
    cy.intercept(
      { method: "GET", pathname: path("works/101/phase/44/additionalinfo") },
      [trackPhaseInfo],
    );
    cy.intercept(
      { method: "GET", pathname: path("works/101/phase/45/additionalinfo") },
      [],
    );
    cy.intercept(
      { method: "GET", pathname: path("works/work-phases/44") },
      { work_phase: trackWorkPhase },
    );
    cy.intercept(
      { method: "GET", pathname: path("works/work-phases/999") },
      { statusCode: 404, body: { message: "Work phase not found" } },
    );
    cy.intercept(
      {
        method: "GET",
        pathname: path("works/work-phases/44/template-upload-status"),
      },
      { template_available: true, task_added: false },
    );
    cy.intercept(
      { method: "POST", pathname: path("works/workplan/download") },
      {
        body: "xlsx bytes",
        headers: { "content-type": "application/octet-stream" },
      },
    ).as("download");
    cy.intercept(
      { method: "GET", pathname: path("phases/ea_acts/3/work_types/6") },
      [trackPhase],
    );
    cy.intercept(
      {
        method: "GET",
        pathname: path("works/work-phases/44/overage-responsibilities"),
      },
      [trackOverage],
    );
    cy.intercept(
      { method: "POST", pathname: path("overage-responsibilities") },
      { statusCode: 201, body: trackOverage },
    ).as("addOverage");
    cy.intercept(
      { method: "DELETE", pathname: path("overage-responsibilities/1") },
      { statusCode: 204 },
    ).as("removeOverage");
    cy.intercept(
      {
        method: "PATCH",
        pathname: path("works/work-phases/44/overage-responsibility-notes"),
      },
      trackWorkPhase,
    ).as("saveNotes");
  });

  it("maps the phases of a work", () => {
    cy.then(() => workPhasesApi.listForWork(101)).then(([first, second]) => {
      expect(first).to.deep.equal(phaseInfo);
      expect(second.is_last_phase).to.equal(false);
      expect(second.end_milestone).to.equal(null);
    });
  });

  it("returns the first additional info, or undefined when there is none", () => {
    cy.then(() => workPhasesApi.getInfo(101, 44)).should(
      "deep.equal",
      phaseInfo,
    );
    cy.then(() => workPhasesApi.getInfo(101, 45)).should("equal", undefined);
  });

  it("unwraps a work phase", () => {
    cy.then(() => workPhasesApi.get(44)).should("deep.equal", workPhase);
  });

  it("rejects with an ApiError for a missing work phase", () => {
    cy.then(() =>
      workPhasesApi.get(999).then(
        () => {
          throw new Error("expected get(999) to fail");
        },
        (error) => error,
      ),
    ).then((error) => {
      expect(isApiError(error)).to.equal(true);
      expect(error.status).to.equal(404);
    });
  });

  it("gets the template upload status", () => {
    cy.then(() => workPhasesApi.getTemplateUploadStatus(44)).should(
      "deep.equal",
      { template_available: true, task_added: false },
    );
  });

  it("downloads the work plan as a Blob", () => {
    cy.then(() => workPhasesApi.downloadWorkPlan(44)).then((file) => {
      expect(file).to.be.instanceOf(Blob);
    });
    cy.wait("@download").then(({ request }) => {
      expect(request.query).to.deep.equal({ work_phase_id: "44" });
      expect(request.body).to.deep.equal({});
    });
  });

  it("lists the phases configured for an EA act and work type", () => {
    cy.then(() => workPhasesApi.listPhaseCodes(3, 6)).should("deep.equal", [
      { id: 3, name: "Early Engagement" },
    ]);
  });

  it("reads and writes overage responsibilities", () => {
    cy.then(() => workPhasesApi.listOverageResponsibilities(44)).should(
      "deep.equal",
      [overage],
    );

    cy.then(() =>
      workPhasesApi.addOverageResponsibility({
        work_phase_id: 44,
        responsibility: OverageResponsibilityEnum.PROPONENT,
        work_id: 101,
      }),
    ).should("deep.equal", overage);
    cy.wait("@addOverage").its("request.body").should("deep.equal", {
      work_phase_id: 44,
      responsibility: "PROPONENT",
      work_id: 101,
    });

    cy.then(() => workPhasesApi.removeOverageResponsibility(1, 101));
    cy.wait("@removeOverage")
      .its("request.query")
      .should("deep.equal", { work_id: "101" });

    cy.then(() => workPhasesApi.saveOverageNotes(44, "Over by a week"));
    cy.wait("@saveNotes")
      .its("request.body")
      .should("deep.equal", { notes: "Over by a week" });
  });
});
