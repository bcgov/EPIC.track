import React, { FC } from "react";
import { TextField, TextFieldProps } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

type IFormInputProps = {
  name: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputEffects?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => string;
  maxLength?: number;
} & TextFieldProps;

const ControlledTextField: FC<IFormInputProps> = ({
  name,
  inputEffects,
  maxLength,
  onChange: onInputChange,
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
          inputProps={{
            maxLength: maxLength,
          }}
          onChange={(e) => {
            if (onInputChange) {
              onInputChange(e);
            }
            if (inputEffects) {
              e.target.value = inputEffects(e);
            }
            field.onChange(e.target.value);
          }}
          {...otherProps}
          // After `otherProps`, so a caller-supplied `error`/`helperText` can no
          // longer silently hide a validation message. A caller's helperText is
          // still shown while the field is valid.
          error={!!errors[name] || otherProps.error}
          helperText={
            errors[name]
              ? String(errors[name]?.message ?? "")
              : otherProps.helperText
          }
        />
      )}
    />
  );
};

export default ControlledTextField;
