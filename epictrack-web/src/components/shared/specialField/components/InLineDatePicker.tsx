import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {
  MRT_Cell,
  MRT_Column,
  MRT_Row,
  MRT_TableInstance,
} from "material-react-table";
import React from "react";
import { SpecialField } from "../type";

interface Props {
  cell: MRT_Cell<SpecialField>;
  column: MRT_Column<SpecialField>;
  row: MRT_Row<SpecialField>;
  table: MRT_TableInstance<SpecialField>;
  isCreating: boolean;
  name: string;
}

export const InLineDatePicker = ({
  cell,
  column,
  row,
  table,
  isCreating,
  name,
}: Props) => {
  const onBlur = (newValue: any) => {
    row._valuesCache[column.id] = newValue;
    if (isCreating) {
      table.setCreatingRow(row);
    } else {
      table.setEditingRow(row);
    }
  };

  const value = dayjs(row._valuesCache[column.id]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        value={value.isValid() ? value : null}
        onChange={onBlur}
        disableFuture
        slotProps={{
          textField: {
            id: name,
            name: name,
            placeholder: "Today",
            inputProps: {
              sx: {
                fontSize: "14px",
              },
            },
          },
        }}
      />
    </LocalizationProvider>
  );
};
