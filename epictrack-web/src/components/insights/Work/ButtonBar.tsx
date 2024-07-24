import React from "react";
import { Stack } from "@mui/material";
import TabButton from "components/shared/TabButton";
import { useWorkInsightsContext } from "./WorkInsightsContext";
import { WORK_INSIGHTS_TAB } from "./constants";

const ButtonBar = () => {
  const { activeTab, setActiveTab } = useWorkInsightsContext();
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems={"center"}
      justifyContent={"flex-end"}
      width="100%"
    >
      <TabButton
        active={activeTab === WORK_INSIGHTS_TAB.General}
        onClick={() => setActiveTab(WORK_INSIGHTS_TAB.General)}
      >
        General
      </TabButton>
      <TabButton
        active={activeTab === WORK_INSIGHTS_TAB.Staff}
        onClick={() => setActiveTab(WORK_INSIGHTS_TAB.Staff)}
      >
        Staff
      </TabButton>
      <TabButton
        active={activeTab === WORK_INSIGHTS_TAB.Partners}
        onClick={() => setActiveTab(WORK_INSIGHTS_TAB.Partners)}
      >
        Partners
      </TabButton>
      <TabButton
        active={activeTab === WORK_INSIGHTS_TAB.Trends}
        onClick={() => setActiveTab(WORK_INSIGHTS_TAB.Trends)}
      >
        Trends
      </TabButton>
    </Stack>
  );
};

export default ButtonBar;
