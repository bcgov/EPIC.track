import RichTextEditor from "../index";

describe("RichTextEditor Component Tests", () => {
  it("should render the component", () => {
    cy.mount(<RichTextEditor />);
  });

  it("should call handleEditorStateChange and setRawText when the editor state changes", () => {
    const handleEditorStateChange = cy.stub();
    const setRawText = cy.stub();
    cy.mount(
      <RichTextEditor
        handleEditorStateChange={handleEditorStateChange}
        setRawText={setRawText}
      />
    );
    cy.get('[role="textbox"]').type("Test text");

    cy.wrap(setRawText).should("have.been.calledWith", "Test text");
  });

  it("should display helper text when error is true", () => {
    cy.mount(<RichTextEditor error={true} helperText={"Error message"} />);
    cy.contains("Error message").should("be.visible");
  });
});
