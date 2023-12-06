import React, { FC } from "react";
import { TextField, TextFieldProps } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

type IFormInputProps = {
  name: string;
  inputEffects?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => string;
} & TextFieldProps;

const ControlledTextField: FC<IFormInputProps> = ({
  name,
  inputEffects,
  ...otherProps
}) => {
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
          onChange={(e) => {
            if (inputEffects) {
              e.target.value = inputEffects(e);
            }
            field.onChange(e.target.value);
          }}
          error={!!errors[name]}
          helperText={String(errors[name]?.message || "")}
        />
      )}
    />
  );
};

export default ControlledTextField;
