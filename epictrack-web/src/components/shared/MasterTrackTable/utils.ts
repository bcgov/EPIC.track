export function getSelectFilterOptions<T>(
  data: T[],
  key: keyof T,
  formatLabel: (value: any) => string = (value) => String(value)
) {
  // Step 1: Create a Map to store unique values and their formatted labels
  const optionsMap = new Map();

  // Step 2: Iterate through the data array to populate the Map
  data.forEach((dataObject) => {
    // Step 3: Skip undefined or null values
    if (dataObject[key] === undefined || dataObject[key] === null) return;

    // Step 4: Populate the Map with unique values and their formatted labels
    optionsMap.set(dataObject[key], formatLabel(dataObject[key]));
  });

  // Step 5: Convert the Map to an array of objects with 'text' and 'value' properties
  const optionsArray = Array.from(optionsMap.entries()).map(([key, value]) => ({
    text: value,
    value: key,
  }));

  return optionsArray;
}

export const roundDataSize = (dataSize: number) => {
  return Math.ceil(dataSize / 5) * 5;
};
export const rowsPerPageOptions = (dataSize = 10) => {
  const defaultOptions = [5, 10, 15, 20, 25, 30, 50, 100];
  const roundedDataSize = roundDataSize(dataSize);

  if (dataSize > defaultOptions[defaultOptions.length - 1]) {
    return [...defaultOptions, roundedDataSize];
  }

  return defaultOptions;
};
