import { useContext } from "react";
import { Box, Grid } from "@mui/material";
import { WorkIssueDashboardItem } from "models/Issue";
import IssueDetails from "components/workPlan/issues/IssueAccordion/Details";
import { IssuesProvider } from "components/workPlan/issues/IssuesContext";
import EditIssueDialog from "components/workPlan/issues/Dialogs/EditIssueDialog";
import NewIssueUpdateDialog from "components/workPlan/issues/Dialogs/NewIssueUpdateDialog";
import EditIssueUpdateDialog from "components/workPlan/issues/Dialogs/EditIssueUpdateDialog";
import { MyIssuesContext } from "../MyIssuesContext";
import IssueCardHeader from "./IssueCardHeader";

export interface IssueCardProps {
  item: WorkIssueDashboardItem;
}

const IssueCard = ({ item }: IssueCardProps) => {
  const { refetchIssues } = useContext(MyIssuesContext);
  return (
    <Box
      sx={{
        border: `2px solid var(--neutral-background-dark, #DBDCDC)`,
        borderRadius: "4px",
      }}
    >
      <IssuesProvider
        key={item.issue?.id}
        workId={String(item.work_id)}
        refetchIssues={refetchIssues}
      >
        <IssueCardHeader item={item} />
        <Grid
          container
          sx={{
            padding: "16px",
            height: "380px",
            overflowY: "auto",
          }}
          direction="column"
          justifyContent="flex-start"
          alignItems="flex-start"
          gap={2}
        >
          <IssueDetails
            issue={item.issue}
            showStalenessIcon={true}
            headingCaption={item.work_name}
          ></IssueDetails>
        </Grid>
        <EditIssueDialog headingCaption={item.work_name} />
        <NewIssueUpdateDialog headingCaption={item.work_name} />
        <EditIssueUpdateDialog headingCaption={item.work_name} />
      </IssuesProvider>
    </Box>
  );
};

export default IssueCard;
