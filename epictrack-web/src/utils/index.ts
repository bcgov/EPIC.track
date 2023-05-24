import dateUtils from "./dateUtils";
const sort = (collection: any[], sortField: string) => {
  const collator = new Intl.Collator("en", {
    numeric: true,
    ignorePunctuation: false,
  });
  return collection.sort(function (a, b) {
    return collator.compare(a[sortField], b[sortField]);
  });
};
export { dateUtils, sort };
