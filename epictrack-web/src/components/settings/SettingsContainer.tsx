import { SyntheticEvent, useState } from "react";
import { Box } from "@mui/system";
import { ETTab, ETTabs } from "../shared/tab/Tab";
import { ETHeading2, ETPageContainer } from "../shared";
import TabPanel from "../shared/tab/TabPanel";
import GeneralSettings from "./tabs/GeneralSettings";
import SpecialHistory from "./tabs/SpecialHistory";
import UserManagementList from "./tabs/UserManagementList";
import { SETTINGS_TAB } from "./constants";
import { Palette } from "styles/theme";

const SettingsContainer = () => {
  const [selectedTabIndex, setSelectedTabIndex] = useState(
    SETTINGS_TAB.GENERAL.index,
  );

  const handleTabSelected = (_event: SyntheticEvent, index: number) => {
    setSelectedTabIndex(index);
  };

  return (
    <ETPageContainer>
      <Box sx={{ display: "flex", gap: "16px" }}>
        <ETHeading2 bold color={Palette.primary.main}>
          Settings
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
          <ETTab label={SETTINGS_TAB.GENERAL.label} />
          <ETTab label={SETTINGS_TAB.SPECIAL_HISTORY.label} />
          <ETTab label={SETTINGS_TAB.USER_MANAGEMENT.label} />
        </ETTabs>
      </Box>
      <TabPanel index={SETTINGS_TAB.GENERAL.index} value={selectedTabIndex}>
        <GeneralSettings />
      </TabPanel>
      <TabPanel
        index={SETTINGS_TAB.SPECIAL_HISTORY.index}
        value={selectedTabIndex}
      >
        <SpecialHistory />
      </TabPanel>
      <TabPanel
        index={SETTINGS_TAB.USER_MANAGEMENT.index}
        value={selectedTabIndex}
      >
        <UserManagementList />
      </TabPanel>
    </ETPageContainer>
  );
};

export default SettingsContainer;
