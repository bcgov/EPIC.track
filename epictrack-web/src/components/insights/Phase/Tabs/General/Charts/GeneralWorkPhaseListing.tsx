import { FC, useEffect, useMemo, useState } from "react";
import { MRT_ColumnDef } from "material-react-table";
import { Tooltip, Box } from "@mui/material";
import { WorkPhaseInsight } from "models/work";
import { searchFilter } from "components/shared/MasterTrackTable/filters";
import { rowsPerPageOptions } from "components/shared/MasterTrackTable/utils";
import { TableFilter } from "components/shared/filterSelect/TableFilter";
import MasterTrackTable from "components/shared/MasterTrackTable";
import { exportToCsv } from "components/shared/MasterTrackTable/utils";
import { ETGridTitle, IButton } from "components/shared";
import Icons from "components/icons";
import { IconProps } from "components/icons/type";
import { useTableFilterContext } from "components/insights/TableFilterContext";
import { usePhaseInsightsContext } from "components/insights/Phase/PhaseInsightsContext";

const DownloadIcon: FC<IconProps> = Icons["DownloadIcon"];

const GeneralWorkPhaseListing = () => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 15,
  });
  const { columnFilters, setColumnFilters } = useTableFilterContext();
  const { workPhases, loadingWorkPhases, viewUnderage } =
    usePhaseInsightsContext();

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageSize: workPhases.length,
    }));
  }, [workPhases]);

  const workTypeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          workPhases
            .map((workPhase) => workPhase.work_type_name || "")
            .filter((type) => type)
            .sort(),
        ),
      ),
    [workPhases],
  );

  const phaseOptions = useMemo(
    () =>
      Array.from(
        new Set(
          workPhases
            .map((workPhase) => workPhase.phase_name || "")
            .filter((phase) => phase)
            .sort(),
        ),
      ),
    [workPhases],
  );

  const responsibilityOptions = useMemo(
    () =>
      Array.from(
        new Set(
          workPhases
            .flatMap((wp) => wp.phase_overage_responsibilities ?? [])
            .filter((r) => r)
            .sort(),
        ),
      ),
    [workPhases],
  );

  const columns = useMemo<MRT_ColumnDef<WorkPhaseInsight>[]>(
    () => [
      {
        accessorKey: "work_title",
        header: "Name",
        size: 300,
        Cell: ({ row, renderedCellValue }) => (
          <ETGridTitle
            to={`/work-plan?work_id=${row.original.work_id}`}
            enableTooltip
            tooltip={row.original.work_title ?? ""}
          >
            {renderedCellValue}
          </ETGridTitle>
        ),
        sortingFn: "sortFn",
        filterFn: searchFilter,
      },
      {
        accessorKey: "work_type_name",
        header: "Work type",
        filterVariant: "multi-select",
        filterSelectOptions: workTypeOptions,
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
        filterFn: (row, id, filterValue) => {
          if (
            !filterValue.length ||
            filterValue.length > workTypeOptions.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id) || "";

          return filterValue.includes(value);
        },
      },
      {
        accessorKey: "phase_name",
        header: "Phase",
        filterVariant: "multi-select",
        filterSelectOptions: phaseOptions,
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
        filterFn: (row, id, filterValue) => {
          if (
            !filterValue.length ||
            filterValue.length > phaseOptions.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id) || "";

          return filterValue.includes(value);
        },
      },
      {
        header: "Legislated Length",
        enableColumnFilter: false,
        Cell: ({ row }) => {
          return <span>{row.original.legislated_length} days</span>;
        },
      },
      {
        header: "Days Taken",
        enableColumnFilter: false,
        Cell: ({ row }) => {
          return (
            <span>
              {row.original.days_taken} day
              {row.original.days_taken !== 1 ? "s" : ""}
            </span>
          );
        },
      },
      {
        id: "days_over",
        accessorKey: "days_over", // <-- add this line
        header: viewUnderage ? "Underage" : "Overage",
        enableColumnFilter: false,
      },
      {
        accessorKey: "overage_responsibility",
        header: "Responsibility",
        filterVariant: "multi-select",
        filterSelectOptions: responsibilityOptions as string[],
        Cell: ({ row }) => {
          return (
            <span>
              {row.original.phase_overage_responsibilities.join(", ")}
            </span>
          );
        },
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="responsibilityFilter"
            />
          );
        },
        filterFn: (row, id, filterValue) => {
          const containsAll = filterValue.every((value: any) =>
            row.original.phase_overage_responsibilities.includes(value),
          );

          return containsAll;
        },
      },
    ],
    [phaseOptions, responsibilityOptions, workTypeOptions, viewUnderage],
  );
  return (
    <MasterTrackTable
      columns={columns}
      data={workPhases}
      initialState={{
        sorting: [
          {
            id: "work_title",
            desc: false,
          },
        ],
      }}
      loading={loadingWorkPhases}
      onColumnFiltersChange={setColumnFilters}
      state={{
        isLoading: loadingWorkPhases,
        showGlobalFilter: true,
        pagination: pagination,
        columnFilters,
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
              onClick={() =>
                exportToCsv({
                  table,
                  downloadDate: new Date().toISOString(),
                  filenamePrefix: "general-insights-listing",
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
        rowsPerPageOptions: rowsPerPageOptions(workPhases.length),
      }}
      onPaginationChange={setPagination}
    />
  );
};

export default GeneralWorkPhaseListing;
