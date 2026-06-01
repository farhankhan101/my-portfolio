// lib/format.tsx
import React from 'react'

/**
 * Parses double asterisks (**) and single asterisks (*) to render bold/strong tags.
 * Helps format ChatGPT-style copied text in reviews.
 */
export function renderFormattedComment(comment: string | null | undefined): React.ReactNode {
  if (!comment) return '';

  // Regex matches **bold** or *italic/bold* text
  const regex = /(\*\*.*?\*\*|\*.*?\*)/g;
  const parts = comment.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-extrabold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return (
            <strong key={i} className="font-extrabold text-foreground">
              {part.slice(1, -1)}
            </strong>
          );
        }
        return part;
      })}
    </>
  );
}

/**
 * Truncates text to a specified maximum length, taking care to balance Markdown formatting tags
 * (** and *) so they do not break layout or styling.
 */
export function truncateComment(comment: string | null | undefined, maxLength: number = 145) {
  if (!comment) {
    return { text: '', isTruncated: false };
  }

  if (comment.length <= maxLength) {
    return { text: comment, isTruncated: false };
  }

  // Slice first
  let truncated = comment.slice(0, maxLength);

  // Avoid cutting word in half if possible
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength - 30) {
    truncated = truncated.slice(0, lastSpace);
  }

  // Count and balance double asterisks (**)
  const doubleStarsCount = (truncated.match(/\*\*/g) || []).length;
  if (doubleStarsCount % 2 !== 0) {
    truncated += '**';
  }

  // Count and balance single asterisks (*) excluding double asterisks
  const singleStarsCount = (truncated.replace(/\*\*/g, '').match(/\*/g) || []).length;
  if (singleStarsCount % 2 !== 0) {
    truncated += '*';
  }

  return { text: truncated + '...', isTruncated: true };
}
