import React from "react";
import { CheckboxProps, Switch } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

type IFormSwitchProps = {
  name: string;
} & CheckboxProps;

const ControlledSwitch: React.ForwardRefRenderFunction<
  HTMLButtonElement,
  IFormSwitchProps
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
        <Switch {...otherProps} {...field} ref={ref} checked={!!field.value} />
      )}
    />
  );
};

export default React.forwardRef(ControlledSwitch);
