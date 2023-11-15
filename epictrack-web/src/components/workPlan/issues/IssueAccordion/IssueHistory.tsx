import React, { useContext, useState } from "react";
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
import { Button, Collapse, Grid } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { When } from "react-if";
import { IconProps } from "../../../icons/type";
import icons from "../../../icons";
import { IssuesContext } from "../IssuesContext";

const IssueHistory = ({ issue }: { issue: WorkIssue }) => {
  const { setUpdateToEdit, setShowIssuesForm } = useContext(IssuesContext);

  const [expand, setExpand] = useState(false);

  const latestUpdate = issue.updates[0];
  const subsequentUpdates = issue.updates.slice(1);
  const highlightFirstInTimeLineApproved = !latestUpdate.is_approved;
  const PencilEditIcon: React.FC<IconProps> = icons["PencilEditIcon"];

  const SHOW_MORE_THRESHOLD = 3;

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
      {subsequentUpdates.slice(0, SHOW_MORE_THRESHOLD).map((update, index) => {
        const isSuccess = highlightFirstInTimeLineApproved && index === 0;
        return (
          <TimelineItem>
            <TimelineOppositeContent>
              <ETPreviewText
                color={isSuccess ? Palette.neutral.dark : Palette.neutral.main}
              >
                <ReadMoreText>{update.description}</ReadMoreText>
              </ETPreviewText>
              <When condition={isSuccess}>
                <Button
                  variant="text"
                  startIcon={<PencilEditIcon />}
                  sx={{
                    backgroundColor: "inherit",
                    borderColor: "transparent",
                  }}
                  onClick={() => {
                    setUpdateToEdit(update);
                    setShowIssuesForm(true);
                  }}
                >
                  Edit
                </Button>
              </When>
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
                {moment(issue.created_at).format("MMM.DD YYYY")}
              </ETCaption3>
            </TimelineContent>
          </TimelineItem>
        );
      })}
      <When condition={subsequentUpdates.length > SHOW_MORE_THRESHOLD}>
        <Collapse in={expand}>
          {subsequentUpdates.slice(SHOW_MORE_THRESHOLD).map((update) => (
            <TimelineItem>
              <TimelineOppositeContent>
                <ETPreviewText color={Palette.neutral.main}>
                  <ReadMoreText>{update.description}</ReadMoreText>
                </ETPreviewText>
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <ETCaption3 color={Palette.neutral.main}>
                  {moment(issue.created_at).format("MMM.DD YYYY")}
                </ETCaption3>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Collapse>
        <TimelineItem>
          <Grid container alignItems={"center"} justifyContent={"center"}>
            <Grid item>
              <Button
                variant="text"
                startIcon={
                  <ExpandMoreIcon
                    sx={{
                      transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
                      transition: (theme: any) =>
                        theme.transitions.create("transform", {
                          duration: theme.transitions.duration.shortest,
                        }),
                    }}
                  />
                }
                sx={{
                  backgroundColor: "inherit",
                  borderColor: "transparent",
                }}
                onClick={() => setExpand(!expand)}
              >
                {expand ? "Show less" : "Show more"}
              </Button>
            </Grid>
          </Grid>
        </TimelineItem>
      </When>
    </Timeline>
  );
};

export default IssueHistory;
