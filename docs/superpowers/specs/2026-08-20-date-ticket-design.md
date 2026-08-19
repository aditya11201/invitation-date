# Date Ticket Stationery Enclosure Design

## Goal

Redesign the final date ticket as a personal stationery keepsake that belongs to the same visual world as the letter.

## Visual Direction

- Use solid ivory paper, deep rose ink, and restrained violet-free accents on this surface.
- Remove the boarding-pass signals: side notches, barcode, holographic sheen, emerald confirmation, gradient/glass surfaces, and emoji chrome.
- Keep one dashed perforation rule as the ticket cue.
- Use a wax-seal echo in the header and a rotated dashed postmark for confirmation.
- Present ticket details as a stationery ledger rather than a dashboard grid.
- Treat the surprise thumbnail as a small polaroid tucked into the paper.
- Keep controls pill-shaped only where they communicate action.

## Functional Contract

Preserve `ticketRef`, `date-ticket-card`, PNG/PDF export, WhatsApp, Google Calendar, ICS download, reset, tilt behavior, selected place/date, and all existing handlers.

Add visible focus rings, `type="button"`, `aria-busy` during export, and mobile stacking for the polaroid and ledger.

## Dependencies

`package.json` does not currently include the required icon family. Install `@phosphor-icons/react` before importing icons, then migrate the ticket icons to Phosphor equivalents. Do not add any other dependency.

## Scope

- Modify `src/components/DateTicket/DateTicket.jsx`.
- Modify `package.json` and its lockfile only if required by the icon install.
- Do not alter export utilities, calendar utilities, WhatsApp utilities, or other scenes.

## Verification

- `npm run build` passes.
- No hardcoded emoji remains in `DateTicket.jsx`.
- No `emerald`, `purple`, `slate-*`, or gradient CTA classes remain in `DateTicket.jsx`.
- All seven controls retain 44px targets and visible focus states.
- At 320px, ledger rows and actions remain readable without horizontal overflow.
- The exported ticket target remains `#date-ticket-card` and excludes the controls.
