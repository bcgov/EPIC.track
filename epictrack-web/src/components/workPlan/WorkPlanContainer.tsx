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

interface WorkPlanContainerRouteParams extends URLSearchParams {
  work_id: string;
}
const WorkPlanContainer = () => {
  const [work, setWork] = React.useState<Work>();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [selectedTabIndex, setSelectedTabIndex] = React.useState(0);
  const query = useSearchParams<WorkPlanContainerRouteParams>();
  const ctx = useContext(WorkplanContext);
  const work_id = React.useMemo(() => query.get("work_id"), [query]);

  React.useEffect(() => {
    getWorkById();
  }, [work_id]);

  React.useEffect(() => {
    ctx.selectedPhaseId = work?.current_phase_id;
  }, [work]);

  const getWorkById = React.useCallback(async () => {
    if (work_id) {
      const work = await workService.getById(String(work_id));
      setWork(work.data as Work);
      setLoading(false);
    }
  }, [work_id]);

  const handleTabSelected = (event: React.SyntheticEvent, index: number) => {
    setSelectedTabIndex(index);
  };
  console.log("selected tab index", selectedTabIndex);
  return (
    <>
      {!loading && (
        <>
          <ETPageContainer
            sx={{
              borderBottom: "2px solid",
              paddingBottom: "0rem !important",
              borderColor: Palette.neutral.bg.dark,
              backgroundColor: Palette.neutral.bg.light,
            }}
          >
            <Box>
              <ETHeading2 bold color={Palette.primary.accent.main}>
                {work?.title}
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
                  identifier="4"
                  data-title="dddd"
                  value={4}
                />
                <Tab label="Indigenous Nations" />
              </ETTabs>
            </Box>
          </ETPageContainer>
          <TabPanel index={0} value={selectedTabIndex}>
            <PhaseContainer workId={Number(work_id)} />
          </TabPanel>
        </>
      )}
    </>
  );
};

export default WorkPlanContainer;
