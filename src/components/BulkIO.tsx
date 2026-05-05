import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Download, Upload, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import { toCSV, downloadFile, pickFile, parseCSV, printHTML } from "@/lib/io";
import { toast } from "sonner";

interface Props<T extends Record<string, unknown>> {
  entity: string;
  rows: T[];
  headers?: string[];
  onImport?: (rows: Record<string, string>[]) => void;
  template?: Record<string, string>;
}

export function BulkIO<T extends Record<string, unknown>>({ entity, rows, headers, onImport, template }: Props<T>) {
  const exportCSV = () => {
    downloadFile(`${entity}.csv`, toCSV(rows, headers));
    toast.success(`${entity}.csv downloaded (${rows.length} rows)`);
  };
  const exportExcel = () => {
    // Excel reads CSV with .xls extension or BOM; demo: CSV with BOM
    downloadFile(`${entity}.xls`, "\uFEFF" + toCSV(rows, headers), "application/vnd.ms-excel");
    toast.success(`${entity}.xls downloaded`);
  };
  const exportPDF = () => {
    const ks = headers ?? (rows[0] ? Object.keys(rows[0]) : []);
    const body = `<h1>${entity.toUpperCase()}</h1><div class="meta">Generated ${new Date().toLocaleString()}</div>
      <table><thead><tr>${ks.map((k) => `<th>${k}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((r) => `<tr>${ks.map((k) => `<td>${String(r[k as keyof T] ?? "")}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    printHTML(entity, body);
  };
  const downloadTemplate = () => {
    if (!template) return;
    downloadFile(`${entity}-template.csv`, toCSV([template]));
    toast.success("Template downloaded");
  };
  const doImport = async () => {
    if (!onImport) return;
    try {
      const text = await pickFile(".csv");
      const parsed = parseCSV(text);
      onImport(parsed);
      toast.success(`Imported ${parsed.length} rows`);
    } catch { /* cancelled */ }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-3 w-3 mr-1" /> Bulk <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export</DropdownMenuLabel>
        <DropdownMenuItem onClick={exportCSV}><Download className="h-3 w-3 mr-2" />CSV</DropdownMenuItem>
        <DropdownMenuItem onClick={exportExcel}><FileSpreadsheet className="h-3 w-3 mr-2" />Excel</DropdownMenuItem>
        <DropdownMenuItem onClick={exportPDF}><FileText className="h-3 w-3 mr-2" />PDF</DropdownMenuItem>
        {onImport && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Import</DropdownMenuLabel>
            {template && <DropdownMenuItem onClick={downloadTemplate}><FileText className="h-3 w-3 mr-2" />Download template</DropdownMenuItem>}
            <DropdownMenuItem onClick={doImport}><Upload className="h-3 w-3 mr-2" />Upload CSV</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
