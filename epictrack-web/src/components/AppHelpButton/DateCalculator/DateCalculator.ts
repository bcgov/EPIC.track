import { showNotification } from "components/shared/notificationProvider";

export const isNonBCBusinessDay = (date: Date | null) => {
  // No date is acceptible
  if (!date) {
    return "Invalid Date";
  }

  // Valid date?
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  // Weekend?
  const day = date.getDay();
  if (day === 0) {
    return "Sunday";
  }
  if (day === 6) {
    return "Saturday";
  }

  // Holiday?
  const month = date.getMonth() + 1;
  const monthDay = date.getDate();
  const isMonday = day === 1;

  // New Year's Day
  if (month === 1 && monthDay === 1) {
    return "New Year's Day";
  }

  // Family Day: Second Monday of February
  if (month === 2 && isMonday && monthDay > 7 && monthDay < 15) {
    return "Family Day";
  }

  // Good Friday: Hard-coded.
  const year = date.getFullYear();
  if (
    (year === 2017 && month === 4 && monthDay === 14) ||
    (year === 2018 && month === 3 && monthDay === 30) ||
    (year === 2019 && month === 4 && monthDay === 19) ||
    (year === 2020 && month === 4 && monthDay === 10) ||
    (year === 2021 && month === 4 && monthDay === 2) ||
    (year === 2022 && month === 4 && monthDay === 15) ||
    (year === 2023 && month === 4 && monthDay === 7) ||
    (year === 2024 && month === 3 && monthDay === 29) ||
    (year === 2025 && month === 4 && monthDay === 18) ||
    (year === 2026 && month === 4 && monthDay === 3) ||
    (year === 2027 && month === 3 && monthDay === 26)
  ) {
    return "Good Friday";
  }

  // Easter Monday: Hard-coded.
  if (
    (year === 2017 && month === 4 && monthDay === 17) ||
    (year === 2018 && month === 4 && monthDay === 2) ||
    (year === 2019 && month === 4 && monthDay === 22) ||
    (year === 2020 && month === 4 && monthDay === 13) ||
    (year === 2021 && month === 4 && monthDay === 5) ||
    (year === 2022 && month === 4 && monthDay === 18) ||
    (year === 2023 && month === 4 && monthDay === 10) ||
    (year === 2024 && month === 4 && monthDay === 1) ||
    (year === 2025 && month === 4 && monthDay === 21) ||
    (year === 2026 && month === 4 && monthDay === 6) ||
    (year === 2027 && month === 3 && monthDay === 29)
  ) {
    return "Easter Monday";
  }

  // Victoria Day: Penultimate Monday of May
  if (month === 5 && isMonday && monthDay > 17 && monthDay < 25) {
    return "Victoria Day";
  }

  // Canada Day: will fall on the 2nd if the 1st is a Sunday
  if (
    (month === 7 && monthDay === 1) ||
    (month === 7 && monthDay === 2 && isMonday)
  ) {
    return "Canada Day";
  }

  // B.C. Day: First Monday of August
  if (month === 8 && isMonday && monthDay < 8) {
    return "B.C. Day";
  }

  // Labour Day: First Monday of September
  if (month === 9 && isMonday && monthDay < 8) {
    return "Labour Day";
  }

  // Thanksgiving Day: Second Monday of October
  if (month === 10 && isMonday && monthDay > 7 && monthDay < 15) {
    return "Thanksgiving Day";
  }

  // Remembrance Day
  if (month === 11 && monthDay === 11) {
    return "Remembrance Day";
  }

  // Christmas Day
  if (month === 12 && monthDay === 25) {
    return "Christmas Day";
  }

  // Boxing Day
  if (month === 12 && monthDay === 26) {
    return "Boxing Day";
  }

  // Otherwise
  return "";
};

export class DayCalculatorResult {
  startDate: Date | null = null;
  endDate: Date | null = null;
  numDays: number | null = null;
}

export const dateCalculator = (
  regular: boolean,
  suspended: boolean,
  numDays: number | null,
  startDate: Date | null,
  endDate: Date | null,
  suspendDate: Date | null,
  resumeDate: Date | null
) => {
  const calcRes = new DayCalculatorResult();

  calcRes.startDate = startDate;
  calcRes.endDate = endDate;
  calcRes.numDays = numDays;

  if (suspended && suspendDate && resumeDate && suspendDate >= resumeDate) {
    // Show error if resume date is later than suspend date
    showNotification(
      "The suspension date must come before the resumption date.",
      {
        type: "error",
      }
    );
    throw new Error(
      "The suspension date must come before the resumption date."
    );
  }

  if (suspended && suspendDate && !resumeDate) {
    // show error if resume date not filled while suspend date is
    showNotification("A resumption date is required.", {
      type: "error",
    });
    throw new Error("A resumption date is required.");
  }

  if (suspended && !suspendDate && resumeDate) {
    // show error if suspend date is not filled while resume date is
    showNotification("A suspension date is required.", {
      type: "error",
    });
    throw new Error("A suspension date is required.");
  }

  // Given two of Start Date, End Date, and Number of Days, calculate the third field.

  if (startDate && endDate) {
    if (startDate >= endDate) {
      // Show error if start date is later than end date
      showNotification("The start date must come before the end date.", {
        type: "error",
      });
      throw new Error("The start date must come before the end date.");
    }

    // Include the start date in the calculation.
    calcRes.numDays = regular ? 1 : 0;

    // Count the number of days between start and end dates
    const date = new Date(startDate);

    // Look at every date between
    while (date < endDate) {
      date.setDate(date.getDate() + 1);

      // Factor in a suspension
      if (suspended && suspendDate && date >= suspendDate) {
        // Stop if the suspension goes past the end date
        if (!resumeDate || endDate < resumeDate) {
          return calcRes;
        }

        // Don't count days in the suspension range
        if (date < resumeDate) {
          continue;
        }
      }

      // If we've made it this far, count the day
      calcRes.numDays++;
    }
  } else if (startDate && calcRes.numDays) {
    // Find the end date from the start date and number of days
    endDate = new Date(startDate);

    // Include the start date in the calculation.
    numDays = regular ? 1 : 0;

    // Start counting the days
    while (numDays < calcRes.numDays) {
      endDate.setDate(endDate.getDate() + 1);

      // Factor in a suspension
      if (suspended && suspendDate && endDate >= suspendDate) {
        if (!resumeDate) {
          // Can't find an end date if there is no resume date
          calcRes.endDate = null;
          return calcRes;
        }

        // Don't count days in the suspension range
        if (endDate < resumeDate) {
          continue;
        }
      }

      // If we've made it this far, count the day
      numDays++;
    }
    // convert moment date back to Date() object so it displays in datepicker

    calcRes.endDate = endDate;
  } else if (endDate && calcRes.numDays) {
    // Find the start date from the end date and number of days

    startDate = new Date(endDate);

    // Include the start date in the calculation.
    numDays = regular ? 1 : 0;

    // Start counting back the days
    while (numDays < calcRes.numDays) {
      startDate.setDate(startDate.getDate() - 1);

      // Factor in a suspension
      if (suspended && suspendDate && startDate >= suspendDate) {
        if (!resumeDate) {
          // Can't find a start date if there is no resume date
          calcRes.startDate = null;
          return calcRes;
        }

        // Don't count days in the suspension range
        if (startDate < resumeDate) {
          continue;
        }
      }

      // If we've made it this far, count the day
      numDays++;
    }

    // convert moment date back to Date() object so it displays in datepicker
    calcRes.startDate = startDate;
  }
  return calcRes;
};
