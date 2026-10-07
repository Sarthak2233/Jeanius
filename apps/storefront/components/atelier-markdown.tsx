import React from 'react';
import Link from 'next/link';

export interface AtelierMarkdownProps {
  readonly content: string;
  readonly className?: string;
}

function renderInlineText(text: string): React.ReactNode[] {
  // Regex parsing for bold **text**, italic *text*, links [label](url), and inline code `code`
  const regex = /(\*\*.*?\*\*|\*.*?\*|\[.*?\]\(.*?\)|`.*?`)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} style={{ fontWeight: 600, color: '#0f172a' }}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            backgroundColor: '#f1f5f9',
            padding: '0.15rem 0.35rem',
            borderRadius: '3px',
            fontSize: '0.85em',
            color: '#b91c1c',
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch && linkMatch[1] !== undefined && linkMatch[2] !== undefined) {
      const label = linkMatch[1];
      const url = linkMatch[2];
      const isInternal = url.startsWith('/');
      if (isInternal) {
        return (
          <Link
            key={index}
            href={url}
            style={{
              color: '#b91c1c',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              fontWeight: 500,
            }}
          >
            {label}
          </Link>
        );
      }
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#b91c1c',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
            fontWeight: 500,
          }}
        >
          {label}
        </a>
      );
    }

    return part;
  });
}

export function AtelierMarkdown({ content, className = '' }: AtelierMarkdownProps) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let currentTable: { headers: string[]; rows: string[][] } | null = null;

  const flushList = () => {
    if (!currentList) return;
    const ListTag = currentList.type;
    const items = [...currentList.items];
    const key = `list-${elements.length}`;
    elements.push(
      <ListTag
        key={key}
        style={{
          margin: '1.25rem 0 1.5rem 1.5rem',
          padding: 0,
          color: '#475569',
          lineHeight: 1.75,
          fontSize: '1rem',
        }}
      >
        {items.map((it, idx) => (
          <li key={idx} style={{ marginBottom: '0.4rem' }}>
            {renderInlineText(it)}
          </li>
        ))}
      </ListTag>,
    );
    currentList = null;
  };

  const flushTable = () => {
    if (!currentTable) return;
    const { headers, rows } = currentTable;
    const key = `table-${elements.length}`;
    elements.push(
      <div
        key={key}
        style={{
          overflowX: 'auto',
          margin: '2rem 0',
          border: '1px solid #ebe7df',
          borderRadius: '6px',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '0.9rem',
          }}
        >
          <thead style={{ backgroundColor: '#faf8f4', borderBottom: '1px solid #ebe7df' }}>
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  style={{
                    padding: '0.75rem 1rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: '#0f172a',
                  }}
                >
                  {renderInlineText(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr
                key={rIdx}
                style={{
                  borderBottom: rIdx === rows.length - 1 ? 'none' : '1px solid #f1f5f9',
                  backgroundColor: rIdx % 2 === 0 ? '#ffffff' : '#fafafa',
                }}
              >
                {row.map((col, cIdx) => (
                  <td key={cIdx} style={{ padding: '0.75rem 1rem', color: '#475569' }}>
                    {renderInlineText(col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
    );
    currentTable = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    if (rawLine === undefined) continue;
    const line = rawLine.trim();

    // Empty line
    if (!line) {
      flushList();
      flushTable();
      continue;
    }

    // Table rows: | Col 1 | Col 2 |
    if (line.startsWith('|') && line.endsWith('|')) {
      flushList();
      const cols = line
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());

      // If it's a delimiter line (e.g. |---|---|)
      if (cols.every((c) => /^:?-+:?$/.test(c))) {
        continue;
      }

      if (!currentTable) {
        currentTable = { headers: cols, rows: [] };
      } else {
        currentTable.rows.push(cols);
      }
      continue;
    } else {
      flushTable();
    }

    // Heading 1
    if (line.startsWith('# ')) {
      flushList();
      elements.push(
        <h1
          key={`h1-${i}`}
          style={{
            fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
            fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)',
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: '#0f172a',
            margin: '2.5rem 0 1.25rem 0',
            textTransform: 'uppercase',
          }}
        >
          {renderInlineText(line.slice(2))}
        </h1>,
      );
      continue;
    }

    // Heading 2
    if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h2
          key={`h2-${i}`}
          style={{
            fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
            fontWeight: 600,
            letterSpacing: '-0.015em',
            color: '#0f172a',
            margin: '2.75rem 0 1rem 0',
            borderTop: '1px solid #ebe7df',
            paddingTop: '2rem',
          }}
        >
          {renderInlineText(line.slice(3))}
        </h2>,
      );
      continue;
    }

    // Heading 3
    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h3
          key={`h3-${i}`}
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#0f172a',
            margin: '1.75rem 0 0.75rem 0',
            letterSpacing: '-0.01em',
          }}
        >
          {renderInlineText(line.slice(4))}
        </h3>,
      );
      continue;
    }

    // Blockquote: > ...
    if (line.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote
          key={`quote-${i}`}
          style={{
            margin: '1.5rem 0',
            padding: '1rem 1.5rem',
            borderLeft: '3px solid #b91c1c',
            backgroundColor: '#faf8f4',
            borderRadius: '0 4px 4px 0',
            fontStyle: 'italic',
            color: '#334155',
            fontSize: '1.05rem',
            lineHeight: 1.7,
          }}
        >
          {renderInlineText(line.slice(2))}
        </blockquote>,
      );
      continue;
    }

    // Unordered list item: - item or * item
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const itemText = line.slice(2);
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [itemText] };
      } else {
        currentList.items.push(itemText);
      }
      continue;
    }

    // Ordered list item: 1. item
    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch && olMatch[2] !== undefined) {
      const itemText = olMatch[2];
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [itemText] };
      } else {
        currentList.items.push(itemText);
      }
      continue;
    }

    // Default: Paragraph
    flushList();
    elements.push(
      <p
        key={`p-${i}`}
        style={{
          fontSize: '1.05rem',
          lineHeight: 1.75,
          color: '#334155',
          margin: '0 0 1.25rem 0',
        }}
      >
        {renderInlineText(line)}
      </p>,
    );
  }

  flushList();
  flushTable();

  return <div className={className}>{elements}</div>;
}
