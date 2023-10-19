import React, { Dispatch, SetStateAction, createContext } from "react";
import { MasterBase } from "../../models/type";
import ServiceBase from "../../services/common/serviceBase";
import TrackDialog from "./TrackDialog";
import { Backdrop, CircularProgress, SxProps } from "@mui/material";
import { showNotification } from "./notificationProvider";
import { COMMON_ERROR_MESSAGE } from "../../constants/application-constant";
import { getAxiosError } from "../../utils/axiosUtils";

interface MasterContextProps {
  backdrop: boolean;
  // error: string | undefined;
  title: string;
  data: MasterBase[];
  item?: MasterBase;
  id?: string;
  loading: boolean;
  setTitle: Dispatch<SetStateAction<string>>;
  setId: Dispatch<SetStateAction<string | undefined>>;
  setItem: Dispatch<SetStateAction<MasterBase | undefined>>;
  setShowDeleteDialog: Dispatch<SetStateAction<boolean>>;
  setShowModalForm: Dispatch<SetStateAction<boolean>>;
  getData: () => any;
  service?: ServiceBase;
  setService: Dispatch<SetStateAction<ServiceBase | undefined>>;
  onSave(data: any, callback: () => any): any;
  setForm: Dispatch<SetStateAction<React.ReactElement>>;
  setFormId: Dispatch<SetStateAction<string | undefined>>;
  onDialogClose(event: any, reason: any): any;
  setFormStyle: Dispatch<SetStateAction<SxProps | undefined>>;
}

export const MasterContext = createContext<MasterContextProps>({
  backdrop: false,
  // error: "",
  title: "Data",
  data: [],
  item: {},
  loading: false,
  setTitle: () => ({}),
  setId: () => ({}),
  setItem: () => ({}),
  setShowDeleteDialog: () => ({}),
  setShowModalForm: () => ({}),
  setService: () => ({}),
  onSave: (data: any, callback: () => any) => ({}),
  getData: () => ({}),
  setForm: () => ({}),
  setFormId: () => ({}),
  onDialogClose: (event: any, reason: any) => ({}),
  setFormStyle: () => ({}),
});

export const MasterProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  // const [error, setError] = React.useState<string | undefined>();
  const [title, setTitle] = React.useState("");
  const [data, setData] = React.useState<MasterBase[]>([]);
  const [item, setItem] = React.useState<MasterBase>();
  const [id, setId] = React.useState<string | undefined>();
  const [service, setService] = React.useState<ServiceBase>();
  const [backdrop, setBackdrop] = React.useState<boolean>(false);
  const [openAlertDialog, setOpenAlertDialog] = React.useState<boolean>(false);
  const [alertContentText, setAlertContentText] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] =
    React.useState<boolean>(false);
  const [form, setForm] = React.useState<React.ReactElement>(() => <></>);
  const [formId, setFormId] = React.useState<string | undefined>();
  const [showModalForm, setShowModalForm] = React.useState<boolean>(false);
  const [formStyle, setFormStyle] = React.useState<SxProps>();

  React.useEffect(() => {
    if (id && !showDeleteDialog) {
      getById(id);
    }
  }, [id, showDeleteDialog]);

  React.useEffect(() => {
    getData();
  }, [service]);

  const getData = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await service?.getAll();
      if (result && result.status === 200) {
        setData(result.data as MasterBase[]);
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      showNotification("Error loading data. Please try again after sometime", {
        type: "error",
      });
    }
  }, [service]);

  const getById = async (id: string) => {
    setBackdrop(true);
    try {
      const result = await service?.getById(id);
      if (result && result.status === 200) {
        setItem(result.data);
        setBackdrop(false);
      }
    } catch (e) {
      showNotification(
        "Error fetching the requested data. Please try again after some time",
        {
          type: "error",
        }
      );
      setBackdrop(false);
    }
  };

  const deleteItem = async (id?: string) => {
    const result = await service?.delete(id);
    if (result && result.status === 200) {
      setShowDeleteDialog(false);
      getData();
      setId(undefined);
    }
  };

  const onSave = React.useCallback(
    async (data: any, callback: () => any) => {
      setBackdrop(true);
      try {
        if (id) {
          const result = await service?.update(data, id);
          if (result && result.status === 200) {
            showNotification(`${title} details updated`, {
              type: "success",
            });
            setItem(undefined);
            setBackdrop(false);
            callback();
          }
        } else {
          const result = await service?.create(data);
          if (result && result.status === 201) {
            showNotification(`${title} details inserted`, {
              type: "success",
            });
            setBackdrop(false);
            callback();
          }
        }
        setShowModalForm(false);
        getData();
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
    [id, service, title]
  );

  const handleDelete = React.useCallback(() => {
    setShowDeleteDialog(false);
    setItem(undefined);
    setId(undefined);
  }, []);

  const onDialogClose = (event: any = undefined, reason: any = undefined) => {
    if (reason && reason == "backdropClick") return;
    setShowModalForm(false);
    setId(undefined);
    setItem(undefined);
  };

  return (
    <MasterContext.Provider
      value={{
        backdrop,
        title,
        setTitle,
        data,
        item,
        loading,
        setId,
        setItem,
        setShowDeleteDialog,
        setShowModalForm,
        setService,
        onSave,
        getData,
        setForm,
        setFormId,
        onDialogClose,
        setFormStyle,
      }}
    >
      {children}
      <TrackDialog
        open={openAlertDialog}
        dialogTitle={"Success"}
        dialogContentText={alertContentText}
        isActionsRequired
        isCancelRequired={false}
        isOkRequired
        onOk={() => {
          setOpenAlertDialog(false);
          onDialogClose();
        }}
      />
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}
        open={backdrop}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <TrackDialog
        open={showDeleteDialog}
        dialogTitle="Delete Confirmation"
        dialogContentText={`Are you sure you want to delete this ${title}?`}
        okButtonText="Delete"
        cancelButtonText="Cancel"
        isActionsRequired
        onCancel={() => handleDelete()}
        onOk={() => deleteItem(id)}
      />
      <TrackDialog
        open={showModalForm}
        dialogTitle={(id ? "Update " : "Create ") + title}
        onClose={(event, reason) => onDialogClose(event, reason)}
        disableEscapeKeyDown
        fullWidth
        maxWidth="md"
        okButtonText="Save"
        cancelButtonText="Cancel"
        isActionsRequired
        onCancel={() => onDialogClose()}
        formId={formId}
        // onOk={() => deleteItem(id)}
        sx={formStyle}
      >
        {form}
      </TrackDialog>
    </MasterContext.Provider>
  );
};
