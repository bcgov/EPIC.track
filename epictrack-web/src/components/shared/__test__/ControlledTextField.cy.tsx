import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import ControlledTextField from "../controlledInputComponents/ControlledTextField";

interface TestComponentProps {
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const TestComponent: React.FC<TestComponentProps> = ({ onChange }) => {
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <ControlledTextField name="test" onChange={onChange} />
    </FormProvider>
  );
};

describe("ControlledTextField", () => {
  it("renders correctly", () => {
    cy.mount(<TestComponent />);
    cy.get("input").should("exist");
  });

  it("handles input correctly", () => {
    const handleChange = cy.stub();
    cy.mount(<TestComponent onChange={handleChange} />);
    cy.get("input").type("test input");
    cy.wrap(handleChange).should("have.been.calledWithMatch", {
      target: { name: "test", value: "test input" },
    });
  });
});
