import { parseLocalDate } from './date.js';

/**
 * Calendar utilities for Google Calendar deep links and Apple/Outlook .ICS file generation.
 * Follows PRD specifications for all-day events and RFC 5545 escaping rules.
 */

// Helper to format date object to YYYYMMDD
function formatYYYYMMDD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

// RFC 5545 escaping for text property values
function escapeIcsText(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

export function generateGoogleCalendarUrl({ recipientName, selectedPlace, selectedDate }) {
  if (!selectedDate) return '#';

  const dateObj = parseLocalDate(selectedDate);
  const nextDay = new Date(dateObj);
  nextDay.setDate(nextDay.getDate() + 1);

  const startStr = formatYYYYMMDD(dateObj);
  const endStr = formatYYYYMMDD(nextDay);

  const title = encodeURIComponent(`Date with ${recipientName || 'My Love'} 💗`);
  const details = encodeURIComponent(`Our cute little romantic date together at ${selectedPlace || 'our special place'}! 💗✨`);
  const location = encodeURIComponent(selectedPlace || '');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
}

export function downloadIcsFile({ recipientName, senderName, selectedPlace, selectedDate }) {
  if (!selectedDate) return;

  const dateObj = parseLocalDate(selectedDate);
  const nextDay = new Date(dateObj);
  nextDay.setDate(nextDay.getDate() + 1);

  const startStr = formatYYYYMMDD(dateObj);
  const endStr = formatYYYYMMDD(nextDay);
  const nowStr = formatYYYYMMDD(new Date()) + 'T120000Z';

  const title = escapeIcsText(`Date with ${recipientName || 'My Love'} 💗`);
  const location = escapeIcsText(selectedPlace || 'Romantic Date');
  const description = escapeIcsText(`Our special romantic date planned by ${senderName || 'Me'} with all my love 💗`);

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Romantic Date Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:date-${Date.now()}@romantic-date-invitation.app`,
    `DTSTAMP:${nowStr}`,
    `DTSTART;VALUE=DATE:${startStr}`,
    `DTEND;VALUE=DATE:${endStr}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'TRANSP:TRANSPARENT',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `Date-with-${recipientName || 'Love'}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
