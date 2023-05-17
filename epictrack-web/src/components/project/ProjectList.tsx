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

const ProjectList = () => {
  const [projects, setProjects] = React.useState<Project[]>([]);
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
  }, [getProject]);

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
        accessorKey: "sub_type.type.name",
        header: "Type",
      },
      {
        accessorKey: "sub_type.name",
        header: "Sub Type",
      },
      {
        accessorKey: "region_env.name",
        header: "ENV Region",
      },
      {
        accessorKey: "is_project_closed",
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
    [projects]
  );
  return (
    <>
      <EpicTrackPageGridContainer
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
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
          project_id={projectId}
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
