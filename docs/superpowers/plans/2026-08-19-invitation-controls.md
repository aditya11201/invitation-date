# Invitation Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove coercive No/Yes behavior from the invitation letter while keeping the existing visual structure and forward flow intact.

**Architecture:** Keep the existing React component tree. Remove the obsolete `noClickCount` and `isQuestionLocked` state paths, render a stable No button from configuration, and let normal document scrolling continue. No new component or dependency is needed.

**Tech Stack:** React 19, Vite 6, Tailwind CSS, existing sound utility.

## Global Constraints

- Modify only `src/components/InvitationLetter/InvitationLetter.jsx`, `src/App.jsx`, and `src/config/config.js` for the behavior change.
- Preserve `onAccept`, `invitation-letter-section`, `letter-paper`, and all downstream accepted-flow callbacks.
- Remove coercive copy from the rendered invitation question.
- Do not add dependencies or a test framework.
- Keep both actions keyboard-focusable with the existing 44px minimum target.

---

### Task 1: Replace the forced-choice interaction with stable actions

**Files:**
- Modify: `src/config/config.js:17-39`
- Modify: `src/components/InvitationLetter/InvitationLetter.jsx:5-99,222-252`
- Modify: `src/App.jsx:17-44,80-89,133-150,187-195`

**Interfaces:**
- Consumes: `invitationConfig.letter.subtext` and the new `invitationConfig.noLabel`.
- Produces: `InvitationLetter` still calls `onAccept()` for Yes and keeps the existing section IDs and accepted-flow rendering.

- [ ] **Step 1: Add a failing static behavior check**

Run this from the repository root before implementation:

```bash
node --input-type=module -e "import fs from 'node:fs'; const files=['src/App.jsx','src/components/InvitationLetter/InvitationLetter.jsx','src/config/config.js'].map(f=>fs.readFileSync(f,'utf8')).join('\\n'); if (!files.includes('noClickCount') || !files.includes('isQuestionLocked') || !files.includes('You have no choice now!')) process.exit(1);"
```

Expected: exit code `0`, proving the current forced-choice implementation is present before the change.

- [ ] **Step 2: Replace coercive configuration copy**

In `src/config/config.js`, change the letter subtext and remove the `noProgression` array:

```js
subtext: "Choose what feels right for you 💌"
```

Add one stable label alongside `letter`:

```js
noLabel: "Not this time"
```

The configuration must no longer contain `You have no choice now!`, `Are you sure?`, `Seriously?`, or the progression array.

- [ ] **Step 3: Remove transient forced-choice state from `InvitationLetter`**

Update the component contract to keep only the accepted-flow inputs:

```jsx
export default function InvitationLetter({
  config,
  onAccept,
  isAccepted,
}) {
```

Remove `yesButtonRef`, `noClickCount`, `setNoClickCount`, `onQuestionReady`, `noProgression`, and `getYesScaleClass`. Keep the scroll listener only for envelope and paragraph reveal; it must not call a parent lock callback.

Use a stable No handler:

```jsx
const handleNoClick = (event) => {
  event.stopPropagation();
  sound.playPop(0.8);

  if (navigator.vibrate) {
    navigator.vibrate(60);
  }
};
```

Keep Yes behavior unchanged except remove the obsolete `onQuestionReady(false)` call and the dynamic scale class.

- [ ] **Step 4: Render both actions permanently and at normal scale**

Replace the conditional No rendering and dynamic Yes class with stable buttons:

```jsx
<button
  type="button"
  onClick={handleYesClick}
  className="group inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-md font-bold text-ivory-50 bg-romantic-600 ring-1 ring-inset ring-romantic-700/40 shadow-md hover:bg-romantic-700 hover:shadow-glow-pink hover:scale-105 active:scale-[0.96] transition-all duration-300 cursor-pointer min-h-[44px]"
>
  <Heart className="w-5 h-5 fill-white animate-pulse" />
  <span className="tracking-[0.18em]">YES 💗</span>
</button>

<button
  type="button"
  onClick={handleNoClick}
  className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold text-romantic-700 bg-ivory-50/80 hover:bg-ivory-200 hover:text-romantic-900 border border-romantic-200 shadow-sm active:scale-[0.96] transition-all duration-200 cursor-pointer min-h-[44px]"
>
  <span>{config.noLabel || 'Not this time'}</span>
</button>
```

No button disappearance, viewport positioning, coercive copy, and Yes takeover must be absent after this step.

- [ ] **Step 5: Remove the global question scroll lock from `App`**

In `src/App.jsx`:

- Delete `isQuestionLocked` and `noClickCount` state.
- Delete the `useEffect` that writes `document.body.style.overflow = 'hidden'`.
- Remove the direct overflow reset from `handleAcceptInvitation` and `handleReset`.
- Stop passing `noClickCount`, `setNoClickCount`, and `onQuestionReady` into `InvitationLetter`.
- Keep `acceptedInvitation`, `handleAcceptInvitation`, reset behavior, and all downstream section callbacks unchanged.

The resulting `InvitationLetter` call should be:

```jsx
<InvitationLetter
  config={invitationConfig}
  onAccept={handleAcceptInvitation}
  isAccepted={acceptedInvitation}
/>
```

- [ ] **Step 6: Run the focused static check**

Run:

```bash
node --input-type=module -e "import fs from 'node:fs'; const app=fs.readFileSync('src/App.jsx','utf8'); const letter=fs.readFileSync('src/components/InvitationLetter/InvitationLetter.jsx','utf8'); const config=fs.readFileSync('src/config/config.js','utf8'); for (const forbidden of ['noClickCount','isQuestionLocked','onQuestionReady','getYesScaleClass','noProgression','You have no choice now!','fixed inset-4']) { if ([app,letter,config].some(source=>source.includes(forbidden))) throw new Error('Forbidden forced-choice code remains: '+forbidden); } for (const required of ['config.noLabel','type=\"button\"','invitation-letter-section','letter-paper']) { if (!letter.includes(required)) throw new Error('Required behavior missing: '+required); } if (!config.includes('Choose what feels right for you')) throw new Error('Respectful subtext missing');"
```

Expected: exit code `0` with no output.

- [ ] **Step 7: Build the application**

Run:

```bash
npm run build
```

Expected: Vite completes successfully and writes `dist/index.html`.

- [ ] **Step 8: Verify the interaction manually when a browser is available**

At the letter question:

1. Press Tab until both Yes and No receive focus.
2. Activate No repeatedly; confirm both buttons remain visible and usable.
3. Confirm Yes remains normal-sized and does not become fixed or viewport-sized.
4. Scroll the document while the question is visible; confirm scrolling remains available.
5. Activate Yes; confirm the existing celebration and downstream flow still appears.

If browser automation is unavailable, report that limitation and retain the static check plus build evidence.

## Self-Review

- Spec coverage: stable No, normal Yes, no coercive copy, no scroll lock, preserved accepted flow, no dependencies, and verification are all covered in Task 1.
- Placeholder scan: no TBD, TODO, or unspecified implementation steps remain.
- Type consistency: no new interfaces are introduced; `InvitationLetter` receives only `config`, `onAccept`, and `isAccepted`.
