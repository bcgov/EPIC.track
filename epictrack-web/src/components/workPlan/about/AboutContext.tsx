import {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import useRouterLocationStateForHelpPage from "hooks/useRouterLocationStateForHelpPage";
import { WORKPLAN_TAB } from "../constants";
import { WorkResource } from "models/workResource";
import { useSearchParams } from "hooks/useSearchParams";
import { workService } from "services/workService/workService";
import { showNotification } from "components/shared/notificationProvider";
import TrackDialog from "components/shared/TrackDialog";
import WorkResourceForm from "./workResources/WorkResourceForm";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AboutContextProps {
  workResources: WorkResource[];
  setShowDeleteDialog: Dispatch<SetStateAction<boolean>>;
  setShowEditDialog: Dispatch<SetStateAction<boolean>>;
  setShowCreateDialog: Dispatch<SetStateAction<boolean>>;
  setSelectedWorkResource: Dispatch<SetStateAction<WorkResource | null>>;
  selectedWorkResource?: WorkResource | null;
  onSave(data: any, callback: () => any): any;
  getWorkResources(): any;
}

interface AboutContainerRouteParams extends URLSearchParams {
  work_id: string;
}

export const AboutContext = createContext<AboutContextProps>({
  workResources: [],
  setShowDeleteDialog: () => {},
  setShowEditDialog: () => {},
  setShowCreateDialog: () => {},
  setSelectedWorkResource: () => {},
  selectedWorkResource: null,
  onSave: (data: any, callback: () => any) => {},
  getWorkResources: () => {},
});

export const AboutProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const aboutLabelCallback = useCallback(() => WORKPLAN_TAB.ABOUT.label, []);
  useRouterLocationStateForHelpPage(aboutLabelCallback);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [workResources, setWorkResources] = useState<WorkResource[]>([]);
  const [selectedWorkResource, setSelectedWorkResource] =
    useState<WorkResource | null>(null);

  const query = useSearchParams<AboutContainerRouteParams>();
  const workId = useMemo(() => query.get("work_id"), [query]);

  const deleteWorkResource = useCallback(async () => {
    if (!workId || !selectedWorkResource) return;
    try {
      await workService.deleteWorkResource(selectedWorkResource.id);
      setWorkResources((prev) =>
        prev.filter((res) => res.id !== selectedWorkResource.id)
      );
      showNotification("Work Resource deleted successfully", {
        duration: 3000,
        type: "success",
      });
    } catch (error) {
      showNotification("Could not delete Work Resource", {
        duration: 3000,
        type: "error",
      });
    }
  }, [selectedWorkResource, workId]);

  const getWorkResources = useCallback(async () => {
    if (!workId) return;
    try {
      const response = await workService.getWorkResources(Number(workId));
      setWorkResources(response.data);
    } catch (error) {
      showNotification("Could not load Work Resources settings", {
        duration: 3000,
        type: "error",
      });
    }
  }, [workId]);

  useEffect(() => {
    getWorkResources();
  }, [getWorkResources]);

  const editWorkResource = async (data: any, callback: () => any) => {
    const { title, link } = data;
    await workService.updateWorkResource(Number(selectedWorkResource?.id), {
      title,
      link,
    });
    showNotification(`Work Resource details updated`, {
      type: "success",
    });
    setSelectedWorkResource(null);
    callback();
  };

  const createWorkResource = async (data: any, callback: () => any) => {
    const { title, link } = data;
    const result = await workService.createWorkResource(Number(workId), {
      title,
      link,
      work_id: workId,
    });
    if (result && result.status === 201) {
      showNotification(`Work Resource Created`, {
        type: "success",
      });
      callback();
    }
  };

  const onSave = async (data: any, callback: () => any) => {
    try {
      if (showCreateDialog) {
        createWorkResource(data, callback);
      } else {
        editWorkResource(data, callback);
      }
      setShowEditDialog(false);
      setShowCreateDialog(false);
      setSelectedWorkResource(null);
      getWorkResources();
    } catch (e) {
      showNotification("Could not save Work Resource", {
        type: "error",
      });
    }
  };

  return (
    <AboutContext.Provider
      value={{
        workResources,
        setShowDeleteDialog,
        setSelectedWorkResource,
        setShowEditDialog,
        setShowCreateDialog,
        selectedWorkResource,
        getWorkResources,
        onSave,
      }}
    >
      {children}
      <TrackDialog
        open={showDeleteDialog}
        dialogTitle={"Delete Resource?"}
        dialogContentText={
          "Once deleted, this resource will no longer display under the Resources section."
        }
        okButtonText="Save"
        cancelButtonText="Cancel"
        onCancel={() => {
          setShowDeleteDialog(false);
          setSelectedWorkResource(null);
        }}
        isActionsRequired
        onOk={() => {
          deleteWorkResource();
          setShowDeleteDialog(false);
          setSelectedWorkResource(null);
        }}
      />
      <TrackDialog
        open={showEditDialog || showCreateDialog}
        dialogTitle={showCreateDialog ? "Create Resource" : "Edit Resource"}
        okButtonText="Save"
        cancelButtonText="Cancel"
        onCancel={() => {
          setShowEditDialog(false);
          setShowCreateDialog(false);
          setSelectedWorkResource(null);
        }}
        isActionsRequired
        fullWidth
        maxWidth="sm"
        formId="work-resource-form"
      >
        <WorkResourceForm />
      </TrackDialog>
    </AboutContext.Provider>
  );
};
