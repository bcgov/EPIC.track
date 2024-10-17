import React from "react";
import { CheckboxProps } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { CustomSwitch } from "../CustomSwitch";

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
    register,
  } = useFormContext();

  return (
    <Controller
      {...register(name)}
      control={control}
      name={name}
      defaultValue={defaultValues?.[name] || ""}
      render={({ field }) => (
        <CustomSwitch
          sx={{
            marginLeft: "10px",
            marginRight: "10px",
          }}
          {...otherProps}
          {...field}
          ref={ref}
          disabled={otherProps.disabled}
          checked={!!field.value || otherProps.defaultChecked}
        />
      )}
    />
  );
};

export default React.forwardRef(ControlledSwitch);
