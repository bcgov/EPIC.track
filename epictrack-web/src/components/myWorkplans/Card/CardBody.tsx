import { Grid, Stack, Tooltip } from "@mui/material";
import { Palette } from "../../../styles/theme";
import { ETCaption1, ETCaption2, ETHeading4, ETParagraph } from "../../shared";
import Icons from "../../icons";
import { IconProps } from "../../icons/type";
import { CardProps } from "./type";
import WorkState from "../../workPlan/WorkState";
import dayjs from "dayjs";
import { MONTH_DAY_YEAR } from "../../../constants/application-constant";
import { isStatusOutOfDate } from "../../workPlan/status/shared";
import { Status } from "../../../models/status";
import { When } from "react-if";
import { daysLeft } from "./util";

const IndicatorSmallIcon: React.FC<IconProps> = Icons["IndicatorSmallIcon"];
const ClockIcon: React.FC<IconProps> = Icons["ClockIcon"];

const CardBody = ({ workplan }: CardProps) => {
  const phase_color = Palette.primary.main;
  const statusOutOfDate =
    isStatusOutOfDate(workplan.status_info as Status) ||
    !workplan.status_info?.posted_date;

  const lastStatusUpdate = dayjs(workplan.status_info.posted_date).format(
    MONTH_DAY_YEAR
  );

  const workTitle = `${workplan.work_type.name}${
    workplan.simple_title ? ` - ${workplan.simple_title}` : ""
  }`;

  return (
    <Grid
      container
      direction="column"
      justifyContent="flex-start"
      sx={{
        backgroundColor: Palette.white,
        padding: "16px 24px",
        height: "313px",
      }}
      gap={1}
    >
      <Grid item container spacing={2}>
        <Grid item xs={9}>
          <ETHeading4
            bold
            color={Palette.neutral.dark}
            xs
            enableTooltip
            tooltip={workTitle}
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "70%",
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
        <When condition={"phase_info" in workplan}>
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
                enableEllipsis
                color={phase_color}
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {workplan?.phase_info[0]?.work_phase.name}
              </ETCaption2>
              <ClockIcon
                fill={
                  workplan?.phase_info[0]?.days_left > 0
                    ? Palette.neutral.main
                    : Palette.error.main
                }
              />
              <ETCaption2
                bold
                enableEllipsis
                color={
                  workplan?.phase_info[0]?.days_left > 0
                    ? Palette.neutral.main
                    : Palette.error.main
                }
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {daysLeft(
                  workplan?.phase_info[0]?.days_left,
                  workplan?.phase_info[0]?.total_number_of_days
                )}
              </ETCaption2>
            </Stack>
          </Grid>
        </When>
      </Grid>
      <Grid container sx={{ height: "64px" }} spacing={1}>
        <When condition={Boolean(workplan?.phase_info[0])}>
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
                {`UPCOMING MILESTONE ${dayjs(new Date())
                  .add(workplan?.phase_info[0]?.days_left, "days")
                  .format(MONTH_DAY_YEAR)
                  .toUpperCase()}`}
              </ETCaption1>
            </Grid>
          </Grid>
          <Grid item container direction="row" spacing={1}>
            <Grid item sx={{ overflow: "hidden" }}>
              <ETParagraph
                bold
                color={Palette.neutral.dark}
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {workplan.phase_info[0]?.next_milestone}
              </ETParagraph>
            </Grid>
          </Grid>
        </When>
      </Grid>

      <Grid item container direction="row" spacing={1}>
        <Grid item>
          <ETCaption1 color={Palette.neutral.main}>
            LAST STATUS UPDATE
          </ETCaption1>
        </Grid>
        <When condition={workplan?.status_info?.posted_date}>
          <Grid item>
            <ETCaption1 color={Palette.neutral.main}>
              {lastStatusUpdate}
            </ETCaption1>
          </Grid>
        </When>
        <Grid item sx={{ marginTop: "2px" }}>
          {statusOutOfDate && <IndicatorSmallIcon />}
        </Grid>
      </Grid>
      <Grid item>
        <ETParagraph
          sx={{
            height: "50px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            "-webkit-line-clamp": "2",
            "-webkit-box-orient": "vertical",
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
