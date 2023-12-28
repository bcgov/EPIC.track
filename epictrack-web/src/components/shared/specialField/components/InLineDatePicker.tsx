import React from "react";
import dayjs from "dayjs";
import {
  MRT_Cell,
  MRT_Column,
  MRT_Row,
  MRT_TableInstance,
} from "material-react-table";
import { SpecialField } from "../type";
import TrackDatePicker from "../../DatePicker";

interface Props {
  column: MRT_Column<SpecialField>;
  row: MRT_Row<SpecialField>;
  table: MRT_TableInstance<SpecialField>;
  isCreating: boolean;
  name: string;
  error?: boolean;
}

export const InLineDatePicker = ({
  column,
  row,
  table,
  isCreating,
  name,
  error = false,
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
    <TrackDatePicker
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
          error: error,
        },
      }}
    />
  );
};
