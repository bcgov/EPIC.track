import React, { useContext } from "react";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import { WorkIssue } from "../../../../models/Issue";
import moment from "moment";
import { Palette } from "../../../../styles/theme";
import { ETCaption3, ETPreviewText } from "../../../shared";
import ReadMoreText from "../../../shared/ReadMoreText";
import TimelineContent, {
  timelineContentClasses,
} from "@mui/lab/TimelineContent";
import { MONTH_DAY_YEAR } from "../../../../constants/application-constant";

const IssueHistory = ({ issue }: { issue: WorkIssue }) => {
  const latestUpdate = issue.updates[0];
  const subsequentUpdates = issue.updates.slice(1);

  const highlightFirstInTimeLineApproved = !latestUpdate.is_approved;
  return (
    <Timeline
      position="left"
      sx={{
        [`& .${timelineContentClasses.root}`]: {
          flex: "initial",
          paddingLeft: 0,
        },
        margin: 0,
        paddingLeft: 0,
      }}
    >
      {subsequentUpdates.map((update, index) => {
        const isSuccess = highlightFirstInTimeLineApproved && index === 0;
        return (
          <TimelineItem>
            <TimelineOppositeContent>
              <ETPreviewText
                color={isSuccess ? Palette.neutral.dark : Palette.neutral.main}
              >
                <ReadMoreText>{update.description}</ReadMoreText>
              </ETPreviewText>
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot
                sx={[
                  isSuccess && {
                    bgcolor: Palette.success.light,
                  },
                ]}
              />
              <TimelineConnector
                sx={[
                  isSuccess && {
                    bgcolor: Palette.success.light,
                  },
                ]}
              />
            </TimelineSeparator>
            <TimelineContent>
              <ETCaption3 color={Palette.neutral.main}>
                {moment(issue.created_at).format(MONTH_DAY_YEAR)}
              </ETCaption3>
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
};

export default IssueHistory;
