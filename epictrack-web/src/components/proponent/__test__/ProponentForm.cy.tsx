import ProponentForm from "../ProponentForm";
import { Staff } from "models/staff";
import { AppConfig } from "config";
import { Endpoint, setupIntercepts } from "../../../../cypress/support/utils";

const staffs: Staff[] = [
  {
    id: 1,
    full_name: "John Doe",
    first_name: "", // Add the missing property
    last_name: "", // Add the missing property
    phone: "",
    email: "",
    idir_user_id: "",
    is_active: false,
    position_id: 2 /* add more missing properties here */,
    position: { name: "test", id: 1, sort_order: 0 }, // Add the missing property
  },
  {
    id: 2,
    full_name: "John Doe",
    first_name: "", // Add the missing property
    last_name: "", // Add the missing property
    phone: "",
    email: "",
    idir_user_id: "",
    is_active: false,
    position_id: 2 /* add more missing properties here */,
    position: { name: "test", id: 1, sort_order: 1 }, // Add the missing property
  },
  // Add more mock Staff objects as needed
];

const endpoints: Endpoint[] = [
  {
    name: "getActiveStaffsOptions",
    method: "OPTIONS",
    url: `${AppConfig.apiUrl}staffs?is_active=false`,
  },
  {
    name: "getPIPTypeOptions",
    method: "OPTIONS",
    url: `${AppConfig.apiUrl}codes/pip_org_types`,
  },

  {
    name: "getFirstNationsOptions",
    method: "OPTIONS",
    url: `${AppConfig.apiUrl}first_nations`,
  },
  {
    name: "getActiveStaffs",
    method: "GET",
    url: `${AppConfig.apiUrl}staffs?is_active=false`,
    response: { body: staffs },
  },
  {
    name: "getPIPType",
    method: "GET",
    url: `${AppConfig.apiUrl}pip-org-types`,
    response: { body: [] },
  },
  {
    name: "getFirstNations",
    method: "GET",
    url: `${AppConfig.apiUrl}first_nations`,
    response: { body: [] },
  },
];

describe("ProponentForm", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
    cy.mount(
      <ProponentForm
        proponent={null}
        saveProponent={cy.stub()}
        setDisableDialogSave={cy.stub()}
      />,
    );
  });

  it("renders the form", () => {
    cy.get("form").should("be.visible");
  });

  it("renders the name field", () => {
    cy.get('input[name="name"]');
  });

  it("renders the relationship holder field", () => {
    cy.get('input[name="relationship_holder_id"]');
  });
});
