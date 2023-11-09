import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import { Box } from "@mui/system";
import moment from "moment";
import { ETStatusHistoryDate, ETPreviewText } from "../../../../shared";
import { Status } from "../../../../../models/status";
import { Palette } from "../../../../../styles/theme";
import { Button } from "@mui/material";
import React, { useContext, useState } from "react";
import { IconProps } from "../../../../icons/type";
import Icons from "../../../../icons";
import { StatusContext } from "../../StatusContext";
import { WorkplanContext } from "../../../WorkPlanContext";

const PencilEditIcon: React.FC<IconProps> = Icons["PencilEditIcon"];

type HistoryItemProps = {
  status: Status;
  index: number;
};

const HistoryItem = ({ status, index }: HistoryItemProps) => {
  const { selectedHistoryIndex, setSelectedHistoryIndex } =
    useContext(StatusContext);
  const { statuses } = useContext(WorkplanContext);
  const [statusHighlight, setStatusHighlight] = useState<number>(0);

  React.useEffect(() => {
    if (!statuses[0].is_approved) {
      setStatusHighlight(statuses[1].id);
    }
    setSelectedHistoryIndex(statuses[1].id);
  }, [statuses]);

  console.log(selectedHistoryIndex);

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
                {moment(status.posted_date).format("L")}
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
            {status.id === selectedHistoryIndex ? (
              <Box>{status.description}</Box>
            ) : (
              <Box>
                {status.description.slice(0, 50)}...
                <Button
                  onClick={() => setSelectedHistoryIndex(status.id)}
                  sx={{
                    paddingBottom: 2,
                    ":hover": {
                      backgroundColor: Palette.white,
                      borderColor: Palette.white,
                    },
                  }}
                >
                  Read More
                </Button>
              </Box>
            )}
          </ETPreviewText>
        </Box>
        {statusHighlight === status.id && (
          <Box sx={{ padding: "12px 8px" }}>
            <PencilEditIcon />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default HistoryItem;
