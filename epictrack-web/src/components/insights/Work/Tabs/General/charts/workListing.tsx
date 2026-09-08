import { FC, useMemo } from "react";
import { MRT_ColumnDef } from "material-react-table";
import { Tooltip, Box } from "@mui/material";
import { Work } from "models/work";
import { rowsPerPageOptions } from "components/shared/MasterTrackTable/utils";
import { TableFilter } from "components/shared/filterSelect/TableFilter";
import MasterTrackTable from "components/shared/MasterTrackTable";
import { serverSideFilter } from "components/shared/MasterTrackTable/filters";
import { exportToCsv } from "components/shared/MasterTrackTable/utils";
import { ETGridTitle, IButton } from "components/shared";
import Icons from "components/icons";
import { IconProps } from "components/icons/type";
import { useWorkListing } from "components/insights/Work/Tabs/useWorkListing";

const DownloadIcon: FC<IconProps> = Icons["DownloadIcon"];

const toExportRow = (work: Work) => ({
  title: work.title,
  "project.name": work.project?.name ?? "",
  "work_type.name": work.work_type?.name ?? "",
  "current_work_phase.name": work.current_work_phase?.name ?? "",
});

const WorkList = () => {
  const {
    works,
    total,
    filterOptions,
    isLoading,
    isFetching,
    pagination,
    setPagination,
    sorting,
    setSorting,
    columnFilters,
    onColumnFiltersChange,
    buildExportRows,
  } = useWorkListing({ isActive: true });

  const columns = useMemo<MRT_ColumnDef<Work>[]>(
    () => [
      {
        accessorKey: "title",
        filterFn: serverSideFilter,
        header: "Name",
        size: 300,
        Cell: ({ row, renderedCellValue }) => (
          <ETGridTitle
            to={`/work-plan?work_id=${row.original.id}`}
            enableTooltip
            tooltip={row.original.title}
          >
            {renderedCellValue}
          </ETGridTitle>
        ),
      },
      {
        accessorKey: "project.name",
        filterFn: serverSideFilter,
        header: "Project",
        size: 200,
        filterVariant: "multi-select",
        filterSelectOptions: filterOptions.projects,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="rolesFilter"
            />
          );
        },
      },
      {
        accessorKey: "work_type.name",
        filterFn: serverSideFilter,
        header: "Work type",
        filterVariant: "multi-select",
        filterSelectOptions: filterOptions.work_types,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="rolesFilter"
            />
          );
        },
      },
      {
        accessorKey: "current_work_phase.name",
        filterFn: serverSideFilter,
        header: "Current Phase",
        filterVariant: "multi-select",
        filterSelectOptions: filterOptions.phases,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="rolesFilter"
            />
          );
        },
      },
    ],
    [filterOptions],
  );

  return (
    <MasterTrackTable
      columns={columns}
      data={works}
      loading={isLoading}
      manualPagination
      manualFiltering
      manualSorting
      rowCount={total}
      onColumnFiltersChange={onColumnFiltersChange}
      onSortingChange={setSorting}
      state={{
        isLoading: isLoading,
        showGlobalFilter: true,
        showProgressBars: isFetching,
        pagination: pagination,
        columnFilters,
        sorting,
      }}
      renderResultCount
      renderTopToolbarCustomActions={({ table }) => (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "right",
          }}
        >
          <Tooltip title="Export to csv">
            <IButton
              onClick={async () =>
                exportToCsv({
                  table,
                  downloadDate: new Date().toISOString(),
                  filenamePrefix: "general-insights-listing",
                  rows: await buildExportRows(toExportRow),
                })
              }
            >
              <DownloadIcon className="icon" />
            </IButton>
          </Tooltip>
        </Box>
      )}
      enablePagination
      muiPaginationProps={{
        rowsPerPageOptions: rowsPerPageOptions(total),
      }}
      onPaginationChange={setPagination}
    />
  );
};

export default WorkList;
