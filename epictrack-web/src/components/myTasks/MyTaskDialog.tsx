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
  task?: MyTask;
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

  const editMyTask = async (data: any) => {
    if (!task) return;
    await taskEventService.update(data, task.id);
  };

  const saveTask = async (data: any) => {
    try {
      task ? await editMyTask(data) : null;
      showNotification("MyTask saved successfully", {
        type: "success",
      });
      setOpen(false);
      saveMyTaskCallback();
    } catch (error) {
      showNotification("Could not save MyTask", {
        type: "error",
      });
    }
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
        disabled: !canEdit || disableSave,
      }}
    >
      {task && (
        <MyTaskForm
          taskEvent={task}
          onSave={saveTask}
          setDisableDialogSave={setDisableSave}
        />
      )}
    </TrackDialog>
  );
};
