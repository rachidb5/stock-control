export type ExcelPrimitive = string | number | boolean | Date | null;
export type ExcelRow = Record<string, ExcelPrimitive>;

function normalizeHeader(header: unknown) {
  return String(header ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeCellValue(value: ExcelPrimitive): ExcelPrimitive {
  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }

  return value;
}

export async function exportRowsToWorkbook(
  rows: ExcelRow[],
  filename: string,
  _sheetName: string,
) {
  const { default: writeExcelFile } = await import("write-excel-file/browser");

  const sheetData =
    rows.length === 0
      ? [["Nenhum dado disponivel"]]
      : [
          Object.keys(rows[0]),
          ...rows.map((row) =>
            Object.keys(rows[0]).map((header) => normalizeCellValue(row[header] ?? null)),
          ),
        ];

  await writeExcelFile(sheetData).toFile(filename);
}

export async function importRowsFromWorkbook(file: File): Promise<ExcelRow[]> {
  const { readSheet } = await import("read-excel-file/browser");
  const sheet = await readSheet(file);

  if (sheet.length === 0) {
    return [];
  }

  const [headerRow, ...dataRows] = sheet;
  const headers = headerRow.map(normalizeHeader);

  return dataRows.reduce<ExcelRow[]>((rows, dataRow) => {
    const result: ExcelRow = {};
    let hasData = false;

    headers.forEach((header, index) => {
      if (!header) {
        return;
      }

      const value = normalizeCellValue((dataRow[index] ?? null) as ExcelPrimitive);
      if (value === null || value === "") {
        return;
      }

      result[header] = value;
      hasData = true;
    });

    if (hasData) {
      rows.push(result);
    }

    return rows;
  }, []);
}
