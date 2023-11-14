import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import { Box } from "@mui/system";
import moment from "moment";
import { ETPreviewText } from "../../../../shared";
import { Status } from "../../../../../models/status";
import { Palette } from "../../../../../styles/theme";
import { Button, Typography, styled } from "@mui/material";
import React, { useContext, useState } from "react";
import { IconProps } from "../../../../icons/type";
import Icons from "../../../../icons";
import { StatusContext } from "../../StatusContext";
import { WorkplanContext } from "../../../WorkPlanContext";
import { If, Then } from "react-if";
import ReadMoreText from "../../../../shared/ReadMoreText";

const PencilEditIcon: React.FC<IconProps> = Icons["PencilEditIcon"];

type HistoryItemProps = {
  status: Status;
};

const ETStatusHistoryDate = styled(Typography)(() => ({
  fontSize: "12px",
  fontStyle: "normal",
  fontWeight: "400",
  lineHeight: "16px",
}));

const HistoryItem = ({ status }: HistoryItemProps) => {
  const {
    selectedHistoryIndex,
    setSelectedHistoryIndex,
    hasPermission,
    setShowStatusForm,
    setStatus,
  } = useContext(StatusContext);
  const { statuses } = useContext(WorkplanContext);
  const [statusHighlight, setStatusHighlight] = useState<number>(0);

  React.useEffect(() => {
    if (!statuses[0].is_approved) {
      setStatusHighlight(statuses[1].id);
    }
    setSelectedHistoryIndex(statuses[1].id);
  }, [statuses]);

  return (
    <Box sx={{ display: "flex", paddingTop: "16px" }}>
      <TimelineItem sx={{ width: "30%" }}>
        <TimelineSeparator>
          <TimelineDot
            sx={{
              backgroundColor:
                statusHighlight === status.id ? Palette.success.light : "",
            }}
          />
          <TimelineConnector
            sx={{
              backgroundColor:
                statusHighlight === status.id ? Palette.success.light : "",
            }}
          />
        </TimelineSeparator>
        <Box sx={{ display: "flex" }}>
          <TimelineContent>
            <Box>
              <ETStatusHistoryDate>
                {moment(status.posted_date).format("MMM.DD YYYY")}
              </ETStatusHistoryDate>
            </Box>
          </TimelineContent>
        </Box>
      </TimelineItem>
      <Box sx={{ width: "70%" }}>
        <Box>
          <ETPreviewText
            color={
              status.id === selectedHistoryIndex
                ? Palette.neutral.dark
                : Palette.neutral.main
            }
          >
            <ReadMoreText>{status?.description}</ReadMoreText>
            <If condition={hasPermission() && statusHighlight === status.id}>
              <Then>
                <Button
                  onClick={() => {
                    setShowStatusForm(true);
                    setStatus(status);
                  }}
                  sx={{
                    padding: "12px 8px",
                    gap: "8px",
                    backgroundColor: "inherit",
                    borderColor: "transparent",
                  }}
                >
                  <PencilEditIcon />
                  Edit
                </Button>
              </Then>
            </If>
          </ETPreviewText>
        </Box>
      </Box>
    </Box>
  );
};

export default HistoryItem;
