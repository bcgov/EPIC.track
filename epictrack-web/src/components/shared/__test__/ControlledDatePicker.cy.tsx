import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import ControlledDatePicker from "../controlledInputComponents/ControlledDatePicker";
import dayjs from "dayjs";

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

  it("should set and clear the date", () => {
    cy.mount(<TestComponent />);
    cy.get("button").should("be.visible");

    // Click the date picker to open it
    cy.get("button").click();

    // Find the 'MuiDayCalendar-monthContainer' div and click the first button inside it
    cy.get(".MuiDayCalendar-monthContainer").find("button").first().click();

    // Check if the input field has any text
    cy.get("input").should("not.have.value", "");
  });
});
