import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { DATE_FORMAT } from "../../../constants/application-constant";

type ControlledDatePickerProps = {
  name: string;
  defaultValue?: any;
  datePickerProps?: {
    placeholder?: string;
    referenceDate?: dayjs.Dayjs;
    minDate?: dayjs.Dayjs | undefined;
    maxDate?: dayjs.Dayjs | undefined;
    disabled?: boolean;
    onDateChange?: (
      value: dayjs.Dayjs | null,
      defaultOnChangeFunc: (value: dayjs.Dayjs | null) => void
    ) => void;
    // Add any other DatePicker-specific props you want to pass
  };
  datePickerSlotProps?: {
    inputRef?: React.Ref<any>;
  };
};

const ControlledDatePicker: React.FC<ControlledDatePickerProps> = ({
  name,
  datePickerProps,
  datePickerSlotProps,
  defaultValue,
}) => {
  const { control, register } = useFormContext();
  return (
    <Controller
      name={name}
      defaultValue={defaultValue}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            views={["year", "month", "day"]}
            format={DATE_FORMAT}
            slotProps={{
              textField: {
                id: name,
                fullWidth: true,
                error: !!error,
                helperText: error?.message || "",
                placeholder: datePickerProps?.placeholder || DATE_FORMAT,
                ...datePickerSlotProps,
              },
              ...register(name),
            }}
            value={value ? dayjs(value) : value}
            onChange={(event: Dayjs | null) => {
              if (datePickerProps?.onDateChange) {
                datePickerProps.onDateChange(event, onChange);
              } else {
                onChange(event?.format() || "");
              }
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
