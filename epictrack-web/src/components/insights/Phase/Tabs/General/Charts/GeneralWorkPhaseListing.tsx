import { FC, useEffect, useMemo, useState } from "react";
import { MRT_ColumnDef } from "material-react-table";
import { Tooltip, Box } from "@mui/material";
import { showNotification } from "components/shared/notificationProvider";
import { Work, WorkPhase, WorkPhaseAdditionalInfo } from "models/work";
import { searchFilter } from "components/shared/MasterTrackTable/filters";
import { rowsPerPageOptions } from "components/shared/MasterTrackTable/utils";
import { TableFilter } from "components/shared/filterSelect/TableFilter";
import MasterTrackTable from "components/shared/MasterTrackTable";
import { exportToCsv } from "components/shared/MasterTrackTable/utils";
import { ETGridTitle, IButton } from "components/shared";
import Icons from "components/icons";
import { IconProps } from "components/icons/type";
import { useGetWorkPhasesQuery } from "services/rtkQuery/phaseInsights";
import { useTableFilterContext } from "components/insights/TableFilterContext";

const DownloadIcon: FC<IconProps> = Icons["DownloadIcon"];

const GeneralWorkPhaseListing = () => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 15,
  });
  const { columnFilters, setColumnFilters } = useTableFilterContext();

  const { data, error, isLoading } = useGetWorkPhasesQuery({
    legislated: true,
  });

  const workPhases = useMemo(() => data || [], [data]);

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

  const responsibilityOptions = useMemo(
    () =>
      Array.from(
        new Set(
          workPhases
            .flatMap((wp) => wp.overage_responsibility)
            .map((r) => r?.responsibility)
            .filter((r) => r)
            .sort(),
        ),
      ).sort(),
    [workPhases],
  );

  useEffect(() => {
    if (error) {
      showNotification("Error fetching Works", {
        duration: 3000,
        type: "error",
      });
    }
  }, [error]);

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
      {
        accessorKey: "overage_responsibility",
        header: "Responsibility",
        filterVariant: "multi-select",
        filterSelectOptions: responsibilityOptions as string[],
        Cell: ({ row }) => {
          const responsibilityString = (
            row.original.overage_responsibility ?? []
          ).map((r) => r.responsibility);
          return <span>{responsibilityString.join(", ")}</span>;
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
          const responsibilityList = (
            row.original.overage_responsibility ?? []
          ).map((r) => r.responsibility);

          const containsAll = filterValue.every((value: any) =>
            responsibilityList.includes(value),
          );

          return containsAll;
        },
      },
    ],
    [phaseOptions, responsibilityOptions, workTypeOptions],
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
      loading={isLoading}
      onColumnFiltersChange={setColumnFilters}
      state={{
        isLoading: isLoading,
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
