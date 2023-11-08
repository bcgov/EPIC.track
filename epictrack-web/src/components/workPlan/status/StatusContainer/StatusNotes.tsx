import React from "react";
import RichTextEditor from "../../../shared/richTextEditor";
import { WorkplanContext } from "../../WorkPlanContext";
import statusService from "../../../../services/statusService/statusService";
import { StatusContext } from "../StatusContext";
import { showNotification } from "../../../shared/notificationProvider";
import debounce from "lodash/debounce";

const StatusNotes = () => {
  const { statuses, getWorkStatuses } = React.useContext(WorkplanContext);
  const { workId } = React.useContext(StatusContext);
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    setNotes(statuses[0]?.notes || "");
  }, [statuses]);

  const saveStatusNotes = React.useCallback(async (value: string) => {
    console.log("HERE");
    console.log(value);
    const result = await statusService.update(
      Number(workId),
      Number(statuses[0]?.id),
      value
    );
    if (result.status === 200) {
      getWorkStatuses();
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
    if (value !== statuses[0]?.notes) {
      setNotes(value);
      debounceSave(value);
    }
  };

  return (
    <>
      {statuses.length > 0 && (
        <RichTextEditor
          // TODO handle notes save
          // handleEditorStateChange={handleNotesChange}
          initialRawEditorState={statuses[0]?.notes}
        />
      )}
    </>
  );
};

export default StatusNotes;
