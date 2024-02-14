import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import ControlledSelect from "../controlledInputComponents/ControlledSelect";
import { MenuItem } from "@mui/material";

interface TestComponentProps {
  onChange?: (
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => void;
}

const TestComponent: React.FC<TestComponentProps> = ({ onChange }) => {
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <ControlledSelect name="test" onChange={onChange}>
        <MenuItem value="option1">Option 1</MenuItem>
        <MenuItem value="option2">Option 2</MenuItem>
      </ControlledSelect>
    </FormProvider>
  );
};

describe("ControlledSelect", () => {
  it("renders correctly", () => {
    cy.mount(<TestComponent />);
    cy.get(".MuiSelect-select").should("exist");
  });

  it("handles selection correctly", () => {
    const handleChange = cy.stub();
    cy.mount(<TestComponent onChange={handleChange} />);
    cy.get(".MuiSelect-select").click();
    cy.get('li[data-value="option1"]').click();
    cy.wrap(handleChange).should("have.been.calledWithMatch", {
      target: { name: "test", value: "option1" },
    });
  });
});
