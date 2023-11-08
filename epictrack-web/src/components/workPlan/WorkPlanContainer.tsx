import React, { useContext } from "react";
import { ETHeading2, ETPageContainer } from "../shared";
import { Palette } from "../../styles/theme";
import { Box } from "@mui/system";
import { ETTab, ETTabs } from "../shared/tab/Tab";
import TabPanel from "../shared/tab/TabPanel";
import PhaseContainer from "./phase/PhaseContainer";
import { WorkplanContext } from "./WorkPlanContext";
import TeamContainer from "./team/TeamContainer";
import { makeStyles } from "@mui/styles";
import FirstNationContainer from "./firstNations/FirstNationContainer";
import { WorkPlanSkeleton } from "./WorkPlanSkeleton";
import Status from "./status";
import Icons from "../icons";
import { IconProps } from "../icons/type";
import Issues from "./issues";

const IndicatorIcon: React.FC<IconProps> = Icons["IndicatorIcon"];

const useStyle = makeStyles({
  tabPanel: {
    paddingTop: "2rem",
  },
});
const WorkPlanContainer = () => {
  const [selectedTabIndex, setSelectedTabIndex] = React.useState(0);
  const ctx = useContext(WorkplanContext);
  const classes = useStyle();

  const activeStaff = ctx.team.filter(
    (staffWorkRole) => staffWorkRole.is_active
  );

  const handleTabSelected = (event: React.SyntheticEvent, index: number) => {
    setSelectedTabIndex(index);
  };

  if (ctx.loading) {
    return <WorkPlanSkeleton />;
  }

  return (
    <ETPageContainer
      sx={{
        paddingBottom: "0rem !important",
      }}
    >
      <Box>
        <ETHeading2 bold color={Palette.primary.main}>
          {ctx.work?.title}
        </ETHeading2>
      </Box>
      <Box
        sx={{
          marginTop: "1rem",
        }}
      >
        <ETTabs
          sx={{
            gap: "2rem",
          }}
          onChange={handleTabSelected}
          value={selectedTabIndex}
        >
          <ETTab
            sx={{
              paddingLeft: 0,
            }}
            label="Workplan"
          />
          <ETTab
            label="Status"
            icon={
              (ctx.statuses.length === 0 ||
                ctx.statuses[0].is_approved === false) && <IndicatorIcon />
            }
          />
          <ETTab label="Issues" />
          <ETTab label="About Project" />
          <ETTab
            label="Teams"
            identifier={activeStaff.length.toString()}
            data-title="dddd"
          />
          <ETTab
            label="First Nations"
            identifier={ctx.firstNations.length.toString()}
          />
        </ETTabs>
      </Box>
      <TabPanel index={0} value={selectedTabIndex} className={classes.tabPanel}>
        <PhaseContainer />
      </TabPanel>
      <TabPanel index={1} value={selectedTabIndex} className={classes.tabPanel}>
        <Status />
      </TabPanel>
      <TabPanel index={2} value={selectedTabIndex} className={classes.tabPanel}>
        <Issues />
      </TabPanel>
      <TabPanel index={4} value={selectedTabIndex} className={classes.tabPanel}>
        <TeamContainer />
      </TabPanel>
      <TabPanel index={5} value={selectedTabIndex} className={classes.tabPanel}>
        <FirstNationContainer />
      </TabPanel>
    </ETPageContainer>
  );
};

export default WorkPlanContainer;
