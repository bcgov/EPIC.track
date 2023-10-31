import React from "react";
import { FormHelperText } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import Select, { CSSObjectWithLabel } from "react-select";
import { Palette } from "../../../../styles/theme";
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

  React.useEffect(() => {
    setSelectedOptions(Array.from(new Set<string>(defaultValue)));
  }, [defaultValue]);

  const handleChange = (item: any) => {
    const selected: Array<any> = [];
    item.map((o: any) => {
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
                    ...base,
                    padding: "0px 4px 0px 2px",
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
