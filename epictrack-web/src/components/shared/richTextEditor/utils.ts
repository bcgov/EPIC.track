import { generateHTML } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { Color, FontSize, TextStyle } from "@tiptap/extension-text-style";
import { JSONContent } from "@tiptap/core";

export const EMPTY_DOC: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export const editorExtensions = [
  StarterKit,
  Underline,
  TextStyle,
  Color,
  FontSize,
  Link.configure({
    openOnClick: false,
    autolink: true,
    protocols: ["http", "https", "mailto"],
  }),
];

const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

type DraftInlineRange = {
  offset?: number;
  length?: number;
  style?: string;
  key?: number;
};

type DraftEntity = {
  type?: string;
  data?: { url?: string; href?: string };
};

type DraftJsBlock = {
  text?: string;
  type?: string;
  inlineStyleRanges?: DraftInlineRange[];
  entityRanges?: DraftInlineRange[];
};

type DraftJsRawContent = {
  blocks: DraftJsBlock[];
  entityMap?: Record<string, DraftEntity>;
};

type TipTapMark = {
  type: string;
  attrs?: Record<string, string>;
};

const isDraftJsContent = (value: unknown): value is DraftJsRawContent =>
  isObject(value) && Array.isArray(value.blocks);

const isTipTapContent = (value: unknown): value is JSONContent =>
  isObject(value) && value.type === "doc";

const parseInputJSON = (contentJSON: string): unknown => {
  if (!contentJSON) return null;
  try {
    return JSON.parse(contentJSON);
  } catch {
    return null;
  }
};

const draftBlockTypeToNode = (type?: string): JSONContent["type"] => {
  if (type === "unordered-list-item") return "bulletList";
  if (type === "ordered-list-item") return "orderedList";
  if (type === "header-one") return "heading";
  if (type === "blockquote") return "blockquote";
  return "paragraph";
};

const draftInlineStyleToMark = (style?: string): TipTapMark => {
  if (style === "BOLD") return { type: "bold" };
  if (style === "ITALIC") return { type: "italic" };
  if (style === "UNDERLINE") return { type: "underline" };
  return { type: "textStyle" };
};

const createTextNode = (
  text = "",
  marks: TipTapMark[] = [],
): JSONContent | null => {
  if (!text) return null;
  if (!marks.length) return { type: "text", text };
  return { type: "text", text, marks };
};

const getLinkMark = (
  entityRange: DraftInlineRange,
  entityMap: Record<string, DraftEntity> = {},
) => {
  const entityKey = String(entityRange?.key ?? "");
  const entity = entityMap[entityKey];
  if (!entity || entity.type !== "LINK") {
    return null;
  }

  const href = entity.data?.url || entity.data?.href;
  if (!href) {
    return null;
  }

  return {
    type: "link",
    attrs: {
      href,
    },
  } satisfies TipTapMark;
};

const getMarksForSegment = (
  start: number,
  end: number,
  inlineRanges: DraftInlineRange[],
  entityRanges: DraftInlineRange[],
  entityMap: Record<string, DraftEntity> = {},
) => {
  const marks: TipTapMark[] = [];

  inlineRanges.forEach((range) => {
    const rangeStart = Number(range?.offset) || 0;
    const rangeEnd = rangeStart + (Number(range?.length) || 0);
    if (start < rangeEnd && end > rangeStart) {
      const mark = draftInlineStyleToMark(range?.style);
      if (mark.type !== "textStyle") {
        marks.push(mark);
      }
    }
  });

  entityRanges.forEach((range) => {
    const rangeStart = Number(range?.offset) || 0;
    const rangeEnd = rangeStart + (Number(range?.length) || 0);
    if (start < rangeEnd && end > rangeStart) {
      const linkMark = getLinkMark(range, entityMap);
      if (linkMark) {
        marks.push(linkMark);
      }
    }
  });

  return marks;
};

export const convertDraftJsRawToTipTapJSON = (
  contentJSON: string,
): JSONContent => {
  const parsed = parseInputJSON(contentJSON);
  if (!isDraftJsContent(parsed)) {
    return EMPTY_DOC;
  }

  const nodes: JSONContent[] = [];
  parsed.blocks.forEach((block) => {
    const text = typeof block?.text === "string" ? block.text : "";
    const blockType = draftBlockTypeToNode(block?.type);
    const inlineRanges = Array.isArray(block?.inlineStyleRanges)
      ? block.inlineStyleRanges
      : [];
    const entityRanges = Array.isArray(block?.entityRanges)
      ? block.entityRanges
      : [];

    if (blockType === "bulletList" || blockType === "orderedList") {
      const listTextNode = createTextNode(text);
      const listItem: JSONContent = {
        type: "listItem",
        content: [
          { type: "paragraph", content: listTextNode ? [listTextNode] : [] },
        ],
      };
      const previousNode = nodes[nodes.length - 1];
      if (previousNode?.type === blockType) {
        previousNode.content = [...(previousNode.content ?? []), listItem];
      } else {
        nodes.push({ type: blockType, content: [listItem] });
      }
      return;
    }

    if (blockType === "heading") {
      const headingTextNode = createTextNode(text);
      nodes.push({
        type: "heading",
        attrs: { level: 1 },
        content: headingTextNode ? [headingTextNode] : [],
      });
      return;
    }

    if (!inlineRanges.length && !entityRanges.length) {
      const node = createTextNode(text);
      nodes.push({ type: blockType, content: node ? [node] : [] });
      return;
    }

    const boundaries = new Set<number>([0, text.length]);
    [...inlineRanges, ...entityRanges].forEach((range) => {
      const start = Number(range?.offset) || 0;
      const end = start + (Number(range?.length) || 0);
      boundaries.add(Math.max(0, Math.min(text.length, start)));
      boundaries.add(Math.max(0, Math.min(text.length, end)));
    });

    const sorted = Array.from(boundaries).sort((a, b) => a - b);
    const segmented: JSONContent[] = [];

    for (let i = 0; i < sorted.length - 1; i++) {
      const start = sorted[i];
      const end = sorted[i + 1];
      if (end <= start) continue;

      const marks = getMarksForSegment(
        start,
        end,
        inlineRanges,
        entityRanges,
        parsed.entityMap,
      );
      const node = createTextNode(text.slice(start, end), marks);
      if (node) {
        segmented.push(node);
      }
    }

    nodes.push({ type: blockType, content: segmented });
  });

  if (!nodes.length) {
    return EMPTY_DOC;
  }

  return {
    type: "doc",
    content: nodes,
  };
};

export const getTipTapContentFromRaw = (
  rawTextToConvert: string,
): JSONContent => {
  if (!rawTextToConvert) {
    return EMPTY_DOC;
  }

  const parsed = parseInputJSON(rawTextToConvert);
  if (isTipTapContent(parsed)) {
    return parsed;
  }

  if (isDraftJsContent(parsed)) {
    return convertDraftJsRawToTipTapJSON(rawTextToConvert);
  }

  return EMPTY_DOC;
};

export const getTextFromDraftJsContentState = (contentJSON: string): string => {
  if (!contentJSON) return "";

  const parsed = parseInputJSON(contentJSON);
  if (!parsed) {
    return contentJSON;
  }

  if (isDraftJsContent(parsed)) {
    return parsed.blocks
      .map((block: { text?: string }) => block.text || "")
      .join(" ")
      .trim();
  }

  if (isTipTapContent(parsed)) {
    const html = generateHTML(parsed, editorExtensions);
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    return document.body.textContent?.trim() || "";
  }

  return "";
};
