import React from "react";
import { MRT_ColumnDef } from "material-react-table";
import {
  getSelectFilterOptions,
  rowsPerPageOptions,
} from "components/shared/MasterTrackTable/utils";
import { Project } from "models/project";
import TableFilter from "components/shared/filterSelect/TableFilter";
import { searchFilter } from "components/shared/MasterTrackTable/filters";
import MasterTrackTable from "components/shared/MasterTrackTable";
import { useProjectsContext } from "./ProjectsContext";
import { exportToCsv } from "components/shared/MasterTrackTable/utils";
import { FileDownload } from "@mui/icons-material";
import { IconButton, Tooltip, Box } from "@mui/material";
import { sort } from "utils";

const ProjectList = () => {
  const { projects, loadingProjects } = useProjectsContext();
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 15,
  });

  const types = projects.map((project) => project.type);
  const types_filter = Array.from(
    new Set(
      types
        .sort((type_a, type_b) => type_a.sort_order - type_b.sort_order)
        .map((type) => type.name)
    )
  );
  const subTypes = sort([...projects], "sub_type.sort_order")
    .map((p) => p.sub_type.name)
    .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index);
  const proponents = sort(
    projects.map((project) => project.proponent),
    "name"
  )
    .map((proponent) => proponent.name)
    .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index);

  const envRegionsOptions = getSelectFilterOptions(
    projects.map((project) => project.region_env),
    "name"
  );

  const nrsRegionOptions = getSelectFilterOptions(
    projects.map((project) => project.region_flnro),
    "name"
  );

  const columns = React.useMemo<MRT_ColumnDef<Project>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Project Name",
        sortingFn: "sortFn",
        filterFn: searchFilter,
      },
      {
        accessorKey: "type.name",
        header: "Type",
        filterVariant: "multi-select",
        filterSelectOptions: types_filter,
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
            filterValue.length > types.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id) || "";

          return filterValue.includes(value);
        },
      },
      {
        accessorKey: "sub_type.name",
        header: "Subtype",
        filterVariant: "multi-select",
        filterSelectOptions: subTypes,
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
            filterValue.length > subTypes.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id) || "";

          return filterValue.includes(value);
        },
      },
      {
        accessorKey: "proponent.name",
        header: "Proponent",
        filterSelectOptions: proponents,
        filterVariant: "multi-select",
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="rolesFilter"
              maxWidth="328px"
            />
          );
        },
        filterFn: (row, id, filterValue) => {
          if (
            !filterValue.length ||
            filterValue.length > proponents.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id) || "";

          return filterValue.includes(value);
        },
      },
      {
        accessorKey: "region_env.name",
        header: "Region ENV",
        filterSelectOptions: envRegionsOptions,
        filterVariant: "multi-select",
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
            filterValue.length > envRegionsOptions.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id) || "";

          return filterValue.includes(value);
        },
      },
      {
        accessorKey: "region_flnro.name",
        header: "Region NRS",
        filterSelectOptions: nrsRegionOptions,
        filterVariant: "multi-select",
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
            filterValue.length > nrsRegionOptions.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id) || "";

          return filterValue.includes(value);
        },
      },
    ],
    [types, subTypes, envRegionsOptions, proponents, nrsRegionOptions]
  );

  return (
    <MasterTrackTable
      columns={columns}
      data={projects}
      initialState={{
        sorting: [
          {
            id: "name",
            desc: false,
          },
        ],
      }}
      state={{
        isLoading: loadingProjects,
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
            <IconButton
              onClick={() =>
                exportToCsv({
                  table,
                  downloadDate: new Date().toISOString(),
                  filenamePrefix: "project-insights-listing",
                })
              }
            >
              <FileDownload />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      enablePagination
      muiPaginationProps={{
        rowsPerPageOptions: rowsPerPageOptions(projects.length),
      }}
      onPaginationChange={setPagination}
    />
  );
};
export default ProjectList;
