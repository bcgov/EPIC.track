import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import ControlledRadioGroup from "../controlledInputComponents/ControlledRadioGroup";

const TestComponent: React.FC = () => {
  const methods = useForm();
  const options = [
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" },
  ];
  return (
    <FormProvider {...methods}>
      <ControlledRadioGroup name="test" options={options} />
    </FormProvider>
  );
};

describe("ControlledRadioGroup", () => {
  it("renders correctly", () => {
    cy.mount(<TestComponent />);
    cy.get('input[type="radio"]').should("have.length", 2);
  });

  it("should select the radio option", () => {
    cy.mount(<TestComponent />);
    const radioInput = cy.get('input[type="radio"]').first();
    radioInput.should("not.be.checked");
    radioInput.check();
    radioInput.should("be.checked");
  });
});
