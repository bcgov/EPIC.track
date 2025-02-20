import { useCallback, useEffect, useState } from "react";
import TrackDialog from "components/shared/TrackDialog";
import { showNotification } from "components/shared/notificationProvider";
import { Proponent } from "models/proponent";
import proponentService from "services/proponentService/proponentService";
import ProponentForm from "../ProponentForm";

type ProponentDialogProps = {
  open: boolean;
  proponentId?: number;
  saveProponentCallback?: () => void;
  setOpen: (open: boolean) => void;
};

export const ProponentDialog = ({
  proponentId,
  open,
  setOpen,
  saveProponentCallback = () => {},
}: ProponentDialogProps) => {
  const [proponent, setProponent] = useState<Proponent | null>(null);
  const [disableSave, setDisableSave] = useState(false);

  const fetchProponent = useCallback(async () => {
    if (!proponentId) return;
    try {
      const response = await proponentService.getById(String(proponentId));
      setProponent(response.data);
    } catch (error) {
      showNotification("Could not load Proponent", { type: "error" });
    }
  }, [proponentId]);

  const saveProponent = async (data: any) => {
    try {
      if (proponentId) {
        await proponentService.update(data, String(proponentId));
        showNotification("Proponent updated successfully", { type: "success" });
      } else {
        await proponentService.create(data);
        showNotification("Proponent created successfully", { type: "success" });
      }
      setOpen(false);
      saveProponentCallback();
    } catch (error) {
      showNotification("Could not save Proponent", { type: "error" });
    }
  };

  useEffect(() => {
    if (open) fetchProponent();
  }, [fetchProponent, open]);

  return (
    <TrackDialog
      open={open}
      dialogTitle={
        proponentId ? proponent?.name || "Edit Proponent" : "Create Proponent"
      }
      onClose={() => {
        setProponent(null);
        setOpen(false);
      }}
      disableEscapeKeyDown
      fullWidth
      maxWidth="lg"
      okButtonText="Save"
      cancelButtonText="Cancel"
      isActionsRequired
      onCancel={() => {
        setProponent(null);
        setOpen(false);
      }}
      formId="proponent-form"
      saveButtonProps={{ disabled: disableSave }}
    >
      <ProponentForm
        proponent={proponent}
        saveProponent={saveProponent}
        setDisableDialogSave={setDisableSave}
      />
    </TrackDialog>
  );
};
