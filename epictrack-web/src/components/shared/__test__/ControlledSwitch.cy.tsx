import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import ControlledSwitch from "../controlledInputComponents/ControlledSwitch";

const TestComponent: React.FC = () => {
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <ControlledSwitch name="test" />
    </FormProvider>
  );
};

describe("ControlledSwitch", () => {
  it("renders correctly", () => {
    cy.mount(<TestComponent />);
    cy.get('input[type="checkbox"]').should("exist");
  });

  it("should check and uncheck the switch", () => {
    cy.mount(<TestComponent />);
    const switchInput = cy.get('input[type="checkbox"]');

    switchInput.should("not.be.checked");
    switchInput.check();
    switchInput.should("be.checked");
    switchInput.uncheck();
    switchInput.should("not.be.checked");
  });
});
