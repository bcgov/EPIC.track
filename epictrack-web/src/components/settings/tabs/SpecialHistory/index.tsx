import { ETParagraph } from "components/shared";
import { SpecialHistoryProvider } from "./SpecialHistorySettingsContext";
import SpecialHistorySettings from "./SpecialHistorySettings";

const SpecialHistory = () => {
  return (
    <SpecialHistoryProvider>
      <SpecialHistorySettings />
    </SpecialHistoryProvider>
  );
};

export default SpecialHistory;
