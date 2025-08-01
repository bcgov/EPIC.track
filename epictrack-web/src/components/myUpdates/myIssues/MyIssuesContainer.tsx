import { useContext } from "react";
import { Grid } from "@mui/material";
import IssueDialogs from "components/workPlan/issues/Dialogs";
import CardList from "../CardList";
import { MyIssuesContext } from "./MyIssuesContext";
import IssueCard from "./IssueCard";

const IssuesContainer = () => {
  const {
    issues,
    loadingIssues,
    totalIssues,
    loadingMoreIssues,
    setLoadingMoreIssues,
  } = useContext(MyIssuesContext);

  return (
    <Grid item xs={12}>
      <CardList
        items={issues}
        totalItems={totalIssues}
        loading={loadingIssues}
        loadingMore={loadingMoreIssues}
        setLoadingMore={setLoadingMoreIssues}
        CardComponent={IssueCard}
      />
      <IssueDialogs />
    </Grid>
  );
};

export default IssuesContainer;
