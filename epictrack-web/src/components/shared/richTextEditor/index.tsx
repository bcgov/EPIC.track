import React, { useEffect } from "react";
import { EditorState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import { Box, FormControl, FormHelperText } from "@mui/material";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "./RichEditorStyles.css";
import { getEditorStateFromHtml, getEditorStateFromRaw } from "./utils";
import { Palette } from "../../../styles/theme";

const styles = {
  toolbar: {
    background: "#f9f9fb",
    marginBottom: "8px",
    padding: "8px 8px 8px",
    borderBottom: `1px solid rgb(224,224,224)`,
  },
};

const RichTextEditor = ({
  setRawText = (_rawText: string) => {
    /* empty default method  */
  },
  handleEditorStateChange = (_stringifiedEditorState: string) => {
    /* empty default method  */
  },
  initialRawEditorState = "",
  initialHTMLText = "",
  error = false,
  helperText = "",
  testId = "",
}) => {
  const getStateFromInitialValue = () => {
    if (initialRawEditorState) {
      setEditorState(getEditorStateFromRaw(initialRawEditorState));
      return;
    }

    if (initialHTMLText) {
      const contentState = getEditorStateFromHtml(initialHTMLText);
      setEditorState(contentState);
    }
  };

  const [editorState, setEditorState] = React.useState(
    getEditorStateFromRaw(initialRawEditorState)
  );
  const [focused, setFocused] = React.useState<boolean>(false);

  const handleChange = (newEditorState: EditorState) => {
    const plainText = newEditorState.getCurrentContent().getPlainText();
    setEditorState(newEditorState);
    const stringifiedEditorState = JSON.stringify(
      convertToRaw(newEditorState.getCurrentContent())
    );
    handleEditorStateChange(stringifiedEditorState);
    setRawText(plainText);
  };

  useEffect(() => {
    getStateFromInitialValue();
  }, [initialRawEditorState, initialHTMLText]);

  return (
    <FormControl fullWidth>
      <Box
        data-cy={testId}
        style={{ borderColor: `${error ? Palette.error.main : ""}` }}
      >
        <form>
          <Editor
            spellCheck
            editorState={editorState}
            onEditorStateChange={handleChange}
            handlePastedText={() => false}
            editorStyle={{
              height: "485px",
              padding: "8px 8px 8px",
              border: `1px solid ${focused ? "#0070E0" : "rgb(224,224,224)"}`,
              borderRadius: "4px",
              background: "#f9f9fb",
              marginBottom: "8px",
              fontSize: "16px",
            }}
            toolbarStyle={styles.toolbar}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            toolbar={{
              options: [
                "inline",
                "fontSize",
                "list",
                "colorPicker",
                "link",
                "emoji",
                "history",
              ],
              inline: {
                options: ["bold", "italic", "underline"],
              },
              list: { options: ["unordered", "ordered"] },
            }}
          />
        </form>
      </Box>
      <FormHelperText error={error}>{error ? helperText : ""}</FormHelperText>
    </FormControl>
  );
};

export default RichTextEditor;
