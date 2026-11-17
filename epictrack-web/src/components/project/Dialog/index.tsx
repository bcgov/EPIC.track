import { useCallback, useEffect, useState } from "react";
import TrackDialog from "components/shared/TrackDialog";
import { Project, ProjectInput } from "models/project";
import { projectsApi, useUpdateProject } from "api/projects";
import { showNotification } from "components/shared/notificationProvider";
import ProjectForm from "../ProjectForm";
import { useAppSelector } from "hooks";
import { ROLES } from "constants/application-constant";

type ProjectDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  projectId?: number;
  saveProjectCallback?: () => void;
};
export const ProjectDialog = ({
  projectId,
  open,
  setOpen,
  saveProjectCallback = () => {
    return;
  },
}: ProjectDialogProps) => {
  const [project, setProject] = useState<Project | null>(null);
  const [disableSave, setDisableSave] = useState(false);
  const { roles } = useAppSelector((state) => state.user.userDetail);
  const [updateProject] = useUpdateProject();
  const canEdit = roles.includes(ROLES.EDIT);

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    try {
      setProject(await projectsApi.get(projectId));
    } catch (error) {
      showNotification("Could not load Project", {
        type: "error",
      });
    }
  }, [projectId]);

  const createProject = async (data: ProjectInput) => {
    try {
      await projectsApi.create(data);
      showNotification("Project created successfully", {
        type: "success",
      });
      setProject(null);
    } catch (error) {
      showNotification("Could not create Project", {
        type: "error",
      });
    }
  };

  const editProject = async (id: number, data: ProjectInput) => {
    try {
      await updateProject({ id, input: data }).unwrap();
      showNotification("Project updated successfully", {
        type: "success",
      });
      setProject(null);
    } catch (error) {
      showNotification("Could not update Project", {
        type: "error",
      });
    }
  };

  const saveProject = async (data: ProjectInput) => {
    if (projectId) {
      await editProject(projectId, data);
    } else {
      await createProject(data);
    }
    setOpen(false);
    saveProjectCallback();
  };

  useEffect(() => {
    if (open) {
      fetchProject();
    }
  }, [fetchProject, open]);

  return (
    <TrackDialog
      open={open}
      dialogTitle={
        projectId ? project?.name || "Edit Project" : "Create Project"
      }
      onClose={() => {
        setProject(null);
        setOpen(false);
      }}
      disableEscapeKeyDown
      fullWidth
      maxWidth="lg"
      okButtonText="Save"
      cancelButtonText="Cancel"
      isActionsRequired
      onCancel={() => {
        setProject(null);
        setOpen(false);
      }}
      formId={"project-form"}
      saveButtonProps={{
        disabled: !canEdit || disableSave,
      }}
    >
      <ProjectForm
        project={project}
        fetchProject={fetchProject}
        saveProject={saveProject}
        setDisableDialogSave={setDisableSave}
      />
    </TrackDialog>
  );
};
