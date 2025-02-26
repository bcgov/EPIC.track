import { useContext } from "react";
import { Box, Grid } from "@mui/material";
import { useAppSelector } from "hooks";
import { hasPermission } from "components/shared/restricted";
import NoDataEver from "../../../shared/NoDataEver";
import WarningBox from "../../../shared/warningBox";
import { isStatusOutOfDate } from "../shared";
import { WorkplanContext } from "../../WorkPlanContext";
import { StatusContext } from "../StatusContext";
import RecentStatus from "./RecentStatus";
import StatusHistory from "./StatusHistory";
import { ROLES } from "constants/application-constant";

const StatusView = () => {
  const { isActiveTeamMember, statuses, work } = useContext(WorkplanContext);
  const { setShowStatusForm } = useContext(StatusContext);

  const { roles: currentRoles } = useAppSelector(
    (state) => state.user.userDetail
  );
  const canAddStatus =
    isActiveTeamMember ||
    hasPermission({
      roles: currentRoles,
      allowed: [ROLES.CREATE],
    });

  const onAddButtonClickHandler = () => {
    setShowStatusForm(true);
  };

  const latestApprovedStatus = statuses.find((status) => status.is_approved);
  const statusOutOfDate =
    !work?.is_complete && isStatusOutOfDate(latestApprovedStatus);

  return (
    <>
      {statuses.length === 0 && (
        <NoDataEver
          title="You don't have any Statuses yet"
          subTitle="Create your first Status"
          addNewButtonText="Add Status"
          onAddNewClickHandler={() => onAddButtonClickHandler()}
          addButtonProps={{
            disabled: !canAddStatus,
          }}
        />
      )}
      {statusOutOfDate && (
        <Box sx={{ paddingBottom: "16px" }}>
          <WarningBox
            title="The Work status is out of date"
            subTitle="Please provide an updated status"
            isTitleBold={true}
          />
        </Box>
      )}
      {statuses.length > 0 && (
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <RecentStatus />
          </Grid>
          <Grid item xs={6}>
            <StatusHistory />
          </Grid>
        </Grid>
      )}
    </>
  );
};

export default StatusView;
