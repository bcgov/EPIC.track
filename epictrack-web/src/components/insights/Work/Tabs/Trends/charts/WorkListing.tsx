import React, { useEffect, useMemo } from "react";
import { MRT_ColumnDef } from "material-react-table";
import { showNotification } from "components/shared/notificationProvider";
import { Work } from "models/work";
import { rowsPerPageOptions } from "components/shared/MasterTrackTable/utils";
import { searchFilter } from "components/shared/MasterTrackTable/filters";
import TableFilter from "components/shared/filterSelect/TableFilter";
import MasterTrackTable from "components/shared/MasterTrackTable";
import { useGetAllWorksQuery } from "services/rtkQuery/workInsights";
import { exportToCsv } from "components/shared/MasterTrackTable/utils";
import { Tooltip, Box, Grid } from "@mui/material";
import { ETCaption1, ETGridTitle, IButton } from "components/shared";
import Icons from "components/icons";
import { IconProps } from "components/icons/type";
import { dateUtils } from "utils";
import { MONTH_DAY_YEAR } from "constants/application-constant";
import WorkState from "components/workPlan/WorkState";

const DownloadIcon: React.FC<IconProps> = Icons["DownloadIcon"];

const WorkList = () => {
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const { data, error, isLoading } = useGetAllWorksQuery();

  const works = data || [];

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageSize: works.length,
    }));
  }, [works]);

  const workStates = useMemo(
    () =>
      Array.from(
        new Set(
          works
            .map((work) => work?.work_state || "")
            .filter((type) => type)
            .sort()
        )
      ),
    [works]
  );

  const projects = useMemo(
    () =>
      Array.from(
        new Set(
          works
            .map((work) => work?.project?.name || "")
            .filter((project) => project)
            .sort()
        )
      ),
    [works]
  );

  const phases = useMemo(
    () =>
      Array.from(
        new Set(
          works
            .map((work) => work?.current_work_phase?.name || "")
            .filter((phase) => phase)
            .sort()
        )
      ),
    [works]
  );

  const started_years = useMemo(
    () =>
      Array.from(
        new Set(
          works.map((work) => dateUtils.formatDate(work?.start_date, "YYYY"))
        )
      ).sort((a, b) => parseInt(b) - parseInt(a)),
    [works]
  );

  const closed_years = useMemo(
    () =>
      Array.from(
        new Set(
          works
            .map((work) =>
              dateUtils.formatDate(work?.work_decision_date as string, "YYYY")
            )
            .filter((year) => year !== "Invalid date")
        )
      ).sort((a, b) => parseInt(b) - parseInt(a)),
    [works]
  );

  useEffect(() => {
    if (error) {
      showNotification("Error fetching works", { type: "error" });
    }
  }, [error]);

  const columns = React.useMemo<MRT_ColumnDef<Work>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Name",
        size: 300,
        Cell: ({ row, renderedCellValue }) => (
          <ETGridTitle
            to={`/work-plan?work_id=${row.original.id}`}
            enableTooltip
            tooltip={row.original.title}
            titleText={row.original.title}
          >
            {renderedCellValue}
          </ETGridTitle>
        ),
        sortingFn: "sortFn",
        filterFn: searchFilter,
      },
      {
        accessorKey: "project.name",
        header: "Project",
        size: 200,
        filterVariant: "multi-select",
        filterSelectOptions: projects,
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
            filterValue.length > projects.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id) || "";

          return filterValue.includes(value);
        },
      },
      {
        accessorKey: "start_date",
        header: "Started",
        Cell: ({ row, renderedCellValue }) => {
          return dateUtils.formatDate(
            renderedCellValue?.toString() || "",
            MONTH_DAY_YEAR
          );
        },
        filterVariant: "multi-select",
        filterSelectOptions: started_years,
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
            filterValue.length > started_years.length // select all is selected
          ) {
            return true;
          }

          const value: string =
            dateUtils.formatDate(row.getValue(id) as string, "YYYY") || "";

          return filterValue.includes(value);
        },
      },
      {
        accessorKey: "work_decision_date",
        header: "Closed",
        Cell: ({ row, renderedCellValue }) => {
          return renderedCellValue
            ? dateUtils.formatDate(
                renderedCellValue?.toString() || "",
                MONTH_DAY_YEAR
              )
            : "";
        },
        filterVariant: "multi-select",
        filterSelectOptions: closed_years,
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
            filterValue.length > closed_years.length // select all is selected
          ) {
            return true;
          }

          const value: string =
            dateUtils.formatDate(row.getValue(id) as string, "YYYY") || "";

          return filterValue.includes(value);
        },
      },
      {
        accessorKey: "work_state",
        header: "Work state",
        filterVariant: "multi-select",
        filterSelectOptions: workStates,
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
            filterValue.length > workStates.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id) || "";

          return filterValue.includes(value);
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
    ],
    [projects, phases, workStates, started_years, closed_years]
  );
  return (
    <MasterTrackTable
      columns={columns}
      data={works}
      initialState={{
        sorting: [
          {
            id: "title",
            desc: false,
          },
        ],
      }}
      state={{
        isLoading: isLoading,
        showGlobalFilter: true,
        pagination: pagination,
      }}
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
        rowsPerPageOptions: rowsPerPageOptions(works.length),
      }}
      onPaginationChange={setPagination}
    />
  );
};

export default WorkList;
