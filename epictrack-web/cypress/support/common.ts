import { Staff } from "models/staff";
import Sinon, { SinonStub } from "cypress/types/sinon";
import { faker } from "@faker-js/faker";
import { Project } from "models/project";
import { ListType } from "models/code";

export const mockStaffs: Staff[] = [
  {
    id: 1,
    full_name: "John Doe",
    first_name: "", // Add the missing property
    last_name: "", // Add the missing property
    phone: "",
    email: "",
    is_active: false,
    position_id: 2 /* add more missing properties here */,
    position: { name: "test", id: 1, sort_order: 0 }, // Add the missing property
  },
  {
    id: 2,
    full_name: "Test Doe",
    first_name: "", // Add the missing property
    last_name: "", // Add the missing property
    phone: "",
    email: "",
    is_active: false,
    position_id: 2 /* add more missing properties here */,
    position: { name: "test", id: 1, sort_order: 1 }, // Add the missing property
  },
  // Add more mock Staff objects as needed
];

export function createMockMasterContext(defaultItem: any, _data?: any) {
  return {
    item: defaultItem,
    setFormId: cy.stub(),
    setTitle: cy.stub(),
    setId: cy.stub(),
    onSave: cy.stub(),
    title: "Data",
    data: [..._data],
    loading: false,
    setItem: cy.stub(),
    setShowDeleteDialog: cy.stub(),
    setShowModalForm: cy.stub(),
    getData: cy.stub(),
    setService: cy.stub(),
    setForm: cy.stub(),
    onDialogClose: cy.stub(),
    setFormStyle: cy.stub(),
    getById: cy.stub(),
    setDialogProps: cy.stub(),
  };
}

export function testTableFiltering(
  tableHeaderName: string,
  propertyToTest: string
) {
  cy.contains("div", tableHeaderName)
    .closest(".MuiTableCell-root")
    .then(($tableCell) => {
      // Within the table cell, find the div that includes 'the property to test' in its class name
      cy.wrap($tableCell)
        .find("input:first")
        .click()
        .type(`${propertyToTest}{enter}`); // Type into the input field and press Enter
    });
}

export const generateMockProject = (() => {
  let projectCounter = 0;
  return (): Project => {
    projectCounter += 1;
    return {
      id: faker.datatype.number() + projectCounter,
      name: `${faker.commerce.productName()} ${projectCounter}`,
      sub_type: {
        id: faker.datatype.number() + projectCounter,
        name: `${faker.commerce.productMaterial()} ${projectCounter}`,
        type: {} as ListType,
      },
      type: {
        id: faker.datatype.number() + projectCounter,
        name: `${faker.commerce.product()} ${projectCounter}`,
      },
      is_active: faker.datatype.boolean(),
      description: `${faker.lorem.paragraph()} ${projectCounter}`,
      region_id_env: faker.datatype.number() + projectCounter,
      region_id_flnro: faker.datatype.number() + projectCounter,
      proponent_id: faker.datatype.number() + projectCounter,
      proponent: {
        id: faker.datatype.number() + projectCounter,
        name: `${faker.company.name()} ${projectCounter}`,
        is_active: false,
      },
      ea_certificate: `${faker.system.fileName()} ${projectCounter}`,
      abbreviation: `${faker.lorem.word()} ${projectCounter}`,
      epic_guid: `${faker.datatype.uuid()} ${projectCounter}`,
      latitude: `${faker.address.latitude().toString()} ${projectCounter}`,
      longitude: `${faker.address.longitude().toString()} ${projectCounter}`,
      capital_investment: faker.datatype.number() + projectCounter,
      address: `${faker.address.streetAddress()} ${projectCounter}`,
      is_project_closed: faker.datatype.boolean(),
      region_env: {
        id: faker.datatype.number() + projectCounter,
        name: `${faker.address.state()} ${projectCounter}`,
        entity: "",
      },
      region_flnro: {
        id: faker.datatype.number() + projectCounter,
        name: `${faker.address.state()} ${projectCounter}`,
        entity: "",
      },
      fte_positions_construction: faker.datatype.number() + projectCounter,
      fte_positions_operation: faker.datatype.number() + projectCounter,
    };
  };
})();

export type CypressStubFunction =
  | Cypress.Agent<Sinon.SinonStub>
  | (() => void)
  | undefined;
