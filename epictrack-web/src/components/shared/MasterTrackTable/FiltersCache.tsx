import { useEffect, useRef } from "react";
import { MRT_TableInstance, MRT_RowData } from "material-react-table";
import isEqual from "lodash/isEqual";

export const FiltersCache = <TData extends MRT_RowData>({
  onCacheFilters,
  table,
}: {
  onCacheFilters: (columnFilters: any) => void;
  table: MRT_TableInstance<TData>;
}) => {
  const prevFilters = useRef(table.getState().columnFilters);

  useEffect(() => {
    const currentFilters = table.getState().columnFilters;

    if (!isEqual(prevFilters.current, currentFilters)) {
      prevFilters.current = currentFilters;
      onCacheFilters(currentFilters);
    }
  }, [table.getState().columnFilters]);

  return null;
};
