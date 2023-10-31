import { Dispatch, SetStateAction, createContext } from "react";
import React from "react";
import TrackDialog from "../../shared/TrackDialog";
import StatusForm from "./StatusForm";
import { Status } from "../../../models/status";
import { showNotification } from "../../shared/notificationProvider";
import { getAxiosError } from "../../../utils/axiosUtils";
import { COMMON_ERROR_MESSAGE } from "../../../constants/application-constant";
import statusService from "../../../services/statusService";

interface StatusContextProps {
  setShowStatusForm: Dispatch<SetStateAction<boolean>>;
  status?: Status | null;
  setStatus: Dispatch<SetStateAction<Status | undefined>>;
  onSave(data: any, callback: () => any): any;
}

export const StatusContext = createContext<StatusContextProps>({
  setShowStatusForm: () => ({}),
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
  const [status, setStatus] = React.useState<Status>();
  const [backdrop, setBackdrop] = React.useState<boolean>(false);

  const onDialogClose = () => {
    setShowStatusForm(false);
  };

  const onSave = React.useCallback(
    async (data: any, callback: () => any) => {
      setBackdrop(true);
      try {
        if (status) {
          const result = await statusService?.update(
            data,
            status.id.toString()
          );
          // if (result && result.status === 200) {
          //   showNotification(`${status.title} details updated`, {
          //     type: "success",
          //   });
          //   setStatus(undefined);
          //   setBackdrop(false);
          //   callback();
          // }
        } else {
          const result = await statusService?.create(data);
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
        setBackdrop(false);
      }
    },
    [status]
  );

  return (
    <StatusContext.Provider
      value={{ setShowStatusForm, setStatus, status, onSave }}
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
    </StatusContext.Provider>
  );
};
