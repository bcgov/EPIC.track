import { Stack } from "@mui/material";
import TabButton from "components/shared/TabButton";
import { INSIGHTS_TAB } from "./constants";
import { useInsightsContext } from "./InsightsContext";
import InsightsAssigneeToggle from "./InsightsAssigneeToggle";

const ButtonBar = () => {
  const { activeTab, setActiveTab, isUserInsights, setIsUserInsights } =
    useInsightsContext();
  return (
    <Stack direction={"column"} width="100%" alignItems="end" spacing={2}>
      <InsightsAssigneeToggle
        handleToggle={setIsUserInsights}
        isUserInsights={isUserInsights}
      />
      <Stack
        direction="row"
        spacing={1}
        alignItems={"center"}
        justifyContent={"flex-end"}
        width="100%"
        flexWrap="wrap"
      >
        <TabButton
          active={activeTab === INSIGHTS_TAB.Work}
          onClick={() => setActiveTab(INSIGHTS_TAB.Work)}
          data-cy="work-insights-tab-button"
        >
          Work
        </TabButton>
        <TabButton
          active={activeTab === INSIGHTS_TAB.Project}
          onClick={() => setActiveTab(INSIGHTS_TAB.Project)}
          data-cy="project-insights-tab-button"
        >
          Project
        </TabButton>
        <TabButton
          active={activeTab === INSIGHTS_TAB.Phase}
          onClick={() => setActiveTab(INSIGHTS_TAB.Phase)}
        >
          Phase
        </TabButton>
      </Stack>
    </Stack>
  );
};

export default ButtonBar;
