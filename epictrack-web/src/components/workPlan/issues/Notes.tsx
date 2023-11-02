import React from "react";
import RichTextEditor from "../../shared/richTextEditor";

export const Notes = () => {
  const handleNotesChange = (value: string) => {
    return null;
  };

  return <RichTextEditor handleEditorStateChange={handleNotesChange} />;
};
