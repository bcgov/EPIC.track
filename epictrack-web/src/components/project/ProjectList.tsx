import React, { useEffect, useMemo } from "react";
import { MRT_ColumnDef } from "material-react-table";
import { Box, Button, Grid, Tooltip, IconButton } from "@mui/material";
import { Project } from "../../models/project";
import MasterTrackTable from "../shared/MasterTrackTable";
import { ETGridTitle, ETPageContainer, IButton } from "../shared";
import projectService from "../../services/projectService/projectService";
import { ETChip } from "../shared/chip/ETChip";
import TableFilter from "../shared/filterSelect/TableFilter";
import { getSelectFilterOptions } from "../shared/MasterTrackTable/utils";
import { Restricted } from "../shared/restricted";
import { ROLES } from "../../constants/application-constant";
import { searchFilter } from "../shared/MasterTrackTable/filters";
import { ProjectDialog } from "./Dialog";
import { showNotification } from "components/shared/notificationProvider";
import { useCachedState } from "hooks/useCachedFilters";
import { ColumnFilter } from "components/shared/MasterTrackTable/type";
import { exportToCsv } from "components/shared/MasterTrackTable/utils";
import Icons from "components/icons";
import { IconProps } from "components/icons/type";

const DownloadIcon: React.FC<IconProps> = Icons["DownloadIcon"];

const projectsListingFiltersCacheKey = "projects-listing-filters";
const ProjectList = () => {
  const [envRegions, setEnvRegions] = React.useState<string[]>([]);
  const [subTypes, setSubTypes] = React.useState<string[]>([]);
  const [proponents, setProponents] = React.useState<string[]>([]);
  const [types, setTypes] = React.useState<string[]>([]);
  const [projectId, setProjectId] = React.useState<number>();
  const [showFormDialog, setShowFormDialog] = React.useState(false);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = React.useState(true);
  const [columnFilters, setColumnFilters] = useCachedState<ColumnFilter[]>(
    projectsListingFiltersCacheKey,
    []
  );

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const response = await projectService.getAll();
      setProjects(response.data);
      setLoadingProjects(false);
    } catch (error) {
      showNotification("Could not load Projects", { type: "error" });
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  React.useEffect(() => {
    const types = projects
      .map((p) => p.type.name)
      .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index);
    const subTypes = projects
      .map((p) => p.sub_type.name)
      .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index);
    const envRegions = projects
      .map((p) => p.region_env?.name)
      .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index);
    const projectProponents = projects
      .map((p) => p.proponent.name)
      .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index);
    setProponents(projectProponents);
    setTypes(types);
    setSubTypes(subTypes);
    setEnvRegions(envRegions);
  }, [projects]);

  const statusesOptions = useMemo(
    () =>
      getSelectFilterOptions(
        projects,
        "is_active",
        (value) => (value ? "Active" : "Inactive"),
        (value) => value
      ),
    [projects]
  );

  const envRegionsOptions = getSelectFilterOptions(
    projects.map((project) => project.region_env),
    "name"
  );

  const columns = React.useMemo<MRT_ColumnDef<Project>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Project Name",
        Cell: ({ cell, row, renderedCellValue }) => (
          <ETGridTitle
            to={"#"}
            onClick={() => {
              setProjectId(row.original.id);
              setShowFormDialog(true);
            }}
            enableTooltip={true}
            tooltip={cell.getValue<string>()}
          >
            {renderedCellValue}
          </ETGridTitle>
        ),
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
        header: "Sub Type",
        filterSelectOptions: subTypes,
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
      {
        accessorKey: "is_active",
        header: "Status",
        filterVariant: "multi-select",
        filterSelectOptions: statusesOptions,
        Filter: ({ header, column }) => {
          return (
            <Box sx={{ width: "100px" }}>
              <TableFilter
                isMulti
                header={header}
                column={column}
                variant="inline"
                name="rolesFilter"
              />
            </Box>
          );
        },
        filterFn: (row, id, filterValue) => {
          if (
            !filterValue.length ||
            filterValue.length > statusesOptions.length // select all is selected
          ) {
            return true;
          }

          const value: string = row.getValue(id);

          return filterValue.includes(value);
        },
        Cell: ({ cell }) => (
          <span>
            {cell.getValue<boolean>() && <ETChip active label="Active" />}
            {!cell.getValue<boolean>() && <ETChip inactive label="Inactive" />}
          </span>
        ),
      },
    ],
    [types, subTypes, envRegions, proponents]
  );

  const handleCacheFilters = (filters?: ColumnFilter[]) => {
    if (!filters) {
      return;
    }
    setColumnFilters(filters);
  };

  return (
    <>
      <ETPageContainer
        direction="row"
        container
        columnSpacing={2}
        rowSpacing={3}
      >
        <Grid item xs={12}>
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
              columnFilters: columnFilters,
            }}
            state={{
              isLoading: loadingProjects,
              showGlobalFilter: true,
            }}
            tableName={"project-listing"}
            enableExport
            renderTopToolbarCustomActions={({ table }) => (
              <Restricted
                allowed={[ROLES.CREATE]}
                errorProps={{ disabled: true }}
              >
                <Button
                  onClick={() => {
                    setShowFormDialog(true);
                    setProjectId(undefined);
                  }}
                  variant="contained"
                >
                  Create Project
                </Button>
              </Restricted>
            )}
            onCacheFilters={handleCacheFilters}
          />
        </Grid>
      </ETPageContainer>
      <ProjectDialog
        projectId={projectId}
        open={showFormDialog}
        setOpen={setShowFormDialog}
        saveProjectCallback={fetchProjects}
      />
    </>
  );
};
export default ProjectList;
