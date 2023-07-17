import React from "react";
import MaterialReactTable, {
  MRT_ToggleFiltersButton,
  MaterialReactTableProps,
} from "material-react-table";
import { Box, Container, Typography } from "@mui/material";
import SearchIcon from "../../assets/images/search.svg";
import { ETHeading2 } from ".";

const NoDataComponent = ({ ...props }) => {
  const { table } = props;
  return (
    <>
      <Container
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            alignItems: "center",
          }}
        >
          <Box component="img" src={SearchIcon} alt="Search" width="32px" />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            <ETHeading2 bold>No results found</ETHeading2>
            {table.options.data.length > 0 && (
              <Typography color="#6D7274">
                Adjust your parameters and try again
              </Typography>
            )}
          </Box>
        </Box>
      </Container>
    </>
  );
};
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
        renderEmptyRowsFallback={({ table }) => (
          <NoDataComponent table={table} />
        )}
      />
    </>
  );
};

export default MasterTrackTable;
