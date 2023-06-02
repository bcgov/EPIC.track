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
        enableHiding={false}
        enableStickyHeader={true}
        enableDensityToggle={false}
        enableColumnFilters={true}
        enableFullScreenToggle={false}
        enablePinning
        enablePagination={false}
        positionActionsColumn={"last"}
        initialState={{
          density: "compact",
          columnPinning: { right: ["mrt-row-actions"] },
        }}
        sortingFns={{
          sortFn: (rowA: any, rowB: any, columnId: string) => {
            return rowA
              .getValue(columnId)
              .value.localeCompare(rowB.getValue(columnId).value, "en", {
                numeric: true,
                ignorePunctuation: true,
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
        state={{
          showGlobalFilter: true,
          columnPinning: { right: ["mrt-row-actions"] },
          ...rest.state,
        }}
        renderToolbarInternalActions={({ table }) => (
          <>
            <MRT_ToggleFiltersButton table={table} />
          </>
        )}
        {...rest}
      />
    </>
  );
};

export default MasterTrackTable;
