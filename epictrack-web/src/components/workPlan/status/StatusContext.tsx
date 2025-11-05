import {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useMemo,
  useState,
} from "react";
import TrackDialog from "../../shared/TrackDialog";
import StatusForm from "./StatusForm";
import { Status } from "../../../models/status";
import { showNotification } from "../../shared/notificationProvider";
import { statusService } from "../../../services/statusService/statusService";
import { useSearchParams } from "../../../hooks/useSearchParams";
import { getErrorMessage } from "../../../utils/axiosUtils";
import useRouterLocationStateForHelpPage from "hooks/useRouterLocationStateForHelpPage";
import { WORKPLAN_TAB } from "../constants";

interface StatusContextProps {
  openStatusForm: (status?: Status, clone?: boolean) => void;
  openApproveStatusDialog: (status: Status) => void;
  setShowStatusForm: Dispatch<SetStateAction<boolean>>;
  status?: Status | null;
  setStatus: Dispatch<SetStateAction<Status | undefined>>;
  onSave(data: any, callback: () => any): any;
  setShowApproveStatusDialog: Dispatch<SetStateAction<boolean>>;
  selectedHistoryIndex?: number;
  setSelectedHistoryIndex: Dispatch<SetStateAction<number>>;
  setIsCloning: Dispatch<SetStateAction<boolean>>;
  workId: string | null;
  isCloning: boolean;
  headingCaption?: string;
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
  selectedHistoryIndex: 0,
  setSelectedHistoryIndex: () => ({}),
  setIsCloning: () => ({}),
  isCloning: false,
  workId: null,
  openStatusForm: function (status?: Status, clone?: boolean): void {
    throw new Error("Function not implemented.");
  },
  openApproveStatusDialog: function (status: Status): void {
    throw new Error("Function not implemented.");
  },
});

export const StatusProvider = ({
  children,
  workId: propWorkId = null,
  refetchStatuses,
  headingCaption = "",
}: {
  children: JSX.Element | JSX.Element[];
  workId?: string | null;
  refetchStatuses?: () => void;
  headingCaption?: string;
}) => {
  const [showStatusForm, setShowStatusForm] = useState<boolean>(false);
  const [showApproveStatusDialog, setShowApproveStatusDialog] =
    useState<boolean>(false);
  const [isCloning, setIsCloning] = useState<boolean>(false);
  const [status, setStatus] = useState<Status>();
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number>(0);

  const query = useSearchParams<StatusContainerRouteParams>();
  const urlWorkId = useMemo(() => query.get("work_id"), [query]);
  const workId = propWorkId ?? urlWorkId;

  const openStatusForm = (s?: Status, clone: boolean = false) => {
    setStatus(s);
    setIsCloning(clone);
    setShowStatusForm(true);
  };

  const openApproveStatusDialog = (s: Status) => {
    setStatus(s);
    setShowApproveStatusDialog(true);
  };

  const onDialogClose = () => {
    setShowStatusForm(false);
    setIsCloning(false);
  };

  const updateStatus = async (data: any, callback: () => any) => {
    const { description, posted_date } = data;
    await statusService?.update(Number(workId), Number(status?.id), {
      description,
      posted_date,
    });
    showNotification(`Status details updated`, {
      type: "success",
    });
    setStatus(undefined);
    callback();
  };

  const createStatus = async (data: any, callback: () => any) => {
    const { description, posted_date } = data;
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
  };

  const onSave = async (data: any, callback: () => any) => {
    try {
      if (status && !isCloning) {
        updateStatus(data, callback);
      } else {
        createStatus(data, callback);
      }
      setIsCloning(false);
      setShowStatusForm(false);
      refetchStatuses?.();
    } catch (e) {
      const message = getErrorMessage(e);
      showNotification(message, {
        type: "error",
      });
    }
  };

  const closeApproveDialog = useCallback(() => {
    setShowApproveStatusDialog(false);
  }, []);

  const approveStatus = async () => {
    try {
      await statusService.approve(Number(workId), Number(status?.id));
      setShowApproveStatusDialog(false);
      showNotification(`Status approved`, {
        type: "success",
      });
      setStatus(undefined);
      refetchStatuses?.();
    } catch (e) {
      const message = getErrorMessage(e);
      showNotification(message, {
        type: "error",
      });
    }
  };

  const statusLabelCallback = useCallback(() => WORKPLAN_TAB.STATUS.label, []);
  useRouterLocationStateForHelpPage(statusLabelCallback);

  return (
    <StatusContext.Provider
      value={{
        openStatusForm,
        openApproveStatusDialog,
        setSelectedHistoryIndex,
        selectedHistoryIndex,
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
        dialogTitle={status?.id && !isCloning ? "Edit Status" : "Add Status"}
        subHeading={headingCaption}
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
        subHeading={headingCaption}
        isActionsRequired
        onCancel={closeApproveDialog}
        onOk={() => {
          approveStatus();
          refetchStatuses?.();
        }}
      />
    </StatusContext.Provider>
  );
};
