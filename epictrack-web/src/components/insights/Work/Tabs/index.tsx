import React from "react";
import { Case, Switch } from "react-if";
import { WORK_INSIGHTS_TAB } from "../constants";
import Staff from "./Staff";
import { useWorkInsightsContext } from "../WorkInsightsContext";
import General from "./General";

const WorkInsightsTabs = () => {
  const { activeTab } = useWorkInsightsContext();
  return (
    <Switch>
      <Case condition={activeTab === WORK_INSIGHTS_TAB.Staff}>
        <Staff />
      </Case>
      <Case condition={activeTab === WORK_INSIGHTS_TAB.General}>
        <General />
      </Case>
    </Switch>
  );
};

export default WorkInsightsTabs;
