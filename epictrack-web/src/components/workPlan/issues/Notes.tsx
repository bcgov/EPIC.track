import React from "react";
import RichTextEditor from "../../shared/richTextEditor";
import { WorkplanContext } from "../WorkPlanContext";
import { IssuesContext } from "./IssuesContext";
import { showNotification } from "../../shared/notificationProvider";
import debounce from "lodash/debounce";
import workService from "../../../services/workService/workService";

const Notes = () => {
  const { work, setWork } = React.useContext(WorkplanContext);
  const { workId } = React.useContext(IssuesContext);
  const [notes, setNotes] = React.useState("");
  const initialNotes = React.useMemo(() => work?.issue_notes, [work?.id]);

  React.useEffect(() => {
    setNotes(work?.issue_notes || "");
  }, [work]);

  const saveIssuesNotes = React.useCallback(async (value: string) => {
    const result = await workService.saveNotes(
      Number(workId),
      value,
      "issue_notes"
    );
    if (result.status === 200) {
      setWork(result.data);
      showNotification("Notes saved successfully", {
        type: "success",
        duration: 1000,
      });
    }
  }, []);

  const debounceSave = React.useMemo(() => {
    return debounce(saveIssuesNotes, 1000);
  }, [saveIssuesNotes]);

  const handleNotesChange = (value: string) => {
    if (value !== notes) {
      setNotes(value);
      debounceSave(value);
    }
  };

  return (
    <RichTextEditor
      handleEditorStateChange={handleNotesChange}
      initialRawEditorState={initialNotes}
    />
  );
};

export default Notes;
