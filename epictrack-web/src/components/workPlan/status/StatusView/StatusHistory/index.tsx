import React, { useState } from "react";
import { Box, Button, Grid } from "@mui/material";
import { IconProps } from "../../../../icons/type";
import Icons from "../../../../icons";
import { StatusContext } from "../../StatusContext";
import { WorkplanContext } from "../../../WorkPlanContext";
import { useAppSelector } from "../../../../../hooks";
import { Status } from "../../../../../models/status";
import {
  ETCaption1,
  ETPreviewText,
  ETStatusHistoryDate,
} from "../../../../shared";
import { Palette } from "../../../../../styles/theme";
import moment from "moment";
import { dateUtils } from "../../../../../utils";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import HistoryItem from "./HistoryItem";
import { If, Then } from "react-if";

const PencilEditIcon: React.FC<IconProps> = Icons["PencilEditIcon"];

const StatusHistory = () => {
  const { statuses } = React.useContext(WorkplanContext);
  //   const { } = React.useContext(StatusContext);
  const { position } = useAppSelector((state) => state.user.userDetail);

  return (
    <Box sx={{ width: "50%" }}>
      <ETCaption1 bold sx={{ letterSpacing: "0.39px", paddingBottom: "16px" }}>
        STATUS HISTORY
      </ETCaption1>
      <Timeline position="left">
        {statuses
          //   .filter((status: Status) => {
          //   if (statuses[0]?.is_approved) {
          //     if (status.id === statuses[0].id) {
          //       return false;
          //     }
          //   }
          // return status?.is_approved;
          //   })
          .map((status: Status, index) => (
            <If condition={status.is_approved && statuses[0].id !== status.id}>
              <Then>
                <HistoryItem status={status} index={index} />
              </Then>
            </If>
          ))}
      </Timeline>
    </Box>
  );
};

export default StatusHistory;
