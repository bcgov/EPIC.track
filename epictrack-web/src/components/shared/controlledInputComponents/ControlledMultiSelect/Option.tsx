import React from "react";
import { Box, Checkbox } from "@mui/material";
import { components, OptionProps } from "react-select";

const Option = ({
  getStyles,
  isDisabled,
  isFocused,
  children,
  innerProps,
  isMulti,
  ...rest
}: OptionProps) => {
  const [isSelected, setIsSelected] = React.useState(false);
  const { filterProps } = rest.selectProps;

  React.useEffect(() => {
    if (filterProps?.selectedOptions && filterProps.getOptionValue) {
      const val = filterProps.getOptionValue(rest.data);
      setIsSelected(filterProps?.selectedOptions.indexOf(val) > -1);
    }
  }, [filterProps?.selectedOptions]);

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
