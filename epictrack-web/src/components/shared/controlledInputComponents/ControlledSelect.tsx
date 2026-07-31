import React from "react";
import { TextField, TextFieldProps } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

type IFormInputProps = {
  name: string;
} & TextFieldProps;

const ControlledSelect: React.ForwardRefRenderFunction<
  HTMLDivElement,
  IFormInputProps
> = ({ name, children, ...otherProps }, ref) => {
  const {
    control,
    formState: { errors, defaultValues },
  } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValues?.[name] || ""}
      render={({ field }) => (
        <TextField
          select
          {...field}
          ref={ref}
          {...otherProps}
          error={!!errors[name] || otherProps.error}
          helperText={
            errors[name]
              ? String(errors[name]?.message || "")
              : otherProps.helperText
          }
        >
          {children}
        </TextField>
      )}
    />
  );
};

export default React.forwardRef(ControlledSelect);
