import React, { createContext, useContext, useEffect, useState } from "react";
import { WorkplanContext } from "../WorkPlanContext";
import issueService from "../../../services/issueService";
import { useSearchParams } from "../../../hooks/useSearchParams";
import { WorkIssue, WorkIssueUpdate } from "../../../models/Issue";
import { CloneForm, CreateIssueForm, EditIssueForm } from "./types";
import { showNotification } from "components/shared/notificationProvider";
import { getErrorMessage } from "utils/axiosUtils";
import useRouterLocationStateForHelpPage from "hooks/useRouterLocationStateForHelpPage";
import { WORKPLAN_TAB } from "../constants";

interface IssuesContextProps {
  isIssuesLoading: boolean;
  workId: string | null;
  addIssue: (issueForm: CreateIssueForm) => Promise<void>;
  editIssue: (issueForm: EditIssueForm) => Promise<void>;
  editIssueUpdate: (issueForm: CloneForm) => Promise<void>;
  approveIssue: (issueId: number, issueUpdateId: number) => Promise<void>;
  issueToApproveId: number | null;
  setIssueToApproveId: React.Dispatch<React.SetStateAction<number | null>>;
  updateToClone: WorkIssueUpdate | null;
  setUpdateToClone: React.Dispatch<
    React.SetStateAction<WorkIssueUpdate | null>
  >;
  cloneIssueUpdate: (cloneForm: CloneForm) => Promise<void>;
  updateToEdit: WorkIssueUpdate | null;
  setUpdateToEdit: React.Dispatch<React.SetStateAction<WorkIssueUpdate | null>>;
  createIssueFormIsOpen: boolean;
  setCreateIssueFormIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editIsssueFormIsOpen: boolean;
  setEditIssueFormIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editIssueUpdateFormIsOpen: boolean;
  setEditIssueUpdateFormIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  newIssueUpdateFormIsOpen: boolean;
  setNewIssueUpdateFormIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  issueToEdit: WorkIssue | null;
  setIssueToEdit: React.Dispatch<React.SetStateAction<WorkIssue | null>>;
}

interface IssueContainerRouteParams extends URLSearchParams {
  work_id: string;
}

export const initialIssueContextValue = {
  isIssuesLoading: true,
  workId: null,
  addIssue: (_: CreateIssueForm) => {
    return Promise.resolve();
  },
  editIssue: (_: EditIssueForm) => {
    return Promise.resolve();
  },
  editIssueUpdate: (_: CloneForm) => {
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
  cloneIssueUpdate: (_: { description: string }) => {
    return Promise.resolve();
  },
  updateToEdit: null,
  setUpdateToEdit: () => ({}),
  issueToEdit: null,
  setIssueToEdit: () => {
    return;
  },

  createIssueFormIsOpen: false,
  setCreateIssueFormIsOpen: () => {
    return;
  },
  editIsssueFormIsOpen: false,
  setEditIssueFormIsOpen: () => {
    return;
  },
  editIssueUpdateFormIsOpen: false,
  setEditIssueUpdateFormIsOpen: () => {
    return;
  },
  newIssueUpdateFormIsOpen: false,
  setNewIssueUpdateFormIsOpen: () => {
    return;
  },
};

export const IssuesContext = createContext<IssuesContextProps>(
  initialIssueContextValue
);

export const LASTEST_ISSUE_UPDATE_INDEX = 0;

export const IssuesProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [createIssueFormIsOpen, setCreateIssueFormIsOpen] = useState(false);
  const [editIsssueFormIsOpen, setEditIssueFormIsOpen] = useState(false);
  const [editIssueUpdateFormIsOpen, setEditIssueUpdateFormIsOpen] =
    useState(false);
  const [newIssueUpdateFormIsOpen, setNewIssueUpdateFormIsOpen] =
    useState(false);

  const [isIssuesLoading, setIsIssuesLoading] = useState<boolean>(true);

  const [issueToEdit, setIssueToEdit] = useState<WorkIssue | null>(null);
  const [updateToEdit, setUpdateToEdit] = useState<WorkIssueUpdate | null>(
    null
  );

  const [updateToClone, setUpdateToClone] = useState<WorkIssueUpdate | null>(
    null
  );

  const [issueToApproveId, setIssueToApproveId] = useState<number | null>(null);

  const { issues, loadIssues } = useContext(WorkplanContext);
  const query = useSearchParams<IssueContainerRouteParams>();
  const workId = query.get("work_id");

  const handleLoadIssues = async () => {
    await loadIssues();
    setIsIssuesLoading(false);
  };

  useEffect(() => {
    if (!issues?.length) {
      handleLoadIssues();
    } else {
      setIsIssuesLoading(false);
    }
  }, []);

  const addIssue = async (issueForm: CreateIssueForm) => {
    if (!workId) return;
    setIsIssuesLoading(true);
    try {
      const request = {
        ...issueForm,
        updates: [issueForm.description],
      };
      await issueService.create(workId, request);
      handleLoadIssues();
    } catch (error) {
      const message = getErrorMessage(error);
      showNotification(message, {
        type: "error",
      });
      setIsIssuesLoading(false);
    }
  };

  const editIssue = async (issueForm: EditIssueForm) => {
    if (!workId || !issueToEdit) return;
    setIsIssuesLoading(true);
    try {
      const {
        title,
        start_date,
        expected_resolution_date,
        is_active,
        is_high_priority,
      } = issueForm;

      const request = {
        title,
        start_date,
        expected_resolution_date,
        is_active,
        is_high_priority,
      };

      await issueService.editIssue(workId, String(issueToEdit.id), request);
      handleLoadIssues();
    } catch (error) {
      const message = getErrorMessage(error);
      showNotification(message, {
        type: "error",
      });
      setIsIssuesLoading(false);
    }
  };

  const editIssueUpdate = async (issueForm: CloneForm) => {
    if (!workId || !updateToEdit) return;
    setIsIssuesLoading(true);
    try {
      const request = {
        description: issueForm.description,
        posted_date: issueForm.posted_date,
      };

      await issueService.editIssueUpdate(
        workId,
        String(updateToEdit.work_issue_id),
        String(updateToEdit.id),
        request
      );
      handleLoadIssues();
    } catch (error) {
      const message = getErrorMessage(error);
      showNotification(message, {
        type: "error",
      });
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
      handleLoadIssues();
    } catch (error) {
      const message = getErrorMessage(error);
      showNotification(message, {
        type: "error",
      });
      setIsIssuesLoading(false);
    }
  };

  const cloneIssueUpdate = async (cloneForm: CloneForm) => {
    if (!workId || !updateToClone) return;
    setIsIssuesLoading(true);
    try {
      await issueService.clone(workId, String(updateToClone.work_issue_id), {
        description: cloneForm.description,
        posted_date: cloneForm.posted_date,
      });
      handleLoadIssues();
    } catch (error) {
      const message = getErrorMessage(error);
      showNotification(message, {
        type: "error",
      });
      setIsIssuesLoading(false);
    }
  };

  useRouterLocationStateForHelpPage(() => WORKPLAN_TAB.ISSUES.label, []);

  return (
    <IssuesContext.Provider
      value={{
        isIssuesLoading,
        workId,
        addIssue,
        issueToApproveId,
        setIssueToApproveId,
        approveIssue,
        editIssue,
        updateToClone,
        setUpdateToClone,
        cloneIssueUpdate,
        updateToEdit,
        setUpdateToEdit,
        issueToEdit,
        setIssueToEdit,
        editIssueUpdate,
        createIssueFormIsOpen,
        setCreateIssueFormIsOpen,
        editIsssueFormIsOpen,
        setEditIssueFormIsOpen,
        editIssueUpdateFormIsOpen,
        setEditIssueUpdateFormIsOpen,
        newIssueUpdateFormIsOpen,
        setNewIssueUpdateFormIsOpen,
      }}
    >
      {children}
    </IssuesContext.Provider>
  );
};
