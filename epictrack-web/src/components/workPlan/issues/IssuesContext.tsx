import React, { createContext, useContext, useEffect, useState } from "react";
import { WorkplanContext } from "../WorkPlanContext";
import issueService from "../../../services/issueService";
import { useSearchParams } from "../../../hooks/SearchParams";
import { WorkIssue, WorkIssueUpdate } from "../../../models/Issue";
import { CloneForm, IssueForm } from "./types";

interface IssuesContextProps {
  showIssuesForm: boolean;
  setShowIssuesForm: React.Dispatch<React.SetStateAction<boolean>>;
  isIssuesLoading: boolean;
  issueToEdit: WorkIssue | null;
  setIssueToEdit: React.Dispatch<React.SetStateAction<WorkIssue | null>>;
  addIssue: (issueForm: IssueForm) => Promise<void>;
  updateIssue: (issueForm: IssueForm) => Promise<void>;
  approveIssue: (issueId: number, issueUpdateId: number) => Promise<void>;
  issueToApproveId: number | null;
  setIssueToApproveId: React.Dispatch<React.SetStateAction<number | null>>;
  updateToClone: WorkIssueUpdate | null;
  setUpdateToClone: React.Dispatch<
    React.SetStateAction<WorkIssueUpdate | null>
  >;
  showCloneForm: boolean;
  setShowCloneForm: React.Dispatch<React.SetStateAction<boolean>>;
  cloneIssueUpdate: (cloneForm: { description: string }) => Promise<void>;
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
  updateIssue: (_: IssueForm) => {
    return Promise.resolve();
  },
  issueToApproveId: null,
  setIssueToApproveId: () => {
    return;
  },
  approveIssue: (_issueId: number, _issueUpdateId: number) => {
    return Promise.resolve();
  },
  updateToClone: null,
  setUpdateToClone: () => ({}),
  showCloneForm: false,
  setShowCloneForm: () => ({}),
  cloneIssueUpdate: (_: { description: string }) => {
    return Promise.resolve();
  },
});

export const LASTEST_ISSUE_UPDATE_INDEX = 0;

export const IssuesProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [showIssuesForm, setShowIssuesForm] = useState(false);
  const [isIssuesLoading, setIsIssuesLoading] = useState<boolean>(true);
  const [issueToEdit, setIssueToEdit] = useState<WorkIssue | null>(null);

  const [showCloneForm, setShowCloneForm] = useState<boolean>(false);
  const [updateToClone, setUpdateToClone] = useState<WorkIssueUpdate | null>(
    null
  );

  const [issueToApproveId, setIssueToApproveId] = useState<number | null>(null);

  const { issues, setIssues } = useContext(WorkplanContext);
  const query = useSearchParams<IssueContainerRouteParams>();
  const workId = query.get("work_id");

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

  const getDescriptionUpdates = (issueForm: IssueForm) => {
    if (!issueToEdit || !issueForm.description_id) return [];

    return (
      issueToEdit.updates
        ?.filter(
          (update) =>
            update.id === issueForm.description_id &&
            update.description !== issueForm.description
        )
        .map((update) => ({
          ...update,
          description: issueForm.description,
        })) ?? []
    );
  };

  const updateIssue = async (issueForm: IssueForm) => {
    if (!workId || !issueToEdit) return;
    setIsIssuesLoading(true);
    try {
      const descriptionUpdates = getDescriptionUpdates(issueForm);

      const {
        title,
        description,
        start_date,
        expected_resolution_date,
        is_active,
        is_high_priority,
      } = issueForm;

      const request = {
        title,
        description,
        start_date,
        expected_resolution_date,
        is_active,
        is_high_priority,
        updates: descriptionUpdates,
      };
      await issueService.update(workId, String(issueToEdit.id), request);
      loadIssues();
    } catch (error) {
      setIsIssuesLoading(false);
    }
  };

  const approveIssue = async (issueId: number, issueUpdateId: number) => {
    if (!workId) return;
    setIsIssuesLoading(true);
    try {
      await issueService.approve(
        workId,
        String(issueId),
        String(issueUpdateId)
      );
      loadIssues();
    } catch (error) {
      setIsIssuesLoading(false);
    }
  };

  const cloneIssueUpdate = async (cloneForm: CloneForm) => {
    if (!workId || !updateToClone) return;
    setIsIssuesLoading(true);
    try {
      await issueService.clone(workId, String(updateToClone.work_issue_id), {
        description_data: [cloneForm.description],
      });
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
        updateIssue,
        updateToClone,
        setUpdateToClone,
        showCloneForm,
        setShowCloneForm,
        cloneIssueUpdate,
      }}
    >
      {children}
    </IssuesContext.Provider>
  );
};
