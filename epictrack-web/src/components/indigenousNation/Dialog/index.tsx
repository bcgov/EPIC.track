import { useCallback, useEffect, useState } from "react";
import TrackDialog from "components/shared/TrackDialog";
import { showNotification } from "components/shared/notificationProvider";
import { FirstNation } from "models/firstNation";
import indigenousNationService from "services/indigenousNationService/indigenousNationService";
import IndiginousNationForm from "../IndigenousNationForm";

type NationDialogProps = {
  firstNationId?: number;
  open: boolean;
  saveFirstNationCallback?: () => void;
  setOpen: (open: boolean) => void;
};

export const FirstNationDialog = ({
  firstNationId,
  open,
  saveFirstNationCallback = () => {},
  setOpen,
}: NationDialogProps) => {
  const [firstNation, setFirstNation] = useState<FirstNation | null>(null);

  const fetchFirstNation = useCallback(async () => {
    if (!firstNationId) return;
    try {
      const response = await indigenousNationService.getById(
        String(firstNationId),
      );
      setFirstNation(response.data);
    } catch (error) {
      showNotification("Could not load First Nation", { type: "error" });
    }
  }, [firstNationId]);

  const saveFirstNation = async (data: any) => {
    try {
      if (firstNationId) {
        await indigenousNationService.update(data, String(firstNationId));
        showNotification("First Nation updated successfully", {
          type: "success",
        });
      } else {
        await indigenousNationService.create(data);
        showNotification("First Nation created successfully", {
          type: "success",
        });
      }
      setOpen(false);
      saveFirstNationCallback();
    } catch (error) {
      showNotification("Could not save First Nation", { type: "error" });
    }
  };

  useEffect(() => {
    if (open) fetchFirstNation();
  }, [fetchFirstNation, open]);

  return (
    <TrackDialog
      open={open}
      dialogTitle={
        firstNationId
          ? firstNation?.name || "Edit First Nation"
          : "Create First Nation"
      }
      onClose={() => {
        setOpen(false);
        setFirstNation(null);
      }}
      disableEscapeKeyDown
      fullWidth
      maxWidth="lg"
      okButtonText="Save"
      cancelButtonText="Cancel"
      isActionsRequired
      onCancel={() => {
        setOpen(false);
        setFirstNation(null);
      }}
      formId="first-nation-form"
    >
      <IndiginousNationForm
        firstNation={firstNation}
        saveFirstNation={saveFirstNation}
      />
    </TrackDialog>
  );
};
