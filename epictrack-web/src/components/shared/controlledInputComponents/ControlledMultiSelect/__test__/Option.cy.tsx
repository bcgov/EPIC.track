import React from "react";
import Option from "../Option";

const makeProps = (overrides: Partial<any> = {}) => ({
  getStyles: () => ({}),
  isDisabled: false,
  isFocused: false,
  children: "Option Label",
  innerProps: {},
  isMulti: true,
  data: { id: "north", label: "North" },
  selectProps: {
    filterProps: {
      selectedOptions: ["north"],
      getOptionValue: (data: any) => data.id,
    },
  },
  ...overrides,
});

describe("ControlledMultiSelect Option", () => {
  it("marks checkbox as selected when option id is selected", () => {
    const element = Option(makeProps() as any) as any;
    const optionChild = element.props.children;
    const checkbox = optionChild.props.children[0];

    expect(optionChild.props.isSelected).to.equal(true);
    expect(checkbox.props.checked).to.equal(true);
  });

  it("marks checkbox as unselected when option id is not selected", () => {
    const element = Option(
      makeProps({
        selectProps: {
          filterProps: {
            selectedOptions: ["south"],
            getOptionValue: (data: any) => data.id,
          },
        },
      }) as any,
    ) as any;
    const optionChild = element.props.children;
    const checkbox = optionChild.props.children[0];

    expect(optionChild.props.isSelected).to.equal(false);
    expect(checkbox.props.checked).to.equal(false);
  });

  it("defaults to unselected when filter props are missing", () => {
    const element = Option(
      makeProps({
        selectProps: {},
      }) as any,
    ) as any;
    const optionChild = element.props.children;

    expect(optionChild.props.isSelected).to.equal(false);
  });
});
