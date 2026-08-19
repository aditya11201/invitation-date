# Invitation Controls Design

## Scope

Fix the P0 interaction problem in the invitation letter without changing the surrounding visual system.

## Behavior

- Keep the No action visible and keyboard-focusable after every click.
- Remove coercive copy and any behavior that hides No or makes Yes take over the viewport.
- Keep Yes at its normal scale and position.
- Do not lock document scrolling while the question is active.
- Preserve `onAccept`, section anchors, and the current visual structure; remove only the internal `onQuestionReady` callback that existed solely to drive the obsolete scroll lock.
- Do not add dependencies.

## Files

- `src/components/InvitationLetter/InvitationLetter.jsx`: simplify No/Yes interaction state and labels.
- `src/App.jsx`: remove the global question-stage scroll lock.
- `src/config/config.js`: replace the coercive No progression copy with one respectful No label and subtext.

## Verification

- `npm run build` passes.
- Repeated No clicks leave both actions available.
- Yes never expands to cover the viewport.
- The page remains scrollable while the question is active.
- Both actions remain reachable by keyboard focus.
