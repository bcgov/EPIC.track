import { json2csv } from "json-2-csv";
import dateUtils from "./dateUtils";

interface TableInstance<T> {
  getFilteredRowModel: () => { flatRows: { original: T }[] };
  getVisibleFlatColumns: () => { columnDef: { id?: string } }[];
}

interface ExportToCsvOptions<T> {
  table: TableInstance<T>;
  downloadDate: string | null;
  filenamePrefix: string;
  mapRow: (row: T) => any;
}

export async function exportToCsv<T>({
  table,
  downloadDate,
  filenamePrefix,
  mapRow,
}: ExportToCsvOptions<T>) {
  const filteredResult = table
    .getFilteredRowModel()
    .flatRows.map((p) => mapRow(p.original));
  const columns = table
    .getVisibleFlatColumns()
    .map((p) => p.columnDef.id?.toString());
  const csv = await json2csv(filteredResult, {
    emptyFieldValue: "",
    keys: columns as string[],
  });
  const url = window.URL.createObjectURL(new Blob([csv as any]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `${filenamePrefix}-${dateUtils.formatDate(
      downloadDate ? downloadDate : new Date().toISOString()
    )}.csv`
  );
  document.body.appendChild(link);
  link.click();
}
