import React, { useEffect } from "react";
import { Button, Grid, Stack } from "@mui/material";
import { ThirtySixtyNinety } from "./ThirtySixtyNinety";
import { ReferralSchedule } from "./ReferralSchedule";
import { PreviewSkeleton } from "./PreviewSkeleton";
import { WorkplanContext } from "../../../WorkPlanContext";
import TabPanel from "../../../../shared/tab/TabPanel";
import { Palette } from "styles/theme";

const TAB = {
  THIRTY_SIXTY_NINETY: 0,
  REFERRAL_SCHEDULE: 1,
};

export const ReportsPreview = () => {
  const { loading, loadIssues, issues } = React.useContext(WorkplanContext);
  const [loadingPreview, setLoadingPreview] = React.useState(true);
  const [selectedTabIndex, setSelectedTabIndex] = React.useState(
    TAB.THIRTY_SIXTY_NINETY
  );

  const handleLoadIssues = async () => {
    if (issues.length > 0) {
      setLoadingPreview(false);
      return;
    }

    await loadIssues();
    setLoadingPreview(false);
  };

  useEffect(() => {
    handleLoadIssues();
  }, []);

  if (loading || loadingPreview) {
    return <PreviewSkeleton />;
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Stack direction={{ lg: "row", xs: "column" }} spacing={2}>
          <Button
            variant="outlined"
            onClick={() => setSelectedTabIndex(TAB.THIRTY_SIXTY_NINETY)}
            sx={{
              backgroundColor:
                selectedTabIndex === TAB.THIRTY_SIXTY_NINETY
                  ? Palette.primary.main
                  : Palette.white,
              color:
                selectedTabIndex === TAB.THIRTY_SIXTY_NINETY
                  ? Palette.white
                  : Palette.primary.main,
            }}
          >
            30-60-90
          </Button>
          <Button
            variant="outlined"
            onClick={() => setSelectedTabIndex(TAB.REFERRAL_SCHEDULE)}
            sx={{
              backgroundColor:
                selectedTabIndex === TAB.REFERRAL_SCHEDULE
                  ? Palette.primary.main
                  : Palette.white,
              color:
                selectedTabIndex === TAB.REFERRAL_SCHEDULE
                  ? Palette.white
                  : Palette.primary.main,
            }}
          >
            Referral Schedule
          </Button>
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
