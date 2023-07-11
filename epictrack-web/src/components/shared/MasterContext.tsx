import React, { Dispatch, SetStateAction, createContext } from "react";
import { MasterBase } from "../../models/type";
import ServiceBase from "../../services/common/serviceBase";
import TrackDialog from "./TrackDialog";
import { Backdrop, CircularProgress } from "@mui/material";

interface MasterContextProps {
  backdrop: boolean;
  error: string | undefined;
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
  onDialogClose(event: any, reason: any): any;
}

export const MasterContext = createContext<MasterContextProps>({
  backdrop: false,
  error: "",
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
  onDialogClose: (event: any, reason: any) => ({}),
});

export const MasterProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [error, setError] = React.useState<string | undefined>();
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
  const [showModalForm, setShowModalForm] = React.useState<boolean>(false);

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
      setError("Error loading data. Please try again after sometime");
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
      setError(
        "Error fetching the requested data. Please try again after some time"
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
            setAlertContentText(`${title} details updated`);
            setOpenAlertDialog(true);
            setBackdrop(false);
            callback();
          }
        } else {
          const result = await service?.create(data);
          if (result && result.status === 201) {
            setAlertContentText(`${title} details inserted`);
            setOpenAlertDialog(true);
            setBackdrop(false);
            callback();
          }
        }
        getData();
      } catch (e) {
        setError("Error during processing. Please try again later");
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
    setError(undefined);
  };

  return (
    <MasterContext.Provider
      value={{
        backdrop,
        error,
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
        onDialogClose,
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
        dialogTitle="Delete"
        dialogContentText="Are you sure you want to delete?"
        okButtonText="Yes"
        cancelButtonText="No"
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
      >
        {form}
      </TrackDialog>
    </MasterContext.Provider>
  );
};
