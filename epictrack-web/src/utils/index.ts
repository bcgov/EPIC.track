import dateUtils from "./dateUtils";

const sort = (collection: any[], sortField: string) => {
  const collator = new Intl.Collator("en-GB", {
    numeric: true,
    ignorePunctuation: true,
    sensitivity: "base",
  });

  const keys = sortField.split(".");

  return [...collection].sort(function (a, b) {
    let aValue = a;
    let bValue = b;

    for (const key of keys) {
      aValue = aValue ? aValue[key] : null;
      bValue = bValue ? bValue[key] : null;
    }

    if (aValue === null && bValue === null) {
      return 0; // both are null, so they're equal
    } else if (aValue === null) {
      return 1; // aValue is null, so it should come after bValue
    } else if (bValue === null) {
      return -1; // bValue is null, so it should come after aValue
    } else {
      return collator.compare(aValue, bValue);
    }
  });
};

const groupBy = <T>(arr: T[], fn: (item: T) => any) => {
  return arr.reduce<Record<string, T[]>>((prev, curr) => {
    const groupKey = fn(curr);
    const group = prev[groupKey] || [];
    group.push(curr);
    return { ...prev, [groupKey]: group };
  }, {});
};

const capitalizeFirstLetterOfWord = (word: string) => {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

export { dateUtils, sort, groupBy, capitalizeFirstLetterOfWord };
