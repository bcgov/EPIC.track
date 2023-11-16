import React from "react";
import { Box, Button } from "@mui/material";
import { WorkplanContext } from "../../../WorkPlanContext";
import { Status } from "../../../../../models/status";
import { ETCaption1, ETCaption2 } from "../../../../shared";
import Timeline from "@mui/lab/Timeline";
import HistoryItem from "./HistoryItem";
import { Else, If, Then } from "react-if";
import { IconProps } from "../../../../icons/type";
import Icons from "../../../../icons";
import { Palette } from "../../../../../styles/theme";

const ExpandIcon: React.FC<IconProps> = Icons["ExpandIcon"];
const CollapseIcon: React.FC<IconProps> = Icons["CollapseIcon"];

const HISTORY_DISPLAY_LIMIT = 3;

const StatusHistory = () => {
  const { statuses } = React.useContext(WorkplanContext);
  const [indexLimit, setIndexLimit] = React.useState<boolean>(true);

  const displayLimit = (index: number) => {
    if (indexLimit && index > HISTORY_DISPLAY_LIMIT) {
      return false;
    }
    return true;
  };

  return (
    <Box>
      <ETCaption1 bold sx={{ letterSpacing: "0.39px", paddingBottom: "16px" }}>
        STATUS HISTORY
      </ETCaption1>
      <Timeline position="left" sx={{ overflowY: "scroll", flex: 1 }}>
        {statuses.map((status: Status, index: number) => (
          <If
            condition={
              status.is_approved &&
              statuses[0].id !== status.id &&
              displayLimit(index)
            }
          >
            <Then>
              <HistoryItem status={status} />
            </Then>
          </If>
        ))}
        <Button
          onClick={() => setIndexLimit(!indexLimit)}
          sx={{
            gap: "8px",
            width: "150px",
            marginLeft: 12,
          }}
        >
          <If
            condition={
              indexLimit &&
              statuses.filter((status: Status) => {
                return status.is_approved;
              }).length > 4
            }
          >
            <Then>
              <ExpandIcon />
              <ETCaption2 bold> Show More</ETCaption2>
            </Then>
          </If>
          <If
            condition={
              !indexLimit &&
              statuses.filter((status: Status) => {
                return status.is_approved;
              }).length > 4
            }
          >
            <Then>
              <ExpandIcon />
              <ETCaption2 bold> Show Less</ETCaption2>
            </Then>
          </If>
        </Button>
      </Timeline>
    </Box>
  );
};

export default StatusHistory;
