import { Divider, Grid } from "@mui/material";
import { useContext } from "react";
import { WorkplanContext } from "../../WorkPlanContext";
import { ETCaption1, ETCaption2, ETParagraph, GrayBox } from "../../../shared";
import { Palette } from "../../../../styles/theme";
import { MONTH_DAY_YEAR } from "../../../../constants/application-constant";
import dayjs from "dayjs";

const ProjectDetails = () => {
  const { work } = useContext(WorkplanContext);
  return (
    <GrayBox>
      <Grid container spacing={1}>
        <Grid item xs={12} container>
          <Grid item xs={12}>
            <ETCaption1 color={Palette.neutral.main}>
              PROJECT CREATION DATE
            </ETCaption1>
          </Grid>
          <Grid item xs={12}>
            <ETParagraph color={Palette.neutral.dark}>
              {dayjs(work?.project?.created_at).format(MONTH_DAY_YEAR)}
            </ETParagraph>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Divider style={{ width: "100%", paddingTop: "8px" }} />
        </Grid>
        <Grid item xs={12}>
          <ETCaption1 bold color={Palette.primary.main}>
            PROPONENT
          </ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETParagraph color={Palette.neutral.dark}>
            {work?.project?.proponent?.name}
          </ETParagraph>
        </Grid>
        <Grid item xs={12}>
          <ETCaption1 bold color={Palette.primary.main}>
            PROJECT DESCRIPTION
          </ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETParagraph color={Palette.neutral.dark}>
            {work?.project?.description}
          </ETParagraph>
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
          <ETParagraph color={Palette.neutral.dark}>
            {work?.project?.type?.name}
          </ETParagraph>
        </Grid>
        <Grid item xs={6}>
          <ETParagraph color={Palette.neutral.dark}>
            {work?.project?.sub_type?.name}
          </ETParagraph>
        </Grid>
        <Grid item xs={12}>
          <ETCaption1 bold color={Palette.primary.main}>
            LOCATION DESCRIPTION
          </ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETParagraph color={Palette.neutral.dark}>
            {work?.project?.address}
          </ETParagraph>
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
          <ETParagraph color={Palette.neutral.dark}>
            {work?.project?.region_env?.name}
          </ETParagraph>
        </Grid>
        <Grid item xs={6}>
          <ETParagraph color={Palette.neutral.dark}>
            {work?.project?.region_flnro?.name}
          </ETParagraph>
        </Grid>
        <Grid item xs={12}>
          <ETCaption1 bold color={Palette.primary.main}>
            ABBREVIATION
          </ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETParagraph color={Palette.neutral.dark}>
            {work?.project?.abbreviation}
          </ETParagraph>
        </Grid>
      </Grid>
    </GrayBox>
  );
};

export default ProjectDetails;
