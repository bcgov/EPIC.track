import TrackDialog from "components/shared/TrackDialog";
import { createContext, Dispatch, useEffect, useState } from "react";
import MinistryForm from "./MinistryForm";
import { getErrorMessage } from "utils/axiosUtils";
import { showNotification } from "components/shared/notificationProvider";
import { Ministry } from "models/ministry";
import ministryService from "services/ministryService";
import { Staff } from "models/staff";
import staffService from "services/staffService/staffService";
import { POSITION_ENUM } from "models/position";
import { ROLES } from "constants/application-constant";
import { hasPermission } from "components/shared/restricted";
import { useAppSelector } from "hooks";

interface SpecialHistoryContextProps {
  createMinistryDialogOpen: boolean;
  setCreateMinistryDialogOpen: Dispatch<React.SetStateAction<boolean>>;
  onSave(data: any, callback: () => any): any;
  ministry: Ministry | null;
  setMinistry: Dispatch<React.SetStateAction<Ministry | null>>;
  ministers: Staff[];
  ministries: Ministry[];
  getMinistries: () => any;
}

export const SpecialHistoryContext = createContext<SpecialHistoryContextProps>({
  createMinistryDialogOpen: false,
  setCreateMinistryDialogOpen: () => {},
  onSave: (data: any, callback: () => any) => ({}),
  ministry: null,
  setMinistry: () => {},
  ministers: [],
  ministries: [],
  getMinistries: () => {},
});

export const SpecialHistoryProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [createMinistryDialogOpen, setCreateMinistryDialogOpen] =
    useState(false);
  const [ministry, setMinistry] = useState<Ministry | null>(null);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [ministers, setMinisters] = useState<Staff[]>([]);
  const { roles } = useAppSelector((state) => state.user.userDetail);
  const canEdit = hasPermission({ roles, allowed: [ROLES.MANAGE_USERS] });
  const [disableSave, setDisableSave] = useState(!canEdit);

  const onSave = async (data: any, callback: () => any) => {
    try {
      if (ministry) {
        // update
        await ministryService.update(data, ministry.id);
        showNotification("Ministry updated successfully", {
          type: "success",
        });
      } else {
        // create
        await ministryService.create(data);
        showNotification("Ministry created successfully", {
          type: "success",
        });
      }
    } catch (e) {
      const message = getErrorMessage(e);
      showNotification(message, {
        type: "error",
      });
    }
    setMinistry(null);
    setCreateMinistryDialogOpen(false);
    getMinistries();
  };

  const getMinisters = async () => {
    const ministerResults = await staffService.getStaffByPosition(
      POSITION_ENUM.MINISTER.toString()
    );

    if (ministerResults.status == 200) {
      setMinisters(ministerResults.data as Staff[]);
    }
  };

  const getMinistries = async () => {
    const ministryResult = await ministryService.getAll();
    if (ministryResult.status === 200) {
      setMinistries(ministryResult.data as Ministry[]);
    }
  };

  useEffect(() => {
    getMinisters(); // staff members with role of minister
    getMinistries();
  }, []);

  useEffect(() => {
    if (!ministry) return;
    const selectedMinistry = ministries.find((m) => m.id === ministry.id);
    if (selectedMinistry) setMinistry(selectedMinistry);
  }, [ministries]);

  return (
    <SpecialHistoryContext.Provider
      value={{
        createMinistryDialogOpen,
        setCreateMinistryDialogOpen,
        onSave,
        ministry,
        setMinistry,
        ministers,
        ministries,
        getMinistries,
      }}
    >
      {children}
      <TrackDialog
        open={createMinistryDialogOpen}
        dialogTitle={ministry ? "Update Ministry" : "Create New Ministry"}
        disableEscapeKeyDown
        fullWidth
        maxWidth="lg"
        okButtonText="Save"
        formId="ministry-form"
        onCancel={() => {
          setCreateMinistryDialogOpen(false);
          setMinistry(null);
        }}
        saveButtonProps={{
          disabled: disableSave,
        }}
        isActionsRequired
      >
        <MinistryForm setDisableDialogSave={setDisableSave} />
      </TrackDialog>
    </SpecialHistoryContext.Provider>
  );
};
