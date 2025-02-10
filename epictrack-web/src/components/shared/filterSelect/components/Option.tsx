import React from "react";
import { components, OptionProps } from "react-select";
import Checkbox from "@mui/material/Checkbox";
import { OptionType } from "../type";
import { Box, Radio } from "@mui/material";

const Option = ({
  getStyles,
  isDisabled,
  isFocused,
  children,
  innerProps,
  isMulti,
  ...rest
}: OptionProps) => {
  const data = React.useMemo(() => rest.data as OptionType, [rest.data]);
  const { filterProps } = rest.selectProps;

  const [isSelected, setIsSelected] = React.useState(false);

  React.useEffect(() => {
    if (filterProps?.selectedOptions) {
      setIsSelected(filterProps?.selectedOptions.indexOf(data.value) > -1);
    }
  }, [filterProps?.selectedOptions]);

  return (
    <Box title={data.label}>
      <components.Option
        {...rest}
        isMulti={isMulti}
        isDisabled={isDisabled}
        isFocused={isFocused}
        isSelected={isSelected}
        getStyles={getStyles}
        innerProps={innerProps}
      >
        {isMulti && (
          <Checkbox
            name={`${rest.label}`}
            checked={isSelected}
            // indeterminate={
            //   data.value === "<SELECT_ALL>" &&
            //   !isSelected &&
            //   filterProps?.selectedOptions &&
            //   filterProps?.selectedOptions?.length > 0
            // }
          />
        )}
        {!isMulti && (
          <Radio
            name={rest.selectProps.name}
            value={data.value}
            checked={isSelected}
            onClick={(event: any) => {
              rest.setValue(
                event.target.checked ? event.target.value : "",
                "select-option"
              );
            }}
            sx={{ color: "inherit !important" }}
          />
        )}
        {children}
      </components.Option>
    </Box>
  );
};

export default Option;
