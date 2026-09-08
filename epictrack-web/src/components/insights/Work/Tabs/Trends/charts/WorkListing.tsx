import React, { useMemo } from "react";
import { MRT_ColumnDef } from "material-react-table";
import { Work } from "models/work";
import { rowsPerPageOptions } from "components/shared/MasterTrackTable/utils";
import { TableFilter } from "components/shared/filterSelect/TableFilter";
import MasterTrackTable from "components/shared/MasterTrackTable";
import { serverSideFilter } from "components/shared/MasterTrackTable/filters";
import { exportToCsv } from "components/shared/MasterTrackTable/utils";
import { Tooltip, Box, Grid } from "@mui/material";
import { ETCaption1, ETGridTitle, IButton } from "components/shared";
import Icons from "components/icons";
import { IconProps } from "components/icons/type";
import { dateUtils } from "utils";
import { MONTH_DAY_YEAR } from "constants/application-constant";
import WorkState from "components/workPlan/WorkState";
import { getStatusFilter } from "components/shared/filterSelect/utils";
import { ETChip } from "components/shared/chip/ETChip";
import { useWorkListing } from "components/insights/Work/Tabs/useWorkListing";

const DownloadIcon: React.FC<IconProps> = Icons["DownloadIcon"];

const statuses = [
  { text: "Active", value: true },
  { text: "Inactive", value: false },
];

const toExportRow = (work: Work) => ({
  title: work.title,
  "project.name": work.project?.name ?? "",
  "work_type.name": work.work_type?.name ?? "",
  start_date: work.start_date,
  work_decision_date: work.work_decision_date ?? "",
  work_state: work.work_state,
  is_active: work.is_active,
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
  } = useWorkListing({ isActive: false });

  const columns = React.useMemo<MRT_ColumnDef<Work>[]>(
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
        accessorKey: "start_date",
        filterFn: serverSideFilter,
        header: "Started",
        Cell: ({ renderedCellValue }) => {
          return dateUtils.formatDate(
            renderedCellValue?.toString() || "",
            MONTH_DAY_YEAR,
          );
        },
        filterVariant: "multi-select",
        filterSelectOptions: filterOptions.started_years,
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
        accessorKey: "work_decision_date",
        filterFn: serverSideFilter,
        header: "Closed",
        Cell: ({ renderedCellValue }) => {
          return renderedCellValue
            ? dateUtils.formatDate(
                renderedCellValue?.toString() || "",
                MONTH_DAY_YEAR,
              )
            : "";
        },
        filterVariant: "multi-select",
        filterSelectOptions: filterOptions.closed_years,
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
        accessorKey: "work_state",
        filterFn: serverSideFilter,
        header: "Work state",
        filterVariant: "multi-select",
        filterSelectOptions: filterOptions.work_states,
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
        Cell: ({ row }) => {
          return (
            <Grid container item>
              <ETCaption1 bold>
                <WorkState work_state={row.getValue("work_state")} />
              </ETCaption1>
            </Grid>
          );
        },
      },
      {
        accessorKey: "is_active",
        filterFn: serverSideFilter,
        header: "Status",
        size: 75,
        filterVariant: "multi-select",
        filterSelectOptions: statuses,
        Filter: getStatusFilter<Work>,
        Cell: ({ cell }) => (
          <span>
            {cell.getValue<boolean>() && <ETChip active label="Active" />}
            {!cell.getValue<boolean>() && <ETChip inactive label="Inactive" />}
          </span>
        ),
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
