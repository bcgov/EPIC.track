import React from "react";
import SingleValue from "../SingleValueContainer";

const makeProps = (overrides: Partial<any> = {}) => ({
  getStyles: () => ({}),
  className: "single-value-class",
  children: "unused-children",
  innerProps: {},
  data: { label: "Alpha" },
  selectProps: {
    value: { label: "Alpha" },
    placeholder: "Type",
    filterProps: {
      variant: "default",
    },
  },
  ...overrides,
});

describe("FilterSelect SingleValueContainer", () => {
  it("shows 'Filtered' text for inline variant when value exists", () => {
    const element = SingleValue(
      makeProps({
        selectProps: {
          value: { label: "Alpha" },
          placeholder: "Type",
          filterProps: { variant: "inline" },
        },
      }) as any,
    ) as any;

    const content = element.props.children;
    const textNode = content.props.children;

    expect(textNode.props.children).to.equal("Filtered");
  });

  it("shows placeholder text for non-inline variant when value exists", () => {
    const element = SingleValue(
      makeProps({
        selectProps: {
          value: { label: "Alpha" },
          placeholder: "Event Type",
          filterProps: { variant: "default" },
        },
      }) as any,
    ) as any;

    const content = element.props.children;
    const textNode = content.props.children;

    expect(textNode.props.children).to.equal("Event Type");
  });

  it("falls back to placeholder text when value is missing", () => {
    const element = SingleValue(
      makeProps({
        selectProps: {
          value: null,
          placeholder: "Select an option",
          filterProps: { variant: "inline" },
        },
      }) as any,
    ) as any;

    const textNode = element.props.children;
    expect(textNode.props.children).to.equal("Select an option");
  });
});
