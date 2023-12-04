import React, { FC } from "react";
import { TextField, TextFieldProps } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

type IFormInputProps = {
  name: string;
} & TextFieldProps;

const ControlledTextField: FC<IFormInputProps> = ({ name, ...otherProps }) => {
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
          {...field}
          {...otherProps}
          error={!!errors[name]}
          helperText={String(errors[name]?.message || "")}
        />
      )}
    />
  );
};

export default ControlledTextField;
