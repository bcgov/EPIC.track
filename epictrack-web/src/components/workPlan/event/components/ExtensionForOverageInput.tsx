import { useEffect, useState } from "react";
import Moment from "moment";
import { Grid, TextField } from "@mui/material";
import {
  ETFormLabel,
  ETFormLabelWithCharacterLimit,
  ETParagraph,
} from "../../../shared";
import TrackSelect from "../../../shared/TrackSelect";
import { ListType } from "../../../../models/code";
import { eventsApi } from "api/events";
import { showNotification } from "../../../shared/notificationProvider";
import {
  COMMON_ERROR_MESSAGE,
  MONTH_DAY_YEAR,
} from "../../../../constants/application-constant";

const REASON_MAX_LENGTH = 60;

interface ExtensionForOverageInputProps {
  days: number;
  endDate?: string;
  eaActId?: number;
  actSectionId?: number;
  onActSectionChange: (actSectionId?: number) => void;
  reason: string;
  onReasonChange: (reason: string) => void;
}

/** The Time Limit Extension a legislated END needs, added in the same step as the END. */
const ExtensionForOverageInput = ({
  days,
  endDate,
  eaActId,
  actSectionId,
  onActSectionChange,
  reason,
  onReasonChange,
}: ExtensionForOverageInputProps) => {
  const [actSections, setActSections] = useState<ListType[]>([]);

  useEffect(() => {
    if (!eaActId) return;
    eventsApi
      .listActSections(eaActId)
      .then(setActSections)
      .catch(() => showNotification(COMMON_ERROR_MESSAGE, { type: "error" }));
  }, [eaActId]);

  const dayCount = `${days} day${days === 1 ? "" : "s"}`;
  return (
    <Grid container direction="column" gap={1} sx={{ mt: 2 }}>
      <ETParagraph data-cy="overage-extension-summary">
        This legislated phase would end {dayCount} over its time limit, and the
        law requires a Time Limit Extension that covers it. A {days}-day
        extension dated {Moment(endDate).format(MONTH_DAY_YEAR)} will be added
        first.
      </ETParagraph>
      <ETFormLabel required>Act Section</ETFormLabel>
      <div data-cy="overage-act-section">
        <TrackSelect
          options={actSections}
          value={actSections.find((section) => section.id === actSectionId)}
          getOptionValue={(o: any) => String(o.id)}
          getOptionLabel={(o: any) => o.name}
          onChange={(o: any) => onActSectionChange(o?.id)}
          fullWidth
        />
      </div>
      <ETFormLabelWithCharacterLimit
        characterCount={reason.length}
        maxCharacterLength={REASON_MAX_LENGTH}
      >
        Reason
      </ETFormLabelWithCharacterLimit>
      <TextField
        data-cy="overage-reason"
        fullWidth
        multiline
        rows={3}
        value={reason}
        inputProps={{ maxLength: REASON_MAX_LENGTH }}
        onChange={(e) => onReasonChange(e.target.value)}
      />
    </Grid>
  );
};

export default ExtensionForOverageInput;
