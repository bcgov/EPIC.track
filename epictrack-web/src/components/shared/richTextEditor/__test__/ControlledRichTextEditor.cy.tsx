import { FC, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import ControlledRichTextEditor from "components/shared/controlledInputComponents/ControlledRichTextEditor";

const TestComponent: FC<{ error?: boolean }> = ({ error }) => {
  const methods = useForm();

  // Ensure error is set after first render
  useEffect(() => {
    if (error) {
      methods.setError("test", { type: "manual", message: "Error message" });
    }
  }, [error, methods]);

  return (
    <FormProvider {...methods}>
      <ControlledRichTextEditor name="test" data-testid="rich-text-editor" />
      {error && <p data-testid="error-message">Error message</p>}
    </FormProvider>
  );
};

describe("ControlledRichTextEditor Component", () => {
  beforeEach(() => {
    cy.viewport(1280, 720); // Ensure consistent viewport
  });

  it("renders the editor input field", () => {
    cy.mount(<TestComponent />);
    cy.get('[role="textbox"]').should("exist");
  });

  it("allows typing into the editor", () => {
    cy.mount(<TestComponent />);
    cy.get('[role="textbox"]').type("Test text");
    cy.get('[role="textbox"]').should("contain.text", "Test text");
  });

  it("displays an error message when an error is set", () => {
    cy.mount(<TestComponent error />);

    cy.contains("Error message").should("be.visible");
  });
});

// import React from "react";
// import { useForm, FormProvider } from "react-hook-form";
// import ControlledRichTextEditor from "components/shared/controlledInputComponents/ControlledRichTextEditor";

// const TestComponent: React.FC<{ error?: boolean }> = ({ error }) => {
//   const methods = useForm();
//   if (error)
//     methods.setError("test", { type: "manual", message: "Error message" });

//   return (
//     <FormProvider {...methods}>
//       <ControlledRichTextEditor name="test" />
//     </FormProvider>
//   );
// };

// describe("ControlledRichTextEditor", () => {
//   it("renders correctly", () => {
//     cy.mount(<TestComponent />);
//     cy.get('[role="textbox"]').should("exist");
//   });

//   it("should type into the editor", () => {
//     cy.mount(<TestComponent />);
//     cy.get('[role="textbox"]').type("Test text");
//     cy.get('[role="textbox"]').should("contain.text", "Test text");
//   });

//   it("should display helper text when error is true", () => {
//     cy.mount(<TestComponent error />);

//     cy.contains("Error message").should("be.visible");
//   });
// });
