import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Printer, FileDown, Pencil } from "lucide-react";
import { toast } from "sonner";
import { printHTML } from "@/lib/io";

interface Props {
  title: string;
  html: string; // body html for printing/PDF
  onEdit?: () => void;
  emailTo?: string;
}

export function DocActions({ title, html, onEdit, emailTo }: Props) {
  return (
    <div className="flex flex-wrap gap-1">
      {onEdit && (
        <Button size="sm" variant="outline" onClick={onEdit}><Pencil className="h-3 w-3 mr-1" /> Edit</Button>
      )}
      <Button size="sm" variant="outline" onClick={() => printHTML(title, html)}>
        <Printer className="h-3 w-3 mr-1" /> Print
      </Button>
      <Button size="sm" variant="outline" onClick={() => printHTML(title, html)}>
        <FileDown className="h-3 w-3 mr-1" /> PDF
      </Button>
      <Button size="sm" variant="outline" onClick={() => toast.success(`Email sent${emailTo ? ` to ${emailTo}` : ""} (demo)`)}>
        <Mail className="h-3 w-3 mr-1" /> Email
      </Button>
      <Button size="sm" variant="outline" onClick={() => toast.success("SMS sent (demo)")}>
        <MessageSquare className="h-3 w-3 mr-1" /> SMS
      </Button>
    </div>
  );
}
