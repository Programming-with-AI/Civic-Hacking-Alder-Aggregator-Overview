import { describe, it, expect } from 'vitest';

// Helper functions extracted for testing
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toRfc822(dateString: string): string {
  const date = new Date(dateString);
  return date.toUTCString();
}

describe('escapeXml', () => {
  it('escapes ampersands', () => {
    expect(escapeXml('Rock & Roll')).toBe('Rock &amp; Roll');
  });

  it('escapes angle brackets', () => {
    expect(escapeXml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });

  it('escapes quotes', () => {
    expect(escapeXml('He said "hello"')).toBe('He said &quot;hello&quot;');
    expect(escapeXml("It's fine")).toBe('It&apos;s fine');
  });

  it('handles text with no special characters', () => {
    expect(escapeXml('Hello World')).toBe('Hello World');
  });

  it('handles multiple special characters', () => {
    expect(escapeXml('A & B < C > D "E" \'F\'')).toBe(
      'A &amp; B &lt; C &gt; D &quot;E&quot; &apos;F&apos;'
    );
  });
});

describe('toRfc822', () => {
  it('converts ISO date string to RFC 822 format', () => {
    const result = toRfc822('2024-01-15T10:30:00-06:00');
    // RFC 822 format: "Mon, 15 Jan 2024 16:30:00 GMT"
    expect(result).toMatch(/\w{3}, \d{2} \w{3} \d{4} \d{2}:\d{2}:\d{2} GMT/);
  });

  it('handles different timezone offsets', () => {
    const result = toRfc822('2024-06-20T14:00:00Z');
    expect(result).toContain('2024');
    expect(result).toContain('GMT');
  });
});
