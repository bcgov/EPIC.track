import { useCallback, useContext, useEffect, useState } from "react";
import { Grid, Stack } from "@mui/material";
import { ThirtySixtyNinety } from "./ThirtySixtyNinety";
import { ReferralSchedule } from "./ReferralSchedule";
import { PreviewSkeleton } from "./PreviewSkeleton";
import { WorkplanContext } from "../../../WorkPlanContext";
import TabPanel from "../../../../shared/tab/TabPanel";
import TabButton from "components/shared/TabButton";

const TAB = {
  THIRTY_SIXTY_NINETY: 0,
  REFERRAL_SCHEDULE: 1,
};

export const ReportsPreview = () => {
  const { loading, loadIssues, issues } = useContext(WorkplanContext);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [selectedTabIndex, setSelectedTabIndex] = useState(
    TAB.THIRTY_SIXTY_NINETY,
  );

  const handleLoadIssues = useCallback(async () => {
    if (issues.length > 0) {
      setLoadingPreview(false);
      return;
    }

    await loadIssues();
    setLoadingPreview(false);
  }, [issues.length, loadIssues]);

  useEffect(() => {
    handleLoadIssues();
  }, [handleLoadIssues]);

  if (loading || loadingPreview) {
    return <PreviewSkeleton />;
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Stack direction={{ lg: "row", xs: "column" }} spacing={2}>
          <TabButton
            active={selectedTabIndex === TAB.THIRTY_SIXTY_NINETY}
            onClick={() => setSelectedTabIndex(TAB.THIRTY_SIXTY_NINETY)}
          >
            30-60-90
          </TabButton>
          <TabButton
            active={selectedTabIndex === TAB.REFERRAL_SCHEDULE}
            onClick={() => setSelectedTabIndex(TAB.REFERRAL_SCHEDULE)}
          >
            Referral Schedule
          </TabButton>
        </Stack>
      </Grid>

      <Grid item xs={12}>
        <TabPanel value={selectedTabIndex} index={TAB.THIRTY_SIXTY_NINETY}>
          <ThirtySixtyNinety />
        </TabPanel>
        <TabPanel value={selectedTabIndex} index={TAB.REFERRAL_SCHEDULE}>
          <ReferralSchedule />
        </TabPanel>
      </Grid>
    </Grid>
  );
};
