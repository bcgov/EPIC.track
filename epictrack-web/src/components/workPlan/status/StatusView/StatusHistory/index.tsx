import React, { useContext, useState } from "react";
import { WorkplanContext } from "../../../WorkPlanContext";
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

const ExpandIcon: React.FC<IconProps> = Icons["ExpandIcon"];
const PencilEditIcon: React.FC<IconProps> = Icons["PencilEditIcon"];

const StatusHistory = () => {
  const { statuses } = React.useContext(WorkplanContext);
  const { setShowStatusForm, setStatus } = useContext(StatusContext);
  const [expand, setExpand] = useState(false);
  const theme = useTheme();

  const approvedStatuses = statuses.filter(
    (status) => status.is_approved && status.id != statuses?.[0]?.id
  );
  const highlightFirstInTimeLineApproved = !statuses?.[0]?.is_approved;

  const SHOW_MORE_THRESHOLD = 3;

  if (approvedStatuses.length === 0) {
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
        {approvedStatuses.slice(0, SHOW_MORE_THRESHOLD).map((status, index) => {
          const isSuccess = highlightFirstInTimeLineApproved && index === 0;
          const finalItem = approvedStatuses.length === index + 1;
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
                  <ReadMoreText defaultExpanded={isSuccess}>
                    {status.description}
                  </ReadMoreText>
                </ETPreviewText>
                <When condition={isSuccess}>
                  <Restricted
                    allowed={[ROLES.EXTENDED_EDIT]}
                    errorProps={{ disabled: true }}
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
              <TimelineContent>
                <ETCaption3 color={Palette.neutral.main}>
                  {moment(status.posted_date).format(MONTH_DAY_YEAR)}
                </ETCaption3>
              </TimelineContent>
            </TimelineItem>
          );
        })}
        <When condition={approvedStatuses.length > SHOW_MORE_THRESHOLD}>
          <Collapse in={expand}>
            {approvedStatuses
              .slice(SHOW_MORE_THRESHOLD)
              .map((status, index) => {
                const finalItem =
                  approvedStatuses.length === index + 1 + SHOW_MORE_THRESHOLD;
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
