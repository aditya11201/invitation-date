# Where Should We Go Media Book Selector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing destination card carousel with a reference-faithful book selector whose active destination controls an image/video atmosphere layer, while preserving the existing auto-confirm-to-calendar flow.

**Architecture:** Keep `App.jsx` and the parent state contract unchanged. Refactor `LocationPicker` into a GSAP-orchestrated carousel, isolate the book markup in `BookCard`, and reuse `PlaceVisual` as the active media backdrop with SVG fallback. Use CSS perspective only for the DOM cover illusion; do not add Three.js/WebGL/model rendering.

**Tech Stack:** React 19, existing GSAP 3.12.x, Tailwind CSS 3.4.x, scoped CSS, Lucide icons, existing sound utility, Vite.

## Global Constraints

- Preserve existing destination copy, IDs, highlights, selection contract, auto-confirm delay, and calendar scroll behavior.
- Use explicit per-place media `{ type: "image" | "video", src, poster? }` and no external/random media URLs.
- Mount/play video only for the active destination; use `muted`, `loop`, `playsInline`, `preload="none"`, and no native controls.
- Keep the existing SVG artwork fallback for missing, failed, or blocked media.
- Use the existing GSAP dependency; do not add `@gsap/react` or another animation dependency.
- Use `gsap.context()` cleanup and `gsap.matchMedia()` for responsive/reduced-motion animation values.
- Do not modify unrelated sections, the global Three.js scene, reference files, or Markdown files for the feature implementation.
- Do not commit files unless explicitly requested; this plan and the approved spec remain untracked local process artifacts.
- Do not add a test framework; `package.json` has only `dev`, `build`, and `preview` scripts.

## File Map

| File | Responsibility after implementation |
|---|---|
| `src/config/config.js` | Existing destination content plus explicit `media` objects and optional book labels derived from existing destination concepts. |
| `src/components/PlacePreviews/PlaceVisual.jsx` | Active image/video backdrop, loading/error state, autoplay handling, and existing SVG fallback. |
| `src/components/LocationPicker/BookCard.jsx` | One semantic book selector: cover, spine, page block, highlights, and active/inactive presentation. |
| `src/components/LocationPicker/LocationPicker.jsx` | Active index, navigation, gestures, GSAP orchestration, backdrop placement, CTA auto-confirm, and responsive stage. |
| `src/index.css` | Only scoped book/page/backface/reduced-motion rules not practical as Tailwind utilities. |

Automated test files are intentionally not added because this repository has no
test runner. Each implementation task ends with `npm run build`; the final task
adds browser interaction and media verification.

---

### Task 1: Establish the media contract and robust backdrop renderer

**Files:**
- Modify: `src/config/config.js:40-96`
- Modify: `src/components/PlacePreviews/PlaceVisual.jsx:1-198`

**Interfaces:**
- Consumes: one destination record with `id`, `themeColor`, existing content, and `media`.
- Produces: `PlaceVisual({ place, isActive })`, rendering one active image/video layer or the existing place-specific SVG artwork.

- [ ] **Step 1: Add explicit media objects to all five destination records**

Replace the legacy `poster`/`video` pair in each `invitationConfig.places` record
with these exact media values while preserving every existing copy and
highlight:

```js
media: {
  type: "video",
  src: "/assets/places/aquarium.mp4",
  poster: "/assets/places/aquarium.webp",
},
media: {
  type: "video",
  src: "/assets/places/cinema.mp4",
  poster: "/assets/places/cinema.webp",
},
media: {
  type: "video",
  src: "/assets/places/ragunan.mp4",
  poster: "/assets/places/ragunan.webp",
},
media: {
  type: "video",
  src: "/assets/places/dufan.mp4",
  poster: "/assets/places/dufan.webp",
},
media: {
  type: "video",
  src: "/assets/places/lego.mp4",
  poster: "/assets/places/lego.webp",
},
```

Do not add external URLs. If a destination needs to start with a still image,
the supported replacement is explicit and local:

```js
media: {
  type: "image",
  src: "/assets/places/aquarium.webp",
}
```

- [ ] **Step 2: Reset media state whenever the place or media source changes**

Replace the current `isActive`-only reset with a place/source reset so a failed
video cannot poison the next destination:

```jsx
useEffect(() => {
  setMediaLoaded(false);
  setHasError(false);
}, [place.id, place.media?.type, place.media?.src]);
```

Keep `videoRef` cleanup paused on inactive/unmount. Retain the existing
`renderArtwork()` switch unchanged except for its surrounding media placement.

- [ ] **Step 3: Render image and video modes over the fallback artwork**

Use one `media` variable and keep the artwork mounted beneath it. The renderer
must not render a video for inactive cards:

```jsx
const media = place.media;
const mediaUrl = media?.src ? resolveAssetUrl(media.src) : null;
const posterUrl = media?.poster ? resolveAssetUrl(media.poster) : undefined;

{isActive && media?.type === "video" && mediaUrl && !hasError && (
  <video
    ref={videoRef}
    src={mediaUrl}
    poster={posterUrl}
    preload="none"
    muted
    loop
    playsInline
    onLoadedData={() => setMediaLoaded(true)}
    onError={() => setHasError(true)}
    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
      mediaLoaded ? "opacity-100" : "opacity-0"
    }`}
  />
)}

{isActive && media?.type === "image" && mediaUrl && !hasError && (
  <img
    src={mediaUrl}
    alt=""
    onLoad={() => setMediaLoaded(true)}
    onError={() => setHasError(true)}
    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
      mediaLoaded ? "opacity-100" : "opacity-0"
    }`}
  />
)}

{(!mediaLoaded || hasError || !isActive) && renderArtwork()}
```

Use `aria-hidden="true"` on the decorative media wrapper. Keep the destination
name in the book content rather than duplicating it as media alt text.

- [ ] **Step 4: Keep active video playback guarded and cleaned up**

Attempt playback only when the current media is a video and the place is
active. Autoplay rejection must set `hasError` and reveal the artwork instead
of logging an uncaught rejection:

```jsx
useEffect(() => {
  if (!isActive || place.media?.type !== "video" || !videoRef.current) return;

  const playPromise = videoRef.current.play();
  playPromise?.catch(() => setHasError(true));

  return () => videoRef.current?.pause();
}, [isActive, place.id, place.media?.type, place.media?.src]);
```

- [ ] **Step 5: Run the static verification**

Run:

```bash
npm run build
```

Expected: Vite build succeeds with no new source errors. No media files are
required for this check because the SVG fallback is the safe runtime path.

---

### Task 2: Build the semantic book card

**Files:**
- Create: `src/components/LocationPicker/BookCard.jsx`

**Interfaces:**
- Consumes:
  ```ts
  {
    place,
    index,
    offset,
    isActive,
    isConfirmed,
    onSelect,
    coverRef,
  }
  ```
- The component is created with `forwardRef`; the forwarded `ref` is the
  `cardRef` consumed by `LocationPicker`, while `coverRef` is an explicit prop.
- Produces: a focusable `button` whose `data-book-state` is `active`, `near`, or `far` and whose cover can be animated by the parent timeline.

- [ ] **Step 1: Define the book-state derivation**

Use the normalized offset passed by `LocationPicker`:

```js
const state = offset === 0 ? "active" : Math.abs(offset) === 1 ? "near" : "far";
```

Do not render media inside this component. The active visual belongs to the
section backdrop; the book is the textual selector and reference-style
foreground object.

- [ ] **Step 2: Add the semantic interactive root and ref hooks**

The root must expose a destination label, active state, theme color, and
selection handler. Define the component with `forwardRef` so the parent can
animate the card root and the cover independently:

```jsx
import { forwardRef } from "react";

const BookCard = forwardRef(function BookCard(
  { place, index, offset, isActive, isConfirmed, onSelect, coverRef },
  cardRef,
) {
  const state = offset === 0 ? "active" : Math.abs(offset) === 1 ? "near" : "far";

  return (
<button
  ref={cardRef}
  type="button"
  data-book-state={state}
  aria-label={`Choose ${place.title}`}
  aria-current={isActive ? "true" : undefined}
  disabled={isConfirmed && !isActive}
  onClick={() => !isActive && !isConfirmed && onSelect(index)}
  style={{ "--place-color": place.themeColor }}
  className="destination-book absolute left-1/2 top-1/2 text-left"
>
  {/* book layers */}
</button>
  );
});
```

Keep the root as the only interactive element inside the book so keyboard and
screen-reader behavior remains predictable.

- [ ] **Step 3: Render the approved book anatomy using existing content**

The component must contain the page block before the cover flap so the cover
can visually conceal it when closed:

```jsx
<span className="destination-book__back" aria-hidden="true" />
<span className="destination-book__pages">
  <span className="destination-book__chapter">
    {place.chapter ?? `Chapter ${String(index + 1).padStart(2, "0")}`}
  </span>
  <strong className="destination-book__title">{place.title}</strong>
  <span className="destination-book__copy">{place.copy}</span>
  {place.highlights?.length > 0 && (
    <span className="destination-book__highlights">
      {place.highlights.map((highlight) => (
        <span key={highlight}>{highlight}</span>
      ))}
    </span>
  )}
  <span className="destination-book__page-number">
    {String(index + 1).padStart(2, "0")}
  </span>
</span>
<span
  ref={coverRef}
  data-book-cover
  className="destination-book__cover"
  aria-hidden="true"
>
  <span className="destination-book__spine">{place.title}</span>
  <span className="destination-book__badge">{place.emoji}</span>
  <span className="destination-book__cover-label">{place.id}</span>
  <strong>{place.title}</strong>
</span>
```

The chapter label and cover label are derived from existing destination data;
do not copy reference story text into the app. If `place.chapter` is added in
the config, it must remain short and destination-specific.

- [ ] **Step 4: Run the static verification**

Run:

```bash
npm run build
```

Expected: the new component compiles even before `LocationPicker` imports it.

---

### Task 3: Refactor `LocationPicker` around GSAP state transitions

**Files:**
- Modify: `src/components/LocationPicker/LocationPicker.jsx:1-232`

**Interfaces:**
- Consumes: `places`, `selectedPlace`, `onSelectPlace`, `onConfirmPlace`, and `isConfirmed` from `App.jsx`; `BookCard`; `PlaceVisual`.
- Produces: the same `LocationPicker` default export and the same parent callback semantics.

- [ ] **Step 1: Replace browser-width render logic with reusable offset/motion helpers**

Add these local helpers above the component:

```js
const getCircularOffset = (index, activeIndex, length) => {
  let offset = index - activeIndex;
  const midpoint = Math.floor(length / 2);
  if (offset < -midpoint) offset += length;
  if (offset > midpoint) offset -= length;
  return offset;
};

const getMotion = (offset, isMobile) => {
  const distance = Math.abs(offset);
  const xGap = isMobile ? 140 : 220;
  const x = offset === 0 ? 0 : Math.sign(offset) * (distance === 1 ? xGap : xGap * 1.7);

  return {
    x,
    z: distance === 0 ? 80 : distance === 1 ? -140 : -260,
    rotateY: offset * -26,
    scale: distance === 0 ? 1.04 : distance === 1 ? 0.84 : 0.68,
    opacity: distance === 0 ? 1 : distance === 1 ? 0.72 : 0.28,
    coverRotateY: distance === 0 ? -155 : distance === 1 ? -18 : 0,
    zIndex: distance === 0 ? 30 : distance === 1 ? 20 : 10,
  };
};
```

If `places.length === 0`, return `null` before modulo operations. This keeps
the component safe for an empty configuration without changing normal behavior.

- [ ] **Step 2: Add refs and lifecycle cleanup for GSAP**

Use ref arrays for cards and covers, plus one root/stage ref and one backdrop
ref:

```jsx
const rootRef = useRef(null);
const backdropRef = useRef(null);
const cardRefs = useRef([]);
const coverRefs = useRef([]);
const confirmTimeoutRef = useRef(null);
const [touchStart, setTouchStart] = useState(null);
```

Clear the auto-confirm timer when the component unmounts:

```jsx
useEffect(() => () => clearTimeout(confirmTimeoutRef.current), []);
```

- [ ] **Step 3: Add the GSAP responsive/reduced-motion transition effect**

Import `useLayoutEffect` and the existing `gsap` package. Scope all animations
to the root and revert them on cleanup. Use `matchMedia` conditions instead of
reading `window.innerWidth` in render:

```jsx
useLayoutEffect(() => {
  let mm;
  const ctx = gsap.context(() => {
    mm = gsap.matchMedia();

    mm.add(
      {
        mobile: "(max-width: 639px)",
        reduceMotion: "(prefers-reduced-motion: reduce)",
      },
      ({ conditions }) => {
        const duration = conditions.reduceMotion ? 0.12 : 0.72;
        const transition = gsap.timeline({
          defaults: { overwrite: "auto" },
        });

        cardRefs.current.forEach((card, index) => {
          if (!card) return;
          const offset = getCircularOffset(index, activeIndex, places.length);
          const motion = getMotion(offset, conditions.mobile);

          transition.to(card, {
            xPercent: -50,
            yPercent: -50,
            x: motion.x,
            z: motion.z,
            rotateY: motion.rotateY,
            scale: motion.scale,
            opacity: motion.opacity,
            zIndex: motion.zIndex,
            duration,
            ease: conditions.reduceMotion ? "none" : "power3.out",
            overwrite: "auto",
          });

          if (coverRefs.current[index]) {
            transition.to(coverRefs.current[index], {
              rotateY: motion.coverRotateY,
              duration: conditions.reduceMotion ? 0.08 : 0.78,
              ease: conditions.reduceMotion ? "none" : "power2.out",
              overwrite: "auto",
            });
          }
        });

        if (backdropRef.current) {
          transition.fromTo(
            backdropRef.current,
            { opacity: 0, scale: conditions.reduceMotion ? 1 : 1.03 },
            {
              opacity: 1,
              scale: 1,
              duration: conditions.reduceMotion ? 0.12 : 0.72,
              ease: conditions.reduceMotion ? "none" : "power2.out",
              overwrite: "auto",
            },
          );
        }

        return () => transition.kill();
      },
    );
  }, rootRef);

  return () => {
    mm?.revert();
    ctx.revert();
  };
}, [activeIndex, places.length]);
```

The dependency list must not include the entire `places` array if its identity
is recreated by a parent; use the stable length and current place data for the
rendered backdrop. The `ctx.revert()` cleanup is required for React Strict Mode.

- [ ] **Step 4: Add navigation handlers with guards and sound feedback**

Normalize indexes and keep the confirmed state locked:

```js
const goTo = (nextIndex) => {
  if (isConfirmed || places.length < 2) return;
  sound.playClick();
  setActiveIndex((nextIndex + places.length) % places.length);
};

const handleNext = () => goTo(activeIndex + 1);
const handlePrev = () => goTo(activeIndex - 1);
```

Use `goTo(index)` for card clicks and dots. Do not call `onSelectPlace` while
browsing; only the primary CTA commits the destination to the parent.

- [ ] **Step 5: Implement directional swipe and keyboard navigation**

Store both axes on touch start and only navigate for a clearly horizontal
gesture:

```js
const handleTouchStart = (event) => {
  if (isConfirmed) return;
  const touch = event.touches[0];
  setTouchStart({ x: touch.clientX, y: touch.clientY });
};

const handleTouchEnd = (event) => {
  if (!touchStart || isConfirmed) return;
  const touch = event.changedTouches[0];
  const dx = touchStart.x - touch.clientX;
  const dy = touchStart.y - touch.clientY;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
    dx > 0 ? handleNext() : handlePrev();
  }
  setTouchStart(null);
};
```

Attach the section-level keyboard handler only to left/right arrows and keep
the section focusable:

```js
const handleKeyDown = (event) => {
  if (event.key === "ArrowRight") handleNext();
  if (event.key === "ArrowLeft") handlePrev();
};
```

- [ ] **Step 6: Render the active backdrop, book stage, and controls**

The section must use the responsive-hybrid height and keep the backdrop
decorative:

```jsx
const currentPlace = places[activeIndex];

<section
  ref={rootRef}
  id="destination-picker-section"
  role="region"
  aria-label="Date destination selector"
  tabIndex={0}
  aria-roledescription="carousel"
  onKeyDown={handleKeyDown}
  onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}
  className="destination-book-selector relative flex min-h-[90dvh] flex-col items-center justify-between overflow-hidden px-4 py-12 lg:h-[100dvh] lg:min-h-[100dvh]"
>
  <div
    ref={backdropRef}
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 -z-10"
    style={{ "--place-color": currentPlace.themeColor }}
  >
    <PlaceVisual key={currentPlace.id} place={currentPlace} isActive />
    <div className="destination-book-selector__scrim absolute inset-0" />
  </div>

  {/* existing header copy, revised only for reference hierarchy */}
  <p className="sr-only" role="status" aria-live="polite">
    {currentPlace.title}
  </p>

  <div className="destination-book-selector__stage relative h-[400px] w-full max-w-5xl sm:h-[460px]">
    {places.map((place, index) => (
      <BookCard
        key={place.id}
        ref={(node) => { cardRefs.current[index] = node; }}
        coverRef={(node) => { coverRefs.current[index] = node; }}
        place={place}
        index={index}
        offset={getCircularOffset(index, activeIndex, places.length)}
        isActive={index === activeIndex}
        isConfirmed={isConfirmed}
        onSelect={goTo}
      />
    ))}
  </div>

  {/* dots, arrows, and existing auto-confirm CTA */}
</section>
```

Keep the existing header meaning and CTA copy; only change layout/treatment to
match the approved reference hierarchy. Dots retain the expanded active state.

- [ ] **Step 7: Preserve auto-confirm exactly at the CTA boundary**

Use the current place title and existing sound effects, with timer cleanup:

```js
const handleChooseDestination = () => {
  if (isConfirmed) return;
  sound.playPop(1.3);
  sound.playSparkle();
  onSelectPlace(currentPlace.title);
  clearTimeout(confirmTimeoutRef.current);
  confirmTimeoutRef.current = setTimeout(onConfirmPlace, 400);
};
```

The confirmed presentation remains a non-interactive locked status and does not
introduce the reference modal.

- [ ] **Step 8: Run the static verification**

Run:

```bash
npm run build
```

Expected: Vite build succeeds with no unused import or JSX errors.

---

### Task 4: Add scoped book visual rules without global redesign

**Files:**
- Modify: `src/index.css:1-84`

**Interfaces:**
- Consumes: the class names emitted by `BookCard` and `LocationPicker`.
- Produces: paper, cover, spine, depth, scrim, and reduced-motion presentation for this section only.

- [ ] **Step 1: Add only destination-scoped CSS rules**

Append rules under a `.destination-book-selector` namespace. The page block
uses a ruled-paper background, the cover rotates around its spine, and the
backdrop scrim uses the active theme color:

```css
.destination-book-selector {
  --book-ink: #332c2f;
  --book-paper: #fcfbf7;
  --book-rose: #a34e5d;
  perspective: 1600px;
}

.destination-book-selector__stage {
  perspective: 1600px;
  touch-action: pan-y;
  isolation: isolate;
}

.destination-book {
  width: min(310px, 78vw);
  height: min(440px, 64dvh);
  transform-style: preserve-3d;
  transform-origin: center;
  will-change: transform, opacity;
  transition: box-shadow 180ms ease;
}

.destination-book__back {
  position: absolute;
  inset: 5px -8px 5px 4px;
  border-radius: 8px 16px 16px 8px;
  background: #3b202c;
  transform: translateZ(-6px);
  box-shadow: 10px 16px 28px -18px rgba(59, 32, 44, 0.7);
}

.destination-book__pages {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 40px 28px 24px 48px;
  overflow: hidden;
  color: var(--book-ink);
  background:
    linear-gradient(90deg, transparent 0 28px, rgba(163, 78, 93, 0.45) 28px 30px, transparent 30px),
    repeating-linear-gradient(to bottom, var(--book-paper) 0 31px, rgba(163, 78, 93, 0.12) 32px 33px);
  border-radius: 8px 14px 14px 8px;
  box-shadow: inset 12px 0 18px -18px rgba(59, 32, 44, 0.6), 0 18px 38px -14px rgba(96, 52, 57, 0.28);
}

.destination-book__chapter,
.destination-book__cover-label {
  color: rgba(163, 78, 93, 0.82);
  font-family: "Plus Jakarta Sans", system-ui, sans-serif;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.destination-book__title {
  color: var(--book-ink);
  font-family: "Playfair Display", Georgia, serif;
  font-size: clamp(1.35rem, 3vw, 2rem);
  line-height: 1.1;
}

.destination-book__copy {
  max-width: 24ch;
  color: #685b5f;
  font-family: "Plus Jakarta Sans", system-ui, sans-serif;
  font-size: 0.78rem;
  line-height: 1.55;
}

.destination-book__highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.destination-book__highlights span {
  padding: 4px 8px;
  border: 1px dashed rgba(163, 78, 93, 0.45);
  border-radius: 999px;
  color: #6e3547;
  font-size: 0.6rem;
  line-height: 1.2;
}

.destination-book__page-number {
  align-self: center;
  color: rgba(104, 91, 95, 0.72);
  font-family: "Playfair Display", Georgia, serif;
  font-size: 0.82rem;
  font-style: italic;
}

.destination-book__cover {
  position: absolute;
  inset: 0 auto 0 0;
  width: 100%;
  padding: 28px 28px 28px 48px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transform-origin: left center;
  transform-style: preserve-3d;
  backface-visibility: hidden;
  background: linear-gradient(135deg, var(--place-color, #a34e5d), #3b202c);
  border: 1px solid rgba(252, 251, 247, 0.72);
  border-radius: 8px 16px 16px 8px;
  box-shadow: 12px 18px 34px -18px rgba(59, 32, 44, 0.62);
  will-change: transform;
}

.destination-book__spine {
  position: absolute;
  inset: 24px auto 24px 14px;
  display: grid;
  place-items: center;
  width: 18px;
  color: rgba(252, 251, 247, 0.72);
  font-size: 0.55rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  writing-mode: vertical-rl;
}

.destination-book__badge {
  align-self: flex-end;
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 1px solid rgba(252, 251, 247, 0.62);
  border-radius: 50%;
  background: rgba(252, 251, 247, 0.16);
  font-size: 1.3rem;
}

.destination-book__cover > strong {
  max-width: 9ch;
  color: var(--book-paper);
  font-family: "Playfair Display", Georgia, serif;
  font-size: clamp(1.7rem, 4vw, 2.7rem);
  line-height: 0.98;
  text-shadow: 0 2px 12px rgba(59, 32, 44, 0.42);
}

.destination-book[data-book-state="active"] .destination-book__pages {
  outline: 2px solid rgba(244, 114, 182, 0.56);
  outline-offset: 6px;
}

.destination-book-selector__scrim {
  background: rgba(59, 32, 44, 0.52);
  background: linear-gradient(180deg, color-mix(in srgb, var(--place-color) 22%, transparent), rgba(59, 32, 44, 0.52));
  backdrop-filter: blur(2px);
}

@media (prefers-reduced-motion: reduce) {
  .destination-book-selector *,
  .destination-book-selector *::before,
  .destination-book-selector *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

Keep any browser fallback for `color-mix()` harmless by using the base
background color from the previous declaration; do not add a global color
system or alter unrelated selectors.

- [ ] **Step 2: Verify scoped styling and build**

Run:

```bash
npm run build
```

Expected: the build succeeds and no selectors outside the destination section
are changed.

---

### Task 5: Perform final browser and regression verification

**Files:**
- No source changes expected.

**Interfaces:**
- Consumes: the completed destination section in the running Vite app.
- Produces: verified interaction/media behavior and a diff limited to the approved source files.

- [ ] **Step 1: Start the development server and inspect the section**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Open the reported local URL and navigate through the invitation until the
destination section is visible. Check the browser console for new errors.

- [ ] **Step 2: Verify desktop composition**

At a desktop viewport, confirm all of the following:

1. Header, centered book stage, dots/arrows, and CTA follow the reference-like
   vertical composition.
2. The active book is centered, open, readable, and visually dominant.
3. Near books peek from both sides; far books are dimmer and closed.
4. The active image/video backdrop fills the section without layout shift.
5. Navigation transitions card transforms, cover flap, dots, and backdrop together.

- [ ] **Step 3: Verify mobile composition and gestures**

Use a narrow mobile viewport and confirm:

1. The section can grow beyond the viewport without clipping text or CTA.
2. Neighbor books remain partially visible without document horizontal overflow.
3. Vertical page scrolling still works when a gesture is mostly vertical.
4. Horizontal swipe past the threshold advances exactly one destination.
5. Arrow, dot, and card controls remain at least 44px where interactive.

- [ ] **Step 4: Verify every navigation path**

Exercise card click, previous/next arrows, each pagination dot, ArrowLeft,
ArrowRight, Enter/Space on a focused card, and swipe. Rapidly change selections
while a transition is active; confirm no stuck cover or stale backdrop remains.

- [ ] **Step 5: Verify media modes and fallback behavior**

Use one local image configuration and one local video configuration in
`src/config/config.js`, then check:

```js
media: { type: "image", src: "/assets/places/aquarium.webp" }
media: {
  type: "video",
  src: "/assets/places/aquarium.mp4",
  poster: "/assets/places/aquarium.webp",
}
```

Also temporarily point one source at a missing local path and confirm the
existing SVG artwork appears with no blank panel or uncaught console rejection.
Restore the configuration to the intended template values after the check.

- [ ] **Step 6: Verify auto-confirm and downstream regression**

Click the CTA and confirm:

1. Existing sound feedback fires.
2. The active title is sent through `onSelectPlace`.
3. The section locks after the existing delay.
4. The app scrolls to `#calendar-journey-section`.
5. Calendar, surprise, and ticket sections still receive the selected title.

- [ ] **Step 7: Verify reduced motion and final diff**

Enable `prefers-reduced-motion: reduce` in the browser and confirm the state
change remains understandable without large rotations or decorative motion.
Then run:

```bash
npm run build
git diff --check
git status --short
```

Expected: build succeeds, `git diff --check` reports no whitespace errors, and
only the approved source files are modified. The local spec and plan remain
untracked and are not staged or committed.

## Plan Self-Review

- **Spec coverage:** architecture, active/near/far states, GSAP cleanup,
  responsive matching, image/video modes, fallback behavior, auto-confirm,
  accessibility, reduced motion, file scope, and verification are covered by
  Tasks 1–5.
- **No unresolved placeholders:** every task names exact files, interfaces,
  commands, expected outcomes, and concrete code shapes.
- **Type/property consistency:** `place.media`, `PlaceVisual({ place, isActive })`,
  `BookCard` refs, `getCircularOffset`, `getMotion`, and the existing parent
  callbacks are used consistently across tasks.
- **Scope check:** no new dependency, route, global redesign, modal, reference
  edit, or unrelated section change is included.
