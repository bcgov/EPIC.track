import dayjs, { Dayjs } from "dayjs";
import { LEGEND_ITEMS } from "../constants";
import { EventCategory, EventsGridModel, EventType } from "models/event";
import { EVENT_TYPE } from "components/workPlan/phase/type";

export const getNDaysArray = (
  startDate: Dayjs,
  count: number
): (Date | null)[] => {
  const start = dayjs(startDate);
  const startDayOfWeek = start.day(); // 0-6 (Sun-Sat)
  const days: (Date | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }
  const daysInMonth = start.daysInMonth();
  for (let i = 0; i < daysInMonth; i++) {
    days.push(start.add(i, "day").toDate());
  }
  while (days.length < count) {
    days.push(null);
  }
  return days;
};

export const isWeekendByIndex = (index: number): boolean => {
  return index % 7 === 0 || index % 7 === 6; // Sun, Sat
};

export function getLegendIconMap() {
  return LEGEND_ITEMS.reduce<Record<string, string>>((map, item) => {
    map[item.text] = item.icon;
    return map;
  }, {});
}

export function resolveEventIconName(
  event: EventsGridModel,
  icons: Record<string, string>
): string {
  if (event.type === EVENT_TYPE.TASK) return icons["Task"];
  if (event.event_configuration.event_type_id === EventType.SUBMISSION)
    return icons["Submission"];
  if (event.event_configuration.event_category_id === EventCategory.DECISION)
    return icons["Decision"];
  if (event.event_configuration.event_category_id === EventCategory.PCP)
    return icons["PCP"];
  return icons["Milestone"];
}
