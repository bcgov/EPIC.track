import dateUtils from "./dateUtils";

export const naturalSortCollator = new Intl.Collator("en-GB", {
  numeric: true,
  ignorePunctuation: true,
  sensitivity: "base",
});
const sort = (collection: any[], sortField: string) => {
  const keys = sortField.split(".");
  if (keys.length > 1) {
    return collection.sort(function (a, b) {
      return naturalSortCollator.compare(
        a[keys[0]][keys[1]],
        b[keys[0]][keys[1]]
      );
    });
  } else {
    return collection.sort(function (a, b) {
      return naturalSortCollator.compare(a[sortField], b[sortField]);
    });
  }
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
