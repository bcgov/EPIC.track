import { PhaseInsightsContextProvider } from "./PhaseInsightsContext";
import PhaseInsightsContainer from "./PhaseInsightsContainer";

const PhaseInsights = () => {
  return (
    <PhaseInsightsContextProvider>
      <PhaseInsightsContainer />
    </PhaseInsightsContextProvider>
  );
};

export default PhaseInsights;
