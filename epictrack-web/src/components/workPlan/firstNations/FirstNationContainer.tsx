import {
  FC,
  SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import debounce from "lodash/debounce";
import { Box, Grid, SxProps } from "@mui/material";
import { Work } from "../../../models/work";
import { FN_RESOURCES } from "../../../constants/application-constant";
import { Palette } from "../../../styles/theme";
import { workService } from "../../../services/workService/workService";
import { ETHeading3, ETLink, ETParagraph } from "../../shared";
import { showNotification } from "../../shared/notificationProvider";
import RichTextEditor from "../../shared/richTextEditor";
import { ETTab, ETTabs } from "../../shared/tab/Tab";
import TabPanel from "../../shared/tab/TabPanel";
import Icons from "../../icons";
import { IconProps } from "../../icons/type";
import FirstNationList from "./FirstNationList";
import { WorkplanContext } from "../WorkPlanContext";
import { WORKPLAN_TAB } from "../constants";
import useRouterLocationStateForHelpPage from "hooks/useRouterLocationStateForHelpPage";

const LinkIcon: FC<IconProps> = Icons["LinkIcon"];

const tab: SxProps = {
  paddingBottom: "0.5rem !important",
  fontSize: "1.5rem !important",
  fontWeight: 400,
  lineHeight: "1.3rem",
  "&.Mui-selected": {
    fontWeight: 400,
  },
  minHeight: "0px",
};
const tabPanel: SxProps = {
  padding: "1.5rem 0px 1rem 1rem",
  minHeight: "0px",
};

const FirstNationContainer = () => {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [notes, setNotes] = useState("");
  const ctx = useContext(WorkplanContext);

  const initialNotes = useMemo(() => ctx?.work?.first_nation_notes, [ctx]);

  useEffect(() => {
    setNotes(ctx.work?.first_nation_notes || "");
  }, [ctx.work?.first_nation_notes]);

  const handleTabSelected = (event: SyntheticEvent, index: number) => {
    setSelectedTabIndex(index);
  };

  const saveNationNotes = useCallback(
    async (value: string) => {
      const result = await workService.saveFirstNationNotes(
        Number(ctx.work?.id),
        value
      );
      if (result.status === 200) {
        ctx.setWork(result.data as Work);
        showNotification("Notes saved successfully", {
          type: "success",
          duration: 1000,
        });
      }
    },
    [ctx]
  );

  const debounceSave = useMemo(() => {
    return debounce(saveNationNotes, 1000);
  }, [saveNationNotes]);

  const handleNotesChange = (value: string) => {
    if (value !== notes) {
      setNotes(value);
      debounceSave(value);
    }
  };

  const firstNationsLabelCallback = useCallback(
    () => WORKPLAN_TAB.FIRST_NATIONS.label,
    []
  );
  useRouterLocationStateForHelpPage(firstNationsLabelCallback);

  return (
    <Grid container columnSpacing={1.5}>
      <Grid item xs={8}>
        <ETHeading3
          sx={{
            borderBottom: `2px solid ${Palette.primary.main}`,
            paddingBottom: "0.5rem",
          }}
          color={Palette.primary.main}
        >
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
              ...tab,
              paddingLeft: 0,
            }}
            label="Notes"
          />
          <ETTab
            label="Resources"
            sx={{
              ...tab,
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
          sx={{
            ...tabPanel,
          }}
        >
          <RichTextEditor
            handleEditorStateChange={handleNotesChange}
            initialRawEditorState={initialNotes}
          />
        </TabPanel>
        <TabPanel
          index={1}
          value={selectedTabIndex}
          sx={{
            ...tabPanel,
          }}
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
                      <LinkIcon fill={`${Palette.primary.accent.main}`} />
                      <ETLink
                        to={`${resource.url}`}
                        target="_blank"
                        rel="noopener"
                        style={{
                          fontSize: "1rem",
                          fontWeight: 700,
                          lineHeight: "1.5rem",
                        }}
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
