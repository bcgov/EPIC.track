import { ReactNode } from "react";
import { Box } from "@mui/material";
import {
  MRT_Column,
  MRT_Header,
  MRT_TableInstance,
} from "material-react-table";
import { TableFilter } from "./TableFilter";

export function getStatusFilter<T extends Object>(props: {
  column: MRT_Column<T, unknown>;
  header: MRT_Header<T>;
  table: MRT_TableInstance<T>;
  rangeFilterIndex?: number;
}): ReactNode {
  const { column, header } = props;

  return (
    <Box sx={{ width: "100px" }}>
      <TableFilter
        isMulti
        header={header}
        column={column}
        variant="inline"
        name="statusFilter"
      />
    </Box>
  );
}
