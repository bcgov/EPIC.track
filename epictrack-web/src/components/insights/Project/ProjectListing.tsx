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
import { useGetProjectsQuery } from "services/rtkQuery/insights";

const ProjectList = () => {
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 15,
  });

  const { data, isLoading: loadingProjects } = useGetProjectsQuery();

  const projects = data ?? [];

  const types = projects
    .map((p) => p.type.name)
    .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index);
  const subTypes = projects
    .map((p) => p.sub_type.name)
    .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index);
  const envRegions = projects
    .map((p) => p.region_env?.name)
    .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index);
  const proponents = projects
    .map((p) => p.proponent.name)
    .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index);

  const envRegionsOptions = getSelectFilterOptions(
    projects.map((project) => project.region_env),
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
        accessorKey: "proponent.name",
        header: "Proponents",
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
        header: "ENV Region",
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
    ],
    [types, subTypes, envRegions, proponents]
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
      enablePagination
      muiPaginationProps={{
        rowsPerPageOptions: rowsPerPageOptions(projects.length),
      }}
      onPaginationChange={setPagination}
    />
  );
};
export default ProjectList;
