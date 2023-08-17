import { GroupBase } from "react-select/dist/declarations/src/types";
import { Props } from "react-select";

export interface OptionType {
  readonly value: string;
  readonly label: string;
}

declare module "react-select/dist/declarations/src/Select" {
  export interface Props<
    Option,
    IsMulti extends boolean,
    Group extends GroupBase<Option> = GroupBase<Option>
  > {
    // Marking as optional here to not raise errors for ControlledSelect
    // Make sure to add for FilterSelect
    filterProps?: {
      applyFilters: () => void;
      clearFilters: () => void;
      selectedOptions: any[];
      onCancel: () => void;
      variant: "inline" | "bar";
    };
  }
}

export type SelectProps = {
  header: any;
  column: any;
  variant: "inline" | "bar";
} & Props<OptionType>;
