import { FC, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import ControlledRichTextEditor from "components/shared/controlledInputComponents/ControlledRichTextEditor";

type TestComponentProps = {
  error?: boolean;
  defaultValues?: {
    test?: string;
  };
};

const TestComponent: FC<TestComponentProps> = ({ error, defaultValues }) => {
  const methods = useForm({ defaultValues });
  const currentValue = methods.watch("test") ?? "";

  // Ensure error is set after first render
  useEffect(() => {
    if (error) {
      methods.setError("test", { type: "manual", message: "Error message" });
    }
  }, [error, methods]);

  return (
    <FormProvider {...methods}>
      <ControlledRichTextEditor name="test" data-testid="rich-text-editor" />
      <p data-testid="current-value">{currentValue}</p>
    </FormProvider>
  );
};

const createRawEditorState = (text: string) =>
  JSON.stringify({
    blocks: [
      {
        key: "test1",
        text,
        type: "unstyled",
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data: {},
      },
    ],
    entityMap: {},
  });

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
    cy.get('[data-testid="current-value"]').should("contain.text", "Test text");
  });

  it("displays an error message when an error is set", () => {
    cy.mount(<TestComponent error />);
    cy.contains("Error message").should("be.visible");
  });

  it("uses form default values as the initial editor state", () => {
    const initialValue = createRawEditorState("Initial editor value");

    cy.mount(<TestComponent defaultValues={{ test: initialValue }} />);

    cy.get('[role="textbox"]').should("contain.text", "Initial editor value");
    cy.get('[data-testid="current-value"]').should(
      "contain.text",
      "Initial editor value",
    );
  });
});
