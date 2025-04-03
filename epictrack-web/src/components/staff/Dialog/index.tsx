import { useCallback, useState, useEffect } from "react";
import TrackDialog from "components/shared/TrackDialog";
import { showNotification } from "components/shared/notificationProvider";
import { Staff } from "models/staff";
import staffService from "services/staffService/staffService";
import StaffForm from "../StaffForm";
import { useAppSelector } from "hooks";
import { ROLES } from "constants/application-constant";

type StaffDialogProps = {
  open: boolean;
  saveStaffCallback?: () => void;
  setOpen: (open: boolean) => void;
  staffId?: number;
};

export const StaffDialog = ({
  open,
  saveStaffCallback = () => {
    return;
  },
  setOpen,
  staffId,
}: StaffDialogProps) => {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [disableSave, setDisableSave] = useState(false);
  const { roles } = useAppSelector((state) => state.user.userDetail);
  const canEdit = roles.includes(ROLES.EDIT);

  const fetchStaff = useCallback(async () => {
    if (!staffId) return;
    try {
      const response = await staffService.getById(String(staffId));
      setStaff(response.data);
    } catch (error) {
      showNotification("Could not load Staff", { type: "error" });
    }
  }, [staffId]);

  const saveStaff = async (data: any) => {
    try {
      if (staffId) {
        await staffService.update(data, String(staffId));
        showNotification("Staff updated successfully", { type: "success" });
      } else {
        await staffService.create(data);
        showNotification("Staff created successfully", { type: "success" });
      }
      setOpen(false);
      saveStaffCallback();
    } catch (error) {
      showNotification("Could not save Staff", { type: "error" });
    }
  };

  useEffect(() => {
    if (open) fetchStaff();
  }, [fetchStaff, open]);

  return (
    <TrackDialog
      open={open}
      dialogTitle={staffId ? staff?.full_name || "Edit Staff" : "Create Staff"}
      onClose={() => {
        setOpen(false);
        setStaff(null);
      }}
      disableEscapeKeyDown
      fullWidth
      maxWidth="lg"
      okButtonText="Save"
      cancelButtonText="Cancel"
      isActionsRequired
      onCancel={() => {
        setOpen(false);
        setStaff(null);
      }}
      formId="staff-form"
      saveButtonProps={{
        disabled: !canEdit || disableSave,
      }}
    >
      <StaffForm
        fetchStaff={fetchStaff}
        saveStaff={saveStaff}
        setDisableDialogSave={setDisableSave}
        staff={staff}
      />
    </TrackDialog>
  );
};
