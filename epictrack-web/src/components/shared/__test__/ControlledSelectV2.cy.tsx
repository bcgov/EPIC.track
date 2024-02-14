import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import ControlledSelectV2 from "../controlledInputComponents/ControlledSelectV2";

interface TestComponentProps {
  onChange?: (value: any) => void;
}

const options = [
  { label: "Option 1", value: "option1" },
  { label: "Option 2", value: "option2" },
];

const TestComponent: React.FC<TestComponentProps> = ({ onChange }) => {
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <ControlledSelectV2
        name="test"
        options={options}
        getOptionLabel={(option: { label: any }) => option.label}
        getOptionValue={(option: { value: any }) => option.value}
        onHandleChange={onChange}
      />
    </FormProvider>
  );
};

describe("ControlledSelectV2", () => {
  it("renders correctly", () => {
    cy.mount(<TestComponent />);
    cy.get("input").first().should("exist");
  });

  it("handles selection correctly", () => {
    const handleChange = cy.stub();
    cy.mount(<TestComponent onChange={handleChange} />);
    cy.get("input").first().click().type("Option 1{enter}");
    cy.wrap(handleChange).should("have.been.calledWith", "option1");
  });
});
