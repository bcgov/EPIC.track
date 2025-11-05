import React, { useContext, useState } from "react";
import { ETCaption1, ETCaption3, ETPreviewText } from "../../../../shared";
import Timeline from "@mui/lab/Timeline";
import { IconProps } from "../../../../icons/type";
import Icons from "../../../../icons";
import { Palette } from "../../../../../styles/theme";
import {
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  timelineContentClasses,
} from "@mui/lab";
import ReadMoreText from "../../../../shared/ReadMoreText";
import {
  MONTH_DAY_YEAR,
  ROLES,
} from "../../../../../constants/application-constant";
import moment from "moment";
import { Unless, When } from "react-if";
import { Box, Button, Collapse, Grid, useTheme } from "@mui/material";
import { StatusContext } from "../../StatusContext";
import { Restricted } from "../../../../shared/restricted";
import { EmptyStatusHistory } from "./EmptyStatusHistory";
import { useUserHasRole } from "../../../utils";
import { Status } from "models/status";

const ExpandIcon: React.FC<IconProps> = Icons["ExpandIcon"];
const PencilEditIcon: React.FC<IconProps> = Icons["PencilEditIcon"];

interface MergedStatus extends Status {
  end_date?: string;
}

const mergeAdjacentStatuses = (statuses: Status[]): MergedStatus[] => {
  if (!statuses || statuses.length === 0) return [];

  const merged: MergedStatus[] = [];
  let current: MergedStatus = { ...statuses[0] };

  for (let i = 1; i < statuses.length; i++) {
    const next = statuses[i];
    if (current.description === next.description) {
      current = {
        ...current,
        end_date: next.posted_date,
      };
    } else {
      merged.push(current);
      current = { ...next };
    }
  }

  merged.push(current);
  return merged;
};

const StatusHistory = ({
  statuses,
  highlightFirstInTimelineApproved = true,
  defaultExpanded = true,
  showEdit = true,
  showOne = false,
}: {
  statuses: Status[];
  highlightFirstInTimelineApproved?: boolean;
  defaultExpanded?: boolean;
  showEdit?: boolean;
  showOne?: boolean;
}) => {
  const { setShowStatusForm, setStatus } = useContext(StatusContext);
  const [expand, setExpand] = useState(false);
  const theme = useTheme();
  const userHasRole = useUserHasRole();

  const approvedStatuses = statuses.filter(
    (status) => status.is_approved && status.id !== statuses?.[0]?.id,
  );

  const mergedStatuses = mergeAdjacentStatuses(approvedStatuses);

  if (showOne && mergedStatuses.length > 0) {
    mergedStatuses.splice(1);
  }

  const SHOW_MORE_THRESHOLD = 3;

  if (mergedStatuses.length === 0) {
    return <EmptyStatusHistory />;
  }
  return (
    <Box sx={{ paddingTop: "8px" }}>
      <ETCaption1 bold color={Palette.neutral.dark}>
        STATUS HISTORY
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
        {mergedStatuses.slice(0, SHOW_MORE_THRESHOLD).map((status, index) => {
          const isSuccess = highlightFirstInTimelineApproved && index === 0;
          const finalItem = mergedStatuses.length === index + 1;
          const lastItemHidden = index + 1 !== SHOW_MORE_THRESHOLD;
          const showConnector = (!finalItem && lastItemHidden) || expand;
          return (
            <TimelineItem key={status.id}>
              <TimelineOppositeContent>
                <ETPreviewText
                  color={
                    isSuccess ? Palette.neutral.dark : Palette.neutral.main
                  }
                >
                  <ReadMoreText defaultExpanded={isSuccess && defaultExpanded}>
                    {status.description}
                  </ReadMoreText>
                </ETPreviewText>
                <When condition={isSuccess && showEdit}>
                  <Restricted
                    allowed={[ROLES.EXTENDED_EDIT]}
                    errorProps={{ disabled: true }}
                    exception={userHasRole}
                  >
                    <Button
                      variant="text"
                      startIcon={<PencilEditIcon />}
                      sx={{
                        backgroundColor: "inherit",
                        borderColor: "transparent",
                      }}
                      onClick={() => {
                        setShowStatusForm(true);
                        setStatus(status);
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
                <When condition={showConnector}>
                  <TimelineConnector
                    sx={[
                      isSuccess && {
                        bgcolor: Palette.success.light,
                      },
                    ]}
                  />
                </When>
              </TimelineSeparator>
              <TimelineContent sx={{ minWidth: "88px" }}>
                <ETCaption3 color={Palette.neutral.main}>
                  {status.end_date ? (
                    <>
                      {moment(status.end_date).format(MONTH_DAY_YEAR)}
                      <br />-{" "}
                      {moment(status.posted_date).format(MONTH_DAY_YEAR)}
                    </>
                  ) : (
                    moment(status.posted_date).format(MONTH_DAY_YEAR)
                  )}
                </ETCaption3>
              </TimelineContent>
            </TimelineItem>
          );
        })}
        <When condition={mergedStatuses.length > SHOW_MORE_THRESHOLD}>
          <Collapse in={expand}>
            {mergedStatuses.slice(SHOW_MORE_THRESHOLD).map((status, index) => {
              const finalItem =
                mergedStatuses.length === index + 1 + SHOW_MORE_THRESHOLD;
              return (
                <TimelineItem key={status.id}>
                  <TimelineOppositeContent>
                    <ETPreviewText color={Palette.neutral.main}>
                      <ReadMoreText>{status.description}</ReadMoreText>
                    </ETPreviewText>
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot />
                    <Unless condition={finalItem}>
                      <TimelineConnector />
                    </Unless>
                  </TimelineSeparator>
                  <TimelineContent>
                    <ETCaption3 color={Palette.neutral.main}>
                      {moment(status.posted_date).format(MONTH_DAY_YEAR)}
                    </ETCaption3>
                  </TimelineContent>
                </TimelineItem>
              );
            })}
          </Collapse>
          <TimelineItem sx={{ paddingLeft: "86px" }} key="expand-button">
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
    </Box>
  );
};

export default StatusHistory;
