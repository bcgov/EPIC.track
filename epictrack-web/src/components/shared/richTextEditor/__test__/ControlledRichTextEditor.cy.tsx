import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import ControlledRichTextEditor from "components/shared/controlledInputComponents/ControlledRichTextEditor";

const TestComponent: React.FC<{ error?: boolean }> = ({ error }) => {
  const methods = useForm();
  if (error)
    methods.setError("test", { type: "manual", message: "Error message" });

  return (
    <FormProvider {...methods}>
      <ControlledRichTextEditor name="test" />
    </FormProvider>
  );
};

describe("ControlledRichTextEditor", () => {
  it("renders correctly", () => {
    cy.mount(<TestComponent />);
    cy.get('[role="textbox"]').should("exist");
  });

  it("should type into the editor", () => {
    cy.mount(<TestComponent />);
    cy.get('[role="textbox"]').type("Test text");
    cy.get('[role="textbox"]').should("contain.text", "Test text");
  });

  it("should display helper text when error is true", () => {
    cy.mount(<TestComponent error />);

    cy.contains("Error message").should("be.visible");
  });
});
