import React, { useMemo } from "react";
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
import { Tooltip, Box } from "@mui/material";
import { sort } from "utils";
import Icons from "components/icons";
import { IconProps } from "components/icons/type";
import { IButton } from "components/shared";

const DownloadIcon: React.FC<IconProps> = Icons["DownloadIcon"];

const ProjectList = () => {
  const { projects, loadingProjects } = useProjectsContext();
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 15,
  });

  const types = useMemo(
    () => projects.map((project) => project.type),
    [projects]
  );
  const types_filter = useMemo(
    () =>
      Array.from(
        new Set(
          types
            .sort((type_a, type_b) => type_a.sort_order - type_b.sort_order)
            .map((type) => type.name)
        )
      ),
    [types]
  );
  const subTypes = useMemo(
    () =>
      sort([...projects], "sub_type.sort_order")
        .map((p) => p.sub_type.name)
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index),
    [projects]
  );
  const proponents = useMemo(
    () =>
      sort(
        projects.map((project) => project.proponent),
        "name"
      )
        .map((proponent) => proponent.name)
        .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index),
    [projects]
  );

  const envRegionsOptions = useMemo(
    () =>
      getSelectFilterOptions(
        projects.map((project) => project.region_env),
        "name"
      ),
    [projects]
  );

  const nrsRegionOptions = useMemo(
    () =>
      getSelectFilterOptions(
        projects.map((project) => project.region_flnro),
        "name"
      ),
    [projects]
  );
  console.log("rerender");
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
            <IButton
              onClick={() =>
                exportToCsv({
                  table,
                  downloadDate: new Date().toISOString(),
                  filenamePrefix: "project-insights-listing",
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
        rowsPerPageOptions: rowsPerPageOptions(projects.length),
      }}
      onPaginationChange={setPagination}
    />
  );
};
export default ProjectList;
