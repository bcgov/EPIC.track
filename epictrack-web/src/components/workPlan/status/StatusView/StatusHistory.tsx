import React from "react";
import { Box, Grid } from "@mui/material";
import { IconProps } from "../../../icons/type";
import Icons from "../../../icons";
import { StatusContext } from "../StatusContext";
import { WorkplanContext } from "../../WorkPlanContext";
import { useAppSelector } from "../../../../hooks";
import { Status } from "../../../../models/status";
import {
  ETCaption1,
  ETPreviewText,
  ETStatusHistoryDate,
} from "../../../shared";
import { Palette } from "../../../../styles/theme";
import moment from "moment";
import { dateUtils } from "../../../../utils";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";

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
        {statuses.map((status: Status, index) => (
          <Box sx={{ display: "flex", paddingTop: "16px" }}>
            <TimelineItem sx={{ width: "30%" }}>
              <TimelineSeparator>
                <TimelineDot
                  sx={{
                    backgroundColor: index === 0 ? Palette.success.light : "",
                  }}
                />
                <TimelineConnector
                  sx={{
                    backgroundColor: index === 0 ? Palette.success.light : "",
                  }}
                />
              </TimelineSeparator>
              <Box sx={{ display: "flex" }}>
                <TimelineContent>
                  <Box>
                    <ETStatusHistoryDate>
                      {dateUtils.formatDate(status?.posted_date, "YYYY-MM-DD")}
                    </ETStatusHistoryDate>
                  </Box>
                </TimelineContent>
              </Box>
            </TimelineItem>
            <Box sx={{ width: "70%" }}>
              <Box>
                <ETPreviewText color={Palette.neutral.dark}>
                  {status.description}
                </ETPreviewText>
              </Box>
              <Box sx={{ padding: "12px 8px" }}>
                <PencilEditIcon />
              </Box>
            </Box>
          </Box>
        ))}
      </Timeline>
    </Box>
  );
};

export default StatusHistory;
