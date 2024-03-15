import React, { useEffect } from "react";
import { MRT_TableInstance, MRT_RowData } from "material-react-table";

export const FiltersCache = <TData extends MRT_RowData>({
  cacheFilters,
  table,
}: {
  cacheFilters: (columnFilters: any) => void;
  table: MRT_TableInstance<TData>;
}) => {
  useEffect(() => {
    cacheFilters(table.getState().columnFilters);
  }, [table.getState().columnFilters]);
  return null;
};
