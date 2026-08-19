# Date Ticket Stationery Enclosure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the final date ticket as a tactile stationery keepsake while preserving every export, calendar, WhatsApp, reset, and selected-date interaction.

**Architecture:** Keep `DateTicket` as the single interactive leaf and preserve its existing handlers and export target. Replace only its visual markup, copy chrome, icon family, and interaction-state affordances. Use the existing Tailwind v3 tokens and add only the required Phosphor icon dependency.

**Tech Stack:** React 19, Vite 6, Tailwind CSS 3.4, `@phosphor-icons/react`, existing export/calendar/WhatsApp utilities.

## Global Constraints

- Use solid ivory paper, deep rose ink, and restrained violet-free accents on the ticket surface.
- Remove side notches, barcode, holographic sheen, emerald confirmation, gradient/glass surfaces, and emoji chrome.
- Preserve `ticketRef`, `date-ticket-card`, PNG/PDF export, WhatsApp, Google Calendar, ICS download, reset, tilt behavior, selected place/date, and all existing handlers.
- Add visible focus rings, `type="button"`, `aria-busy` during export, and mobile stacking for the polaroid and ledger.
- Use `@phosphor-icons/react`; do not add any other dependency.
- Do not alter export utilities, calendar utilities, WhatsApp utilities, or other scenes.
- Do not commit; this project is not a Git repository.

---

### Task 1: Install and smoke-test the icon family

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json` if npm creates or updates it

**Interfaces:**
- Produces these imports for Task 2: `HeartIcon`, `DownloadIcon`, `CalendarIcon`, `ArrowCounterClockwiseIcon`, `FilePdfIcon`, `ArrowSquareOutIcon`, `WhatsappLogoIcon`, and `CheckCircleIcon` from `@phosphor-icons/react`.

- [ ] **Step 1: Verify the dependency is absent before installation**

Run:

```bash
node --input-type=module -e "import fs from 'node:fs'; const pkg=JSON.parse(fs.readFileSync('package.json','utf8')); if (pkg.dependencies?.['@phosphor-icons/react'] || pkg.devDependencies?.['@phosphor-icons/react']) throw new Error('Phosphor is already installed'); console.log('Phosphor dependency absent');"
```

Expected: `Phosphor dependency absent`.

- [ ] **Step 2: Install the approved dependency**

Run:

```bash
npm install --yes @phosphor-icons/react
```

Expected: npm exits `0` and records the dependency in `package.json` and its lockfile.

- [ ] **Step 3: Smoke-test the exact named exports**

Run:

```bash
node --input-type=module -e "import { HeartIcon, DownloadIcon, CalendarIcon, ArrowCounterClockwiseIcon, FilePdfIcon, ArrowSquareOutIcon, WhatsappLogoIcon, CheckCircleIcon } from '@phosphor-icons/react'; if (![HeartIcon, DownloadIcon, CalendarIcon, ArrowCounterClockwiseIcon, FilePdfIcon, ArrowSquareOutIcon, WhatsappLogoIcon, CheckCircleIcon].every(Boolean)) throw new Error('Missing Phosphor export'); console.log('Phosphor exports ready');"
```

Expected: `Phosphor exports ready`.

### Task 2: Reskin `DateTicket` as a stationery enclosure

**Files:**
- Modify: `src/components/DateTicket/DateTicket.jsx:1-349`

**Interfaces:**
- Consumes the existing `config`, `selectedPlace`, `selectedDate`, and `onReset` props.
- Produces the same `date-ticket-section` and `date-ticket-card` DOM anchors used by scroll and export logic.

- [ ] **Step 1: Write and run the failing visual-contract check**

Run before the component edit:

```bash
node --input-type=module -e "import fs from 'node:fs'; const s=fs.readFileSync('src/components/DateTicket/DateTicket.jsx','utf8'); const required=['rounded-3xl','from-pink-400/10','emerald-50','Sparkles','🎟️','💗','📸','📅']; if (!required.every(token=>s.includes(token))) throw new Error('Expected pre-redesign ticket markers are missing'); console.log('RED: old ticket surface confirmed');"
```

Expected: `RED: old ticket surface confirmed`.

- [ ] **Step 2: Migrate imports to verified Phosphor exports**

Replace the Lucide import with:

```jsx
import {
  HeartIcon,
  DownloadIcon,
  CalendarIcon,
  ArrowCounterClockwiseIcon,
  FilePdfIcon,
  ArrowSquareOutIcon,
  WhatsappLogoIcon,
  CheckCircleIcon,
} from '@phosphor-icons/react';
```

Use `size` and `weight="regular"` or `weight="fill"` consistently. Do not add another icon library.

- [ ] **Step 3: Replace the shell and header chrome**

Remove the centered pink-purple blur orb. Keep `id="date-ticket-section"`, safe-area padding, and use `min-h-[100dvh]`.

Replace the glass badge and emoji title with:

```jsx
<div className="text-center max-w-lg mx-auto mb-8 relative z-10">
  <p className="font-handwriting text-xl text-romantic-500 mb-2">for the record</p>
  <h2 className="font-display font-bold text-3xl sm:text-5xl text-romantic-900 mb-2" style={{ textWrap: 'balance' }}>
    Our Official Date Pass
  </h2>
  <p className="text-romantic-700/80 text-sm sm:text-base font-display italic">
    A small keepsake for the day we chose together.
  </p>
</div>
```

- [ ] **Step 4: Replace the card material and confirmation treatment**

Keep `id="date-ticket-card"`, `ticketRef`, tilt transform, and export target. Change the surface to `bg-ivory-100 border-ivory-300 rounded-lg shadow-paper` and use the letter’s two-dot `radial-gradient` as a subtle background image. Delete the holographic sheen and both circular side notches.

Use a solid rose seal and a dashed rose postmark containing `Confirmed` plus the formatted date. Keep `CheckCircleIcon` only if it supports the postmark meaningfully; otherwise use the postmark text without an extra badge.

- [ ] **Step 5: Convert the body grid into a responsive stationery ledger**

Keep recipient, sender, destination, formatted date, and surprise thumbnail. Replace the two-column dashboard grid with rows that stack on mobile:

```jsx
<div className="flex flex-col gap-0">
  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 border-b border-ivory-300/60 py-3">
    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-romantic-500">Date With</span>
    <p className="font-display font-bold text-lg text-romantic-900">{config.recipientName || 'Sassy'}</p>
  </div>
  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 border-b border-ivory-300/60 py-3">
    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-romantic-500">From</span>
    <p className="font-display font-bold text-lg text-romantic-900">{config.senderName || 'User'}</p>
  </div>
</div>
```

Place the thumbnail in a `bg-ivory-50 border border-ivory-300 p-1.5 rotate-3 shadow-sm` polaroid wrapper. On small screens, stack it above the ledger and keep the rotation inside the card padding.

- [ ] **Step 6: Replace footer boarding-pass decoration with one perforation and sign-off**

Keep the dashed top rule. Remove all barcode spans. Retain the recipient-only line as a quiet stationery mark and replace Sparkles with a small filled `HeartIcon` or a short handwriting sign-off. Do not add serial numbers, IDs, emoji, or fake precision.

- [ ] **Step 7: Normalize action controls and states**

Preserve all existing handlers and menu state. Apply one action system:

- WhatsApp: deep rose fill, ivory icon/text, no gradient.
- Save and Calendar: ivory ghost buttons with the same rose hairline border and text treatment.
- Dropdowns: ivory paper, `rounded-lg`, `border-romantic-200/70`, `shadow-paper`, `rounded-md` menu items.
- Reset: rose text with an underline, not gray microcopy.
- Every button: `type="button"`, `min-h-[44px]`, visible rose `focus-visible:ring`, `active:scale-[0.96]`.
- Export trigger: `aria-busy={isExporting}` plus `opacity-60 cursor-wait` while exporting.
- Remove hardcoded emoji from all labels and fallback strings in this component.

- [ ] **Step 8: Reduce tilt amplitude without changing export behavior**

Keep pointer tilt required by the PRD, but reduce the calculated rotation from `x * 12` / `y * 12` to `x * 6` / `y * 6`. Preserve `handleMouseLeave`, `ticketRef`, and the export target. Do not animate layout properties.

- [ ] **Step 9: Run the green visual-contract check**

Run:

```bash
node --input-type=module -e "import fs from 'node:fs'; const s=fs.readFileSync('src/components/DateTicket/DateTicket.jsx','utf8'); const forbidden=['emerald','purple','slate-','from-pink','teal-','rounded-3xl','Sparkles','🎟️','💗','📸','📅']; for (const token of forbidden) if (s.includes(token)) throw new Error('Forbidden ticket token remains: '+token); for (const token of ['date-ticket-section','date-ticket-card','ticketRef','aria-busy','focus-visible:ring','min-h-[44px]','HeartIcon','WhatsappLogoIcon']) if (!s.includes(token)) throw new Error('Required ticket contract missing: '+token); console.log('GREEN: stationery ticket contract confirmed');"
```

Expected: `GREEN: stationery ticket contract confirmed`.

- [ ] **Step 10: Build the application**

Run:

```bash
npm run build
```

Expected: Vite exits `0` and writes `dist/index.html`.

- [ ] **Step 11: Verify responsive and functional behavior**

When a browser is available, verify at 320px and desktop widths:

1. Ledger rows stack without horizontal overflow.
2. Polaroid thumbnail stays inside the paper surface.
3. All seven controls receive visible keyboard focus and remain at least 44px tall.
4. Export target remains only `#date-ticket-card`, not the action controls.
5. PNG/PDF, WhatsApp, Google Calendar, ICS, reset, and dropdown closing behavior still work.

If no browser is available, report that limitation and retain the contract check plus build evidence.

## Self-Review

- Spec coverage: visual material, one accent, removed boarding-pass cues, postmark, ledger, polaroid, icon dependency, focus/loading states, mobile behavior, export anchor, and preserved handlers are covered above.
- Placeholder scan: no TBD, TODO, or unspecified implementation steps remain.
- Type consistency: `DateTicket` keeps its existing prop contract and handler names; no new public component interface is introduced.
