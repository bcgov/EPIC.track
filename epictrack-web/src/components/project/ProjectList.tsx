import React from "react";
import { MRT_ColumnDef } from "material-react-table";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { Box, Button, Chip, Grid, IconButton } from "@mui/material";
import ProjectForm from "./ProjectForm";
import { Project } from "../../models/project";
import MasterTrackTable from "../shared/MasterTrackTable";
import { ETGridTitle, ETPageContainer } from "../shared";
import { MasterContext } from "../shared/MasterContext";
import projectService from "../../services/projectService/projectService";
import { ActiveChip, InactiveChip } from "../shared/chip/Chip";

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
      .map((p) => p.region_env.name)
      .filter((ele, index, arr) => arr.findIndex((t) => t === ele) === index);
    setTypes(types);
    setSubTypes(subTypes);
    setEnvRegions(envRegions);
  }, [projects]);

  const handleDelete = (id: string) => {
    ctx.setShowDeleteDialog(true);
    ctx.setId(id);
  };
  const columns = React.useMemo<MRT_ColumnDef<Project>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Project Name",
        Cell: ({ cell, row }) => (
          <ETGridTitle to={"#"} onClick={() => onEdit(row.original.id)}>
            {cell.getValue<string>()}
          </ETGridTitle>
        ),
        sortingFn: "sortFn",
      },
      {
        accessorKey: "type.name",
        header: "Type",
        filterVariant: "multi-select",
        filterSelectOptions: types,
      },
      {
        accessorKey: "sub_type.name",
        header: "Sub Type",
        filterVariant: "multi-select",
        filterSelectOptions: subTypes,
      },
      {
        accessorKey: "region_env.name",
        header: "ENV Region",
        filterVariant: "multi-select",
        filterSelectOptions: envRegions,
      },
      {
        accessorKey: "is_active",
        header: "Active",
        filterVariant: "checkbox",
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
    []
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
            enableRowActions={true}
            renderRowActions={({ row }: any) => (
              <Box>
                <IconButton onClick={() => handleDelete(row.original.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
            renderTopToolbarCustomActions={() => (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "right",
                }}
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
              </Box>
            )}
          />
        </Grid>
      </ETPageContainer>
    </>
  );
};
export default ProjectList;
