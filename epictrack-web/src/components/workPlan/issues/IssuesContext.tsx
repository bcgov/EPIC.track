import React, { createContext, useContext, useEffect, useState } from "react";
import { WorkplanContext } from "../WorkPlanContext";
import issueService from "../../../services/issueService";
import { useSearchParams } from "../../../hooks/SearchParams";
import { WorkIssue } from "../../../models/Issue";
import { IssueForm } from "./types";

interface IssuesContextProps {
  showIssuesForm: boolean;
  setShowIssuesForm: React.Dispatch<React.SetStateAction<boolean>>;
  isIssuesLoading: boolean;
  issueToEdit: WorkIssue | null;
  setIssueToEdit: React.Dispatch<React.SetStateAction<WorkIssue | null>>;
  addIssue: (issueForm: IssueForm) => Promise<void>;
  approveIssue: (issueId: number) => Promise<void>;
  issueToApproveId: number | null;
  setIssueToApproveId: React.Dispatch<React.SetStateAction<number | null>>;
}

interface IssueContainerRouteParams extends URLSearchParams {
  work_id: string;
}

export const IssuesContext = createContext<IssuesContextProps>({
  showIssuesForm: false,
  setShowIssuesForm: () => ({}),
  isIssuesLoading: true,
  issueToEdit: null,
  setIssueToEdit: () => ({}),
  addIssue: (_: IssueForm) => {
    return Promise.resolve();
  },
  issueToApproveId: null,
  setIssueToApproveId: () => {
    return;
  },
  approveIssue: (_: number) => {
    return Promise.resolve();
  },
});

export const IssuesProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [showIssuesForm, setShowIssuesForm] = useState(false);
  const [isIssuesLoading, setIsIssuesLoading] = useState<boolean>(true);
  const [issueToEdit, setIssueToEdit] = useState<WorkIssue | null>(null);

  const [issueToApproveId, setIssueToApproveId] = useState<number | null>(null);

  const { issues, setIssues } = useContext(WorkplanContext);
  const query = useSearchParams<IssueContainerRouteParams>();
  const workId = query.get("work_id");

  // // TODO: Remove mock data
  // const mockIssueUpdate: WorkIssueUpdate = {
  //   id: 1,
  //   description:
  //     "The project has been the subject of media attention due to opposition to the project from the union representing the terminal workers and environmental non-profits.",
  //   work_issue_id: 1,
  //   is_active: true,
  //   is_deleted: false,
  // };
  // const mockIssue: WorkIssue = {
  //   id: 1,
  //   title: "Union in opposition to the project",
  //   start_date: "2023-11-07",
  //   expected_resolution_date: "2023-11-07",
  //   is_active: true,
  //   is_high_priority: true,
  //   is_deleted: false,
  //   work_id: 1,
  //   approved_by: "somebody",
  //   created_by: "somebody",
  //   created_at: new Date().toISOString(),
  //   updated_by: "somebody",
  //   updated_at: "2023-11-07",
  //   updates: [mockIssueUpdate],
  // };

  // //TODO: remove mock data
  // const mockIssues = [
  //   mockIssue,
  //   { ...mockIssue, id: 2, is_high_priority: false, is_active: true },
  // ];

  const loadIssues = async () => {
    if (!workId) return;
    try {
      const response = await issueService.getAll(workId);
      setIssues(response.data);
      setIsIssuesLoading(false);
    } catch (error) {
      setIsIssuesLoading(false);
    }
  };

  useEffect(() => {
    if (!issues?.length) {
      loadIssues();
    } else {
      setIsIssuesLoading(false);
    }
  }, []);

  const addIssue = async (issueForm: IssueForm) => {
    if (!workId) return;
    setIsIssuesLoading(true);
    try {
      const request = {
        ...issueForm,
        updates: [issueForm.description],
      };
      await issueService.create(workId, request);
      loadIssues();
    } catch (error) {
      setIsIssuesLoading(false);
    }
  };

  const approveIssue = async (issueId: number) => {
    if (!workId) return;
    setIsIssuesLoading(true);
    try {
      await issueService.approve(workId, String(issueId));
      loadIssues();
    } catch (error) {
      setIsIssuesLoading(false);
    }
  };

  return (
    <IssuesContext.Provider
      value={{
        showIssuesForm,
        setShowIssuesForm,
        isIssuesLoading,
        issueToEdit,
        setIssueToEdit,
        addIssue,
        issueToApproveId,
        setIssueToApproveId,
        approveIssue,
      }}
    >
      {children}
    </IssuesContext.Provider>
  );
};
