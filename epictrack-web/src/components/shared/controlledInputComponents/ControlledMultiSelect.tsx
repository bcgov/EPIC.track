import React from "react";
import { Box, FormHelperText } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import Select, { CSSObjectWithLabel } from "react-select";
import { Palette } from "../../../styles/theme";
import Option from "./Option";
import MultiValue from "./MultiValue";

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
    closeMenuOnSelect,
    hideSelectedOptions,
    defaultValue,
    ...otherProps
  },
  ref
) => {
  const [selectedOptions, setSelectedOptions] = React.useState<any>([]);
  const [label, setLabel] = React.useState("");

  const handleChange = (item: any) => {
    const selected: Array<any> = [];
    item.map((o: any) => {
      const val = getOptionValue(o);
      selected.push(val);
    });
    setSelectedOptions(Array.from(new Set<string>(selected)));
  };

  React.useEffect(() => {
    setSelectedOptions(Array.from(new Set<string>(defaultValue)));
  }, [defaultValue]);

  React.useEffect(() => {
    let title = "";
    options.map((o) => {
      if (selectedOptions.includes(getOptionValue(o))) {
        if (title) {
          title += ", ";
        }
        title += getOptionLabel(o);
      }
    });
    title = title.substring(0, 30);
    console.log(title.length);
    setLabel(title);
  }, [selectedOptions]);

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
                label,
              }}
              components={{
                Option,
                MultiValueRemove: () => null,
                MultiValue,
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
                option: (baseStyles, state) => {
                  return {
                    ...baseStyles,
                    backgroundColor: Palette.white,
                    color: Palette.primary.accent.light,
                  };
                },
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
                multiValue(base, props) {
                  return {
                    backgroundColor: Palette.white,
                  };
                },
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
