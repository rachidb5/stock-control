declare module "jspdf-autotable" {
  import { jsPDF } from "jspdf";

  type TableCell = string | number | boolean | null | undefined;
  type TableRow = TableCell[];
  type TableStyles = Record<string, string | number | boolean | undefined>;

  interface MarginOptions {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  }

  export interface UserOptions {
    head?: TableRow[];
    body?: TableRow[];
    foot?: TableRow[];
    startY?: number;
    margin?: number | MarginOptions;
    pageBreak?: "auto" | "avoid" | "always";
    tableWidth?: "auto" | "wrap" | number;
    showHead?: "everyPage" | "firstPage" | "never";
    showFoot?: "everyPage" | "lastPage" | "never";
    theme?: "striped" | "grid" | "plain";
    styles?: TableStyles;
    headStyles?: TableStyles;
    bodyStyles?: TableStyles;
    footStyles?: TableStyles;
    alternateRowStyles?: TableStyles;
    columnStyles?: Record<string, TableStyles>;
  }

  export default function autoTable(doc: jsPDF, options: UserOptions): void;
}
