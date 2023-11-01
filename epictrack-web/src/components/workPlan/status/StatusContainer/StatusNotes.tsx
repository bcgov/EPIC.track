import RichTextEditor from "../../../shared/richTextEditor";

const StatusNotes = () => {
  const handleNotesChange = (value: string) => {
    return null;
  };

  return (
    <RichTextEditor
      handleEditorStateChange={handleNotesChange}
      // initialRawEditorState={}
    />
  );
};

export default StatusNotes;
