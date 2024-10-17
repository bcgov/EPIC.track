import React, { useContext } from "react";
import { ETCaption3, ETHeading2, ETPageContainer } from "../shared";
import { Palette } from "../../styles/theme";
import { Box } from "@mui/system";
import { ETTab, ETTabs } from "../shared/tab/Tab";
import { SxProps } from "@mui/material";
import TabPanel from "../shared/tab/TabPanel";
import PhaseContainer from "./phase/PhaseContainer";
import { WorkplanContext } from "./WorkPlanContext";
import TeamContainer from "./team/TeamContainer";
import FirstNationContainer from "./firstNations/FirstNationContainer";
import { WorkPlanSkeleton } from "./WorkPlanSkeleton";
import Status from "./status";
import Icons from "../icons";
import { IconProps } from "../icons/type";
import Issues from "./issues";
import WorkState from "./WorkState";
import { isStatusOutOfDate } from "./status/shared";
import About from "./about";
import { useLocation } from "react-router-dom";
import { WORKPLAN_TAB } from "./constants";
import useRouterLocationStateForHelpPage from "hooks/useRouterLocationStateForHelpPage";

const IndicatorIcon: React.FC<IconProps> = Icons["IndicatorIcon"];

const tabPanel: SxProps = {
  paddingTop: "2rem",
};
const WorkPlanContainer = () => {
  const location = useLocation();

  const tabIndex = location.state?.tabIndex ?? WORKPLAN_TAB.WORKPLAN.index;

  const [selectedTabIndex, setSelectedTabIndex] = React.useState(tabIndex);

  const ctx = useContext(WorkplanContext);

  const activeStaff = ctx.team.filter(
    (staffWorkRole) => staffWorkRole.is_active
  );

  const handleTabSelected = (_event: React.SyntheticEvent, index: number) => {
    setSelectedTabIndex(index);
  };

  if (ctx.loading) {
    return <WorkPlanSkeleton />;
  }

  const statusOutOfDate =
    ctx.statuses.length === 0 ||
    isStatusOutOfDate(ctx.statuses.find((status) => status.is_approved));

  return (
    <ETPageContainer
      sx={{
        paddingBottom: "0rem !important",
      }}
    >
      <Box sx={{ display: "flex", gap: "16px" }}>
        <ETHeading2 bold color={Palette.primary.main}>
          {ctx.work?.title}
        </ETHeading2>
        <ETCaption3 bold>
          <WorkState work_state={ctx.work?.work_state} />
        </ETCaption3>
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
            label={WORKPLAN_TAB.WORKPLAN.label}
          />
          <ETTab
            label={WORKPLAN_TAB.STATUS.label}
            icon={statusOutOfDate && <IndicatorIcon />}
          />
          <ETTab label={WORKPLAN_TAB.ISSUES.label} />
          <ETTab label={WORKPLAN_TAB.ABOUT.label} />
          <ETTab
            label={WORKPLAN_TAB.TEAM.label}
            identifier={activeStaff.length.toString()}
            data-title="dddd"
          />
          <ETTab
            label={WORKPLAN_TAB.FIRST_NATIONS.label}
            identifier={ctx.firstNations.length.toString()}
          />
        </ETTabs>
      </Box>
      <TabPanel
        index={WORKPLAN_TAB.WORKPLAN.index}
        value={selectedTabIndex}
        sx={{
          ...tabPanel,
        }}
      >
        <PhaseContainer />
      </TabPanel>
      <TabPanel
        index={WORKPLAN_TAB.STATUS.index}
        value={selectedTabIndex}
        sx={{
          ...tabPanel,
        }}
      >
        <Status />
      </TabPanel>
      <TabPanel
        index={WORKPLAN_TAB.ISSUES.index}
        value={selectedTabIndex}
        sx={{
          ...tabPanel,
        }}
      >
        <Issues />
      </TabPanel>
      <TabPanel
        index={WORKPLAN_TAB.ABOUT.index}
        value={selectedTabIndex}
        sx={{
          ...tabPanel,
        }}
      >
        <About />
      </TabPanel>
      <TabPanel
        index={WORKPLAN_TAB.TEAM.index}
        value={selectedTabIndex}
        sx={{
          ...tabPanel,
        }}
      >
        <TeamContainer />
      </TabPanel>
      <TabPanel
        index={WORKPLAN_TAB.FIRST_NATIONS.index}
        value={selectedTabIndex}
        sx={{
          ...tabPanel,
        }}
      >
        <FirstNationContainer />
      </TabPanel>
    </ETPageContainer>
  );
};

export default WorkPlanContainer;
