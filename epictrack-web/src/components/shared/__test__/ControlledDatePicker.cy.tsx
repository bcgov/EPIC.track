import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import ControlledDatePicker from "../controlledInputComponents/ControlledDatePicker";

const TestComponent: React.FC = () => {
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <ControlledDatePicker name="test" />
    </FormProvider>
  );
};

describe("ControlledDatePicker", () => {
  it("renders correctly", () => {
    cy.mount(<TestComponent />);
    cy.get('input[type="text"]').should("exist");
  });

  it("should set the date", () => {
    cy.mount(<TestComponent />);
    cy.get('input[type="text"]').first().as("dateInput");
    cy.get('[aria-label="Choose date"]').click();
    cy.get('[aria-current="date"]').click();
    cy.get("@dateInput").invoke("val").should("not.equal", "");
  });
});
