import { isApiError } from "apiManager/apiError";
import { ProjectsSource } from "../sources/types";

/** `stubWire` must make project 1 exist, project 999 missing, and "Taken Project" the only used name. */
export const describeProjectsSource = (
  name: string,
  source: ProjectsSource,
  stubWire: () => void,
) => {
  describe(`${name} projects source contract`, () => {
    beforeEach(stubWire);

    it("getSummary returns exactly the summary fields", () => {
      cy.then(() => source.getSummary(1)).then((summary) => {
        expect(summary).to.have.all.keys(
          "id",
          "name",
          "description",
          "abbreviation",
          "address",
          "created_at",
          "type",
          "sub_type",
          "proponent",
          "region_env",
          "region_flnro",
        );
        expect(summary.id).to.equal(1);
        [
          summary.type,
          summary.sub_type,
          summary.proponent,
          summary.region_env,
          summary.region_flnro,
        ].forEach((value) => {
          expect(value).to.have.all.keys("name");
          expect(value.name).to.be.a("string");
        });
      });
    });

    it("get returns the fields the project form edits", () => {
      cy.then(() => source.get(1)).then((project) => {
        expect(project.id).to.equal(1);
        expect(project).to.include.keys(
          "name",
          "type_id",
          "sub_type_id",
          "proponent_id",
          "region_id_env",
          "region_id_flnro",
          "eac_signed",
          "eac_expires",
          "is_active",
          "is_project_closed",
        );
      });
    });

    it("list returns projects and listOptions returns refs", () => {
      cy.then(() => source.list()).then((projects) => {
        expect(projects).to.have.length.greaterThan(0);
        expect(projects[0]).to.include.keys("id", "name", "type");
      });
      cy.then(() => source.listOptions()).then((options) => {
        expect(options).to.have.length.greaterThan(0);
        options.forEach((option) =>
          expect(option).to.have.all.keys("id", "name"),
        );
      });
    });

    it("create and update return the saved project", () => {
      cy.then(() => source.create({ name: "New Project" })).then((project) =>
        expect(project).to.include.keys("id", "name"),
      );
      cy.then(() => source.update(1, { name: "Renamed" })).then((project) =>
        expect(project.id).to.equal(1),
      );
    });

    it("checkExists answers with a boolean", () => {
      cy.then(() => source.checkExists("Taken Project")).should("equal", true);
      cy.then(() => source.checkExists("Free Project", 1)).should(
        "equal",
        false,
      );
    });

    it("suggestAbbreviation returns a string", () => {
      cy.then(() => source.suggestAbbreviation("New Project")).should(
        "be.a",
        "string",
      );
    });

    it("returns the lookups the filters and form need", () => {
      cy.then(() => source.listTypes()).then((types) =>
        expect(types[0]).to.include.keys("id", "name"),
      );
      cy.then(() => source.getFormOptions()).then((options) => {
        expect(options).to.have.all.keys(
          "types",
          "proponents",
          "envRegions",
          "nrsRegions",
        );
        Object.values(options).forEach((list) =>
          expect(list).to.have.length.greaterThan(0),
        );
      });
      cy.then(() => source.listSubTypes(1)).then((subTypes) =>
        expect(subTypes[0]).to.include.keys("id", "name"),
      );
    });

    it("rejects with an ApiError for a missing project", () => {
      cy.then(() =>
        source.getSummary(999).then(
          () => {
            throw new Error("expected getSummary(999) to fail");
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
