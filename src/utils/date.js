/**
 * Local date parser and formatter utilities.
 * Avoids timezone shift bugs when parsing YYYY-MM-DD strings.
 */

export function parseLocalDate(dateStr) {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;
  
  if (typeof dateStr === 'string') {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, monthIndex, day);
    }
  }
  return new Date(dateStr);
}

export function isValidLocalDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return false;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

export function formatLocalDateString(dateStr, options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) {
  if (!dateStr || !isValidLocalDate(dateStr)) return '';
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString('en-US', options);
}
