import { Box, Grid, SxProps } from "@mui/material";
import { Palette } from "../../../styles/theme";
import { ETCaption1, ETCaption2, ETHeading4, ETParagraph } from "../../shared";
import Icons from "../../icons";
import { IconProps } from "../../icons/type";

interface IProps {
  children: React.ReactNode;
  gap?: number;
  sx?: SxProps;
}

const GridRowContainer = ({ children, sx, gap }: IProps) => {
  return (
    <Grid item sx={{ ...sx }}>
      <Grid container direction="row" gap={gap}>
        {children}
      </Grid>
    </Grid>
  );
};

const IndicatorSmallIcon: React.FC<IconProps> = Icons["IndicatorSmallIcon"];
const DotIcon: React.FC<IconProps> = Icons["DotIcon"];
const ClockIcon: React.FC<IconProps> = Icons["ClockIcon"];

const CardBody = () => {
  return (
    <Grid
      container
      direction="column"
      justifyContent="flex-start"
      sx={{
        width: "516",
        backgroundColor: Palette.white,
        borderTop: `1px solid var(--neutral-background-dark, #DBDCDC)`,
        padding: "16px 24px",
      }}
      gap={1}
    >
      <GridRowContainer gap={2}>
        <Grid item>
          <ETHeading4 bold color={Palette.neutral.dark}>
            EAC Assessment
          </ETHeading4>
        </Grid>
        <Grid item>
          <ETCaption1
            bold
            sx={{
              color: Palette.success.dark,
              backgroundColor: Palette.success.bg.light,
              padding: "4px 8px",
              borderRadius: "4px",
            }}
          >
            In Progress
          </ETCaption1>
        </Grid>
      </GridRowContainer>
      <GridRowContainer gap={1} sx={{ paddingBottom: "8px" }}>
        <Grid item sx={{ marginTop: "2px" }}>
          <DotIcon />
        </Grid>
        <Grid item>
          <ETCaption2
            bold
            color={Palette.neutral.main}
            sx={{ fontSize: "14px" }}
          >
            Early Engagement
          </ETCaption2>
        </Grid>
        <Grid item sx={{ marginTop: "2px" }}>
          <ClockIcon />
        </Grid>
        <Grid item>
          <ETCaption2
            bold
            color={Palette.neutral.main}
            sx={{ fontSize: "14px" }}
          >
            46/90 days left
          </ETCaption2>
        </Grid>
      </GridRowContainer>
      <GridRowContainer gap={1}>
        <Grid item>
          <ETCaption1
            color={Palette.neutral.main}
            sx={{ fontSize: "13px", letterSpacing: "0.39px" }}
          >
            UPCOMING MILESTONE
          </ETCaption1>
        </Grid>
        <Grid item>
          <ETCaption1
            color={Palette.neutral.main}
            sx={{ fontSize: "13px", letterSpacing: "0.39px" }}
          >
            NOV.10 2023
          </ETCaption1>
        </Grid>
      </GridRowContainer>
      <Grid item sx={{ paddingBottom: "8px" }}>
        <ETHeading4
          bold
          color={Palette.neutral.dark}
          sx={{ fontSize: 16, lineHeight: "24px" }}
        >
          PIN Notice of Intent
        </ETHeading4>
      </Grid>
      <GridRowContainer gap={1} sx={{ paddingBottom: "16px" }}>
        <Grid item>
          <ETCaption1
            color={Palette.neutral.main}
            sx={{ fontSize: "13px", letterSpacing: "0.39px" }}
          >
            LAST STATUS UPDATE
          </ETCaption1>
        </Grid>
        <Grid item>
          <ETCaption1
            color={Palette.neutral.main}
            sx={{ fontSize: "13px", letterSpacing: "0.39px" }}
          >
            JUN.10 2023
          </ETCaption1>
        </Grid>
        <Grid item sx={{ marginTop: "2px" }}>
          <IndicatorSmallIcon />
        </Grid>
      </GridRowContainer>
      <Grid item>
        <ETCaption1
          color={Palette.neutral.main}
          sx={{ fontSize: "13px", letterSpacing: "0.39px" }}
        >
          IAAC INVOLVEMENT
        </ETCaption1>
      </Grid>
      <Grid item>
        <ETParagraph
          color={Palette.neutral.dark}
          sx={{ fontSize: "16px", lineHeight: "24px" }}
        >
          None
        </ETParagraph>
      </Grid>
    </Grid>
  );
};

export default CardBody;