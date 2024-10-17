import React, { Dispatch, SetStateAction, createContext } from "react";
import { MasterBase } from "../../models/type";
import ServiceBase from "../../services/common/serviceBase";
import TrackDialog, { TrackDialogProps } from "./TrackDialog";
import { DialogProps, SxProps } from "@mui/material";
import { showNotification } from "./notificationProvider";
import { getErrorMessage } from "../../utils/axiosUtils";
import { Restricted } from "./restricted";
import { ROLES } from "../../constants/application-constant";

interface MasterContextProps {
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
  getById: (id: string) => Promise<void>;
  setDialogProps: Dispatch<SetStateAction<Partial<TrackDialogProps>>>;
}

export const MasterContext = createContext<MasterContextProps>({
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
  getById: async (id: string) => {
    return Promise.resolve();
  },
  setDialogProps: () => ({}),
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
  const [openAlertDialog, setOpenAlertDialog] = React.useState<boolean>(false);
  const [alertContentText, setAlertContentText] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] =
    React.useState<boolean>(false);
  const [form, setForm] = React.useState<React.ReactElement>(() => <></>);
  const [formId, setFormId] = React.useState<string | undefined>();
  const [showModalForm, setShowModalForm] = React.useState<boolean>(false);
  const [formStyle, setFormStyle] = React.useState<SxProps>();
  const [dialogProps, setDialogProps] = React.useState<
    Partial<TrackDialogProps>
  >({});

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
    try {
      const result = await service?.getById(id);
      if (result && result.status === 200) {
        setItem(result.data);
      }
    } catch (e) {
      showNotification(
        "Error fetching the requested data. Please try again after some time",
        {
          type: "error",
        }
      );
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
      try {
        if (id) {
          const result = await service?.update(data, id);
          if (result && result.status === 200) {
            showNotification(`${title} details updated`, {
              type: "success",
            });
            setItem(undefined);
            setId(undefined);
            callback();
          }
        } else {
          const result = await service?.create(data);
          if (result && result.status === 201) {
            showNotification(`${title} details inserted`, {
              type: "success",
            });
            callback();
          }
        }
        setShowModalForm(false);
        getData();
      } catch (e) {
        const message = getErrorMessage(e);
        showNotification(message, {
          type: "error",
        });
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
        getById,
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
        setDialogProps,
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
      <Restricted allowed={[ROLES.EDIT]}>
        <TrackDialog
          open={showModalForm}
          dialogTitle={title ? title : id ? "Update " : "Create "}
          onClose={(event, reason) => onDialogClose(event, reason)}
          disableEscapeKeyDown
          fullWidth
          maxWidth="lg"
          okButtonText="Save"
          cancelButtonText="Cancel"
          isActionsRequired
          onCancel={() => onDialogClose()}
          formId={formId}
          // onOk={() => deleteItem(id)}
          sx={formStyle}
          {...dialogProps}
        >
          {form}
        </TrackDialog>
      </Restricted>
    </MasterContext.Provider>
  );
};
