import React, { FC } from "react";
import { Checkbox, CheckboxProps } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

type IFormCheckboxProps = {
  name: string;
} & CheckboxProps;

const ControlledCheckbox: React.ForwardRefRenderFunction<
  HTMLButtonElement,
  IFormCheckboxProps
> = ({ name, ...otherProps }, ref) => {
  const {
    control,
    formState: { defaultValues },
  } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValues?.[name] || ""}
      render={({ field }) => (
        <Checkbox
          {...otherProps}
          {...field}
          ref={ref}
          checked={!!field.value}
        />
      )}
    />
  );
};

export default React.forwardRef(ControlledCheckbox);
