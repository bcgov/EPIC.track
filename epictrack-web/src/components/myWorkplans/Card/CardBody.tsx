import { useMemo } from "react";
import { Else, If, Then, When } from "react-if";
import { Grid, Stack } from "@mui/material";
import dayjs from "dayjs";
import { Palette } from "../../../styles/theme";
import { ETCaption1, ETCaption2, ETHeading4, ETParagraph } from "../../shared";
import Icons from "../../icons";
import { IconProps } from "../../icons/type";
import {
  CardProps,
  MilestoneInfoSectionEnum,
  MilestoneInfoSectionProps,
} from "./type";
import WorkState from "../../workPlan/WorkState";
import {
  DISPLAY_DATE_FORMAT,
  MONTH_DAY_YEAR,
  StalenessEnum,
} from "../../../constants/application-constant";
import { calculateStatusStaleness } from "../../workPlan/status/shared";
import { Status } from "models/status";
import { WorkStateEnum } from "models/work";
import { daysLeft } from "./util";
import { dateUtils } from "utils";

const IndicatorSmallIcon: React.FC<IconProps> = Icons["IndicatorSmallIcon"];
const ClockIcon: React.FC<IconProps> = Icons["ClockIcon"];

/**
 * Fixed so every card in the list lines up. Sized to the tallest content the
 * body can hold: title (34) + phase row (26) + milestone row (64) + status
 * update caption (19.5) + clamped description (50) + federal involvement
 * caption (19.5) and value (27), plus six 8px gaps and 32px of padding.
 *
 * Exported so `CardSkeleton` cannot drift from it.
 */
export const CARD_BODY_HEIGHT = "328px";

const decisionWorkStates = [
  WorkStateEnum.CLOSED,
  WorkStateEnum.COMPLETED,
  WorkStateEnum.TERMINATED,
  WorkStateEnum.WITHDRAWN,
];

const MilestoneInfoSection = (props: MilestoneInfoSectionProps) => {
  let dateTitle, name, date;
  if (props.infoType === MilestoneInfoSectionEnum.DECISION) {
    dateTitle = "DECISION TAKEN";
    name = props.phaseInfo?.decision;
    date = props.phaseInfo?.decision_milestone_date;
  } else {
    dateTitle = "UPCOMING MILESTONE";
    name = props.phaseInfo?.next_milestone;
    date = props.phaseInfo?.next_milestone_date;
  }
  return (
    <>
      {!!props.phaseInfo && (
        <>
          <Grid item container direction="row" spacing={1}>
            <Grid
              item
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <ETCaption1 color={Palette.neutral.main}>
                {`${dateTitle} `}
                {dateUtils.formatDate(String(date), DISPLAY_DATE_FORMAT)}
              </ETCaption1>
            </Grid>
          </Grid>
          <Grid item container direction="row" spacing={1}>
            <Grid item sx={{ overflow: "hidden" }}>
              <ETParagraph
                bold
                enableTooltip={true}
                tooltip={name}
                color={Palette.neutral.dark}
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {name}
              </ETParagraph>
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
};
const CardBody = ({ workplan, statusStalenessSettings }: CardProps) => {
  const phase_color = Palette.primary.main;
  const statusStaleness = calculateStatusStaleness(
    (workplan.status_info as Status) || !workplan.status_info?.posted_date,
    statusStalenessSettings?.staleness_length,
    statusStalenessSettings?.warning_length,
  );

  const lastStatusUpdate = dayjs(workplan.status_info.posted_date).format(
    MONTH_DAY_YEAR,
  );
  const workTitle = `${workplan.work_type.name}${
    workplan.simple_title ? ` - ${workplan.simple_title}` : ""
  }`;

  const currentWorkPhaseInfo = useMemo(() => {
    if (!workplan.phase_info) return undefined;
    const currentPhaseInfo = workplan.phase_info.filter(
      (p) => p.work_phase.id === workplan.current_work_phase_id,
    );
    return currentPhaseInfo[0];
  }, [workplan]);

  return (
    <Grid
      container
      direction="column"
      justifyContent="flex-start"
      sx={{
        backgroundColor: Palette.white,
        padding: "16px 24px",
        height: CARD_BODY_HEIGHT,
        // Grid containers wrap by default. On a fixed-height *column* container
        // that means any overflow starts a second column, which renders at the
        // top right instead of clipping - so a few extra pixels of text moved
        // "FEDERAL INVOLVEMENT"'s value up beside the work state badge.
        flexWrap: "nowrap",
      }}
      gap={1}
    >
      <Grid item container spacing={2}>
        <Grid item xs={9}>
          <ETHeading4
            bold
            color={Palette.neutral.dark}
            enableTooltip
            enableEllipsis
            tooltip={workTitle}
            sx={{
              maxWidth: { md: "75%", lg: "85%", xl: "100%" },
            }}
          >
            {workTitle}
          </ETHeading4>
        </Grid>
        <Grid item xs={3} container justifyContent={"flex-end"}>
          <ETCaption1 bold>
            <WorkState work_state={workplan.work_state} />
          </ETCaption1>
        </Grid>
      </Grid>

      <Grid item container direction="row" spacing={1} sx={{ height: "26px" }}>
        {!!currentWorkPhaseInfo && (
          <Grid item xs={12}>
            <Stack
              direction={"row"}
              spacing={1}
              alignItems={"center"}
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <ETCaption2
                bold
                color={phase_color}
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {currentWorkPhaseInfo?.work_phase?.name || ""}
              </ETCaption2>
              <ClockIcon
                fill={
                  currentWorkPhaseInfo?.days_left > 0
                    ? Palette.neutral.main
                    : Palette.error.main
                }
              />
              <ETCaption2
                bold
                color={
                  currentWorkPhaseInfo?.days_left > 0
                    ? Palette.neutral.main
                    : Palette.error.main
                }
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {daysLeft(currentWorkPhaseInfo)}
              </ETCaption2>
            </Stack>
          </Grid>
        )}
      </Grid>
      <Grid container sx={{ height: "64px" }} spacing={1}>
        <If
          condition={decisionWorkStates.includes(
            WorkStateEnum[workplan?.work_state as keyof typeof WorkStateEnum],
          )}
        >
          <Then>
            <MilestoneInfoSection
              infoType={MilestoneInfoSectionEnum.DECISION}
              phaseInfo={currentWorkPhaseInfo}
            />
          </Then>
          <Else>
            <MilestoneInfoSection
              infoType={MilestoneInfoSectionEnum.MILESTONE}
              phaseInfo={currentWorkPhaseInfo}
            />
          </Else>
        </If>
      </Grid>

      <Grid item container direction="row" spacing={1}>
        <When condition={workplan?.status_info?.posted_date}>
          <Grid item>
            <ETCaption1 color={Palette.neutral.main}>
              LAST STATUS UPDATE
            </ETCaption1>
          </Grid>
          <Grid item>
            <ETCaption1 color={Palette.neutral.main}>
              {lastStatusUpdate}
            </ETCaption1>
          </Grid>
          <When
            condition={
              !decisionWorkStates.includes(
                WorkStateEnum[
                  workplan?.work_state as keyof typeof WorkStateEnum
                ],
              )
            }
          >
            <Grid item sx={{ marginTop: "2px" }}>
              {(statusStaleness === StalenessEnum.CRITICAL ||
                statusStaleness === StalenessEnum.WARN) && (
                <IndicatorSmallIcon />
              )}
            </Grid>
          </When>
        </When>
      </Grid>
      <Grid item>
        <ETParagraph
          sx={{
            height: "50px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: "2",
            WebkitBoxOrient: "vertical",
          }}
        >
          {workplan.status_info.description}
        </ETParagraph>
      </Grid>
      <Grid item>
        <ETCaption1 color={Palette.neutral.main}>
          FEDERAL INVOLVEMENT
        </ETCaption1>
      </Grid>
      <Grid item>
        <ETParagraph color={Palette.neutral.dark}>
          {workplan.federal_involvement.name}
        </ETParagraph>
      </Grid>
    </Grid>
  );
};

export default CardBody;
