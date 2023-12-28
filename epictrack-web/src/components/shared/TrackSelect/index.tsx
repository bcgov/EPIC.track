import React from "react";
import Select, { CSSObjectWithLabel } from "react-select";
import { FormHelperText } from "@mui/material";
import { Palette } from "../../../styles/theme";
import { OptionType } from "../filterSelect/type";

type SelectProps = {
  options: OptionType[];
  getOptionLabel: (option: any) => string;
  getOptionValue: (option: any) => string;
  isMulti?: boolean;
  disabled?: boolean;
  value: any;
  onChange: (val: any) => void;
  error?: boolean;
  helperText?: string;
};

const TrackSelect: React.FC<SelectProps> = ({
  options,
  getOptionLabel,
  getOptionValue,
  isMulti,
  disabled,
  value,
  onChange,
  error = false,
  helperText = "",
  ...rest
}) => {
  return (
    <>
      <Select
        options={options}
        menuPosition="fixed"
        getOptionValue={getOptionValue}
        getOptionLabel={getOptionLabel}
        isSearchable={true}
        isDisabled={!!disabled}
        isClearable={true}
        value={options.filter((c) => {
          if (isMulti && value) {
            return (value as any[])
              .map((p) => p.toString())
              .includes(getOptionValue(c));
          }
          return getOptionValue(c) === value?.toString();
        })}
        isMulti={isMulti}
        onChange={(val: any) => {
          let v;
          if (isMulti) v = val.map((v: any) => getOptionValue(v));
          else v = getOptionValue(val);
          onChange(v);
        }}
        menuPortalTarget={document.body}
        styles={{
          control: (baseStyles, state) => {
            return {
              ...baseStyles,
              borderColor: error
                ? "#d32f2f"
                : state.isFocused
                ? Palette.primary.accent.light
                : Palette.neutral.accent.light,
              borderWidth: "2px",
              fontSize: "16px",
              lineHeight: "24px",
              backgroundColor: !!disabled
                ? Palette.neutral.bg.dark
                : Palette.white,
              fontWeight: "400",
              "&:hover": {
                borderColor: Palette.primary.accent.light,
              },
            };
          },
          menuPortal: (base: CSSObjectWithLabel) => ({
            ...base,
            zIndex: 99999,
            fontSize: "1rem",
          }),
        }}
        {...rest}
      />
      {error && (
        <FormHelperText
          error
          className="MuiFormHelperText-sizeSmall"
          style={{ marginInline: "14px" }}
        >
          {helperText}
        </FormHelperText>
      )}
    </>
  );
};

export default TrackSelect;
