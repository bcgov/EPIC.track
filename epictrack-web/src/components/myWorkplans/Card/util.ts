export const daysLeft = (daysLeft: number, totalDays: number) => {
  if (daysLeft >= 0) {
    return `${daysLeft}/${totalDays} days left`;
  }

  const daysOver = Math.abs(daysLeft);

  return `${daysOver} day${daysOver > 1 ? "s" : ""} over`;
};
