import { Box, Grid, SxProps } from "@mui/material";
import { Palette } from "../../../styles/theme";
import { ETCaption1, ETCaption2, ETHeading4, ETParagraph } from "../../shared";
import Icons from "../../icons";
import { IconProps } from "../../icons/type";
import { CardProps } from "./type";
import WorkState from "../../workPlan/WorkState";
import dayjs from "dayjs";
import { MONTH_DAY_YEAR } from "../../../constants/application-constant";

const IndicatorSmallIcon: React.FC<IconProps> = Icons["IndicatorSmallIcon"];
const DotIcon: React.FC<IconProps> = Icons["DotIcon"];
const ClockIcon: React.FC<IconProps> = Icons["ClockIcon"];

const CardBody = ({ workplan }: CardProps) => {
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
      <Grid item container direction="row" spacing={1}>
        <Grid item>
          <ETHeading4 bold color={Palette.neutral.dark}>
            {workplan.work_type.name}
          </ETHeading4>
        </Grid>
        <Grid item>
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
        <Grid item sx={{ marginTop: "2px" }}>
          <DotIcon />
        </Grid>
        <Grid item>
          <ETCaption2 bold color={Palette.neutral.main}>
            {workplan.phase_info.work_phase.name}
          </ETCaption2>
        </Grid>
        <Grid item sx={{ marginTop: "4px" }}>
          <ClockIcon />
        </Grid>
        <Grid item>
          <ETCaption2 bold color={Palette.neutral.main}>
            {workplan.phase_info.days_left}/
            {workplan.phase_info.total_number_of_days} days left
          </ETCaption2>
        </Grid>
      </Grid>
      <Grid item container direction="row" spacing={1}>
        <Grid item>
          <ETCaption1 color={Palette.neutral.main}>
            UPCOMING MILESTONE
          </ETCaption1>
        </Grid>
        <Grid item>
          <ETCaption1 color={Palette.neutral.main}>
            {dayjs(new Date())
              .add(workplan.phase_info.days_left, "days")
              .format(MONTH_DAY_YEAR)
              .toUpperCase()}
          </ETCaption1>
        </Grid>
      </Grid>
      <Grid item sx={{ paddingBottom: "8px" }}>
        <ETParagraph bold color={Palette.neutral.dark}>
          {workplan.phase_info.next_milestone}
        </ETParagraph>
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
          {}
          <IndicatorSmallIcon />
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
