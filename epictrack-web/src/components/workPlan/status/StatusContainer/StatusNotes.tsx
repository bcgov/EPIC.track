import React from "react";
import RichTextEditor from "../../../shared/richTextEditor";
import { WorkplanContext } from "../../WorkPlanContext";
import statusService from "../../../../services/statusService/statusService";
import { StatusContext } from "../StatusContext";
import { showNotification } from "../../../shared/notificationProvider";
import debounce from "lodash/debounce";
import workService from "../../../../services/workService/workService";

const StatusNotes = () => {
  const { work, setWork } = React.useContext(WorkplanContext);
  const { workId } = React.useContext(StatusContext);
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    setNotes(work?.status_notes || "");
  }, [work]);

  const saveStatusNotes = React.useCallback(async (value: string) => {
    const result = await workService.saveNotes(
      Number(workId),
      value,
      "status_notes"
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
    return debounce(saveStatusNotes, 1000);
  }, [saveStatusNotes]);

  const handleNotesChange = (value: string) => {
    if (value !== notes) {
      setNotes(value);
      debounceSave(value);
    }
  };

  return (
    <RichTextEditor
      handleEditorStateChange={handleNotesChange}
      initialRawEditorState={work?.status_notes}
    />
  );
};

export default StatusNotes;
