import React, { useEffect, useState } from "react";
import MyTaskForm from "./MyTaskForm";
import TrackDialog from "components/shared/TrackDialog";
import taskEventService from "services/taskEventService/taskEventService";
import { MyTask } from "models/task";
import { showNotification } from "components/shared/notificationProvider";
import { useAppSelector } from "hooks";
import { hasPermission } from "components/shared/restricted";
import { ROLES } from "constants/application-constant";

type MyTaskDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  task?: MyTask | null;
  setTask: (task: MyTask | null) => void;
  saveMyTaskCallback?: () => void;
  closeCallback?: () => void;
};
export const MyTaskDialog = ({
  task,
  open,
  setOpen,
  setTask,
  saveMyTaskCallback = () => {
    return;
  },
  closeCallback = () => {
    return;
  },
}: MyTaskDialogProps) => {
  const { roles } = useAppSelector((state) => state.user.userDetail);
  const canEdit = hasPermission({ roles, allowed: [ROLES.EDIT] });
  const [disableSave, setDisableSave] = useState(!canEdit);

  const saveTask = async (data: any) => {
    setOpen(false);
    setTask(null);
    saveMyTaskCallback();
  };

  return (
    <TrackDialog
      open={open}
      dialogTitle={task ? task?.name || "Edit Task" : "Create Task"}
      onClose={() => {
        setOpen(false);
        setTask(null);
        closeCallback();
      }}
      disableEscapeKeyDown
      fullWidth
      maxWidth="lg"
      okButtonText="Save"
      cancelButtonText="Cancel"
      isActionsRequired
      onCancel={() => {
        setOpen(false);
        setTask(null);
        closeCallback();
      }}
      formId={"myTask-form"}
      saveButtonProps={{
        disabled: disableSave,
      }}
    >
      {task && <MyTaskForm taskEvent={task} onSave={saveTask} />}
    </TrackDialog>
  );
};
