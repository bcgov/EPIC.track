import { GroupBase } from "react-select/dist/declarations/src/types";
import { Props } from "react-select";

export interface OptionType {
  readonly value: string | number;
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
      applyFilters?: () => void;
      clearFilters?: () => void;
      selectedOptions: any[];
      options?: any[];
      onCancel?: () => void;
      variant?: "inline" | "bar" | "inline-standalone";
      getOptionLabel?: (option: any) => string;
      getOptionValue?: (option: any) => string;
      label?: string;
      maxWidth?: string;
    };
    filterAppliedCallback?: (value?: string[] | string) => void;
    filterClearedCallback?: (value?: [] | "") => void;
  }
}

export type SelectProps = {
  variant: "inline" | "bar" | "inline-standalone";
  info?: boolean;
  maxWidth?: string;
} & Props<OptionType>;

export type TableFilterProps = {
  header: any;
  column: any;
} & SelectProps;
