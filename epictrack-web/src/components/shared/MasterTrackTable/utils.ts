export const BLANK_OPTION = "(Blanks)";
export function getSelectFilterOptions<T>(
  data: T[],
  key: keyof T,
  formatLabel: (value: any) => string = (value) => String(value),
  formatValue: (value: any) => any = (value) => String(value)
) {
  // Step 1: Create a Map to store unique values and their formatted labels
  const optionsMap = new Map();

  // Step 2: Iterate through the data array to populate the Map
  data.forEach((dataObject) => {
    // Step 3: Skip undefined or null values
    if (
      !dataObject ||
      dataObject[key] === undefined ||
      dataObject[key] === null
    ) {
      optionsMap.set("", BLANK_OPTION);
      return;
    }

    // Step 4: Populate the Map with unique values and their formatted labels
    optionsMap.set(formatValue(dataObject[key]), formatLabel(dataObject[key]));
  });

  // Step 5: Convert the Map to an array of objects with 'text' and 'value' properties
  const optionsArray = Array.from(optionsMap.entries()).map(([key, value]) => ({
    text: value,
    value: key,
  }));

  // Step 6: Sort the array by 'value' property
  optionsArray.sort((a, b) => {
    if (a.value === "") {
      return -1;
    }

    if (b.value === "") {
      return 1;
    }

    return a.value < b.value ? -1 : 1;
  });

  return optionsArray;
}

export const rowsPerPageOptions = (dataSize = 10) => {
  const defaultOptions = [
    {
      value: 15,
      label: "15",
    },
    {
      value: dataSize,
      label: "All",
    },
  ];

  return defaultOptions;
};
