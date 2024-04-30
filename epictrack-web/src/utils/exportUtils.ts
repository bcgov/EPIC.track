import { json2csv } from "json-2-csv";
import dateUtils from "./dateUtils";
import { MRT_TableInstance } from "material-react-table";
import { MRT_RowData } from "material-react-table";
interface ExportToCsvOptions<T extends MRT_RowData> {
  table: MRT_TableInstance<T>;
  downloadDate: string | null;
  filenamePrefix: string;
}

export async function exportToCsv<T extends MRT_RowData>({
  table,
  downloadDate,
  filenamePrefix,
}: ExportToCsvOptions<T>) {
  const filteredResult = table
    .getFilteredRowModel()
    .flatRows.map((p) => p.original);
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
