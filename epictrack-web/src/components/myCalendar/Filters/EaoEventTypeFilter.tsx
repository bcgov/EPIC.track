import { useMemo } from "react";
import FilterSelect from "components/shared/filterSelect/FilterSelect";
import { useEventCalendarContext } from "components/calendar/EventCalendarContext";
import { EventCategory, EventType } from "models/event";

export const EAO_EVENT_TYPE_OPTIONS = [
  {
    label: "Milestone (specific)",
    value: `event_position:START,END`,
  },
  { label: "Decision", value: `event_category:${EventCategory.DECISION}` },
  { label: "PCP", value: `event_category:${EventCategory.PCP}` },
  { label: "Submission", value: `event_type:${EventType.SUBMISSION}` },
];

export const EaoEventTypeFilter = () => {
  const { setSearchOptions, searchOptions } = useEventCalendarContext();

  const value = useMemo(() => {
    // If no selected values, default to all options
    const selected = EAO_EVENT_TYPE_OPTIONS.filter((option) =>
      searchOptions.event_types.includes(String(option.value)),
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
            event_types: EAO_EVENT_TYPE_OPTIONS.map((o) => String(o.value)),
          }));
          return;
        }
        setSearchOptions((prev) => ({
          ...prev,
          event_types: value as string[],
        }));
      }}
      filterClearedCallback={() => {
        // reset to all options when cleared
        setSearchOptions((prev) => ({
          ...prev,
          event_types: EAO_EVENT_TYPE_OPTIONS.map((o) => String(o.value)),
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
