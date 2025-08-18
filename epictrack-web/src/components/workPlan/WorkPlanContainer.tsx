import React, { useContext } from "react";
import { useLocation } from "react-router-dom";
import { SxProps } from "@mui/material";
import { Box } from "@mui/system";
import { Palette } from "../../styles/theme";
import { ETCaption3, ETHeading2, ETPageContainer } from "../shared";
import { ETTab, ETTabs } from "../shared/tab/Tab";
import TabPanel from "../shared/tab/TabPanel";
import { WorkplanContext } from "./WorkPlanContext";
import { WorkPlanSkeleton } from "./WorkPlanSkeleton";
import About from "./about";
import FirstNationContainer from "./firstNations/FirstNationContainer";
import Issues from "./issues";
import PhaseContainer from "./phase/PhaseContainer";
import Status from "./status";
import { calculateStatusStaleness } from "./status/shared";
import TeamContainer from "./team/TeamContainer";
import WorkState from "./WorkState";
import Icons from "../icons";
import { IconProps } from "../icons/type";
import { WORKPLAN_TAB } from "./constants";
import { StalenessEnum } from "constants/application-constant";
import { issueListMaxStaleness } from "./utils";

const IndicatorIcon: React.FC<IconProps> = Icons["IndicatorIcon"];
const ExclamationSmallIcon: React.FC<IconProps> = Icons["ExclamationSmallIcon"];
const tabPanel: SxProps = {
  paddingTop: "2rem",
  height: "100%",
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

  const statusStaleness =
    ctx.statuses.length === 0
      ? StalenessEnum.CRITICAL
      : calculateStatusStaleness(
          ctx.statuses.find((status) => status.is_approved),
          ctx.statusStalenessSetting?.staleness_length,
          ctx.statusStalenessSetting?.warning_length
        );

  const highestStaleness = issueListMaxStaleness(
    ctx.issues,
    ctx.issueStalenessSetting?.staleness_length,
    ctx.issueStalenessSetting?.warning_length
  );

  const iconStyles = React.useMemo(() => {
    if (highestStaleness === StalenessEnum.CRITICAL) {
      return {
        fill: Palette.error.light,
      };
    }
    if (highestStaleness === StalenessEnum.WARN) {
      return {
        fill: Palette.secondary.light,
      };
    }
    return {
      fill: Palette.white,
    };
  }, [highestStaleness]);

  return (
    <>
      {ctx.loading ? (
        <WorkPlanSkeleton />
      ) : (
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
              {/* Track-606
              <ETTab
                sx={{
                  paddingLeft: 0,
                }}
                label={WORKPLAN_TAB.CALENDAR.label}
              /> */}
              <ETTab
                label={WORKPLAN_TAB.STATUS.label}
                icon={
                  (statusStaleness === StalenessEnum.CRITICAL ||
                    statusStaleness === StalenessEnum.WARN) && <IndicatorIcon />
                }
              />
              <ETTab
                label={WORKPLAN_TAB.ISSUES.label}
                icon={
                  <ExclamationSmallIcon
                    style={{
                      ...iconStyles,
                    }}
                  />
                }
              />
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
          {/* Track-606
          <TabPanel
            index={WORKPLAN_TAB.CALENDAR.index}
            value={selectedTabIndex}
            sx={{
              ...tabPanel,
            }}
          >
            <Calendar
              initialSearchOptions={{
                regions: [],
                work_types: [],
                project_types: [],
                event_types: ["include_tasks:true"],
                work_ids: ctx.work?.id ? [ctx.work?.id] : [],
                staff_id: null,
                year: new Date().getFullYear(),
              }}
            />
          </TabPanel>
          */}
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
      )}
    </>
  );
};

export default WorkPlanContainer;
