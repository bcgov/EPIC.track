import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import Picker from "@emoji-mart/react";
import emojiData from "@emoji-mart/data";
import {
  Box,
  FormControl as MuiFormControl,
  FormControl,
  FormHelperText,
  IconButton,
  MenuItem,
  Popover,
  Select,
  SelectChangeEvent,
  Stack,
  Tooltip,
} from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import LinkIcon from "@mui/icons-material/Link";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import FormatClearIcon from "@mui/icons-material/FormatClear";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import "./RichEditorStyles.scss";
import { editorExtensions, EMPTY_DOC, getTipTapContentFromRaw } from "./utils";
import { Palette } from "../../../styles/theme";
import * as tokens from "../../../styles/designTokens";

const FONT_SIZE_OPTIONS = [
  "8px",
  "9px",
  "10px",
  "11px",
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
];
const EMOJI_PICKER_WIDTH = 352;
const EMOJI_PICKER_HEIGHT = 435;
const COLOR_OPTIONS = [
  "#000000",
  "#1D3557",
  "#0053A6",
  "#2A9D8F",
  "#3A5A40",
  "#E76F51",
  "#E63946",
  "#A44A3F",
  "#6D597A",
  "#6F7275",
];

export type RichTextEditorProps = {
  setRawText?: (rawText: string) => void;
  handleEditorStateChange?: (stringifiedEditorState: string) => void;
  initialRawEditorState?: string;
  initialHTMLText?: string;
  error?: boolean;
  helperText?: string;
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
}: RichTextEditorProps) => {
  const [focused, setFocused] = useState<boolean>(false);
  const [selectedFontSize, setSelectedFontSize] = useState<string>("16px");
  const [selectedColor, setSelectedColor] = useState<string>("#000000");
  const [colorAnchorEl, setColorAnchorEl] = useState<HTMLElement | null>(null);
  const [emojiAnchorPosition, setEmojiAnchorPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const editor = useEditor({
    extensions: [
      ...editorExtensions,
      Placeholder.configure({
        placeholder: "Type your notes here...",
      }),
    ],
    content: EMPTY_DOC,
    editorProps: {
      attributes: {
        class: "track-rich-editor__content",
        role: "textbox",
        "aria-multiline": "true",
      },
      handlePaste: () => false,
    },
    onUpdate: ({ editor: currentEditor }) => {
      const jsonContent = currentEditor.getJSON();
      handleEditorStateChange(JSON.stringify(jsonContent));
      setRawText(currentEditor.getText());
    },
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  });

  const applyLink = () => {
    if (!editor) return;

    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      " ",
    );

    const linkInput = window.prompt(
      selectedText ? `Add a link for: "${selectedText}"` : "Enter link URL",
      "https://",
    );

    if (!linkInput) {
      return;
    }

    const href = linkInput;

    if (!selectedText) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: "text",
          text: href,
          marks: [{ type: "link", attrs: { href } }],
        })
        .run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  };

  const embedLink = () => {
    if (!editor) return;

    const linkInput = window.prompt("Enter URL to embed", "https://");
    if (!linkInput) return;

    const href = linkInput;

    const label =
      window.prompt("Display text", href.replace(/^https?:\/\//i, "")) || href;

    editor
      .chain()
      .focus()
      .insertContent({
        type: "text",
        text: label,
        marks: [{ type: "link", attrs: { href } }],
      })
      .run();
  };

  const handleFontSizeChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setSelectedFontSize(value);
    if (!editor) return;

    editor.chain().focus().setMark("textStyle", { fontSize: value }).run();
  };

  const handleColorSelect = (value: string) => {
    setSelectedColor(value);
    if (!editor) return;

    editor.chain().focus().setColor(value).run();
    setColorAnchorEl(null);
  };

  const handleEmojiSelect = (emoji: { native?: string }) => {
    if (!editor || !emoji?.native) return;
    editor.chain().focus().insertContent(`${emoji.native} `).run();
    setEmojiAnchorPosition(null);
  };

  const openEmojiPicker = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 12;

    const left = Math.min(
      Math.max(margin, rect.right - EMOJI_PICKER_WIDTH),
      Math.max(margin, viewportWidth - EMOJI_PICKER_WIDTH - margin),
    );

    const prefersBelow =
      rect.bottom + EMOJI_PICKER_HEIGHT + margin <= viewportHeight;
    const top = prefersBelow
      ? Math.min(rect.bottom + 6, viewportHeight - EMOJI_PICKER_HEIGHT - margin)
      : Math.max(margin, rect.top - EMOJI_PICKER_HEIGHT - 6);

    setEmojiAnchorPosition({ top, left });
  };

  useEffect(() => {
    if (!editor) {
      return;
    }

    if (initialRawEditorState) {
      editor.commands.setContent(
        getTipTapContentFromRaw(initialRawEditorState),
        { emitUpdate: false },
      );
      return;
    }

    if (initialHTMLText) {
      editor.commands.setContent(initialHTMLText, { emitUpdate: false });
      return;
    }

    editor.commands.setContent(EMPTY_DOC, { emitUpdate: false });
  }, [editor, initialHTMLText, initialRawEditorState]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const updateToolbarState = () => {
      const attributes = editor.getAttributes("textStyle");
      const currentFontSize =
        typeof attributes.fontSize === "string" ? attributes.fontSize : "16px";
      const currentColor =
        typeof attributes.color === "string" ? attributes.color : "#000000";
      setSelectedFontSize(currentFontSize);
      setSelectedColor(currentColor);
    };

    updateToolbarState();
    editor.on("selectionUpdate", updateToolbarState);
    editor.on("update", updateToolbarState);

    return () => {
      editor.off("selectionUpdate", updateToolbarState);
      editor.off("update", updateToolbarState);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <FormControl fullWidth>
      <Box
        sx={{
          border: `1px solid ${
            focused
              ? tokens.surfaceColorBorderActive
              : tokens.surfaceColorBorderDefault
          }`,
          borderRadius: tokens.layoutBorderRadiusMedium,
          background: Palette.neutral.bg.light,
          ...(error && { borderColor: Palette.error.main }),
        }}
      >
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            background: Palette.neutral.bg.light,
            p: 1,
            borderBottom: `1px solid ${tokens.surfaceColorBorderDefault}`,
            flexWrap: "wrap",
          }}
        >
          <MuiFormControl size="small" sx={{ minWidth: 84 }}>
            <Select
              value={selectedFontSize}
              onChange={handleFontSizeChange}
              displayEmpty
              className="track-rich-editor__select"
            >
              {FONT_SIZE_OPTIONS.map((fontSize) => (
                <MenuItem key={fontSize} value={fontSize}>
                  {fontSize.replace("px", "")}
                </MenuItem>
              ))}
            </Select>
          </MuiFormControl>

          <Tooltip title="Bold">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleBold().run()}
              color={editor.isActive("bold") ? "primary" : "default"}
            >
              <FormatBoldIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Italic">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              color={editor.isActive("italic") ? "primary" : "default"}
            >
              <FormatItalicIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Underline">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              color={editor.isActive("underline") ? "primary" : "default"}
            >
              <FormatUnderlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Bulleted List">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              color={editor.isActive("bulletList") ? "primary" : "default"}
            >
              <FormatListBulletedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Numbered List">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              color={editor.isActive("orderedList") ? "primary" : "default"}
            >
              <FormatListNumberedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Link">
            <IconButton size="small" onClick={applyLink}>
              <LinkIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Embed Link">
            <IconButton size="small" onClick={embedLink}>
              <InsertLinkIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove Link">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().unsetLink().run()}
            >
              <LinkOffIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear Formatting">
            <IconButton
              size="small"
              onClick={() =>
                editor.chain().focus().clearNodes().unsetAllMarks().run()
              }
            >
              <FormatClearIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Text Color">
            <IconButton
              size="small"
              onClick={(event) => setColorAnchorEl(event.currentTarget)}
              sx={{ color: selectedColor }}
            >
              <FormatColorTextIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Insert Emoji">
            <IconButton
              size="small"
              onClick={(event) => openEmojiPicker(event.currentTarget)}
            >
              <EmojiEmotionsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        <Popover
          open={Boolean(colorAnchorEl)}
          anchorEl={colorAnchorEl}
          onClose={() => setColorAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          marginThreshold={16}
          slotProps={{
            paper: {
              sx: {
                p: 1,
                maxWidth: "calc(100vw - 24px)",
              },
            },
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 28px)",
              gap: 0.75,
            }}
          >
            {COLOR_OPTIONS.map((color) => (
              <Box
                key={color}
                component="button"
                type="button"
                aria-label={`Select color ${color}`}
                onClick={() => handleColorSelect(color)}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border:
                    selectedColor === color
                      ? `2px solid ${tokens.surfaceColorBorderActive}`
                      : `1px solid ${tokens.surfaceColorBorderDefault}`,
                  backgroundColor: color,
                  cursor: "pointer",
                }}
              />
            ))}
          </Box>
        </Popover>

        <Popover
          open={Boolean(emojiAnchorPosition)}
          anchorReference="anchorPosition"
          anchorPosition={emojiAnchorPosition ?? { top: 0, left: 0 }}
          onClose={() => setEmojiAnchorPosition(null)}
          marginThreshold={8}
          slotProps={{
            paper: {
              sx: {
                width: EMOJI_PICKER_WIDTH,
                maxWidth: `min(${EMOJI_PICKER_WIDTH}px, calc(100vw - 16px))`,
                maxHeight: `min(${EMOJI_PICKER_HEIGHT}px, calc(100vh - 16px))`,
                overflow: "hidden",
              },
            },
          }}
        >
          <Picker
            data={emojiData}
            onEmojiSelect={handleEmojiSelect}
            theme="light"
            previewPosition="none"
          />
        </Popover>

        <EditorContent editor={editor} />
      </Box>
      <FormHelperText error={error}>{error ? helperText : ""}</FormHelperText>
    </FormControl>
  );
};

export default RichTextEditor;
