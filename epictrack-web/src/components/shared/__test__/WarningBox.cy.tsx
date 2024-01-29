import WarningBox from "../warningBox";
import { CypressStubFunction } from "../../../../cypress/support/common";

describe("WarningBox", () => {
  let onCloseHandler: CypressStubFunction;

  beforeEach(() => {
    onCloseHandler = cy.stub();
    cy.mount(
      <WarningBox
        title="Test Title"
        isTitleBold={true}
        subTitle="Test Subtitle"
        onCloseHandler={onCloseHandler}
      />
    );
  });

  it("renders the title and subtitle", () => {
    cy.get('[data-cy="warning-box-title"]').should("contain", "Test Title");
    cy.get('[data-cy="warning-box-subtitle"]').should(
      "contain",
      "Test Subtitle"
    );
  });

  it("calls the onCloseHandler when the close button is clicked", () => {
    cy.get("button").click();
    cy.wrap(onCloseHandler).should("be.calledOnce");
  });
});
