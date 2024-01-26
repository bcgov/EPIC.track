import NoDataEver from "../NoDataEver";

describe("NoDataEver", () => {
  let defaultProps: any;
  let onAddNewClickHandler;
  let onImportClickHandler;

  beforeEach(() => {
    onAddNewClickHandler = cy.stub();
    onImportClickHandler = cy.stub();

    defaultProps = {
      title: "No Data",
      subTitle: "No data available",
      addNewButtonText: "Add New",
      onAddNewClickHandler,
      isImportRequired: true,
      importButtonText: "Import",
      onImportClickHandler,
    };
    cy.mount(<NoDataEver {...defaultProps} />);
  });

  it("should display title and subtitle", () => {
    cy.contains(defaultProps.title).should("be.visible");
    cy.contains(defaultProps.subTitle).should("be.visible");
  });

  it("should call onAddNewClickHandler when add new button is clicked", () => {
    cy.contains(defaultProps.addNewButtonText).click();
    cy.wrap(defaultProps.onAddNewClickHandler).should("have.been.calledOnce");
  });

  it("should display import button when isImportRequired is true", () => {
    cy.contains(defaultProps.importButtonText).should("be.visible");
  });

  it("should call onImportClickHandler when import button is clicked", () => {
    cy.contains(defaultProps.importButtonText).click();
    cy.wrap(defaultProps.onImportClickHandler).should("have.been.calledOnce");
  });

  it("should disable import button when isImportDisabled is true", () => {
    cy.mount(<NoDataEver {...defaultProps} isImportDisabled={true} />);
    cy.contains(defaultProps.importButtonText).should("be.disabled");
  });
});
