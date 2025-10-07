import { FC, useEffect, useMemo, useState } from "react";
import { MRT_ColumnDef } from "material-react-table";
import { Tooltip, Box } from "@mui/material";
import { Work, WorkPhase, WorkPhaseAdditionalInfo } from "models/work";
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
  const { workPhases, loadingWorkPhases } = usePhaseInsightsContext();

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
            .map((workPhase) => workPhase.work?.work_type?.name || "")
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
            .map((workPhase) => workPhase.work_phase.name || "")
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
            .map((workPhase) => workPhase.work?.ea_act?.name || "")
            .filter((act) => act)
            .sort(),
        ),
      ),
    [workPhases],
  );

  const yearOptions = useMemo(() => {
    const years = workPhases
      .map((workPhase) => {
        const decisionDate = workPhase.work?.decision_date;
        return decisionDate ? new Date(decisionDate).getFullYear() : undefined;
      })
      .filter((year): year is number => year !== undefined);

    return Array.from(new Set(years)).sort((a, b) => a - b);
  }, [workPhases]);

  const columns = useMemo<
    MRT_ColumnDef<{ work: Work } & WorkPhase & WorkPhaseAdditionalInfo>[]
  >(
    () => [
      {
        accessorKey: "work.title",
        header: "Name",
        size: 300,
        Cell: ({ row, renderedCellValue }) => (
          <ETGridTitle
            to={`/work-plan?work_id=${
              row.original.work?.id ?? row.original.id
            }`}
            enableTooltip
            tooltip={row.original.work?.title ?? ""}
          >
            {renderedCellValue}
          </ETGridTitle>
        ),
        sortingFn: "sortFn",
        filterFn: searchFilter,
      },
      {
        accessorKey: "work.ea_act.name",
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
        accessorKey: "work.decision_date",
        header: "Year Closed",
        filterVariant: "multi-select",
        filterSelectOptions: yearOptions.map(String),
        Cell: ({ row }) => {
          const date = row.original.work?.decision_date;
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
        accessorKey: "work.work_type.name",
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
        accessorKey: "work_phase.name",
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
        header: "Length",
        enableColumnFilter: false,
        Cell: ({ row }) => {
          return (
            <span>
              {row.original.days_taken}/{row.original.total_number_of_days} days
            </span>
          );
        },
      },
      {
        header: "Overage",
        enableColumnFilter: false,
        Cell: ({ row }) => {
          const overage =
            row.original.days_left < 0 ? Math.abs(row.original.days_left) : 0;
          return (
            <span>
              {overage} day{overage !== 1 ? "s" : ""}
            </span>
          );
        },
      },
    ],
    [phaseOptions, eaActOptions, yearOptions, workTypeOptions],
  );
  return (
    <MasterTrackTable
      columns={columns}
      data={workPhases}
      initialState={{
        sorting: [
          {
            id: "work.title",
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
