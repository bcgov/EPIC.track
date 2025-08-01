import { Box } from "@mui/material";
import StatusCardBody from "./StatusCardBody";
import StatusCardHeader from "./StatusCardHeader";
import { StalenessSettings } from "models/settings";
import { StatusDashboardItem } from "models/status";
import { StatusProvider } from "components/workPlan/status/StatusContext";
import { useContext } from "react";
import { MyStatusesContext } from "../MyStatusContext";

export interface StatusCardProps {
  item: StatusDashboardItem;
  statusStalenessSettings?: StalenessSettings;
}

const StatusCard = ({ item, statusStalenessSettings }: StatusCardProps) => {
  const { refetchStatuses } = useContext(MyStatusesContext);
  return (
    <Box
      sx={{
        border: `2px solid var(--neutral-background-dark, #DBDCDC)`,
        borderRadius: "4px",
      }}
    >
      <StatusCardHeader item={item} />
      <StatusProvider
        key={item.status?.id}
        headingCaption={String(item.work_name)}
        workId={String(item.work_id)}
        refetchStatuses={refetchStatuses}
      >
        <StatusCardBody
          item={item}
          statusStalenessSettings={statusStalenessSettings}
        />
      </StatusProvider>
    </Box>
  );
};

export default StatusCard;
