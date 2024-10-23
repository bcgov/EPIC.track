import React from "react";
import { Grid } from "@mui/material";
import { ETHeading3 } from "../../shared";
import { Palette } from "../../../styles/theme";
import { ETTab, ETTabs } from "../../shared/tab/Tab";
import TabPanel from "../../shared/tab/TabPanel";
import IssuesView from "./IssuesView";
import { ReportsPreview } from "./ReportsPreview";
import Notes from "./Notes";
import { titleStyle, tabStyle, tabPanelStyle } from "../common/styles";

const IssuesContainer = () => {
  const [selectedTabIndex, setSelectedTabIndex] = React.useState(0);

  const handleTabSelected = (_: React.SyntheticEvent, index: number) => {
    setSelectedTabIndex(index);
  };

  return (
    <Grid container columnSpacing={1.5} marginBottom={"2em"}>
      <Grid item xs={8}>
        <ETHeading3
          sx={{
            ...titleStyle,
          }}
          color={Palette.primary.main}
        >
          Issues
        </ETHeading3>
      </Grid>
      <Grid item xs={4}>
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
            sx={{
              paddingLeft: 0,
              ...tabStyle,
            }}
            label="Reports Preview"
          />
          <ETTab
            label="Notes"
            sx={{
              ...tabStyle,
            }}
          />
        </ETTabs>
      </Grid>
      <Grid
        item
        xs={8}
        sx={{
          pt: "2rem",
        }}
      >
        <IssuesView />
      </Grid>
      <Grid
        item
        xs={4}
        sx={{
          pt: "2rem",
        }}
      >
        <TabPanel
          index={0}
          value={selectedTabIndex}
          sx={{
            ...tabPanelStyle,
          }}
        >
          <ReportsPreview />
        </TabPanel>
        <TabPanel
          index={1}
          value={selectedTabIndex}
          sx={{
            ...tabPanelStyle,
          }}
        >
          <Notes />
        </TabPanel>
      </Grid>
    </Grid>
  );
};

export default IssuesContainer;
