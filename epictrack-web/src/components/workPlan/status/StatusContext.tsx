import { Dispatch, SetStateAction, createContext, useContext } from "react";
import React from "react";
import TrackDialog from "../../shared/TrackDialog";
import StatusForm from "./StatusForm";
import { Status } from "../../../models/status";
import { showNotification } from "../../shared/notificationProvider";
import { getAxiosError } from "../../../utils/axiosUtils";
import { COMMON_ERROR_MESSAGE } from "../../../constants/application-constant";
import workService from "../../../services/workService/workService";
import statusService from "../../../services/statusService/statusService";
import { useSearchParams } from "../../../hooks/SearchParams";
import { WorkplanContext } from "../WorkPlanContext";

interface StatusContextProps {
  setShowStatusForm: Dispatch<SetStateAction<boolean>>;
  status?: Status | null;
  setStatus: Dispatch<SetStateAction<Status | undefined>>;
  onSave(data: any, callback: () => any): any;
  setShowApproveStatusDialog: Dispatch<SetStateAction<boolean>>;
  setIsCloning: Dispatch<SetStateAction<boolean>>;
  workId: string | null;
  isCloning: boolean;
}

interface StatusContainerRouteParams extends URLSearchParams {
  work_id: string;
}

export const StatusContext = createContext<StatusContextProps>({
  setShowStatusForm: () => ({}),
  setShowApproveStatusDialog: () => ({}),
  status: null,
  setStatus: () => ({}),
  onSave: (data: any, callback: () => any) => ({}),
  setIsCloning: () => ({}),
  isCloning: false,
  workId: null,
});

export const StatusProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [showStatusForm, setShowStatusForm] = React.useState<boolean>(false);
  const [showApproveStatusDialog, setShowApproveStatusDialog] =
    React.useState<boolean>(false);
  const [isCloning, setIsCloning] = React.useState<boolean>(false);
  const [status, setStatus] = React.useState<Status>();
  const query = useSearchParams<StatusContainerRouteParams>();
  const workId = React.useMemo(() => query.get("work_id"), [query]);
  const { getWorkStatuses } = useContext(WorkplanContext);

  const onDialogClose = () => {
    setShowStatusForm(false);
    setIsCloning(false);
  };

  const onSave = async (data: any, callback: () => any) => {
    const { description, posted_date } = data;
    console.log(description);
    console.log(posted_date);
    try {
      if (status && !isCloning) {
        const result = await statusService?.update(
          Number(workId),
          Number(status.id),
          { description, posted_date }
        );
        if (result && result.status === 200) {
          showNotification(`Status details updated`, {
            type: "success",
          });
          setStatus(undefined);
          callback();
        }
      } else {
        const result = await statusService?.create(Number(workId), {
          description,
          posted_date,
        });
        if (result && result.status === 201) {
          showNotification(`Status Created`, {
            type: "success",
          });
          callback();
        }
      }
      setIsCloning(false);
      getWorkStatuses();
      setShowStatusForm(false);
    } catch (e) {
      const error = getAxiosError(e);
      const message =
        error?.response?.status === 422
          ? error.response.data?.toString()
          : COMMON_ERROR_MESSAGE;
      showNotification(message, {
        type: "error",
      });
    }
  };

  const closeApproveDialog = React.useCallback(() => {
    setShowApproveStatusDialog(false);
  }, []);

  const approveStatus = async () => {
    const result = await statusService.approve(
      Number(workId),
      Number(status?.id)
    );
    if (result && result.status === 200) {
      setShowApproveStatusDialog(false);
      setStatus(undefined);
      getWorkStatuses();
    }
  };

  return (
    <StatusContext.Provider
      value={{
        isCloning,
        workId,
        setIsCloning,
        setShowStatusForm,
        setShowApproveStatusDialog,
        setStatus,
        status,
        onSave,
      }}
    >
      {children}
      <TrackDialog
        open={showStatusForm}
        dialogTitle="Add Status"
        disableEscapeKeyDown
        fullWidth
        maxWidth="sm"
        okButtonText="Save"
        formId="status-form"
        onCancel={() => onDialogClose()}
        isActionsRequired
      >
        <StatusForm />
      </TrackDialog>
      <TrackDialog
        open={showApproveStatusDialog}
        dialogTitle="Approve this Status?"
        dialogContentText="Once approved, this status will be automatically added to the Report."
        okButtonText="Approve"
        cancelButtonText="Cancel"
        isActionsRequired
        onCancel={closeApproveDialog}
        onOk={approveStatus}
      />
    </StatusContext.Provider>
  );
};
