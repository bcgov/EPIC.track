import React from "react";
import { FormHelperText } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import Select, { CSSObjectWithLabel, Props, ThemeConfig } from "react-select";
import { Palette } from "../../../styles/theme";

type IFormInputProps = {
  placeholder?: string;
  name: string;
  options: Array<any>;
  defaultValue?: string | number | undefined | number[];
  isMulti?: boolean;
  getOptionLabel: (option: any) => string;
  getOptionValue: (option: any) => string;
  helperText?: string | undefined;
  disabled?: boolean;
  onHandleChange?: (val: any) => void;
  // menuPortalTarget: HTMLElement | undefined;
};

const ControlledSelectV2: React.ForwardRefRenderFunction<
  HTMLDivElement,
  IFormInputProps
> = (
  {
    placeholder,
    name,
    options,
    getOptionLabel,
    getOptionValue,
    isMulti,
    disabled,
    helperText,
    onHandleChange,
    // menuPortalTarget,
    ...otherProps
  },
  ref
) => {
  const {
    control,
    formState: { errors, defaultValues },
  } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValues?.[name] || ""}
      render={({ field }) => {
        const { onChange, value, ref } = field;
        return (
          <>
            <Select
              placeholder={placeholder}
              {...field}
              ref={ref}
              {...otherProps}
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
                if (onHandleChange !== undefined) onHandleChange(v);
                return onChange(v);
              }}
              menuPortalTarget={document.body}
              styles={{
                control: (baseStyles, state) => {
                  return {
                    ...baseStyles,
                    borderColor: !!errors[name]
                      ? "#d32f2f"
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
            ></Select>
            {helperText && (
              <FormHelperText
                error={true}
                className="MuiFormHelperText-sizeSmall"
                style={{ marginInline: "14px" }}
              >
                {String(errors[name]?.message || "")}
              </FormHelperText>
            )}
          </>
        );
      }}
    />
  );
};

export default React.forwardRef(ControlledSelectV2);
