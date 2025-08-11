import dayjs, { Dayjs } from "dayjs";

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

export const isWeekendByDate = (date: Date): boolean => {
  const day = dayjs(date).day();
  return day === 0 || day === 6; // Sun, Sat
};

export const isWeekendByIndex = (index: number): boolean => {
  return index % 7 === 0 || index % 7 === 6; // Sun, Sat
};

export const addDays = (date: Date, n: number): Date => {
  return dayjs(date).add(n, "day").toDate();
};
