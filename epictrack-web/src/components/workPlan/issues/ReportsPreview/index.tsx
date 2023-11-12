import React from "react";
import { Button, Grid, Stack } from "@mui/material";
import TabPanel from "../../../shared/tab/TabPanel";
import { ThirtySixtyNinety } from "./ThirtySixtyNinety";
import { ReferralSchedule } from "./ReferralSchedule";
import { IssuesContext } from "../IssuesContext";
import { PreviewSkeleton } from "./PreviewSkeleton";

const TAB = {
  THIRTY_SIXTY_NINETY: 0,
  REFERRAL_SCHEDULE: 1,
};

export const ReportsPreview = () => {
  const { isIssuesLoading } = React.useContext(IssuesContext);
  const [selectedTabIndex, setSelectedTabIndex] = React.useState(
    TAB.THIRTY_SIXTY_NINETY
  );

  if (isIssuesLoading) {
    return <PreviewSkeleton />;
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Stack direction={{ lg: "row", xs: "column" }} spacing={2}>
          <Button
            variant={
              selectedTabIndex === TAB.THIRTY_SIXTY_NINETY
                ? "contained"
                : "outlined"
            }
            onClick={() => setSelectedTabIndex(TAB.THIRTY_SIXTY_NINETY)}
          >
            30-60-90
          </Button>
          <Button
            variant={
              selectedTabIndex === TAB.REFERRAL_SCHEDULE
                ? "contained"
                : "outlined"
            }
            onClick={() => setSelectedTabIndex(TAB.REFERRAL_SCHEDULE)}
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
