import { Fragment, type ReactElement } from "react";

/** Minimal markdown renderer for the mock assistant output. */
function inline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={key} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={key} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <Fragment key={key}>{part}</Fragment>;
  });
}

function cells(row: string) {
  return row
    .split("|")
    .slice(1, -1)
    .map((c) => c.trim());
}

export function MarkdownText({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: ReactElement[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]!;
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("|")) {
      const rows: string[] = [];
      while (i < lines.length && lines[i]!.trim().startsWith("|")) {
        rows.push(lines[i]!.trim());
        i += 1;
      }
      i -= 1;
      const header = cells(rows[0] ?? "");
      const body = rows.slice(2).map(cells);
      blocks.push(
        <div key={`tbl-${i}`} className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-surface-2">
              <tr>
                {header.map((h, hi) => (
                  <th key={hi} className="px-3 py-2 text-left font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((r, ri) => (
                <tr key={ri} className="border-t">
                  {r.map((c, ci) => (
                    <td key={ci} className="px-3 py-2 align-top text-muted-foreground">
                      {inline(c, `c-${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    const ordered = /^(\d+)\.\s+(.*)$/.exec(trimmed);
    if (ordered) {
      blocks.push(
        <p key={`li-${i}`} className="flex gap-2.5 text-sm leading-relaxed">
          <span className="font-mono text-xs text-primary">{ordered[1]}.</span>
          <span className="text-muted-foreground">{inline(ordered[2]!, `o-${i}`)}</span>
        </p>,
      );
      continue;
    }

    if (trimmed.startsWith("- ")) {
      blocks.push(
        <p key={`ul-${i}`} className="flex gap-2.5 text-sm leading-relaxed">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
          <span className="text-muted-foreground">{inline(trimmed.slice(2), `u-${i}`)}</span>
        </p>,
      );
      continue;
    }

    blocks.push(
      <p key={`p-${i}`} className="text-sm leading-relaxed text-muted-foreground">
        {inline(trimmed, `p-${i}`)}
      </p>,
    );
  }

  return <div className="space-y-2.5">{blocks}</div>;
}
