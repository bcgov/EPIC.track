import { Box, Divider, Grid } from "@mui/material";
import { useContext } from "react";
import { WorkplanContext } from "../../WorkPlanContext";
import { ETCaption1, ETCaption2, GrayBox } from "../../../shared";
import { Palette } from "../../../../styles/theme";
import { MONTH_DAY_YEAR } from "../../../../constants/application-constant";
import dayjs from "dayjs";

const ProjectDetails = () => {
  const { work } = useContext(WorkplanContext);
  return (
    <GrayBox>
      <Grid
        container
        sx={{
          padding: "16px 24px",
        }}
      >
        <Grid item xs={12}>
          <ETCaption1 color={Palette.neutral.main}>
            PROJECT CREATION DATE
          </ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETCaption2 color={Palette.neutral.dark}>
            {dayjs(work?.project?.created_at).format(MONTH_DAY_YEAR)}
          </ETCaption2>
        </Grid>
      </Grid>
      <Divider style={{ width: "100%" }} />
      <Grid
        container
        spacing={1}
        sx={{
          padding: "16px 24px",
        }}
      >
        <Grid item xs={12}>
          <ETCaption1 bold color={Palette.primary.main}>
            PROPONENT
          </ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETCaption2 color={Palette.neutral.dark}>
            {work?.project?.proponent?.name}
          </ETCaption2>
        </Grid>
        <Grid item xs={12}>
          <ETCaption1 bold color={Palette.primary.main}>
            PROJECT DESCRIPTION
          </ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETCaption2 color={Palette.neutral.dark}>
            {work?.project?.description}
          </ETCaption2>
        </Grid>
        <Grid item xs={6}>
          <ETCaption1 bold color={Palette.primary.main}>
            TYPE
          </ETCaption1>
        </Grid>
        <Grid item xs={6}>
          <ETCaption1 bold color={Palette.primary.main}>
            SUBTYPE
          </ETCaption1>
        </Grid>
        <Grid item xs={6}>
          <ETCaption1 color={Palette.neutral.dark}>
            {work?.project?.type?.name}
          </ETCaption1>
        </Grid>
        <Grid item xs={6}>
          <ETCaption1 color={Palette.neutral.dark}>
            {work?.project?.sub_type?.name}
          </ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETCaption1 bold color={Palette.primary.main}>
            LOCATION DESCRIPTION
          </ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETCaption2 color={Palette.neutral.dark}>
            {work?.project?.address}
          </ETCaption2>
        </Grid>
        <Grid item xs={6}>
          <ETCaption1 bold color={Palette.primary.main}>
            ENV REGION
          </ETCaption1>
        </Grid>
        <Grid item xs={6}>
          <ETCaption1 bold color={Palette.primary.main}>
            NRS REGION
          </ETCaption1>
        </Grid>
        <Grid item xs={6}>
          <ETCaption1 color={Palette.neutral.dark}>
            {work?.project?.region_env?.name}
          </ETCaption1>
        </Grid>
        <Grid item xs={6}>
          <ETCaption1 color={Palette.neutral.dark}>
            {work?.project?.region_flnro?.name}
          </ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETCaption1 bold color={Palette.primary.main}>
            ABBREVIATION
          </ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETCaption1 color={Palette.neutral.dark}>
            {work?.project?.abbreviation}
          </ETCaption1>
        </Grid>
      </Grid>
    </GrayBox>
  );
};

export default ProjectDetails;
