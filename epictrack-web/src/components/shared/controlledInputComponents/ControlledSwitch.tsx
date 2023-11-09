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
  } = useFormContext();

  console.log(name);

  return (
    <Controller
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
          checked={!!field.value || otherProps.defaultChecked}
        />
      )}
    />
  );
};

export default React.forwardRef(ControlledSwitch);
