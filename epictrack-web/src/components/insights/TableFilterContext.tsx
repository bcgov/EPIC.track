import { ColumnFilter } from "components/shared/MasterTrackTable/type";
import React, { createContext, useContext, useState } from "react";

type TableFilterContextType = {
  columnFilters: ColumnFilter[];
  setColumnFilters: any;
};

const TableFilterContext = createContext<TableFilterContextType | undefined>(
  undefined,
);

export const TableFilterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([]);

  return (
    <TableFilterContext.Provider value={{ columnFilters, setColumnFilters }}>
      {children}
    </TableFilterContext.Provider>
  );
};

export const useTableFilterContext = () => {
  const context = useContext(TableFilterContext);
  if (!context) {
    throw new Error("useTableFilter must be used within a TableFilterProvider");
  }
  return context;
};
