import React from "react";
import AddIcon from "@mui/icons-material/Add";
import NoDataEver from "../../shared/NoDataEver";
import { IssuesContext } from "./IssuesContext";
import IssuesViewSkeleton from "./IssuesViewSkeleton";
import { Else, If, Then } from "react-if";
import IssueAccordion from "./IssueAccordion";
import { Button, Grid } from "@mui/material";
import { WorkplanContext } from "../WorkPlanContext";
import IssueDialogs from "./Dialogs";

const IssuesView = () => {
  const { issues } = React.useContext(WorkplanContext);
  const { isIssuesLoading, setCreateIssueFormIsOpen } =
    React.useContext(IssuesContext);

  const lastInteractedIssue = React.useRef<number | null>(null);

  if (isIssuesLoading) {
    return <IssuesViewSkeleton />;
  }

  return (
    <>
      <If condition={issues.length === 0}>
        <Then>
          <NoDataEver
            title="You don't have any Issues yet"
            subTitle="Start adding your Issues"
            addNewButtonText="Add Issue"
            onAddNewClickHandler={() => setCreateIssueFormIsOpen(true)}
          />
        </Then>
        <Else>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={() => setCreateIssueFormIsOpen(true)}
                startIcon={<AddIcon />}
              >
                Issue
              </Button>
            </Grid>
            {issues.map((issue, index) => (
              <Grid key={`accordion-${issue.id}`} item xs={12}>
                <IssueAccordion
                  issue={issue}
                  defaultOpen={
                    lastInteractedIssue.current
                      ? issue.id === lastInteractedIssue.current
                      : index === 0
                  }
                  onInteraction={() => {
                    lastInteractedIssue.current = issue.id;
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Else>
      </If>
      <IssueDialogs />
    </>
  );
};

export default IssuesView;
