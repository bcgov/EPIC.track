import React, { useContext } from "react";
import { ETHeading2, ETPageContainer } from "../shared";
import workService from "../../services/workService/workService";
import { Work } from "../../models/work";
import { useSearchParams } from "../../hooks/SearchParams";
import { Palette } from "../../styles/theme";
import { Tab } from "@mui/material";
import { Box } from "@mui/system";
import { ETTab, ETTabs } from "../shared/tab/Tab";
import TabPanel from "../shared/tab/TabPanel";
import PhaseContainer from "./phase/PhaseContainer";
import { WorkplanContext } from "./WorkPlanContext";
import TeamContainer from "./team/TeamContainer";
import { makeStyles } from "@mui/styles";
import FirstNationContainer from "./firstNations/FirstNationContainer";

const useStyle = makeStyles({
  tabPanel: {
    padding: "2rem 2.5rem 1.5rem 2.5rem",
  },
});
const WorkPlanContainer = () => {
  const [selectedTabIndex, setSelectedTabIndex] = React.useState(0);
  const ctx = useContext(WorkplanContext);
  const classes = useStyle();

  const activeStaff = React.useMemo(
    () => ctx.team.filter((p) => p.is_active),
    [ctx.team]
  );
  const handleTabSelected = (event: React.SyntheticEvent, index: number) => {
    setSelectedTabIndex(index);
  };
  return (
    <>
      {!ctx.loading && (
        <>
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
                <ETTab label="Status" />
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
          </ETPageContainer>
          <TabPanel
            index={0}
            value={selectedTabIndex}
            className={classes.tabPanel}
          >
            <PhaseContainer />
          </TabPanel>
          <TabPanel
            index={4}
            value={selectedTabIndex}
            className={classes.tabPanel}
          >
            <TeamContainer />
          </TabPanel>
          <TabPanel
            index={5}
            value={selectedTabIndex}
            className={classes.tabPanel}
          >
            <FirstNationContainer />
          </TabPanel>
        </>
      )}
    </>
  );
};

export default WorkPlanContainer;
