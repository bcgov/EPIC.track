import { faker } from "@faker-js/faker";
import { Provider } from "react-redux";
import { ROLES } from "constants/application-constant";
import { UserDetail } from "services/userService/type";
import { userDetails } from "services/userService/userSlice";
import { store } from "store";
import { AboutContext } from "../../AboutContext";
import WorkResourceForm from "../WorkResourceForm";

const mountForm = (onSave: Cypress.Agent<sinon.SinonStub>) =>
  cy.mount(
    <Provider store={store}>
      <AboutContext.Provider
        value={{
          workResources: [],
          setShowDeleteDialog: () => {},
          setShowEditDialog: () => {},
          setShowCreateDialog: () => {},
          setSelectedWorkResource: () => {},
          selectedWorkResource: null,
          onSave,
          getWorkResources: () => {},
        }}
      >
        <WorkResourceForm />
        <button type="submit" form="work-resource-form">
          Save
        </button>
      </AboutContext.Provider>
    </Provider>,
  );

describe("WorkResourceForm", () => {
  beforeEach(() => {
    store.dispatch(
      userDetails(
        new UserDetail(
          faker.word.words(1),
          faker.string.uuid(),
          [faker.word.words(1)],
          faker.person.firstName(),
          faker.person.lastName(),
          `${faker.string.alphanumeric(5)}@example.com`,
          faker.number.int(),
          faker.phone.number(),
          faker.person.jobTitle(),
          [ROLES.EDIT],
        ),
      ),
    );
  });

  it("rejects links that are not http(s)", () => {
    const onSave = cy.stub().as("onSave");
    mountForm(onSave);

    cy.get("input[name='title']").type("Resource");
    cy.get("input[name='link']").type("javascript:alert(1)");
    cy.contains("button", "Save").click();

    cy.contains("Enter a full web address starting with http:// or https://");
    cy.get("@onSave").should("not.have.been.called");
  });

  it("saves http(s) links", () => {
    const onSave = cy.stub().as("onSave");
    mountForm(onSave);

    cy.get("input[name='title']").type("Resource");
    cy.get("input[name='link']").type("https://www.bclaws.gov.bc.ca/doc");
    cy.contains("button", "Save").click();

    cy.get("@onSave").should("have.been.calledOnce");
  });
});
