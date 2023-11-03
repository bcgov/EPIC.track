import React, { createContext, useContext, useEffect, useState } from "react";
import { WorkplanContext } from "../WorkPlanContext";
import issueService from "../../../services/issueService";
import { useSearchParams } from "../../../hooks/SearchParams";

interface IssuesContextProps {
  showIssuesForm: boolean;
  setShowIssuesForm: React.Dispatch<React.SetStateAction<boolean>>;
  isIssuesLoading: boolean;
}

interface IssueContainerRouteParams extends URLSearchParams {
  work_id: string;
}

export const IssuesContext = createContext<IssuesContextProps>({
  showIssuesForm: false,
  setShowIssuesForm: () => ({}),
  isIssuesLoading: true,
});

export const IssuesProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [showIssuesForm, setShowIssuesForm] = useState(false);
  const [isIssuesLoading, setIsIssuesLoading] = useState<boolean>(true);

  const { issues, setIssues } = useContext(WorkplanContext);
  const query = useSearchParams<IssueContainerRouteParams>();
  const workId = query.get("work_id");

  const loadIssues = async () => {
    console.log("A");
    if (!workId) return;

    try {
      // const response = await issueService.getAll(workId);
      // setIssues(response.data);
      console.log("B");
      setIsIssuesLoading(false);
    } catch (error) {
      setIsIssuesLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    if (!issues?.length) {
      loadIssues();
    }
  }, []);

  return (
    <IssuesContext.Provider
      value={{
        showIssuesForm,
        setShowIssuesForm,
        isIssuesLoading,
      }}
    >
      {children}
    </IssuesContext.Provider>
  );
};
