import React, { createContext } from "react";
import { EVENT_TYPE } from "../phase/type";

export interface HighlightedRow {
  type: EVENT_TYPE;
  id: number;
}

interface EventContextProps {
  highlightedRow: HighlightedRow | null;
  handleHighlightRow: (rowToHighlight?: HighlightedRow) => void;
}

export const EventContext = createContext<EventContextProps>({
  highlightedRow: null,
  handleHighlightRow: (_rowToHighlight?: HighlightedRow) => {
    return;
  },
});

let highlightTimout: null | NodeJS.Timeout = null;
export const EventProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [highlightedRow, setHighlightedRow] =
    React.useState<HighlightedRow | null>(null);

  const handleHighlightRow = (rowToHighlight?: HighlightedRow) => {
    if (!rowToHighlight) return;
    if (highlightTimout) {
      clearTimeout(highlightTimout);
    }
    const HIGHLIGHT_DURATION = 6000;
    setHighlightedRow(rowToHighlight);
    highlightTimout = setTimeout(() => {
      setHighlightedRow(null);
    }, HIGHLIGHT_DURATION);
  };

  return (
    <EventContext.Provider
      value={{
        highlightedRow,
        handleHighlightRow,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};
