import React, { useCallback, useMemo } from "react";
import { MRT_ColumnDef } from "material-react-table";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { Box, Button, Chip, Grid, IconButton } from "@mui/material";
import ProjectForm from "./ProjectForm";
import { Project } from "../../models/project";
import MasterTrackTable from "../shared/MasterTrackTable";
import { ETGridTitle, ETPageContainer } from "../shared";
import { MasterContext } from "../shared/MasterContext";
import projectService from "../../services/projectService/projectService";
import { ActiveChip, InactiveChip } from "../shared/chip/ETChip";
import TableFilter from "../shared/filterSelect/TableFilter";
import { getSelectFilterOptions } from "../shared/MasterTrackTable/utils";
import { Restricted } from "../shared/restricted";
import { GROUPS, ROLES } from "../../constants/application-constant";
import { searchFilter } from "../shared/MasterTrackTable/filters";

const ProjectList = () => {
  const [envRegions, setEnvRegions] = React.useState<string[]>([]);
  const [subTypes, setSubTypes] = React.useState<string[]>([]);
  const [types, setTypes] = React.useState<string[]>([]);
  const [projectId, setProjectId] = React.useState<number>();
  const ctx = React.useContext(MasterContext);

  React.useEffect(() => {
    ctx.setForm(<ProjectForm projectId={projectId} />);
  }, [projectId]);

  const onEdit = (id: number) => {
    setProjectId(id);
    ctx.setShowModalForm(true);
  };

  React.useEffect(() => {
    ctx.setService(projectService);
    ctx.setFormStyle({
      "& .MuiDialogContent-root": {
        padding: 0,
      },
    });
  }, []);

  React.useEffect(() => {
    ctx.setTitle("Project");
  }, [ctx.title]);

  const projects = React.useMemo(() => ctx.data as Project[], [ctx.data]);

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
            onClick={() => onEdit(row.original.id)}
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
        size: 115,
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
            {cell.getValue<boolean>() && (
              <ActiveChip label="Active" color="primary" />
            )}
            {!cell.getValue<boolean>() && (
              <InactiveChip label="Inactive" color="error" />
            )}
          </span>
        ),
      },
    ],
    [types, subTypes, envRegions]
  );
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
            }}
            state={{
              isLoading: ctx.loading,
              showGlobalFilter: true,
            }}
            renderTopToolbarCustomActions={() => (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "right",
                }}
              >
                <Restricted
                  allowed={[ROLES.CREATE]}
                  errorProps={{ disabled: true }}
                >
                  <Button
                    onClick={() => {
                      ctx.setShowModalForm(true);
                      setProjectId(undefined);
                    }}
                    variant="contained"
                  >
                    Create Project
                  </Button>
                </Restricted>
              </Box>
            )}
          />
        </Grid>
      </ETPageContainer>
    </>
  );
};
export default ProjectList;
