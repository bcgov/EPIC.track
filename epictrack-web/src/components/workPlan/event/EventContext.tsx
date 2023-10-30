import React, { createContext } from "react";
import { EVENT_TYPE } from "../phase/type";

export interface HighlightedRow {
  type: EVENT_TYPE;
  id: number;
}

interface EventContextProps {
  highlightedRows: HighlightedRow[];
  handleHighlightRows: (rowsToHighlight?: HighlightedRow[]) => void;
}

export const EventContext = createContext<EventContextProps>({
  highlightedRows: [],
  handleHighlightRows: (_rowToHighlight?: HighlightedRow[]) => {
    return;
  },
});

let highlightTimout: null | NodeJS.Timeout = null;
export const EventProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [highlightedRows, setHighlightedRows] = React.useState<
    HighlightedRow[]
  >([]);

  const handleHighlightRows = (rowsToHighlight?: HighlightedRow[]) => {
    if (!rowsToHighlight) return;
    if (highlightTimout) {
      clearTimeout(highlightTimout);
    }
    const HIGHLIGHT_DURATION = 6000;
    setHighlightedRows(rowsToHighlight);
    highlightTimout = setTimeout(() => {
      setHighlightedRows([]);
    }, HIGHLIGHT_DURATION);
  };

  return (
    <EventContext.Provider
      value={{
        highlightedRows,
        handleHighlightRows,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};
