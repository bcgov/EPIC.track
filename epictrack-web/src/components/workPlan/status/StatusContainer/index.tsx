import React from "react";
import { Grid } from "@mui/material";
import { ETHeading3 } from "../../../shared";
import { Palette } from "../../../../styles/theme";
import { makeStyles } from "@mui/styles";
import StatusView from "../StatusView";
import { ETTab, ETTabs } from "../../../shared/tab/Tab";
import TabPanel from "../../../shared/tab/TabPanel";
import StatusPreview from "./StatusPreview";
import StatusNotes from "./StatusNotes";

const useStyle = makeStyles({
  title: {
    borderBottom: `2px solid ${Palette.primary.main}`,
    paddingBottom: "0.5rem",
  },
  tab: {
    paddingBottom: "0.5rem !important",
    fontSize: "1.5rem !important",
    fontWeight: 400,
    lineHeight: "1.3rem",
    "&.Mui-selected": {
      fontWeight: 400,
    },
    minHeight: "0px",
  },
  tabPanel: {
    padding: "1.5rem 0px 1rem 1rem",
    minHeight: "0px",
  },
});

const StatusContainer = () => {
  const classes = useStyle();
  const [selectedTabIndex, setSelectedTabIndex] = React.useState(0);

  const handleTabSelected = (event: React.SyntheticEvent, index: number) => {
    setSelectedTabIndex(index);
  };

  return (
    <Grid container columnSpacing={1.5}>
      <Grid item xs={8}>
        <ETHeading3 className={classes.title} color={Palette.primary.main}>
          Status
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
            }}
            label="Status Preview"
            className={classes.tab}
          />
          <ETTab label="Notes" className={classes.tab} />
        </ETTabs>
      </Grid>
      <Grid
        item
        xs={8}
        sx={{
          pt: "2rem",
        }}
      >
        <StatusView />
      </Grid>
      <Grid item xs={4}>
        <TabPanel
          index={0}
          value={selectedTabIndex}
          className={classes.tabPanel}
        >
          <StatusPreview />
        </TabPanel>
        <TabPanel
          index={1}
          value={selectedTabIndex}
          className={classes.tabPanel}
        >
          <StatusNotes />
        </TabPanel>
      </Grid>
    </Grid>
  );
};

export default StatusContainer;
