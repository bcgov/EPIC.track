import { useEffect, useState } from "react";
import TrackDialog from "components/shared/TrackDialog";
import { Project } from "models/project";
import projectService from "services/projectService/projectService";
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
  const canEdit = roles.includes(ROLES.EDIT);

  const fetchProject = async () => {
    if (!projectId) return;
    try {
      const response = await projectService.getById(String(projectId));
      setProject(response.data);
    } catch (error) {
      showNotification("Could not load Project", {
        type: "error",
      });
    }
  };

  const createProject = async (data: any) => {
    try {
      await projectService.create(data);
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

  const editProject = async (data: any) => {
    try {
      await projectService.update(data, String(projectId));
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

  const saveProject = async (data: any) => {
    if (data.eac_signed) {
      data.eac_signed = new Date(data.eac_signed).toISOString().split("T")[0];
    }
    if (data.eac_expires) {
      data.eac_expires = new Date(data.eac_expires).toISOString().split("T")[0];
    }
    if (projectId) {
      await editProject(data);
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
  }, [open]);

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
