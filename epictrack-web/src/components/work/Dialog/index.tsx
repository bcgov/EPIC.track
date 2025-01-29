import { useEffect, useState } from "react";
import WorkForm from "../WorkForm";
import TrackDialog from "components/shared/TrackDialog";
import { Work } from "models/work";
import workService from "services/workService/workService";
import { showNotification } from "components/shared/notificationProvider";
import { useAppSelector } from "hooks";
import { hasPermission } from "components/shared/restricted";
import { ROLES } from "constants/application-constant";

type WorkDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  workId?: number;
  saveWorkCallback?: () => void;
  closeCallback?: () => void;
};
export const WorkDialog = ({
  workId,
  open,
  setOpen,
  saveWorkCallback = () => {
    return;
  },
  closeCallback = () => {
    return;
  },
}: WorkDialogProps) => {
  const [work, setWork] = useState<Work | null>(null);
  const { roles } = useAppSelector((state) => state.user.userDetail);
  const canEdit = hasPermission({ roles, allowed: [ROLES.EDIT] });
  const [disableSave, setDisableSave] = useState(!canEdit);

  const fetchWork = async () => {
    if (!workId) return;
    try {
      const response = await workService.getById(String(workId));
      setWork(response.data);
    } catch (error) {
      showNotification("Could not load Work", {
        type: "error",
      });
    }
  };

  const createWork = async (data: any) => {
    await workService.create(data);
  };

  const editWork = async (data: any) => {
    await workService.update(data, String(workId));
  };

  const saveWork = async (data: any) => {
    try {
      workId ? await editWork(data) : await createWork(data);
      showNotification("Work saved successfully", {
        type: "success",
      });
      setOpen(false);
      setWork(null);
      saveWorkCallback();
    } catch (error) {
      showNotification("Could not save Work", {
        type: "error",
      });
    }
  };

  useEffect(() => {
    if (open) {
      fetchWork();
    }
  }, [open]);

  return (
    <TrackDialog
      open={open}
      dialogTitle={workId ? work?.title || "Edit Work" : "Create Work"}
      onClose={() => {
        setWork(null);
        setOpen(false);
        closeCallback();
      }}
      disableEscapeKeyDown
      fullWidth
      maxWidth="lg"
      okButtonText="Save"
      cancelButtonText="Cancel"
      isActionsRequired
      onCancel={() => {
        setWork(null);
        setOpen(false);
        closeCallback();
      }}
      formId={"work-form"}
      saveButtonProps={{
        disabled: !canEdit || disableSave,
      }}
    >
      <WorkForm
        work={work}
        fetchWork={fetchWork}
        saveWork={saveWork}
        setDisableDialogSave={setDisableSave}
      />
    </TrackDialog>
  );
};
