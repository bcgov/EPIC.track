import { ETCaption3 } from "..";
import { SpecialFieldGrid } from "../specialField";
import {
  SpecialFieldEntityEnum,
  SPECIAL_FIELDS,
  SPECIAL_FIELD_TYPES,
} from "../../../constants/application-constant";
import { setupIntercepts } from "../../../../cypress/support/utils";
import { faker } from "@faker-js/faker";
import { AppConfig } from "config";

const endpoints = [
  {
    name: "SpecialFieldOptions",
    method: "OPTIONS",
    url: `${AppConfig.apiUrl}special-fields?entity=PROJECT&entity_id=1&field_name=name`,
  },
  {
    name: "GetSpecialField",
    method: "GET",
    url: `${AppConfig.apiUrl}special-fields?entity=PROJECT&entity_id=1&field_name=name`,
    response: {
      body: {
        id: faker.number.int(),
        entity: SpecialFieldEntityEnum.PROJECT,
        entity_id: 1,
        field_name: SPECIAL_FIELDS.PROJECT.NAME,
        field_label: "Name",
        active_from: faker.date.recent(),
      },
    },
  },
];

describe("SpecialFieldGrid Component Tests", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
    cy.mount(
      <SpecialFieldGrid
        entity={SpecialFieldEntityEnum.PROJECT}
        entity_id={1}
        fieldName={SPECIAL_FIELDS.PROJECT.NAME}
        fieldValueType={SPECIAL_FIELD_TYPES.STRING}
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
    cy.get('[data-cy="description"]').contains(
      "Testing Description for test field"
    );
  });
});
