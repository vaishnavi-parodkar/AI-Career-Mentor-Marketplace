function inlineParts(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-semibold text-dark-green">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index} className="rounded bg-cream px-1.5 py-0.5 text-[0.9em]">{part.slice(1, -1)}</code>;
    }
    return <span key={index}>{part}</span>;
  });
}

function isTableSeparator(line) {
  return /^\s*\|?[\s:|-]+\|[\s:|-]+\|?\s*$/.test(line);
}

function tableCells(line) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

function renderPointers(lines, key) {
  const headers = tableCells(lines[0]);
  const rows = lines.slice(2).map(tableCells);

  return (
    <div key={key} className="my-4 space-y-3">
      {rows.map((row, rowIndex) => (
        <dl key={rowIndex} className="space-y-2 rounded-xl border border-border bg-cream/50 p-3">
          {headers.map((header, cellIndex) => (
            <div key={cellIndex} className="sm:grid sm:grid-cols-[minmax(8rem,30%)_1fr] sm:gap-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-dark-green">{inlineParts(header)}</dt>
              <dd className="mt-0.5 text-text-dark sm:mt-0">{inlineParts(row[cellIndex] || "Not specified")}</dd>
            </div>
          ))}
        </dl>
      ))}
    </div>
  );
}

export default function FormattedText({ children, className = "" }) {
  const text = typeof children === "string" ? children : "";
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];

  for (let index = 0; index < lines.length;) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    if (lines[index + 1] && line.includes("|") && isTableSeparator(lines[index + 1])) {
      const tableLines = [lines[index], lines[index + 1]];
      index += 2;
      while (index < lines.length && lines[index].trim() && lines[index].includes("|")) {
        tableLines.push(lines[index]);
        index += 1;
      }
      blocks.push(renderPointers(tableLines, `pointers-${index}`));
      continue;
    }

    const heading = line.match(/^#{1,3}\s+(.+)$/);
    if (heading) {
      blocks.push(<h3 key={`heading-${index}`} className="mt-4 font-heading text-lg font-bold text-dark-green">{inlineParts(heading[1])}</h3>);
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
        index += 1;
      }
      blocks.push(<ul key={`list-${index}`} className="my-3 list-disc space-y-1.5 pl-5">{items.map((item, itemIndex) => <li key={itemIndex}>{inlineParts(item)}</li>)}</ul>);
      continue;
    }

    if (/^\d+[.)]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\d+[.)]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+[.)]\s+/, ""));
        index += 1;
      }
      blocks.push(<ol key={`ordered-${index}`} className="my-3 list-decimal space-y-1.5 pl-5">{items.map((item, itemIndex) => <li key={itemIndex}>{inlineParts(item)}</li>)}</ol>);
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !/^#{1,3}\s+/.test(lines[index].trim()) && !/^[-*]\s+/.test(lines[index].trim()) && !/^\d+[.)]\s+/.test(lines[index].trim())) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(<p key={`paragraph-${index}`} className="my-3 leading-7">{inlineParts(paragraph.join(" "))}</p>);
  }

  return <div className={className}>{blocks}</div>;
}
