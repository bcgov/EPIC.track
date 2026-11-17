import { useMemo } from "react";
import FilterSelect from "components/shared/filterSelect/FilterSelect";
import { useEventCalendarContext } from "components/calendar/EventCalendarContext";
import { CalendarEventFilter } from "models/event";

export const EAO_EVENT_TYPE_OPTIONS: {
  label: string;
  value: CalendarEventFilter;
}[] = [
  { label: "Milestone (specific)", value: "start_end_milestone" },
  { label: "Decision", value: "decision" },
  { label: "PCP", value: "pcp" },
  { label: "Submission", value: "submission" },
];

export const EaoEventTypeFilter = () => {
  const { setSearchOptions, searchOptions } = useEventCalendarContext();

  const value = useMemo(() => {
    // If no selected values, default to all options
    const selected = EAO_EVENT_TYPE_OPTIONS.filter((option) =>
      searchOptions.event_types.includes(option.value),
    );
    return selected.length > 0 ? selected : EAO_EVENT_TYPE_OPTIONS;
  }, [searchOptions.event_types]);

  return (
    <FilterSelect
      options={EAO_EVENT_TYPE_OPTIONS}
      variant="inline-standalone"
      placeholder={"Event Type"}
      filterAppliedCallback={(value) => {
        if (!value || value.length === 0) {
          // fallback to all options if nothing selected
          setSearchOptions((prev) => ({
            ...prev,
            event_types: EAO_EVENT_TYPE_OPTIONS.map((o) => o.value),
          }));
          return;
        }
        setSearchOptions((prev) => ({
          ...prev,
          event_types: value as CalendarEventFilter[],
        }));
      }}
      filterClearedCallback={() => {
        // reset to all options when cleared
        setSearchOptions((prev) => ({
          ...prev,
          event_types: EAO_EVENT_TYPE_OPTIONS.map((o) => o.value),
        }));
      }}
      value={value}
      name="eventType"
      isMulti
      info={true}
      isSearchable={false}
    />
  );
};
