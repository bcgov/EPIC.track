import { CypressStubFunction } from "../../../../cypress/support/common";
import UserMenuTest from "../userMenu/UserMenuTest";
describe("UserMenu", () => {
  let onCloseHandler: CypressStubFunction;

  const props = {
    anchorEl: null,
    firstName: "John",
    lastName: "Doe",
    position: "Developer",
    email: "john.doe@example.com",
    phone: "123-456-7890",
    id: "user-menu",
  };

  beforeEach(() => {
    onCloseHandler = cy.stub();
    cy.mount(
      <>
        <UserMenuTest onClose={onCloseHandler} {...props} />
      </>
    );
  });

  it("renders the user name", () => {
    cy.get('[data-cy="user-name"]').should(
      "contain",
      `${props.firstName} ${props.lastName}`
    );
  });

  it("renders the user position", () => {
    cy.get('[data-cy="user-position"]').should("contain", props.position);
  });

  it("renders the user email", () => {
    cy.get('[data-cy="user-email"]').should("contain", props.email);
  });

  it("renders the user phone", () => {
    cy.get('[data-cy="user-phone"]').should("contain", props.phone);
  });

  it("opens the menu when the button is clicked", () => {
    cy.get('[data-cy="open-menu-button"]').click();
    cy.get('[data-cy="user-menu"]').should("be.visible");
  });
});
