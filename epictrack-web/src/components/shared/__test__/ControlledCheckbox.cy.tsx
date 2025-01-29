import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import ControlledCheckbox from "../controlledInputComponents/ControlledCheckbox";

interface TestComponentProps {
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const TestComponent: React.FC<TestComponentProps> = ({ onChange }) => {
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <ControlledCheckbox name="test" onChange={onChange} />
    </FormProvider>
  );
};

describe("ControlledCheckbox", () => {
  it("renders correctly", () => {
    cy.mount(<TestComponent />);
    cy.get('input[type="checkbox"]').should("exist");
  });

  it("should check and uncheck the checkbox", () => {
    cy.mount(<TestComponent />);
    const checkbox = cy.get('input[type="checkbox"]');

    checkbox.should("not.be.checked");
    checkbox.check();
    checkbox.should("be.checked");
    checkbox.uncheck();
    checkbox.should("not.be.checked");
  });

  it("should set default value", () => {
    cy.mount(<TestComponent />);
    const checkbox = cy.get('input[type="checkbox"]');
    checkbox.click();
    checkbox.should("be.checked");
  });
});
