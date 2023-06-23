import React from "react";
import { FormHelperText } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import Select, { Props } from "react-select";

type IFormInputProps = {
  name: string;
  options: Array<any>;
  defaultValue: string | number | undefined;
  isMulti?: boolean;
  getOptionLabel: (option: any) => string;
  getOptionValue: (option: any) => string;
  helperText?: string | undefined;
  // menuPortalTarget: HTMLElement | undefined;
};

const ControlledSelectV2: React.ForwardRefRenderFunction<
  HTMLDivElement,
  IFormInputProps
> = (
  {
    name,
    options,
    getOptionLabel,
    getOptionValue,
    isMulti,
    helperText,
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
              {...field}
              ref={ref}
              {...otherProps}
              options={options}
              getOptionValue={getOptionValue}
              getOptionLabel={getOptionLabel}
              isSearchable={true}
              isClearable={true}
              value={options.find(
                (c) => getOptionValue(c) === value?.toString()
              )}
              isMulti={isMulti}
              onChange={(val: any) => {
                let v;
                if (isMulti)
                  v = val.map((v: any) => getOptionValue(v)).join(",");
                else v = getOptionValue(val);
                return onChange(v);
              }}
              menuPortalTarget={document.body}
              styles={{
                control: (baseStyles, state) => {
                  return {
                    ...baseStyles,
                    borderColor: !!errors[name] ? "#d32f2f" : undefined,
                  };
                },
                menuPortal: (base: any) => ({
                  ...base,
                  zIndex: 99999,
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
