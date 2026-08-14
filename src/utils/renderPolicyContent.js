import React from 'react';

/**
 * Parses simple markdown-like text and returns React elements.
 * Supports:
 * - Blank lines (double newline) -> separate blocks
 * - Lines starting with "- "    -> bullet list (disc bullets)
 * - Lines starting with "1. "   -> numbered step list (gold bubble numbers via CSS counter)
 * - **bold text**               -> <strong>bold text</strong>
 */

const parseInline = (text) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

export const renderPolicyContent = (content) => {
  if (!content) return null;

  const blocks = content.split(/\n\s*\n/);

  return blocks.map((block, idx) => {
    const lines = block.trim().split('\n').filter(Boolean);
    if (!lines.length) return null;

    // Numbered step list: lines starting with "1. " or "2. " etc.
    const isNumbered = lines.every(line => /^\d+\.\s/.test(line.trim()));

    // Bullet list: lines starting with "- "
    const isBullet = lines.every(line => line.trim().startsWith('- '));

    if (isNumbered) {
      return (
        <ul key={idx} className="space-y-5 policy-steps">
          {lines.map((line, lIdx) => {
            const text = line.trim().replace(/^\d+\.\s/, '');
            return (
              <li key={lIdx} className="flex items-start gap-4">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                  style={{
                    background: 'rgba(201, 162, 93, 0.14)',
                    border: '1px solid rgba(201, 162, 93, 0.4)',
                    color: '#9c7a35',
                  }}
                >
                  {lIdx + 1}
                </div>
                <p className="text-[15px] leading-relaxed pt-0.5" style={{ color: '#4a4238' }}>
                  {parseInline(text)}
                </p>
              </li>
            );
          })}
        </ul>
      );
    }

    if (isBullet) {
      return (
        <ul key={idx} className="space-y-2.5 text-[15px] leading-relaxed list-disc list-inside" style={{ color: '#4a4238' }}>
          {lines.map((line, lIdx) => (
            <li key={lIdx}>{parseInline(line.trim().substring(2))}</li>
          ))}
        </ul>
      );
    }

    // Plain paragraph(s)
    return (
      <p key={idx} className="text-[15px] leading-relaxed" style={{ color: '#4a4238' }}>
        {parseInline(block.trim())}
      </p>
    );
  });
};
