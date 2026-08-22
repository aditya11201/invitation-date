# Where Should We Go — Media Book Selector Redesign

**Date:** 2026-08-21  
**Branch:** `feat/redesign-where-should-we-go-media-selector`  
**Status:** Approved design; local planning artifact only. Do not commit this file.

## Goal

Redesign the existing `Where should we go?` destination section using the
composition and interaction language of `reference-choose.html`: a centered,
book-like selector with one dominant active story, partially visible adjacent
stories, coordinated transitions, and destination-specific atmosphere.

The reference's 3D models and WebGL rendering are explicitly excluded. The
destination atmosphere is replaced by one active image or video media layer.
The existing auto-confirm flow remains: the primary CTA selects the current
destination, locks the picker, and scrolls to the calendar after the existing
delay. No confirmation modal is added.

## Existing Architecture

- `src/App.jsx` owns `selectedPlace` and `placeConfirmed`, passes destinations
  into `LocationPicker`, and scrolls to `#calendar-journey-section` after
  confirmation.
- `src/components/LocationPicker/LocationPicker.jsx` owns browsing state,
  swipe handling, arrows, dots, selection, confirmation, and current card
  layout.
- `src/components/PlacePreviews/PlaceVisual.jsx` currently renders only the
  active place video and falls back to animated SVG artwork.
- `src/config/config.js` contains five destinations, existing copy, emoji,
  highlights, theme colors, and optional poster/video paths.
- Tailwind, Lucide, GSAP, and the existing sound utility are already available.
- The global Three.js scene remains outside this redesign scope.

## Reference Patterns to Preserve

1. Full-height editorial framing with a header, centered selector stage, and
   bottom navigation/action controls.
2. One active book in the center, with near and far books establishing the
   available choices without competing with the active item.
3. Physical-book cues: leather cover, spine, page block, ruled paper, inset
   border, chapter label, chips, title, copy, and page number.
4. Active/near/far state changes that coordinate position, depth, rotation,
   scale, opacity, and cover opening.
5. Multiple equivalent navigation paths: card click, arrows, pagination dots,
   keyboard arrows, and horizontal swipe.
6. Smooth background atmosphere changes tied to the active destination.
7. Visible focus/pressed states and reduced-motion support.

## Explicit Exclusions

- No Three.js, WebGL canvas, STL/model loading, shader, geometry, or 3D engine
  work for this section.
- No new animation dependency; use the existing GSAP dependency.
- No generic card grid or carousel replacement.
- No reference copy/content copied into the application.
- No confirmation modal; preserve immediate CTA-to-calendar behavior.
- No changes to unrelated sections, global layout, calendar semantics, ticket
  semantics, or the persistent global Three.js scene.

## Approved Architecture

```text
App
└── LocationPicker
    ├── active PlaceVisual media backdrop
    ├── book carousel stage
    │   └── BookCard × destination count
    └── dots, arrows, and auto-confirm CTA
```

### `LocationPicker`

`LocationPicker` remains the integration boundary. It will continue receiving
`places`, `selectedPlace`, `onSelectPlace`, `onConfirmPlace`, and `isConfirmed`.
It will keep `activeIndex` as local browsing state and compute circular offsets
for every destination.

The component will own:

- active-index changes from all navigation methods;
- touch start/end values and directional swipe validation;
- card refs and the GSAP transition context;
- the active-place media backdrop;
- the existing auto-confirm callback sequence;
- keyboard navigation and carousel status messaging.

The parent contract will not change. `onSelectPlace` continues receiving the
destination title so downstream calendar, surprise, and ticket behavior stays
compatible.

### `BookCard`

Create `src/components/LocationPicker/BookCard.jsx` to isolate the physical
book markup from carousel orchestration. It receives a place, circular offset,
active/confirmed state, and selection callback. It renders the book anatomy:

```text
book
├── back cover / leather edge
├── page block
│   ├── chapter label
│   ├── title
│   ├── existing destination copy
│   ├── existing highlights
│   └── page number
└── cover flap
    ├── spine text
    ├── category label
    ├── emoji
    └── destination title
```

CSS perspective and `preserve-3d` are allowed only for the DOM book-cover
illusion. They are not a replacement 3D scene or model.

### `PlaceVisual`

Reuse `src/components/PlacePreviews/PlaceVisual.jsx` as the active media
backdrop renderer rather than mounting one media instance inside every book.
The component will support image and video modes, maintain a fallback artwork
underlay, and reset loading/error state when the place changes.

Only the active place's video is mounted. This keeps inactive choices light and
avoids multiple autoplay attempts on mobile.

## State and Transition Design

Circular offsets are normalized around the active index. Each book receives one
of three visual states:

| State | Card treatment | Cover treatment | Media |
|---|---|---|---|
| Active (`offset = 0`) | centered, largest, highest depth, full opacity | open wide; page block dominates | active image/video visible; video plays |
| Near (`offset = ±1`) | adjacent, smaller, rotated toward center | slightly open preview | no video playback |
| Far (`offset = ±2` or more) | farther, smaller, dimmed | closed cover | no video playback |

On an index change, GSAP animates transform and opacity with a single scoped
timeline. The timeline uses `overwrite: "auto"` so rapid arrows, dots, clicks,
or swipes do not leave stale animations. Cover flap rotation is synchronized
with card motion; the media backdrop crossfades to the new place independently
but with the same overall easing feel.

The CTA keeps the existing behavior:

1. Play the existing pop/sparkle feedback.
2. Call `onSelectPlace(currentPlace.title)`.
3. After the existing short delay, call `onConfirmPlace()`.
4. `App.jsx` locks the section and scrolls to the calendar.

The implementation may hold the timeout in a ref and clear it on unmount to
avoid stale callbacks, without changing the user-visible flow.

## Media Data Model

Each place will use an explicit media object:

```js
{
  id: "aquarium",
  title: "Aquarium Date",
  copy: "Let's get lost with the fishies together 🐠💗",
  media: {
    type: "video",
    src: "/assets/places/aquarium.mp4",
    poster: "/assets/places/aquarium.webp"
  }
}
```

Supported behavior:

- `type: "image"` renders an object-cover image.
- `type: "video"` renders a muted looping inline video with no native
  controls, `playsInline`, and `preload="none"`.
- `poster` is optional for video and may also be used as an image placeholder
  during media loading.
- Missing paths, load failures, and autoplay rejection reveal the existing
  place-specific SVG artwork.
- The media layer has fixed dimensions and absolute positioning so changing
  destinations cannot cause layout shift.
- `themeColor` remains available for a CSS custom-property tint/scrim over the
  media so the foreground book remains readable.

The configuration keeps the existing `/assets/places/` convention. No external
media URLs are introduced.

## Responsive Design

- Desktop uses a `100dvh`-oriented section with the header, book stage, and
  controls distributed vertically like the reference.
- Mobile uses a flexible `min-height` near `90dvh`, smaller books, compressed
  offsets, and enough content height to prevent clipping.
- The stage uses `touch-action: pan-y`; a swipe advances only when horizontal
  movement exceeds the threshold and clearly dominates vertical movement.
- Card sizing and offsets use responsive CSS/GSAP values rather than reading
  `window.innerWidth` during render.
- The page remains horizontally contained; far cards may be visually clipped by
  the stage without causing document-level horizontal overflow.

## Accessibility and Reduced Motion

- Use semantic interactive card controls with destination-specific accessible
  labels.
- Preserve labelled arrow and pagination controls with 44px minimum targets.
- Support ArrowLeft/ArrowRight keyboard navigation and a compact live status
  for the active destination.
- Keep inactive cards discoverable but visually subordinate; confirmed state
  disables navigation consistently.
- Respect `prefers-reduced-motion` by replacing cover rotation/depth movement
  with opacity/scale transitions and disabling decorative motion.
- Keep fallback artwork and text available when media cannot play.

## File Scope

Expected source changes:

- `src/components/LocationPicker/LocationPicker.jsx` — carousel orchestration,
  GSAP timeline, controls, gestures, responsive stage, and auto-confirm.
- `src/components/LocationPicker/BookCard.jsx` — new reusable book markup and
  state presentation.
- `src/components/PlacePreviews/PlaceVisual.jsx` — image/video backdrop,
  loading/error reset, and fallback behavior.
- `src/config/config.js` — explicit `media` objects and only the small metadata
  additions needed by the book presentation.
- `src/index.css` — only scoped utilities/rules that Tailwind cannot express,
  such as paper rules, cover backface behavior, or reduced-motion overrides.

Do not modify `App.jsx` unless a strictly necessary integration correction is
found during implementation. Do not modify Markdown, reference files, or
temporary/generated files for the feature commit.

## Verification Plan

Run the repository build with `npm run build`. If no lint or test scripts exist,
do not add them solely for this feature. Use the development browser to verify:

1. Desktop and mobile layout at representative viewport sizes.
2. Initial active destination and active/near/far book states.
3. Card click, arrows, dots, keyboard, and swipe navigation.
4. Image rendering and active media crossfade.
5. Video autoplay attributes, playback, and poster behavior.
6. Missing image/video and failed video fallback artwork.
7. Fast repeated navigation and transition interruption.
8. Auto-confirm lock and smooth scroll to the calendar.
9. Reduced-motion behavior and browser console errors.
10. No changes to unrelated sections during the flow.
