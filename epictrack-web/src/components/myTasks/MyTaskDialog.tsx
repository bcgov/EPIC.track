import { useState } from "react";
import MyTaskForm from "./MyTaskForm";
import TrackDialog from "components/shared/TrackDialog";
import { MyTask } from "models/task";
import { useAppSelector } from "hooks";
import { hasPermission } from "components/shared/restricted";
import { ROLES } from "constants/application-constant";

type MyTaskData = {
  data: MyTaskDialogProps;
};

type MyTaskDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  task?: MyTask | null;
  setTask: (task: MyTask | null) => void;
  saveMyTaskCallback: () => void;
};

export const MyTaskDialog = ({ data }: MyTaskData) => {
  const { open, setOpen, task, setTask, saveMyTaskCallback } = data;
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
      }}
      disableEscapeKeyDown
      fullWidth
      maxWidth="md"
      okButtonText="Save"
      cancelButtonText="Cancel"
      isActionsRequired
      onCancel={() => {
        setOpen(false);
        setTask(null);
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
