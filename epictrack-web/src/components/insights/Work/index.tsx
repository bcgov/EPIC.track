import { WorkInsightsContextProvider } from "./WorkInsightsContext";
import WorkInsightsContainer from "./WorkInsightsContainer";

const WorkInsights = () => {
  return (
    <WorkInsightsContextProvider>
      <WorkInsightsContainer />
    </WorkInsightsContextProvider>
  );
};

export default WorkInsights;
