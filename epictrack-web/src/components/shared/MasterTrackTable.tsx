import React from "react";
import MaterialReactTable, {
  MRT_ToggleFiltersButton,
  MaterialReactTableProps,
} from "material-react-table";

const MasterTrackTable = <T extends Record<string, any>>({
  columns,
  data,
  ...rest
}: MaterialReactTableProps<T>) => {
  return (
    <>
      <MaterialReactTable
        columns={columns}
        data={data}
        globalFilterFn="contains"
        enableHiding={false}
        enableStickyHeader={true}
        enableDensityToggle={false}
        enableColumnFilters={true}
        enableFullScreenToggle={false}
        enableSorting={true}
        enablePinning
        enablePagination={false}
        positionActionsColumn={"last"}
        muiTableContainerProps={(table) => ({
          sx: {
            maxHeight: "100%",
          },
        })}
        sortingFns={{
          sortFn: (rowA: any, rowB: any, columnId: string) => {
            return rowA
              ?.getValue(columnId)
              ?.localeCompare(rowB?.getValue(columnId), "en", {
                numeric: true,
                ignorePunctuation: false,
                sensitivity: "base",
              });
          },
        }}
        positionGlobalFilter="left"
        muiSearchTextFieldProps={{
          placeholder: "Search",
          sx: { minWidth: "300px" },
          variant: "outlined",
        }}
        renderToolbarInternalActions={({ table }) => (
          <>
            <MRT_ToggleFiltersButton table={table} />
          </>
        )}
        {...rest}
        initialState={{
          density: "compact",
          columnPinning: { right: ["mrt-row-actions"] },
          ...rest.initialState,
        }}
        state={{
          showGlobalFilter: true,
          columnPinning: { right: ["mrt-row-actions"] },
          ...rest.state,
        }}
      />
    </>
  );
};

export default MasterTrackTable;
