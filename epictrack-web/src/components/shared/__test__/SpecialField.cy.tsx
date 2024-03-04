import { ETCaption3 } from "..";
import { SpecialFieldGrid } from "../specialField";
import {
  SpecialFieldEntityEnum,
  SPECIAL_FIELDS,
} from "../../../constants/application-constant";

describe("SpecialFieldGrid Component Tests", () => {
  beforeEach(() => {
    cy.mount(
      <SpecialFieldGrid
        entity={SpecialFieldEntityEnum.PROJECT}
        entity_id={1}
        fieldName={SPECIAL_FIELDS.PROJECT.NAME}
        fieldLabel={"Name"}
        fieldType={"text"}
        title={"Title"}
        description={
          <ETCaption3>Testing Description for test field</ETCaption3>
        }
        onSave={cy.stub()}
      />
    );
  });

  it("should render the component", () => {
    cy.get('[data-cy="special-field-grid"]').should("be.visible");
  });

  it("should display the correct title", () => {
    cy.get('[data-cy="title"]').should("have.text", "Title");
  });

  it("should display the correct description", () => {
    cy.get('[data-cy="description"]').should(
      "have.text",
      "Testing Description for test field"
    );
  });
});
