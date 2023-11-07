import { Dispatch, SetStateAction, createContext } from "react";
import React from "react";
import TrackDialog from "../../shared/TrackDialog";
import StatusForm from "./StatusForm";
import { Status } from "../../../models/status";
import { showNotification } from "../../shared/notificationProvider";
import { getAxiosError } from "../../../utils/axiosUtils";
import { COMMON_ERROR_MESSAGE } from "../../../constants/application-constant";
import workService from "../../../services/workService/workService";

interface StatusContextProps {
  setShowStatusForm: Dispatch<SetStateAction<boolean>>;
  status?: Status | null;
  setStatus: Dispatch<SetStateAction<Status | undefined>>;
  onSave(data: any, callback: () => any): any;
  setShowApproveStatusDialog: Dispatch<SetStateAction<boolean>>;
}

export const StatusContext = createContext<StatusContextProps>({
  setShowStatusForm: () => ({}),
  setShowApproveStatusDialog: () => ({}),
  status: null,
  setStatus: () => ({}),
  onSave: (data: any, callback: () => any) => ({}),
});

export const StatusProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [showStatusForm, setShowStatusForm] = React.useState<boolean>(false);
  const [showApproveStatusDialog, setShowApproveStatusDialog] =
    React.useState<boolean>(false);
  const [status, setStatus] = React.useState<Status>();

  const onDialogClose = () => {
    setShowStatusForm(false);
  };

  const onSave = async (data: any, callback: () => any) => {
    try {
      if (status) {
        // TODO update or create a status
        // const result = await statusService?.update(data, status.id.toString());
        // if (result && result.status === 200) {
        //   showNotification(`${status.title} details updated`, {
        //     type: "success",
        //   });
        //   setStatus(undefined);
        //   setBackdrop(false);
        //   callback();
        // }
      } else {
        // const result = await statusService?.create(data);
        // if (result && result.status === 201) {
        //   showNotification(`Status Created`, {
        //     type: "success",
        //   });
        //   setBackdrop(false);
        //   callback();
        // }
      }
      setShowStatusForm(false);
      // getData();
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

  const approveStatus = async (id?: string) => {
    // TODO update status to be approved
    // const result = await workService?.delete(id);
    // if (result && result.status === 200) {
    setShowApproveStatusDialog(false);
    // getData();
    // setId(undefined);
  };

  return (
    <StatusContext.Provider
      value={{
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
        onOk={() => approveStatus(status?.id.toString())}
      />
    </StatusContext.Provider>
  );
};
