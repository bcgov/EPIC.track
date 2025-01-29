import React, { useEffect, useMemo, useState } from "react";
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_RowData,
  MRT_TableInstance,
  MRT_TableOptions,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Container, Tooltip, Typography } from "@mui/material";
import SearchIcon from "../../../assets/images/search.svg";
import { Palette } from "../../../styles/theme";
import { MET_Header_Font_Weight_Bold } from "../../../styles/constants";
import { ETHeading2, IButton } from "..";
import { FiltersCache } from "./FiltersCache";
import { exportToCsv } from "./utils";
import Icons from "components/icons";
import { IconProps } from "components/icons/type";

const DownloadIcon: React.FC<IconProps> = Icons["DownloadIcon"];

const NoDataComponent = ({ ...props }) => {
  const { table } = props;
  return (
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
  );
};

export interface MaterialReactTableProps<TData extends MRT_RowData>
  extends MRT_TableOptions<TData> {
  columns: MRT_ColumnDef<TData>[];
  data: TData[];
  enableExport?: boolean;
  onCacheFilters?: (columnFilters: any) => void;
  renderResultCount?: boolean;
  setTableInstance?: (instance: MRT_TableInstance<TData> | undefined) => void;
  tableName?: string;
}

const MasterTrackTable = <TData extends MRT_RowData>({
  columns,
  data,
  enableExport,
  onCacheFilters,
  renderResultCount,
  renderTopToolbarCustomActions,
  setTableInstance,
  tableName,
  ...rest
}: MaterialReactTableProps<TData>) => {
  const { initialState, state, icons, ...otherProps } = rest;
  const [otherPropsData, setOtherPropsData] = useState(otherProps);

  useEffect(() => {
    setOtherPropsData(otherProps);
  }, [columns, data]);

  const table = useMaterialReactTable({
    columns: columns,
    data: data,
    globalFilterFn: "contains",
    enableHiding: false,
    layoutMode: "grid",
    enableGlobalFilter: false,
    enableColumnResizing: true,
    enableStickyHeader: true,
    enableDensityToggle: false,
    enableColumnFilters: true,
    enableFullScreenToggle: false,
    enableSorting: true,
    enableFilters: true,
    enableColumnActions: false,
    enablePinning: true,
    enablePagination: false,
    positionActionsColumn: "last",
    muiTableHeadProps: {
      sx: {
        "& .MuiTableRow-root": {
          boxShadow: "none",
        },
      },
    },
    muiTableHeadCellProps: {
      sx: {
        backgroundColor: Palette.neutral.bg.light,
        padding: "1rem 0.5rem 0.5rem 1rem !important",
        "& .Mui-TableHeadCell-Content-Labels": {
          fontSize: "1rem",
          fontWeight: MET_Header_Font_Weight_Bold,
          color: Palette.neutral.dark,
          paddingBottom: "0.5rem",
        },
        "& .MuiTextField-root": {
          minWidth: "0",
        },
        "& .MuiCheckbox-root": {
          width: "2.75rem !important",
          height: "2rem",
          padding: "8px !important",
          borderRadius: "4px",
        },
      },
    },
    muiTableProps: {
      sx: {
        tableLayout: "fixed",
      },
    },
    muiTableBodyCellProps: ({ row }) => ({
      disabled: true,
      sx: {
        padding: "0.5rem 0.5rem 0.5rem 1rem",
        "& .MuiCheckbox-root": {
          width: "2.75rem !important",
          height: "2rem",
          borderRadius: "4px",
          padding: "8px !important",
          "&.Mui-disabled": {
            svg: {
              fill: Palette.neutral.light,
            },
          },
        },
      },
    }),
    muiFilterTextFieldProps: ({ column }) => ({
      placeholder: column.columnDef.header,
      variant: "outlined",
      sx: {
        backgroundColor: "white",
        "& .MuiInputBase-input::placeholder": {
          color: Palette.neutral.light,
          fontSize: "0.875rem",
          lineHeight: "1rem",
          opacity: 1,
        },
        "& .MuiInputAdornment-root": {
          display: "none",
        },
        "& .MuiSelect-icon": {
          mr: "0px !important",
        },
      },
    }),
    muiTableContainerProps: (table) => ({
      sx: {
        maxHeight: "100%",
      },
    }),
    muiTableBodyProps: {
      sx: {
        "& tr:hover td": {
          backgroundColor: Palette.primary.bg.light,
        },
      },
    },
    muiTableBodyRowProps: {
      hover: true,
      sx: {
        "&.Mui-selected": {
          backgroundColor: Palette.primary.bg.main,
        },
        "&.MuiTableRow-hover:hover": {
          backgroundColor: Palette.primary.bg.light,
        },
      },
    },
    sortingFns: {
      sortFn: (rowA: any, rowB: any, columnId: string) => {
        return rowA
          ?.getValue(columnId)
          ?.localeCompare(rowB?.getValue(columnId), "en", {
            numeric: true,
            ignorePunctuation: false,
            sensitivity: "base",
          });
      },
    },
    renderEmptyRowsFallback: ({ table }) => <NoDataComponent table={table} />,
    renderTopToolbarCustomActions: ({ table }) => {
      return (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            {renderResultCount && <Typography>Results: {rowCount}</Typography>}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {renderTopToolbarCustomActions &&
              renderTopToolbarCustomActions({ table })}
            {enableExport && (
              <Tooltip title="Export to csv">
                <IButton
                  onClick={() =>
                    exportToCsv({
                      table,
                      downloadDate: new Date().toISOString(),
                      filenamePrefix: tableName || "exported-data",
                    })
                  }
                >
                  <DownloadIcon className="icon" />
                </IButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      );
    }, // Provide an empty function as the initializer
    initialState: {
      showColumnFilters: true,
      density: "compact",
      columnPinning: { right: ["mrt-row-actions"] },
      ...initialState,
    },
    state: {
      showGlobalFilter: true,
      columnPinning: { right: ["mrt-row-actions"] },
      ...state,
    },
    icons: {
      FilterAltIcon: () => null,
      CloseIcon: () => null,
      ...icons,
    },
    filterFns: {
      multiSelectFilter: (row, id, filterValue) => {
        if (filterValue.length === 0) return true;
        return filterValue.includes(row.getValue(id));
      },
    },
    ...otherPropsData,
  });

  const rowCount = useMemo(
    () => table.getRowModel().rows.length,
    [table.getRowModel().rows]
  );

  useEffect(() => {
    if (table && setTableInstance) {
      setTableInstance(table);
    }
  }, [setTableInstance, table]);

  return (
    <>
      <MaterialReactTable table={table} />
      {onCacheFilters && (
        <FiltersCache onCacheFilters={onCacheFilters} table={table} />
      )}
    </>
  );
};

export default MasterTrackTable;
