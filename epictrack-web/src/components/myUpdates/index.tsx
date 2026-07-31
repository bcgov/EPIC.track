import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Grid, Stack } from "@mui/material";
import { useAppSelector } from "hooks";
import { ETPageContainer } from "components/shared";
import { ETTabs, ETTab } from "components/shared/tab/Tab";
import { getTotalHeaderHeight } from "components/layout/Header/constants";
import { tabStyle } from "components/workPlan/common/styles";
import { WORKPLAN_TAB } from "components/workPlan/constants";
import TabPanel from "../shared/tab/TabPanel";
import { MyIssuesProvider } from "./myIssues/MyIssuesContext";
import IssueContainer from "./myIssues/MyIssuesContainer";
import IssueFilters from "./myIssues/Filters";
import IssuesAssigneeToggle from "./myIssues/Filters/IssuesAssigneeToggle";
import { MyStatusesProvider } from "./myStatuses/MyStatusContext";
import StatusAssigneeToggle from "./myStatuses/Filters/StatusAssigneeToggle";
import StatusContainer from "./myStatuses/MyStatusContainer";
import StatusFilters from "./myStatuses/Filters";
import { MY_UPDATES_TABS } from "./constants";
import { Palette } from "../../styles/theme";

const MyUpdates = () => {
  const { showEnvBanner } = useAppSelector((state) => state.uiState);
  const location = useLocation();
  const tabIndex = location.state?.tabIndex ?? WORKPLAN_TAB.WORKPLAN.index;
  const [selectedTabIndex, setSelectedTabIndex] = useState(tabIndex);

  const handleTabSelected = (_event: React.SyntheticEvent, index: number) => {
    setSelectedTabIndex(index);
  };

  /* 
    Providers need to wrap entire content as tab selection is below filters.
    Empty panels are used when the other tab is active
    */
  if (selectedTabIndex === MY_UPDATES_TABS.STATUS.index) {
    return (
      <MyStatusesProvider>
        <ETPageContainer container spacing={2}>
          <Grid
            item
            xs={12}
            container
            spacing={2}
            sx={{
              position: "sticky",
              top: getTotalHeaderHeight(showEnvBanner),
              backgroundColor: Palette.white,
              paddingBottom: "1em",
            }}
          >
            <Grid item xs={12} container justifyContent="flex-end">
              <Stack direction="row" spacing={1}>
                <StatusAssigneeToggle />
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <StatusFilters />
            </Grid>
            <Grid item xs={12} sx={{ marginTop: "2rem" }}>
              <ETTabs
                sx={{
                  gap: "2rem",
                  minHeight: "0px",
                  height: "100%",
                }}
                onChange={handleTabSelected}
                value={selectedTabIndex}
              >
                <ETTab
                  label={MY_UPDATES_TABS.STATUS.label}
                  sx={{ ...tabStyle, fontWeight: "400" }}
                />
                <ETTab
                  label={MY_UPDATES_TABS.ISSUES.label}
                  sx={{ ...tabStyle }}
                />
              </ETTabs>
            </Grid>
            <Grid item xs={12}>
              <TabPanel
                index={MY_UPDATES_TABS.STATUS.index}
                value={selectedTabIndex}
              >
                <StatusContainer />
              </TabPanel>
              <TabPanel
                index={MY_UPDATES_TABS.ISSUES.index}
                value={selectedTabIndex}
              >
                {/* Empty panel because issues not active */}
              </TabPanel>
            </Grid>
          </Grid>
        </ETPageContainer>
      </MyStatusesProvider>
    );
  }

  if (selectedTabIndex === MY_UPDATES_TABS.ISSUES.index) {
    return (
      <MyIssuesProvider>
        <ETPageContainer container spacing={2}>
          <Grid
            item
            xs={12}
            container
            spacing={2}
            sx={{
              position: "sticky",
              top: getTotalHeaderHeight(showEnvBanner),
              backgroundColor: Palette.white,
              paddingBottom: "1em",
            }}
          >
            <Grid item xs={12} container justifyContent="flex-end">
              <Stack direction="row" spacing={1}>
                <IssuesAssigneeToggle />
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <IssueFilters />
            </Grid>
            <Grid item xs={12} sx={{ marginTop: "2rem" }}>
              <ETTabs
                sx={{
                  gap: "2rem",
                  minHeight: "0px",
                  height: "100%",
                }}
                onChange={handleTabSelected}
                value={selectedTabIndex}
              >
                <ETTab
                  label={MY_UPDATES_TABS.STATUS.label}
                  sx={{ ...tabStyle }}
                />
                <ETTab
                  label={MY_UPDATES_TABS.ISSUES.label}
                  sx={{ ...tabStyle }}
                />
              </ETTabs>
            </Grid>
            <Grid item xs={12}>
              <TabPanel
                index={MY_UPDATES_TABS.STATUS.index}
                value={selectedTabIndex}
              >
                {/* Empty panel because status not active */}
              </TabPanel>
              <TabPanel
                index={MY_UPDATES_TABS.ISSUES.index}
                value={selectedTabIndex}
              >
                <IssueContainer />
              </TabPanel>
            </Grid>
          </Grid>
        </ETPageContainer>
      </MyIssuesProvider>
    );
  }

  return null;
};

export default MyUpdates;
