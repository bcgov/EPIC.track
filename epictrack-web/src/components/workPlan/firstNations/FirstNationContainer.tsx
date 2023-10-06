import React from "react";
import { Box, Grid } from "@mui/material";
import Icon from "@mui/material/Icon";
import { ETHeading3, ETLink, ETParagraph } from "../../shared";
import { Palette } from "../../../styles/theme";
import { makeStyles } from "@mui/styles";
import FirstNationList from "./FirstNationList";
import { ETTab, ETTabs } from "../../shared/tab/Tab";
import TabPanel from "../../shared/tab/TabPanel";
import { WorkplanContext } from "../WorkPlanContext";
import RichTextEditor from "../../shared/richTextEditor";
import { FN_RESOURCES } from "../../../constants/application-constant";
import Icons from "../../icons";
import { IconProps } from "../../icons/type";
import debounce from "lodash/debounce";
import workService from "../../../services/workService/workService";
import { Work } from "../../../models/work";
import { showNotification } from "../../shared/notificationProvider";

const LinkIcon: React.FC<IconProps> = Icons["LinkIcon"];

const useStyle = makeStyles({
  title: {
    borderBottom: `2px solid ${Palette.primary.main}`,
    paddingBottom: "0.5rem",
  },
  tabPanel: {
    padding: "1.5rem 1rem 1rem 1rem",
    minHeight: "0px",
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
  resoureLink: {
    fontSize: "1rem",
    fontWeight: 700,
    lineHeight: "1.5rem",
  },
  linkIcon: {
    fill: Palette.primary.accent.main,
  },
});

const FirstNationContainer = () => {
  const classes = useStyle();
  const [selectedTabIndex, setSelectedTabIndex] = React.useState(0);
  const [notes, setNotes] = React.useState("");

  const ctx = React.useContext(WorkplanContext);

  const handleTabSelected = (event: React.SyntheticEvent, index: number) => {
    setSelectedTabIndex(index);
  };

  const saveNationNotes = React.useCallback(async (value: string) => {
    const result = await workService.saveFirstNationNotes(
      Number(ctx.work?.id),
      value
    );
    if (result.status === 200) {
      // TODO: Save this new work to ctx?
      // const work = result.data as Work
      showNotification("Notes saved successfully", {
        type: "success",
        duration: 1000,
      });
    }
  }, []);

  const debounceSave = React.useMemo(() => {
    return debounce(saveNationNotes, 500);
  }, [saveNationNotes]);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    debounceSave(value);
  };

  return (
    <Grid container columnSpacing={1.5}>
      <Grid item xs={8}>
        <ETHeading3 className={classes.title} color={Palette.primary.main}>
          First Nations
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
            label="Notes"
            className={classes.tab}
          />
          <ETTab label="Resources" className={classes.tab} />
        </ETTabs>
      </Grid>
      <Grid
        item
        xs={8}
        sx={{
          pt: "2rem",
        }}
      >
        <FirstNationList />
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
          <RichTextEditor
            handleEditorStateChange={handleNotesChange}
            initialRawEditorState={ctx.work?.first_nation_notes}
          />
        </TabPanel>
        <TabPanel
          index={1}
          value={selectedTabIndex}
          className={classes.tabPanel}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {FN_RESOURCES.map((resource) => {
              return (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      padding: "1rem 1.5rem",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: ".5rem",
                      alignSelf: "stretch",
                      borderRadius: "4px",
                      backgroundColor: Palette.neutral.bg.light,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        gap: ".5rem",
                        alignItems: "center",
                      }}
                    >
                      <LinkIcon className={classes.linkIcon} />
                      <ETLink
                        to={`${resource.url}`}
                        target="_blank"
                        rel="noopener"
                        className={classes.resoureLink}
                      >
                        {resource.title}
                      </ETLink>
                    </Box>
                    <ETParagraph enableEllipsis={false}>
                      {resource.description}
                    </ETParagraph>
                  </Box>
                </>
              );
            })}
          </Box>
        </TabPanel>
      </Grid>
    </Grid>
  );
};

export default FirstNationContainer;
