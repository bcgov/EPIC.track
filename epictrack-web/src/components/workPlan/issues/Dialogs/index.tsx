import React from "react";
import CreateIssueDialog from "./CreateIssueDialog";
import EditIssueDialog from "./EditIssueDialog";
import NewIssueUpdateDialog from "./NewIssueUpdateDialog";
import EditIssueUpdateDialog from "./EditIssueUpdateDialog";

const IssueDialogs = () => {
  return (
    <>
      <CreateIssueDialog />
      <EditIssueDialog />
      <NewIssueUpdateDialog />
      <EditIssueUpdateDialog />
    </>
  );
};

export default IssueDialogs;
