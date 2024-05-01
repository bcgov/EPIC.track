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

    keys.forEach((key) => {
      aValue = aValue[key];
      bValue = bValue[key];
    });

    return collator.compare(aValue, bValue);
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
