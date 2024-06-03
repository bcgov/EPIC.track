import { json2csv } from "json-2-csv";
import { dateUtils } from "utils";
import { MRT_TableInstance } from "material-react-table";
import { MRT_RowData } from "material-react-table";

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

interface ExportToCsvOptions<T extends MRT_RowData> {
  table: MRT_TableInstance<T>;
  downloadDate: string | null;
  filenamePrefix: string;
}

function getStaffNamesByRole(row: any, roleName: string): string {
  return row.staff
    .filter(
      (staffMember: { role: { name: string } }) =>
        staffMember.role.name === roleName
    )
    .map(
      (staffMember: { first_name: string; last_name: string }) =>
        `${staffMember.last_name} ${staffMember.first_name}`
    )
    .join("; ");
}

const customAccessors: { [key: string]: (row: any) => any } = {
  "Responsible EPD": (row) =>
    `${row.responsible_epd?.first_name} ${row.responsible_epd?.last_name}`,
  "Work Lead": (row) =>
    /* custom logic */ `${row.work_lead?.first_name} ${row.work_lead?.last_name}`,
  Other: (row) => /* custom logic */ `${getStaffNamesByRole(row, "Other")}`,
  "Officer / Analyst": (row) =>
    `${getStaffNamesByRole(row, "Officer / Analyst")}`,
  "FN CAIRT": (row) => `${getStaffNamesByRole(row, "FN CAIRT")}`,
  Role: (row) => /* custom logic */ `${row?.role?.name}`,
};

export async function exportToCsv<T extends MRT_RowData>({
  table,
  downloadDate,
  filenamePrefix,
}: ExportToCsvOptions<T>) {
  const columns = table
    .getVisibleFlatColumns()
    .map((p) => p.columnDef.id?.toString());
  const filteredResult = table.getFilteredRowModel().flatRows.map((row) => {
    const newRow = { ...row.original };
    columns.forEach((column: string | undefined) => {
      if (column && customAccessors[column]) {
        newRow[column as keyof typeof newRow] = customAccessors[column](
          row.original
        );
      }
    });
    return newRow;
  });

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
