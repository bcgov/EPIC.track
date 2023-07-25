import React from "react";
import { ETHeading2, ETPageContainer } from "../shared";
import workService from "../../services/workService/workService";
import { Work } from "../../models/work";
import { useSearchParams } from "../../hooks/SearchParams";
import { Palette } from "../../styles/theme";
import { Tab } from "@mui/material";
import { Box } from "@mui/system";
import { ETTab, ETTabs } from "../shared/tab/Tab";

interface WorkPlanContainerRouteParams extends URLSearchParams {
  work_id: string;
}
const WorkPlanContainer = () => {
  const [work, setWork] = React.useState<Work>();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [selectedTabIndex, setSelectedTabIndex] = React.useState(0);
  const query = useSearchParams<WorkPlanContainerRouteParams>();

  const work_id = React.useMemo(() => query.get("work_id"), [query]);
  React.useEffect(() => {
    getWorkById();
  }, [work_id]);

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
        <ETPageContainer
          sx={{
            borderBottom: "2px solid",
            paddingBottom: "0rem !important",
            borderColor: Palette.neutral.bg.dark,
            backgroundColor: Palette.neutral.bg.light,
          }}
        >
          <Box>
            <ETHeading2 bold color={Palette.primary.main}>
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
              <ETTab label="Status & Reports" />
              <ETTab label="Issues" />
              <ETTab label="About" />
              <ETTab label="Teams" identifier="4" />
              <ETTab label="First Nations" />
            </ETTabs>
          </Box>
        </ETPageContainer>
      )}
    </>
  );
};

export default WorkPlanContainer;
