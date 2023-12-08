import { Box, Grid, SxProps, colors } from "@mui/material";
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

const IndicatorSmallIcon: React.FC<IconProps> = Icons["IndicatorSmallIcon"];
const DotIcon: React.FC<IconProps> = Icons["DotIcon"];
const ClockIcon: React.FC<IconProps> = Icons["ClockIcon"];

const CardBody = ({ workplan }: CardProps) => {
  const phase_color = workplan?.phase_info?.work_phase?.phase.color;
  const statusOutOfDate =
    isStatusOutOfDate(workplan.status_info as Status) ||
    !workplan.status_info?.posted_date;
  return (
    <Grid
      container
      direction="column"
      justifyContent="flex-start"
      sx={{
        backgroundColor: Palette.white,
        padding: "16px 24px",
      }}
      gap={1}
    >
      <Grid item container spacing={1}>
        <Grid item xs={6}>
          <ETHeading4
            bold
            color={Palette.neutral.dark}
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {workplan.work_type.name}
          </ETHeading4>
        </Grid>
        <Grid item container xs={6}>
          <ETCaption1 bold>
            <WorkState work_state={workplan.work_state} />
          </ETCaption1>
        </Grid>
      </Grid>
      <Grid
        item
        container
        direction="row"
        spacing={1}
        sx={{ paddingBottom: "8px" }}
      >
        <When condition={"phase_info" in workplan}>
          <Grid item container sx={{ marginTop: "2px" }} xs={1}>
            <DotIcon fill={phase_color} />
          </Grid>
          <Grid item container xs={6}>
            <ETCaption2
              bold
              color={phase_color}
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {workplan?.phase_info?.work_phase.name}
            </ETCaption2>
          </Grid>
        </When>

        <Grid item container sx={{ marginTop: "4px" }} xs={1}>
          <ClockIcon />
        </Grid>
        <Grid item container xs={4}>
          <ETCaption2
            bold
            color={Palette.neutral.main}
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {workplan.phase_info.days_left}/
            {workplan.phase_info.total_number_of_days} days left
          </ETCaption2>
        </Grid>
      </Grid>
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
              .add(workplan.phase_info.days_left, "days")
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
            {workplan.phase_info.next_milestone}
          </ETParagraph>
        </Grid>
      </Grid>

      <Grid item container direction="row" spacing={1}>
        <Grid item>
          <ETCaption1 color={Palette.neutral.main}>
            LAST STATUS UPDATE
          </ETCaption1>
        </Grid>
        <Grid item>
          <ETCaption1 color={Palette.neutral.main}>
            {dayjs(workplan.status_info.posted_date).format(MONTH_DAY_YEAR)}
          </ETCaption1>
        </Grid>
        <Grid item sx={{ marginTop: "2px" }}>
          {statusOutOfDate && <IndicatorSmallIcon />}
        </Grid>
      </Grid>
      <Grid item sx={{ height: "49px", width: "100%" }}>
        <ETParagraph sx={{ height: "49px" }} enableEllipsis>
          {workplan.status_info.description}
        </ETParagraph>
      </Grid>
      <Grid item>
        <ETCaption1 color={Palette.neutral.main}>IAAC INVOLVEMENT</ETCaption1>
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
