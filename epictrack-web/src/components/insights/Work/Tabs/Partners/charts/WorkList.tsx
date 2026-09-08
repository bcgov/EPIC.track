import { FC, useMemo } from "react";
import { MRT_ColumnDef } from "material-react-table";
import { Work } from "models/work";
import { rowsPerPageOptions } from "components/shared/MasterTrackTable/utils";
import { TableFilter } from "components/shared/filterSelect/TableFilter";
import MasterTrackTable from "components/shared/MasterTrackTable";
import { serverSideFilter } from "components/shared/MasterTrackTable/filters";
import { exportToCsv } from "components/shared/MasterTrackTable/utils";
import { Tooltip, Box } from "@mui/material";
import { ETGridTitle, IButton } from "components/shared";
import Icons from "components/icons";
import { IconProps } from "components/icons/type";
import { useWorkListing } from "components/insights/Work/Tabs/useWorkListing";

const DownloadIcon: FC<IconProps> = Icons["DownloadIcon"];

const nationNames = (work: Work) =>
  work.indigenous_works
    ?.map((indigenous_work) => indigenous_work.name)
    .join(", ") || "";

const relStaffNames = (work: Work) =>
  work.rel_staff?.map((staff) => staff.full_name).join(", ") || "";

const toExportRow = (work: Work) => ({
  title: work.title,
  "ministry.name": work.ministry?.name ?? "",
  "federal_involvement.name": work.federal_involvement?.name ?? "",
  "indigenous_works.name": nationNames(work),
  rel_staff: relStaffNames(work),
  "work_type.name": work.work_type?.name ?? "",
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
  } = useWorkListing({
    isActive: true,
    includeIndigenousNations: true,
    includeRelStaff: true,
  });

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
        accessorKey: "ministry.name",
        filterFn: serverSideFilter,
        header: "Other Ministry",
        size: 200,
        filterVariant: "multi-select",
        filterSelectOptions: filterOptions.ministries,
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
        accessorKey: "federal_involvement.name",
        filterFn: serverSideFilter,
        header: "Federal Involvement",
        size: 100,
        filterVariant: "multi-select",
        filterSelectOptions: filterOptions.federal_involvements,
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
        accessorKey: "indigenous_works.name",
        filterFn: serverSideFilter,
        header: "First Nations",
        size: 200,
        enableSorting: false,
        filterVariant: "multi-select",
        filterSelectOptions: filterOptions.indigenous_nations,
        accessorFn: nationNames,
        Cell: ({ row }) => (
          <div style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}>
            {nationNames(row.original)}
          </div>
        ),
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
        accessorKey: "rel_staff",
        filterFn: serverSideFilter,
        header: "REL",
        size: 200,
        enableSorting: false,
        filterVariant: "multi-select",
        filterSelectOptions: filterOptions.rel_staff,
        accessorFn: relStaffNames,
        Cell: ({ row }) => (
          <div style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}>
            {relStaffNames(row.original)}
          </div>
        ),
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
        header: "Work Type",
        size: 150,
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
                  filenamePrefix: "partners-insights-listing",
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
