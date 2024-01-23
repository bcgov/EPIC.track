import { Staff } from "models/staff";

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
