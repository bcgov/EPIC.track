import React from "react";
import { Box, Grid } from "@mui/material";
import { ETHeading3 } from "../../shared";
import { Palette } from "../../../styles/theme";
import { makeStyles } from "@mui/styles";
import StatusView from "./StatusView";
import { WorkplanContext } from "../WorkPlanContext";
import { ETTab, ETTabs } from "../../shared/tab/Tab";
import RichTextEditor from "../../shared/richTextEditor";
import TabPanel from "../../shared/tab/TabPanel";

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
  const ctx = React.useContext(WorkplanContext);
  const classes = useStyle();
  const [selectedTabIndex, setSelectedTabIndex] = React.useState(0);
  const status = React.useMemo(() => ctx.status, [ctx.status]);

  const handleTabSelected = (event: React.SyntheticEvent, index: number) => {
    setSelectedTabIndex(index);
  };

  const handleNotesChange = (value: string) => {
    return null;
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
          className={classes.tabPanel}
        >
          <Box
            sx={{
              backgroundColor: Palette.neutral.bg.light,
              padding: "16px 24px",
            }}
          >
            <Box
              sx={{
                fontSize: "14px",
                fontStyle: "normal",
                fontWeight: "700",
                lineHeight: "16px",
                paddingBottom: "8px",
              }}
            >
              Status
            </Box>
            {status.length === 0 && (
              <Box
                sx={{
                  color: Palette.neutral.light,
                  fontSize: "14px",
                  fontStyle: "normal",
                  fontWeight: "400",
                  lineHeight: "24px",
                  border: `1px dashed ${Palette.success.light}`,
                  padding: "8px",
                }}
              >
                Your status will appear here.
              </Box>
            )}
          </Box>
        </TabPanel>
        <TabPanel
          index={1}
          value={selectedTabIndex}
          className={classes.tabPanel}
        >
          <RichTextEditor
            handleEditorStateChange={handleNotesChange}
            // initialRawEditorState={}
          />
        </TabPanel>
      </Grid>
    </Grid>
  );
};

export default StatusContainer;
