import React from "react";
import {
  LocalizationProvider,
  DatePicker,
  DatePickerSlotsComponentsProps,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DATE_FORMAT } from "../../../constants/application-constant";
import { DatePickerProps } from "@mui/lab";

type TrackDatePickerProps = DatePickerProps<any> & {
  placeholder?: string;
  slotProps?: DatePickerSlotsComponentsProps<unknown>;
};

const TrackDatePicker: React.FC<TrackDatePickerProps> = ({
  placeholder,
  slotProps,
  ...rest
}) => {
  const { textField: textFieldProps, ...restSlotProps } = slotProps || {};
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        views={["year", "month", "day"]}
        format={DATE_FORMAT}
        slotProps={{
          textField: {
            fullWidth: true,
            placeholder: placeholder ?? DATE_FORMAT,
            onKeyDown: (e) => {
              if (e.key !== "Tab") {
                e.preventDefault();
              }
            },
            onBlur: (e) => {
              if (rest.onBlur) {
                rest.onBlur(e);
              }
            },
            ...(textFieldProps ?? {}),
          },
          ...restSlotProps,
        }}
        sx={{ display: "block" }}
        {...rest}
      />
    </LocalizationProvider>
  );
};

export default TrackDatePicker;
