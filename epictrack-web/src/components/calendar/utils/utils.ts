import { LEGEND_ITEMS } from "../constants";
import { EventCategory, EventsGridModel, EventType } from "models/event";
import { EVENT_TYPE } from "components/workPlan/phase/type";

/**
 * Returns an array of Dates (and nulls for empty slots) representing
 * a month grid starting from the given startDate.
 */
export const getNDaysArray = (
  startDate: Date,
  count: number,
): (Date | null)[] => {
  const start = new Date(startDate);
  const startDayOfWeek = start.getDay(); // 0–6 (Sun–Sat)
  const days: (Date | null)[] = [];

  // Fill leading nulls before the first day
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }

  // Get number of days in the month
  const year = start.getFullYear();
  const month = start.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Fill the actual days
  for (let i = 0; i < daysInMonth; i++) {
    const date = new Date(year, month, start.getDate() + i);
    days.push(date);
  }

  // Fill trailing nulls to reach desired count
  while (days.length < count) {
    days.push(null);
  }

  return days;
};

/**
 * Determines whether a cell index in a 7-day grid corresponds to a weekend.
 */
export const isWeekendByIndex = (index: number): boolean => {
  const dayOfWeek = index % 7;
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
};

/**
 * Builds a map of legend text → icon.
 */
export function getLegendIconMap() {
  return LEGEND_ITEMS.reduce<Record<string, string>>((map, item) => {
    map[item.text] = item.icon;
    return map;
  }, {});
}

/**
 * Resolves which icon name to use for a given event.
 */
export function resolveEventIconName(
  event: EventsGridModel,
  icons: Record<string, string>,
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
