import { useCallback, useEffect, useState } from "react";
import WorkForm from "../WorkForm";
import TrackDialog from "components/shared/TrackDialog";
import { Work, WorkInput } from "models/work";
import { worksApi } from "api/works";
import { showNotification } from "components/shared/notificationProvider";
import { useAppSelector } from "hooks";
import { hasPermission } from "components/shared/restricted";
import { ROLES } from "constants/application-constant";

type WorkDialogProps = {
  isActiveTeamMember: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  workId?: number;
  closeCallback?: () => void;
  saveWorkCallback?: () => void;
};
export const WorkDialog = ({
  isActiveTeamMember,
  open,
  setOpen,
  workId,
  closeCallback = () => {
    return;
  },
  saveWorkCallback = () => {
    return;
  },
}: WorkDialogProps) => {
  const [work, setWork] = useState<Work | null>(null);
  const { roles } = useAppSelector((state) => state.user.userDetail);
  const canEdit =
    hasPermission({ roles, allowed: [ROLES.EDIT] }) || isActiveTeamMember;
  const [disableSave, setDisableSave] = useState(!canEdit);

  const fetchWork = useCallback(async () => {
    if (!workId) return;
    try {
      setWork(await worksApi.get(workId));
    } catch (error) {
      showNotification("Could not load Work", {
        type: "error",
      });
    }
  }, [workId]);

  const saveWork = async (input: WorkInput) => {
    try {
      if (workId) {
        await worksApi.update(workId, input);
      } else {
        await worksApi.create(input);
      }
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
  }, [fetchWork, open]);

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
