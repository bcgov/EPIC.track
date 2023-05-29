import React from "react";
import { MRT_ColumnDef } from "material-react-table";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { Box, Button, Chip, Grid, IconButton, Tooltip } from "@mui/material";
import { RESULT_STATUS } from "../../constants/application-constant";
import ProjectForm from "./ProjectForm";
import { Project } from "../../models/project";
import ProjectService from "../../services/projectService";
import MasterTrackTable from "../shared/MasterTrackTable";
import TrackDialog from "../shared/TrackDialog";
import { EpicTrackPageGridContainer } from "../shared";
import { Staff } from "../../models/staff";

const ProjectList = () => {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [envRegions, setEnvRegions] = React.useState<string[]>([]);
  const [subTypes, setSubTypes] = React.useState<string[]>([]);
  const [types, setTypes] = React.useState<string[]>([]);
  const [resultStatus, setResultStatus] = React.useState<string>();
  const [projectId, setProjectId] = React.useState<number>();
  const [deleteProjectId, setDeleteProjectId] = React.useState<number>();
  const [showDialog, setShowDialog] = React.useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] =
    React.useState<boolean>(false);
  const titleSuffix = "Project Details";
  const onDialogClose = (event: any, reason: any) => {
    if (reason && reason == "backdropClick") return;
    setShowDialog(false);
  };
  const onEdit = (id: number) => {
    setProjectId(id);
    setShowDialog(true);
  };

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

  const getProject = React.useCallback(async () => {
    setResultStatus(RESULT_STATUS.LOADING);
    try {
      const projectResult = await ProjectService.getProjects();
      if (projectResult.status === 200) {
        setProjects((projectResult.data as never)["projects"]);
      }
    } catch (error) {
      console.error("Project List: ", error);
    } finally {
      setResultStatus(RESULT_STATUS.LOADED);
    }
  }, []);

  React.useEffect(() => {
    getProject();
  }, []);

  const handleDelete = (id: number) => {
    setShowDeleteDialog(true);
    setDeleteProjectId(id);
  };

  const deleteProject = async (id?: number) => {
    const result = await ProjectService.deleteProjects(id);
    if (result.status === 200) {
      setDeleteProjectId(undefined);
      setShowDeleteDialog(false);
      getProject();
    }
  };
  const columns = React.useMemo<MRT_ColumnDef<Project>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Project Name",
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
              <Chip label="Active" color="primary" />
            )}
            {!cell.getValue<boolean>() && (
              <Chip label="Inactive" color="error" />
            )}
          </span>
        ),
      },
    ],
    []
  );
  return (
    <>
      <EpicTrackPageGridContainer
        direction="row"
        container
        columnSpacing={2}
        rowSpacing={3}
      >
        <Grid item xs={12}>
          <MasterTrackTable
            columns={columns}
            data={projects}
            state={{
              isLoading: resultStatus === RESULT_STATUS.LOADING,
              showGlobalFilter: true,
            }}
            enableRowActions={true}
            renderRowActions={({ row }: any) => (
              <Box>
                <IconButton onClick={() => onEdit(row.original.id)}>
                  <EditIcon />
                </IconButton>
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
                    setShowDialog(true);
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
      </EpicTrackPageGridContainer>
      <TrackDialog
        open={showDialog}
        dialogTitle={(projectId ? "Update " : "Create ") + titleSuffix}
        onClose={(event: any, reason: any) => onDialogClose(event, reason)}
        disableEscapeKeyDown
        fullWidth
        maxWidth="md"
      >
        <ProjectForm
          onCancel={onDialogClose}
          projectId={projectId}
          onSubmitSucces={getProject}
        />
      </TrackDialog>
      <TrackDialog
        open={showDeleteDialog}
        dialogTitle="Delete"
        dialogContentText="Are you sure you want to delete?"
        okButtonText="Yes"
        cancelButtonText="No"
        isActionsRequired
        onCancel={() => setShowDeleteDialog(!showDeleteDialog)}
        onOk={() => deleteProject(deleteProjectId)}
      />
    </>
  );
};
export default ProjectList;
