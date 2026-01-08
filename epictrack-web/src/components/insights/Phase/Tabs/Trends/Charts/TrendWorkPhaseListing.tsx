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

const TrendWorkPhaseListing = () => {
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

  const eaActOptions = useMemo(
    () =>
      Array.from(
        new Set(
          workPhases
            .map((workPhase) => workPhase.ea_act_name || "")
            .filter((act) => act)
            .sort(),
        ),
      ),
    [workPhases],
  );

  const yearOptions = useMemo(() => {
    const years = workPhases
      .map((workPhase) => {
        const endDate = workPhase.work_phase_end_date;
        return endDate ? new Date(endDate).getFullYear() : undefined;
      })
      .filter((year): year is number => year !== undefined);

    return Array.from(new Set(years)).sort((a, b) => a - b);
  }, [workPhases]);

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
        accessorKey: "ea_act_name",
        header: "Act",
        filterVariant: "multi-select",
        filterSelectOptions: eaActOptions,
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
            filterValue.length > eaActOptions.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id) || "";

          return filterValue.includes(value);
        },
      },
      {
        accessorKey: "work_phase_end_date",
        header: "Year Closed",
        filterVariant: "multi-select",
        filterSelectOptions: yearOptions.map(String),
        Cell: ({ row }) => {
          const date = row.original.work_phase_end_date;
          return <span>{date ? new Date(date).getFullYear() : ""}</span>;
        },
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
            filterValue.length > yearOptions.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id) || "";
          const year = value ? new Date(value).getFullYear().toString() : "";

          return filterValue.includes(year);
        },
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
          return (
            <span>
              {row.original.legislated_length} day
              {row.original.legislated_length !== 1 ? "s" : ""}
            </span>
          );
        },
      },
      {
        id: "days_over",
        accessorKey: "days_over",
        header: viewUnderage ? "Underage" : "Overage",
        enableColumnFilter: false,
        Cell: ({ row }) => {
          return (
            <span>
              {row.original.days_over} day
              {row.original.days_over !== 1 ? "s" : ""}
            </span>
          );
        },
      },
    ],
    [phaseOptions, eaActOptions, yearOptions, workTypeOptions, viewUnderage],
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

export default TrendWorkPhaseListing;
