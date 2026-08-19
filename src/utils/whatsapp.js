import { formatLocalDateString } from './date.js';

/**
 * WhatsApp integration utility.
 * Replaces template variables and generates a deep link URL for WhatsApp.
 */

export function generateWhatsAppUrl(config, { selectedPlace, selectedDate }) {
  const number = (config.whatsapp?.number || '').replace(/[^0-9]/g, '');
  let message = config.whatsapp?.messageTemplate || `Hellooo {{senderName}}! I choose {{selectedPlace}} on {{selectedDate}} 💗`;

  // Format date nicely if available
  const formattedDateStr = selectedDate
    ? formatLocalDateString(selectedDate, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Soon 💗';

  // Replace placeholders
  message = message
    .replaceAll('{{senderName}}', config.senderName || 'My Love')
    .replaceAll('{{recipientName}}', config.recipientName || 'Sassy')
    .replaceAll('{{selectedPlace}}', selectedPlace || 'Our Dream Date')
    .replaceAll('{{selectedDate}}', formattedDateStr || 'Soon 💗');

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encodedMessage}`;
}
