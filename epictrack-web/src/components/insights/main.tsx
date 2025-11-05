import { Grid } from "@mui/material";
import { ETHeading3, ETPageContainer } from "components/shared";
import NoResultsFound from "components/NoResultsFound";
import WorkInsights from "./Work";
import ProjectInsights from "./Project";
import ButtonBar from "./ButtonBar";
import { INSIGHTS_TAB } from "./constants";
import { useInsightsContext } from "./InsightsContext";
import { Case, Switch } from "react-if";
import { Palette } from "styles/theme";
import PhaseInsights from "./Phase";

const InsightBoxWrapperStyle = {
  padding: "16px",
  border: `1px solid ${Palette.neutral.bg.dark}`,
  borderRadius: `5px !important`,
  ".MuiAccordionSummary-root": {
    flexDirection: "row-reverse",
    borderRadius: "4px",
  },
  ".Mui-expanded": {
    mt: "0px !important",
    mb: "0px !important",
  },
};

const InsightHeaderStyle = {
  paddingLeft: "16px",
  backgroundColor: Palette.neutral.bg.light,
  border: `1px solid ${Palette.neutral.bg.dark}`,
  borderRadius: 1,
  height: "60px",
  textAlign: "center",
  flexDirection: "row",
  alignItems: "center",
};

const Main = () => {
  const { activeTab, isUserAssignedToWork, isUserInsights } =
    useInsightsContext();
  return (
    <ETPageContainer>
      <Grid container direction="row" gap={2}>
        <Grid item xs={12}>
          <ButtonBar />
        </Grid>
        <Switch>
          <Case condition={activeTab === INSIGHTS_TAB.Work}>
            <Grid container item xs={12} sx={InsightHeaderStyle}>
              <ETHeading3 bold sx={{ color: Palette.primary.main }}>
                Work Dashboard
              </ETHeading3>
            </Grid>
            {!isUserAssignedToWork && isUserInsights ? (
              <Grid item xs={12} sx={InsightBoxWrapperStyle}>
                <NoResultsFound />
              </Grid>
            ) : (
              <Grid item xs={12} sx={InsightBoxWrapperStyle}>
                <WorkInsights />
              </Grid>
            )}
          </Case>
          <Case condition={activeTab === INSIGHTS_TAB.Project}>
            <Grid container item xs={12} sx={InsightHeaderStyle}>
              <ETHeading3 bold sx={{ color: Palette.primary.main }}>
                Project Dashboard
              </ETHeading3>
            </Grid>
            {!isUserAssignedToWork && isUserInsights ? (
              <Grid item xs={12} sx={InsightBoxWrapperStyle}>
                <NoResultsFound />
              </Grid>
            ) : (
              <Grid item xs={12} sx={InsightBoxWrapperStyle}>
                <ProjectInsights />
              </Grid>
            )}
          </Case>
          <Case condition={activeTab === INSIGHTS_TAB.Phase}>
            <Grid container item xs={12} sx={InsightHeaderStyle}>
              <ETHeading3 bold sx={{ color: Palette.primary.main }}>
                Phase Dashboard
              </ETHeading3>
            </Grid>
            {!isUserAssignedToWork && isUserInsights ? (
              <Grid item xs={12} sx={InsightBoxWrapperStyle}>
                <NoResultsFound />
              </Grid>
            ) : (
              <Grid item xs={12} sx={InsightBoxWrapperStyle}>
                <PhaseInsights />
              </Grid>
            )}
          </Case>
        </Switch>
      </Grid>
    </ETPageContainer>
  );
};

export default Main;
