import React from "react";
import { IssuesProvider } from "./IssuesContext";
import IssuesContainer from "./IssuesContainer";

const Issues = () => {
  return (
    <IssuesProvider>
      <IssuesContainer />
    </IssuesProvider>
  );
};

export default Issues;
