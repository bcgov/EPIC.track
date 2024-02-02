import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { ControlledMaskTextField } from "../maskTextField";

interface TestComponentProps {
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const TestComponent: React.FC<TestComponentProps> = ({ onChange }) => {
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <ControlledMaskTextField
        name="test"
        mask="####-####"
        onChange={onChange}
      />
    </FormProvider>
  );
};

describe("ControlledMaskTextField", () => {
  it("renders correctly", () => {
    cy.mount(<TestComponent />);
    cy.get("input").should("exist");
  });

  it("handles input correctly", () => {
    const handleChange = cy.stub();
    cy.mount(<TestComponent onChange={handleChange} />);
    cy.get("input").type("12341234");
    cy.wrap(handleChange).should("have.been.calledWithMatch", {
      target: { name: "test", value: "1234-1234" },
    });
  });
});
