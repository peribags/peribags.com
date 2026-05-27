import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  empty = "No results.",
}: {
  rows: T[];
  columns: Array<{ key: keyof T; label: string }>;
  empty?: string;
}) {
  const renderCell = (value: T[keyof T]): ReactNode => {
    if (value == null) return "";
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return String(value);
    }
    return value as ReactNode;
  };
  return (
    <div className="border-border bg-card overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((c) => (
              <TableHead key={String(c.key)}>{c.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-muted-foreground py-10 text-center text-sm"
              >
                {empty}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                {columns.map((c) => (
                  <TableCell key={String(c.key)}>
                    {renderCell(row[c.key])}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
