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

const ProjectList = () => {
  const { projects, loadingProjects } = useProjectsContext();
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 15,
  });

  const types = projects
    .map((p) => p.type.name)
    .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index);
  const subTypes = projects
    .map((p) => p.sub_type.name)
    .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index);
  const proponents = projects
    .map((p) => p.proponent.name)
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
        filterSelectOptions: types,
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

  console.log("projects", projects);
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
      enablePagination
      muiPaginationProps={{
        rowsPerPageOptions: rowsPerPageOptions(projects.length),
      }}
      onPaginationChange={setPagination}
    />
  );
};
export default ProjectList;
