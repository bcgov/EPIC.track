import { Stack } from "@mui/material";
import TabButton from "components/shared/TabButton";
import { INSIGHTS_TAB } from "./constants";
import { useInsightsContext } from "./InsightsContext";

const ButtonBar = () => {
  const { activeTab, setActiveTab } = useInsightsContext();
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems={"center"}
      justifyContent={"flex-end"}
      width="100%"
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
  );
};

export default ButtonBar;
