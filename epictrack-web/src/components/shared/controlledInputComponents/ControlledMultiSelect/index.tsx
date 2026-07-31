import React from "react";
import { FormHelperText } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import Select, { CSSObjectWithLabel } from "react-select";
import { Palette } from "../../../../styles/theme";
import * as tokens from "../../../../styles/designTokens";
import Option from "./Option";

type IFormInputProps = {
  placeholder?: string;
  name: string;
  options: Array<any>;
  defaultValue?: string[] | undefined;
  isMulti?: boolean;
  getOptionLabel: (option: any) => string;
  getOptionValue: (option: any) => string;
  helperText?: string | undefined;
  disabled?: boolean;
  onHandleChange?: (val: any) => void;
  closeMenuOnSelect?: boolean;
  hideSelectedOptions?: boolean;
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
    closeMenuOnSelect,
    hideSelectedOptions,
    defaultValue,
    ...otherProps
  },
  ref,
) => {
  const [selectedOptions, setSelectedOptions] = React.useState<any>([]);

  React.useEffect(() => {
    setSelectedOptions(Array.from(new Set<string>(defaultValue)));
  }, [defaultValue]);

  const handleChange = (item: any) => {
    const selected: Array<any> = [];
    item.forEach((o: any) => {
      const val = getOptionValue(o);
      selected.push(val);
    });
    setSelectedOptions(Array.from(new Set<string>(selected)));
  };

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
              isClearable={false}
              hideSelectedOptions={!!hideSelectedOptions}
              closeMenuOnSelect={!!closeMenuOnSelect}
              filterProps={{
                selectedOptions,
                options,
                getOptionLabel,
                getOptionValue,
              }}
              components={{
                Option,
                MultiValueRemove: () => null,
              }}
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
                handleChange(val);
                return onChange(v);
              }}
              menuPortalTarget={document.body}
              styles={{
                control: (baseStyles, state) => {
                  return {
                    ...baseStyles,
                    borderColor: !!errors[name]
                      ? tokens.supportBorderColorDanger
                      : state.isFocused
                        ? tokens.surfaceColorBorderActive
                        : tokens.surfaceColorBorderDefault,
                    borderWidth: "2px",
                    fontSize: tokens.typographyFontSizeBody,
                    lineHeight: tokens.typographyLineHeightBody,
                    backgroundColor: !!disabled
                      ? tokens.surfaceColorFormsDisabled
                      : Palette.white,
                    fontWeight: tokens.typographyFontWeightsRegular,
                    "&:hover": {
                      borderColor: !!errors[name]
                        ? tokens.supportBorderColorDanger
                        : tokens.surfaceColorBorderMedium,
                    },
                  };
                },
                placeholder: (base: CSSObjectWithLabel) => ({
                  ...base,
                  color: tokens.typographyColorPlaceholder,
                }),
                menuPortal: (base: CSSObjectWithLabel) => ({
                  ...base,
                  zIndex: 99999,
                  fontSize: tokens.typographyFontSizeBody,
                }),
                multiValue(base) {
                  return {
                    ...base,
                    padding: "0px 4px 0px 2px",
                  };
                },
              }}
            ></Select>
            {(!!errors[name] || helperText) && (
              <FormHelperText
                error={!!errors[name]}
                className="MuiFormHelperText-sizeSmall"
                style={{ marginInline: "14px" }}
              >
                {errors[name]
                  ? String(errors[name]?.message || "")
                  : helperText}
              </FormHelperText>
            )}
          </>
        );
      }}
    />
  );
};

export default React.forwardRef(ControlledSelectV2);
