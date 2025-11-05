import { Box, Checkbox } from "@mui/material";
import { components, OptionProps } from "react-select";

interface CustomSelectProps {
  filterProps?: {
    selectedOptions: string[];
    getOptionValue: (data: any) => string;
  };
}

const Option = ({
  getStyles,
  isDisabled,
  isFocused,
  children,
  innerProps,
  isMulti,
  ...rest
}: OptionProps & { selectProps: CustomSelectProps }) => {
  const { filterProps } = rest.selectProps;

  let isSelected = false;
  if (filterProps?.selectedOptions && filterProps.getOptionValue) {
    const val = filterProps.getOptionValue(rest.data);
    isSelected = filterProps.selectedOptions.includes(val);
  }

  return (
    <Box>
      <components.Option
        {...rest}
        isMulti={isMulti}
        isDisabled={isDisabled}
        isFocused={isFocused}
        isSelected={isSelected}
        getStyles={getStyles}
        innerProps={innerProps}
      >
        <Checkbox checked={isSelected} />
        {children}
      </components.Option>
    </Box>
  );
};

export default Option;
