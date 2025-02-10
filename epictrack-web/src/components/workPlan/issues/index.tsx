import IssuesContainer from "./IssuesContainer";
import { IssuesProvider } from "./IssuesContext";

const Issues = () => {
  return (
    <IssuesProvider>
      <IssuesContainer />
    </IssuesProvider>
  );
};

export default Issues;
