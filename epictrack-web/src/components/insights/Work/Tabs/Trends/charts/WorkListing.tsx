import React, { useEffect, useMemo } from "react";
import { MRT_ColumnDef } from "material-react-table";
import { showNotification } from "components/shared/notificationProvider";
import { Work } from "models/work";
import { rowsPerPageOptions } from "components/shared/MasterTrackTable/utils";
import { searchFilter } from "components/shared/MasterTrackTable/filters";
import TableFilter from "components/shared/filterSelect/TableFilter";
import MasterTrackTable from "components/shared/MasterTrackTable";
import { useGetWorksQuery } from "services/rtkQuery/workInsights";
import { exportToCsv } from "components/shared/MasterTrackTable/utils";
import { Tooltip, Box } from "@mui/material";
import { ETGridTitle, IButton } from "components/shared";
import Icons from "components/icons";
import { IconProps } from "components/icons/type";
import { dateUtils } from "utils";
import { MONTH_DAY_YEAR } from "constants/application-constant";

const DownloadIcon: React.FC<IconProps> = Icons["DownloadIcon"];

const WorkList = () => {
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const { data, error, isLoading } = useGetWorksQuery();

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

  const created_years = useMemo(
    () =>
      Array.from(
        new Set(
          works.map((work) => dateUtils.formatDate(work?.created_at, "YYYY"))
        )
      ),
    [works]
  );

  const ended_years = useMemo(
    () =>
      Array.from(
        new Set(
          works
            .map((work) =>
              dateUtils.formatDate(work?.work_decision_date as string, "YYYY")
            )
            .filter((year) => year !== "Invalid date")
        )
      ),
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
          // <Link to={`/work-plan?work_id=${row.original.id}`}>
          <ETGridTitle
            to={`/work-plan?work_id=${row.original.id}`}
            enableTooltip
            tooltip={row.original.title}
            titleText={row.original.title}
          >
            {renderedCellValue}
          </ETGridTitle>
          // </Link>
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
        accessorKey: "created_at",
        header: "Created on",
        Cell: ({ row, renderedCellValue }) => {
          return dateUtils.formatDate(
            renderedCellValue?.toString() || "",
            MONTH_DAY_YEAR
          );
        },
        filterVariant: "multi-select",
        filterSelectOptions: created_years,
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
            filterValue.length > created_years.length // select all is selected
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
        header: "Ended on",
        Cell: ({ row, renderedCellValue }) => {
          return renderedCellValue
            ? dateUtils.formatDate(
                renderedCellValue?.toString() || "",
                MONTH_DAY_YEAR
              )
            : "";
        },
        filterVariant: "multi-select",
        filterSelectOptions: ended_years,
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
            filterValue.length > ended_years.length // select all is selected
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
      },
    ],
    [projects, phases, workStates, created_years, ended_years]
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
