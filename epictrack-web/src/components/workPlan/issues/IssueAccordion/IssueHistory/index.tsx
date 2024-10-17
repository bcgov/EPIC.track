import React, { useContext, useState } from "react";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import { WorkIssue } from "../../../../../models/Issue";
import moment from "moment";
import { Palette } from "../../../../../styles/theme";
import { ETCaption1, ETCaption3, ETPreviewText } from "../../../../shared";
import ReadMoreText from "../../../../shared/ReadMoreText";
import TimelineContent, {
  timelineContentClasses,
} from "@mui/lab/TimelineContent";
import { Button, Collapse, Grid, Stack, useTheme } from "@mui/material";
import { Else, If, Then, When, Unless } from "react-if";
import { IconProps } from "../../../../icons/type";
import icons from "../../../../icons";
import { IssuesContext } from "../../IssuesContext";
import {
  MONTH_DAY_YEAR,
  ROLES,
} from "../../../../../constants/application-constant";
import { Restricted } from "../../../../shared/restricted";
import { EmptyIssueHistory } from "./EmptyIssueHistory";

const IssueHistory = ({ issue }: { issue: WorkIssue }) => {
  const theme = useTheme();
  const { setUpdateToEdit, setEditIssueUpdateFormIsOpen } =
    useContext(IssuesContext);

  const [expand, setExpand] = useState(false);

  const latestUpdate = issue.updates[0];
  const subsequentUpdates = issue.updates.slice(1);
  const highlightFirstInTimeLineApproved = !latestUpdate.is_approved;
  const PencilEditIcon: React.FC<IconProps> = icons["PencilEditIcon"];
  const ExpandIcon: React.FC<IconProps> = icons["ExpandIcon"];

  const SHOW_MORE_THRESHOLD = 3;

  const firstNUpdatesInTimeline = subsequentUpdates.slice(
    0,
    SHOW_MORE_THRESHOLD
  );
  const restOfUpdatesInTimeline = subsequentUpdates.slice(SHOW_MORE_THRESHOLD);

  if (firstNUpdatesInTimeline.length === 0) {
    return <EmptyIssueHistory />;
  }

  return (
    <Stack
      sx={{
        padding: "16px",
      }}
      direction="column"
    >
      <ETCaption1 bold color={Palette.neutral.dark}>
        ISSUE HISTORY
      </ETCaption1>
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
        {firstNUpdatesInTimeline.map((update, index) => {
          const isSuccess = highlightFirstInTimeLineApproved && index === 0;
          return (
            <TimelineItem
              key={update.id}
              data-cy={`history-update-${update.id}`}
            >
              <TimelineOppositeContent>
                <If condition={isSuccess}>
                  <Then>
                    <ETPreviewText color={Palette.neutral.dark}>
                      {update.description}
                    </ETPreviewText>
                  </Then>
                  <Else>
                    <ETPreviewText color={Palette.neutral.main}>
                      <ReadMoreText>{update.description}</ReadMoreText>
                    </ETPreviewText>
                  </Else>
                </If>
                <When condition={isSuccess}>
                  <Restricted
                    allowed={[ROLES.EXTENDED_EDIT]}
                    errorProps={{ disabled: true }}
                  >
                    <Button
                      data-cy="edit-history-update-button"
                      variant="text"
                      startIcon={<PencilEditIcon />}
                      sx={{
                        backgroundColor: "inherit",
                        borderColor: "transparent",
                      }}
                      onClick={() => {
                        setUpdateToEdit(update);
                        setEditIssueUpdateFormIsOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </Restricted>
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
                <Unless
                  condition={
                    index === firstNUpdatesInTimeline.length - 1 && !expand
                  }
                >
                  <TimelineConnector
                    sx={[
                      isSuccess && {
                        bgcolor: Palette.success.light,
                      },
                    ]}
                  />
                </Unless>
              </TimelineSeparator>
              <TimelineContent>
                <ETCaption3 color={Palette.neutral.main}>
                  {moment(update.posted_date).format(MONTH_DAY_YEAR)}
                </ETCaption3>
              </TimelineContent>
            </TimelineItem>
          );
        })}
        <When condition={restOfUpdatesInTimeline.length > 0}>
          <Collapse in={expand}>
            {restOfUpdatesInTimeline.map((update, index) => (
              <TimelineItem key={update.id}>
                <TimelineOppositeContent>
                  <ETPreviewText color={Palette.neutral.main}>
                    <ReadMoreText>{update.description}</ReadMoreText>
                  </ETPreviewText>
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot />
                  <Unless
                    condition={index === restOfUpdatesInTimeline.length - 1}
                  >
                    <TimelineConnector />
                  </Unless>
                </TimelineSeparator>
                <TimelineContent>
                  <ETCaption3 color={Palette.neutral.main}>
                    {moment(update.posted_date).format("MMM.DD YYYY")}
                  </ETCaption3>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Collapse>
          <TimelineItem key="expand-button">
            <Grid container>
              <Grid item>
                <Button
                  variant="text"
                  startIcon={
                    <ExpandIcon
                      style={{
                        transform: !expand ? "rotate(0deg)" : "rotate(-180deg)",
                        transition: theme.transitions.create("transform", {
                          duration: theme.transitions.duration.shortest,
                        }),
                        fill: Palette.primary.accent.main,
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
    </Stack>
  );
};

export default IssueHistory;
