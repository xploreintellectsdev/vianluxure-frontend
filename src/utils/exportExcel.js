import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

/**
 * Export an array of objects to a styled .xlsx file.
 *
 * - Headers: mild golden background, bold black text
 * - Columns auto-fit to content ("collapse to the cells")
 * - All cells vertically/horizontally aligned, with light borders
 *
 * @param {Array<Object>} data - array of row objects (keys become headers)
 * @param {string} filename - output filename, e.g. 'orders.xlsx'
 * @param {string} sheetName - worksheet tab name
 */
export const exportToExcel = async (data, filename = 'export.xlsx', sheetName = 'Data') => {
  if (!data || data.length === 0) {
    console.warn('exportToExcel: no data to export');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  const headers = Object.keys(data[0]);

  // Define columns (key must match the object keys for worksheet.addRow to map correctly)
  worksheet.columns = headers.map((key) => ({
    header: key,
    key,
    width: 12, // temporary; auto-fit calculated below
  }));

  // Add data rows
  data.forEach((row) => worksheet.addRow(row));

  // ---- Header styling: mild golden background, black bold text ----
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD4AF37' }, // mild/muted gold
    };
    cell.font = {
      color: { argb: 'FF000000' }, // black text
      bold: true,
      size: 11,
      name: 'Calibri',
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFB8912E' } },
      left: { style: 'thin', color: { argb: 'FFB8912E' } },
      bottom: { style: 'thin', color: { argb: 'FFB8912E' } },
      right: { style: 'thin', color: { argb: 'FFB8912E' } },
    };
  });
  headerRow.height = 22;

  // ---- Body styling: alignment + light borders on every cell ----
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // header already styled
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: false };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
      };
    });
    // subtle zebra striping (optional; remove if not wanted)
    if (rowNumber % 2 === 0) {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFAF7EF' },
        };
      });
    }
  });

  // ---- Auto-fit column widths ("collapse to the cells") ----
  worksheet.columns.forEach((column) => {
    let maxLength = column.header ? String(column.header).length : 10;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const cellValue = cell.value == null ? '' : String(cell.value);
      maxLength = Math.max(maxLength, cellValue.length);
    });
    // padding + cap so one giant cell doesn't blow out the sheet
    column.width = Math.min(Math.max(maxLength + 3, 10), 50);
  });

  // Freeze header row so it stays visible on scroll
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];

  // ---- Write and trigger download (browser) ----
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/octet-stream',
  });
  saveAs(blob, filename);
};