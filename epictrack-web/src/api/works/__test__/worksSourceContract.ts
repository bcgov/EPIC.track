import { isApiError } from "apiManager/apiError";
import { WorksSource } from "../sources/types";

/** `stubWire` must make work 1 exist, work 999 missing, and "Taken Work" the only used title. */
export const describeWorksSource = (
  name: string,
  source: WorksSource,
  stubWire: () => void,
) => {
  describe(`${name} works source contract`, () => {
    beforeEach(stubWire);

    it("get returns the fields the work form edits, with a project ref", () => {
      cy.then(() => source.get(1)).then((work) => {
        expect(work.id).to.equal(1);
        expect(work).to.include.keys(
          "title",
          "simple_title",
          "report_description",
          "epic_description",
          "start_date",
          "ea_act_id",
          "work_type_id",
          "project_id",
          "ministry_id",
          "federal_involvement_id",
          "substitution_act_id",
          "eao_team_id",
          "responsible_epd_id",
          "work_lead_id",
          "decision_by_id",
          "is_active",
          "is_high_priority",
          "is_cac_recommended",
        );
        expect(work.project).to.have.all.keys("id", "name");
      });
    });

    it("list returns exactly the list fields", () => {
      cy.then(() => source.list()).then((works) => {
        expect(works).to.have.length.greaterThan(0);
        works.forEach((work) => {
          expect(work).to.have.all.keys(
            "id",
            "title",
            "is_active",
            "work_state",
            "project",
            "ea_act",
            "work_type",
            "eao_team",
            "current_work_phase",
          );
          expect(work.project).to.have.all.keys("id", "name");
          [work.ea_act, work.work_type, work.eao_team].forEach((value) =>
            expect(value).to.have.all.keys("name"),
          );
        });
      });
    });

    it("listOptions returns ids and titles", () => {
      cy.then(() => source.listOptions()).then((options) => {
        expect(options).to.have.length.greaterThan(0);
        options.forEach((option) =>
          expect(option).to.have.all.keys("id", "title"),
        );
      });
    });

    it("create and update return the saved work", () => {
      cy.then(() => source.create({ simple_title: "New" })).then((work) =>
        expect(work).to.include.keys("id", "title"),
      );
      cy.then(() => source.update(1, { simple_title: "Renamed" })).then(
        (work) => expect(work.id).to.equal(1),
      );
    });

    it("checkExists answers with a boolean", () => {
      cy.then(() => source.checkExists("Taken Work")).should("equal", true);
      cy.then(() => source.checkExists("Free Work", 1)).should("equal", false);
    });

    it("rejects with an ApiError for a missing work", () => {
      cy.then(() =>
        source.get(999).then(
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
  });
};
