import { FC, SetStateAction, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Grid } from "@mui/material";
import { useAppSelector } from "hooks";
import { ROLES } from "constants/application-constant";
import { IconProps } from "../../../icons/type";
import Icons from "../../../icons";
import { hasPermission } from "components/shared/restricted";
import RecentStatus from "components/workPlan/status/StatusView/RecentStatus";
import StatusHistory from "components/workPlan/status/StatusView/StatusHistory";
import { WORKPLAN_TAB } from "components/workPlan/constants";
import { StatusContext } from "components/workPlan/status/StatusContext";
import { Status } from "models/status";
import EmptyCardBody from "./EmptyCardBody";
import { StatusCardProps } from ".";
import { MyStatusesContext } from "../MyStatusContext";

const GoToIcon: FC<IconProps> = Icons["GoToIcon"];

const StatusCardBody = ({ item }: StatusCardProps) => {
  const {
    setStatus,
    setShowStatusForm,
    setShowApproveStatusDialog,
    setIsCloning,
  } = useContext(StatusContext);
  const status = item;
  const { userWorkIds } = useContext(MyStatusesContext);
  const navigate = useNavigate();
  const { roles: currentRoles } = useAppSelector(
    (state) => state.user.userDetail
  );

  const isActiveTeamMember = userWorkIds?.includes(status.work_id);

  const handleHistoryClick = () => {
    navigate(`/work-plan?work_id=${status.work_id}`, {
      state: { tabIndex: WORKPLAN_TAB.STATUS.index },
    });
  };

  const onEdit = (status: SetStateAction<Status | undefined>) => {
    setStatus(status);
    setShowStatusForm(true);
  };

  const onApprove = (status: SetStateAction<Status | undefined>) => {
    setStatus(status);
    setShowApproveStatusDialog(true);
  };

  const onClone = (status: SetStateAction<Status | undefined>) => {
    setStatus(status);
    setIsCloning(true);
    setShowStatusForm(true);
  };

  const onAdd = () => {
    setShowStatusForm(true);
  };

  return (
    <Grid
      container
      sx={{
        padding: "16px",
        height: "412px",
        overflowY: "auto",
      }}
      direction="column"
      justifyContent="flex-start"
      alignItems="flex-start"
      gap={2}
    >
      {status.status === null && <EmptyCardBody onAddClick={onAdd} />}

      {status.status && (
        <Grid item container xs={12}>
          <Grid item xs={12}>
            <RecentStatus
              statuses={status.status_history}
              isActiveTeamMember={isActiveTeamMember || false}
              userHasRole={hasPermission({
                roles: currentRoles,
                allowed: [ROLES.EDIT, ROLES.CREATE],
              })}
              onEdit={onEdit}
              onApprove={onApprove}
              onClone={onClone}
              showStalenessIcon={true}
            />
          </Grid>
          <Grid item xs={12}>
            <StatusHistory
              statuses={status.status_history}
              defaultExpanded={false}
              showEdit={false}
              showOne={true}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              onClick={handleHistoryClick}
              variant="text"
              startIcon={<GoToIcon style={{ height: "10px" }} />}
              sx={{
                fontSize: "0.875rem",
                textTransform: "none",
                minWidth: "unset",
              }}
            >
              Open Full History
            </Button>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

export default StatusCardBody;
