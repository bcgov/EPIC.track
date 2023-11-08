import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

type ControlledDatePickerProps = {
  name: string;
  datePickerProps?: {
    placeholder?: string;
    // Add any other DatePicker-specific props you want to pass
  };
};

const ControlledDatePicker: React.FC<ControlledDatePickerProps> = ({
  name,
  datePickerProps,
}) => {
  const { control, register } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            slotProps={{
              textField: {
                id: name,
                fullWidth: true,
                error: !!error,
                helperText: error?.message || "",
                placeholder: datePickerProps?.placeholder || "MM-DD-YYYY",
                ...register(name),
              },
            }}
            value={dayjs(value)}
            onChange={(event: Dayjs | null) => {
              onChange(event?.format() || "");
            }}
            {...datePickerProps}
            sx={{ display: "block" }}
          />
        </LocalizationProvider>
      )}
    />
  );
};

export default ControlledDatePicker;
