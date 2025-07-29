import { Box } from "@mui/material";
import StatusCardBody from "./StatusCardBody";
import StatusCardHeader from "./StatusCardHeader";
import { StalenessSettings } from "models/settings";
import { StatusDashboardItem } from "models/status";
import { StatusProvider } from "components/workPlan/status/StatusContext";
import { useContext } from "react";
import { MyStatusesContext } from "../MyStatusContext";

export interface StatusCardProps {
  status: StatusDashboardItem;
  statusStalenessSettings?: StalenessSettings;
}

const StatusCard = ({ status, statusStalenessSettings }: StatusCardProps) => {
  const { refetchStatuses } = useContext(MyStatusesContext);
  return (
    <Box
      sx={{
        border: `2px solid var(--neutral-background-dark, #DBDCDC)`,
        borderRadius: "4px",
      }}
    >
      <StatusCardHeader status={status} />
      <StatusProvider
        key={status.status?.id}
        headingCaption={String(status.work_name)}
        workId={String(status.work_id)}
        refetchStatuses={refetchStatuses}
      >
        <StatusCardBody
          status={status}
          statusStalenessSettings={statusStalenessSettings}
        />
      </StatusProvider>
    </Box>
  );
};

export default StatusCard;
