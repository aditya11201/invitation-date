# Product Requirements Document — 3D Romantic Date Invitation

**Version:** 1.0  
**Product Type:** Interactive 3D Web Experience  
**Primary Platform:** Mobile & Tablet  
**Secondary Platform:** Desktop  
**Deployment:** Static Web / GitHub Pages compatible  
**Default Recipient:** Sassy  
**Default Sender:** User

---

## 1. Product Overview

### 1.1 Product Vision

Build an **interactive 3D romantic date invitation website** that transforms the simple act of “asking your partner on a date” into a memorable, playful, romantic, immersive, and personal digital journey.

The website should not feel like a conventional landing page. The entire experience is designed as **one long cinematic journey** where scrolling, gestures, 3D objects, audio, video, typography, and interaction work together as a single story.

The experience begins in a dreamy 3D environment, followed by a personal greeting, an envelope and love letter, a date question with a playful Yes/No gimmick, destination selection, date selection, a surprise GIF reveal, and finally a **Digital Date Ticket**.

---

# 2. Problem Statement

Asking a partner on a date through a regular chat such as WhatsApp feels too simple and easy to forget.

The user needs a way that is:

- More memorable.
- More personal.
- Built around emotional buildup.
- Capable of delivering a surprise.
- Playful and interactive.
- Experienced as an event, not just a message.
- Saveable as a keepsake.

This website becomes a **mini romantic digital experience** before the actual date takes place.

---

# 3. Product Goals

### Primary Goal

Make the invitation recipient feel:

**“They really put effort into making something just for me.”**

### Secondary Goals

1. Make asking someone on a date feel fun and memorable.
2. Combine romance, elegance, humor, and playful interaction.
3. Deliver a strong cinematic 3D experience, especially on mobile.
4. Let the recipient choose the date location and date themselves.
5. Generate a final date ticket that can be saved and shared.
6. Make the product reusable for other couples by changing only one configuration file.

---

# 4. Target Users

## Primary User

The invitation creator’s girlfriend.

The first version is created personally for:

**Recipient:** Sassy

## Secondary User

Other people who want to use the same source code to create their own romantic date invitation.

All personalized content must be replaceable through:

`src/config/config.js`

without modifying the core application logic.

---

# 5. Experience Principles

The experience must follow these five principles.

### Romantic

Use copy, motion, music, lighting, and visuals that build an emotional connection.

### Elegant

Do not use so much decoration that the interface feels crowded.

The visuals must remain premium and intentional.

### Cute

Hearts, microcopy, typography, and interactions should have a sweet character.

### Playful

The user actively interacts with the website instead of simply reading it.

### Teasing / Funny

Some interactions include humor, especially the No-button gimmick that gradually “pushes” the user toward choosing Yes.

---

# 6. Visual Direction

## Main Visual Theme

**Soft Pink + Lavender Dreamy**

Supporting palette:

- Soft pink
- Pastel lavender
- Ivory
- Cream
- Soft white
- Subtle rose
- Low-opacity glass

Visual effects:

- Bloom
- Soft glow
- Glassmorphism
- Volumetric depth
- Soft shadow
- Subtle reflection
- Floating particles
- Depth of field
- Parallax
- Cinematic lighting

The website should feel dreamy without looking childish.

---

# 7. Technical Architecture

## Recommended Stack

### Application

**React + Vite**

Vite is used as the development/build system.

React is used for:

- state management
- UI componentization
- conditional scenes
- user selections
- interaction flow

### 3D Engine

**Three.js + React Three Fiber**

Additional:

**@react-three/drei**

Used for:

- 3D hearts
- particle environment
- envelope scene
- depth effects
- floating cards
- camera animation
- 3D ticket
- lighting
- parallax

Three.js should preferably be used as an npm dependency through React Three Fiber rather than a direct CDN because the final architecture uses React + Vite.

### Cinematic Animation

**GSAP + ScrollTrigger**

GSAP serves as the primary animation orchestrator.

ScrollTrigger is used for:

- pinning scenes
- scrub animations
- camera movement
- envelope reveal
- letter extraction
- scene transitions
- calendar journey
- final reveal

### UI Animation

**Framer Motion**

Used for:

- button interactions
- cards
- fades
- scaling
- micro animations
- modal/export UI

### Audio

**Howler.js** or Web Audio API.

### Dates

Native Date API or Day.js.

### Ticket Export

A DOM-to-image-compatible library for PNG export.

PDF export is provided as a secondary option.

---

# 8. Application Structure

Recommended component structure:

```text
src/
├── components/
│   ├── Preloader/
│   ├── Navbar/
│   ├── Hero/
│   ├── EnvelopeScene/
│   ├── InvitationLetter/
│   ├── YesNoScene/
│   ├── CelebrationScene/
│   ├── LocationPicker/
│   ├── CalendarJourney/
│   ├── GifReveal/
│   ├── DateTicket/
│   └── ExportMenu/
│
├── three/
│   ├── LoveBubbleScene/
│   ├── HeartParticles/
│   ├── Envelope3D/
│   ├── CelebrationParticles/
│   ├── DestinationCarousel/
│   ├── Calendar3D/
│   └── Ticket3D/
│
├── config/
│   └── config.js
│
├── assets/
│   ├── audio/
│   ├── images/
│   ├── video/
│   ├── gifs/
│   └── textures/
│
├── hooks/
├── utils/
├── App.jsx
└── main.jsx
```

---

# 9. Global User Journey

```text
3D Preloader
      ↓
Hero Greeting
      ↓
Envelope Appears
      ↓
Letter Slowly Leaves Envelope
      ↓
Invitation Copy Reveal
      ↓
YES / NO
      ↓
3D Celebration
      ↓
Letter Rotates
      ↓
Destination Carousel
      ↓
Destination Confirmation
      ↓
3D Calendar Journey
      ↓
Date Confirmation
      ↓
GIF Surprise Reveal
      ↓
Digital Date Ticket
      ↓
Save / Calendar / WhatsApp
```

The entire journey must feel like **one cinematic sequence**, not a collection of separate sections.

---

# 10. Scene 0 — 3D Preloader

Before the experience begins, the website displays a cinematic loading screen.

Text:

**“Preparing something special for you... 💗”**

Visual:

- layered CSS 3D burgundy envelope
- ivory letter paper peeking from the pocket
- gold foil border and progress rail
- dimensional wax seal with a heart impression
- slow floating tilt and muted rose/lavender atmosphere
- percentage/progress indicator

After the progress reaches 100%:

1. the status changes to `Your invitation is ready 💌`
2. the wax seal and `Open My Invitation 💌` action become available
3. clicking the action opens the flap and lifts the paper peek
4. the preloader fades out and calls the existing `onStart()` boundary

The preloader remains the first user interaction needed to enable audio in accordance with browser autoplay policies. It must work without a separate WebGL renderer and must remain compatible with static GitHub Pages hosting.

---

# 11. Global Navigation

The navbar uses a:

**Glassmorphism floating navigation** style.

At the top of the page:

- translucent
- blurred
- minimal

After scrolling:

- the background becomes more solid
- contrast increases

The navbar contains only:

- minimal branding/name
- music toggle
- thin progress bar

Do not use navigation labels such as Hero / Date / Calendar.

Progress is shown only as a **thin line**.

The progress bar represents the user’s position within the cinematic journey.

---

# 12. Scene 1 — Hero

## Objective

Create a dreamy and personal first impression.

## Hero 3D Environment

Massive full-viewport WebGL canvas.

The background contains:

**floating 3D love bubbles**

Hearts move like air bubbles underwater.

Motion characteristics:

- slow floating
- random rotation
- gentle wobble
- different Z-depth
- slight lateral drift

Depth is divided into:

### Background Hearts

Small, slow, and far away.

### Midground Hearts

Medium-sized and more visible.

### Foreground Hearts

Some hearts occasionally move toward the camera.

Hearts may pass along the sides of the camera to create a stronger sensation of depth.

The frequency should remain low so the result still feels elegant.

---

# 13. Hero Copy

Default greeting:

**“Hellooo my beautiful Sassy, my cutieeeeeee 💗”**

The copy must be configurable.

Animation:

**handwriting reveal**

The text appears as if someone is slowly writing it by hand.

After the handwriting animation finishes:

- subtle glow
- slight depth
- gentle floating
- light parallax

---

# 14. Scene 2 — Envelope Introduction

When the user scrolls:

The greeting slowly moves away.

An envelope appears from below / from the depth of the scene.

## Envelope Style

It must not be a glass object.

It should look like a:

**premium realistic paper envelope**

Characteristics:

- realistic folds
- subtle paper grain
- believable shadows
- soft pink envelope
- ivory/cream letter
- lavender accent
- physical thickness
- premium stationery feel

The envelope slowly floats toward the camera.

GSAP ScrollTrigger controls:

- position
- rotation
- depth
- shadow
- envelope flap

The user’s scroll becomes the animation timeline.

---

# 15. Scene 3 — Letter Reveal

As the user continues scrolling:

1. the envelope flap opens
2. the edge of the letter becomes visible
3. the letter slowly moves out
4. the envelope remains behind it
5. the letter moves closer to the camera
6. the letter stops at the center of the viewport

Throughout this process, the letter must remain visible as a physical 3D object.

It must not suddenly fade into a 2D UI element.

---

# 16. Invitation Letter Copy

Default copy:

**Hellooo my beautiful Sassy, my cutieeeeeee 💗**

I just want to say…

**I really love spending time with you.**

Even the smallest things somehow feel more fun, more ridiculous, and more special when I’m with you.

So, I was thinking…

What if we make one little day that belongs only to us?

We can go out, eat something delicious, laugh about random things, take photos, and make another cute memory together.

I’ve already prepared everything here. There’s just one thing left…

**Would you go on a date with me? 🥺💗**

Choose wisely…

**even though there’s actually only one correct answer 😌**

---

# 17. Letter Reading Animation

The entire letter content should not appear all at once.

Paragraphs appear according to scroll progression.

Example:

```text
Scroll 0–20%
Opening

20–40%
Personal paragraph

40–60%
Date idea

60–80%
Question buildup

80–100%
Would you go on a date with me?
```

After the question has fully appeared:

**scroll is locked.**

The user cannot continue until they provide an answer.

---

# 18. Scene 4 — YES / NO Interaction

Initial layout:

```text
Would you go on a date with me? 💗

[ YES 💗 ]      [ NO 🙄 ]
```

## YES Behavior

Clicking Yes:

- accepts the invitation
- triggers the celebration
- unlocks the next part of the journey

## NO Behavior

No can be pressed a maximum of 5 times as a playful interaction.

With every click:

1. the Yes button grows larger
2. the No button changes its copy
3. the layout reacts slightly
4. a subtle heart reaction appears

Suggested No progression:

### Click 0

`No`

### Click 1

`Are you sure? 🥺`

### Click 2

`Seriously? 😭`

### Click 3

`Really now? 😤`

### Click 4

`Pleaseee 💗`

### Click 5

The Yes button expands to nearly/full viewport size.

Suggested Yes scale progression:

```text
Initial → 1.0
No #1   → 1.25
No #2   → 1.60
No #3   → 2.20
No #4   → major viewport takeover
No #5   → near/full viewport
```

After the fifth click, the Yes button becomes the dominant element so that, in practice, it is the only primary interaction left.

The interaction should feel funny, not aggressive.

---

# 19. Scene 5 — 3D YES Celebration

When Yes is pressed, do not use regular 2D confetti.

Use an **immersive Three.js celebration sequence**.

## Sequence

### Stage 1 — Energy Point

The Yes button becomes the source of pink-lavender light.

### Stage 2 — Heart Explosion

Dozens or hundreds of heart particles burst from the button area.

Particles vary in:

- position X
- position Y
- position Z
- scale
- velocity
- rotation

### Stage 3 — Foreground Flyby

Several large hearts fly past the camera.

### Stage 4 — Camera Motion

Camera:

- small dolly-in
- subtle impact
- smooth pull-back

### Stage 5 — Lighting Reaction

A pink/lavender light sweep passes through the scene.

The background bubble hearts are also pushed outward by the celebration.

### Stage 6 — Sparkle Trails

Selected foreground hearts have sparkle trails.

### Stage 7 — Scene Settle

Particles slowly fall away / disappear.

The letter becomes the visual focus again.

---

# 20. Celebration Audio

When Yes is pressed:

Combine:

- soft pop
- sparkle chime
- short romantic audio swell

On supported Android devices:

light haptic feedback can be used through:

`navigator.vibrate()`

Haptic feedback is not a blocking requirement.

---

# 21. Scene 6 — Letter Flip Transition

After the celebration:

The letter begins rotating on the Y-axis.

The camera follows the movement.

The letter rotates toward a “new/front side.”

The letter surface then transforms into a gateway toward:

**Choose Our Date Destination**

The transition must not feel like a new page is loading.

---

# 22. Scene 7 — Destination Picker

Use a:

**3D Cinematic Destination Carousel**

Do not use a static card grid.

## Layout

The active destination is centered and closest to the camera.

Previous/next destinations are:

- smaller
- positioned deeper on the Z-axis
- partially visible
- slightly blurred/dimmed

The user can interact through:

### Mobile

Swipe left/right.

### Desktop

Scroll, drag, or navigation interaction.

---

# 23. Destination Card

Each destination contains:

- location name
- video preview
- one cute sentence

Do not display:

- price
- budget
- detailed address
- rating
- long description

The goal is emotional selection, not a travel catalog.

---

# 24. Destination Options

## 1. Aquarium Date

Cute copy:

**“Let's get lost with the fishies together 🐠💗”**

Scene accent:

- underwater light
- subtle bubbles
- aqua/lavender glow

---

## 2. Cinema Date

Cute copy:

**“Movie, popcorn, and maybe stealing your hand 🍿🤏💗”**

Scene accent:

- cinematic light beam
- subtle film atmosphere

---

## 3. Ragunan Zoo Date

Cute copy:

**“A cute little zoo adventure with you 🐘💕”**

Scene accent:

- subtle floating leaves
- warm natural lighting

---

## 4. Ancol / Dufan Date

Cute copy:

**“Screaming together sounds romantic enough 🎢💗”**

Scene accent:

- sparkle
- playful movement
- abstract amusement park elements

---

## 5. Lego Date

Cute copy:

**“Let's build something cute together 🧱✨”**

Scene accent:

- floating block geometry
- playful depth

---

# 25. Destination Video Behavior

Use short looping video rather than GIF whenever possible.

Preferred formats:

- MP4
- WebM

GIF can be used as a fallback.

## Desktop

When hovering the active card:

- the card moves slightly toward the camera
- pointer-based tilt activates
- video begins
- glow increases

## Mobile

Because mobile does not have hover:

- the active center card automatically plays its video
- the previous card pauses
- the next card pauses

Video must be:

- muted
- looping
- inline

Only the active video plays.

---

# 26. Destination Performance

Do not load/play all 5 videos at the same time.

Initial load:

- poster images only

Lazy load:

- active destination video
- optionally the next destination

When a card becomes inactive:

- pause playback

This is important for mobile performance.

---

# 27. Destination Confirmation

The active destination displays a CTA:

**“Choose this date 💗”**

When pressed:

1. the card glow increases
2. a subtle heart pulse appears
3. the selection becomes locked
4. the destination card moves toward the letter
5. the card shrinks like a photo/polaroid
6. the destination visual appears to be attached to the letter
7. the camera moves toward the calendar scene

---

# 28. Scene 8 — 3D Calendar Journey

The calendar must not use a simple flat date picker.

Use the concept:

# 3D Calendar Journey

Months appear as floating cards arranged across spatial depth.

The active month is:

- centered
- closest
- sharp
- illuminated

The next month is:

- positioned farther along the Z-axis

The following month is:

- positioned even farther away

Scrolling/swiping moves the camera through the month timeline.

---

# 29. Calendar Range

Configuration year:

**2026**

The calendar supports:

January–December 2026.

However, dates that have already passed cannot be selected.

Availability logic:

```js
minimumSelectableDate = current local date
maximumSelectableDate = 31 December 2026
```

Example based on 19 August 2026:

- January–July: disabled
- August 1–18: disabled
- August 19 onward: enabled

The logic must be dynamic based on the current device date.

It must not be hardcoded specifically for 19 August.

---

# 30. Past Date Visual

Past dates should not simply use gray text.

Use a:

**faded glass effect**

Characteristics:

- lower opacity
- no glow
- subtle blur
- visually recessed
- no hover/touch response

Available dates:

- gentle pink/lavender glow
- slightly raised

---

# 31. Calendar Date Interaction

When an available date is pressed:

The date:

- rises from the calendar surface
- gets a soft glow
- scales slightly
- creates a floating date badge

Example:

**24 AUG 2026 💗**

However, the date is not final yet.

---

# 32. Date Confirmation

After selecting a date, a CTA appears:

**“This date 💗”**

The user must press this CTA.

The experience must not proceed to the next scene immediately after the user only presses a date number.

When confirmed:

- the selected date becomes locked
- the badge moves forward
- a micro heart particle effect appears
- the remaining calendar cards fade deeper into the scene

The destination + date are then visually combined.

Example:

```text
Aquarium Date 🐠
24 August 2026 💗
```

After that, the experience proceeds to the surprise reveal.

---

# 33. Scene 9 — GIF Surprise Reveal

After the date is confirmed:

The environment becomes calmer.

The selected location/date moves into the background.

A **floating 3D GIF card** emerges from the depth and moves toward the center of the screen.

The GIF is provided through configuration.

## Visual

GIF card:

- centered
- floating
- realistic depth
- glass/premium frame
- pink-lavender glow
- soft bloom
- shadow
- subtle reflection

---

# 34. GIF Parallax

The GIF card includes parallax.

Desktop:

pointer movement affects:

- rotation X
- rotation Y
- shadow
- highlight

Mobile/tablet:

device movement may be used subtly if permission is available.

Parallax must not make the GIF difficult to view.

---

# 35. GIF Reveal Copy

Primary text:

**“Yay, it's a date! 💗”**

Secondary text:

**“Can't wait to spend this cute little day with you 🥹✨”**

Animation:

- fade
- gentle scale
- depth movement
- slight float

The GIF remains the main visual focus.

---

# 36. Scene 10 — Final Digital Date Ticket

The final summary uses the concept:

# Digital Date Ticket 3D

Not a plain confirmation page.

The ticket has:

- depth
- premium material
- soft glass accent
- realistic shadow
- embossed typography
- subtle holographic/pink-lavender reflection
- gentle floating
- pointer/device tilt

The design remains clean.

Do not use a ticket ID or serial number.

---

# 37. Ticket Content

The ticket displays:

### Date With

`{{recipientName}}`

### From

`{{senderName}}`

### Destination

`{{selectedPlace}}`

### Date

`{{selectedDate}}`

### Status

**Confirmed 💗**

### Visual

Small GIF/image thumbnail.

---

# 38. Ticket Actions

The final ticket has four main actions.

## Primary CTA

**Send to WhatsApp 💌**

## Secondary CTA

**Save Ticket**

Default format:

**PNG image**

## Export Option

The user can choose:

**PDF**

PDF is not the default.

## Calendar

**Add to Calendar 📅**

---

# 39. Save Ticket Behavior

The default save action generates a:

**high-resolution PNG**

The output must contain only the ticket, not the entire screen.

Recommended:

- high DPI rendering
- social-share-friendly dimensions
- crisp typography

UI controls must not be included in the exported image.

---

# 40. PDF Export

PDF is available through the export menu.

Example:

```text
Save Ticket

→ Save as Image (Recommended)
→ Export as PDF
```

PNG is the default option.

PDF is an optional secondary format.

---

# 41. Add to Calendar

Button:

**Add to Calendar 📅**

Opens the following options:

### Google Calendar

Generate a prefilled Google Calendar URL.

### Apple Calendar / Other Calendar

Generate a downloadable `.ics` file.

ICS can also be used by:

- Apple Calendar
- Outlook
- other compatible apps

---

# 42. Calendar Event Configuration

The event is created as an:

**All-Day Event**

It does not have a start time/end time.

Suggested title:

**Date with {{recipientName}} 💗**

Location:

`{{selectedPlace}}`

Description can contain:

**Our cute little date 💗**

The selected date becomes the event date.

---

# 43. WhatsApp Integration

No backend is required.

Use:

`https://wa.me/`

The WhatsApp number comes from `config.js`.

Default placeholder:

`628xxxxxxxxxx`

---

# 44. WhatsApp Message

The message must automatically use the selected destination + selected date.

Template:

**Hellooo {{senderName}}, my handsome, cute, funny, sweet guyyyy 😚💗**

I want to go on a date with youuu 🥺👉👈✨

💌 **Our Date Plan**  
📍 Place: **{{selectedPlace}}**  
📅 Date: **{{selectedDate}}**

I’ve made my choiceee, so now you have to stay with me on our date until I’m completely satisfied 😌🤏💕

No running away, no canceling, we absolutely have to go on our dateee 😤💗

See you on our cute little dateeee 🫶🏻✨💗

The text must be URL-encoded before being bound to the WhatsApp URL.

---

# 45. Background Music

The website has romantic background music.

Characteristics:

- instrumental / soft
- dreamy
- low intensity
- does not interfere with reading the letter

Audio starts after the first eligible user interaction to remain compatible with mobile browser autoplay policies.

The navbar has a:

**Music On / Off control**

---

# 46. Sound Effects

Micro sound effects are used for:

- envelope opening
- paper movement
- Yes/No click
- Yes celebration
- destination selection
- calendar selection
- date confirmation
- GIF reveal
- ticket reveal

Sound must remain subtle.

It must not turn into a noisy, game-like interface.

---

# 47. Scroll Architecture

The website uses **cinematic scroll choreography**.

Scrolling acts as an animation timeline.

Key technology:

**GSAP ScrollTrigger**

Some scenes use:

- `scrub`
- `pin`
- camera tween
- timeline synchronization

Scenes that require a user decision can pause the journey.

---

# 48. Scroll Lock

Scrolling is locked at:

### Required

The Yes / No interaction.

Unlock only after Yes is selected.

### Optional Temporary Locks

A short interaction lock can be used during:

- destination confirmation
- date confirmation

but it must be brief and must not make the experience feel broken.

---

# 49. Responsive Design

## Priority 1

Mobile

## Priority 2

Tablet

## Priority 3

Desktop

All screen sizes must remain optimized.

Mobile requirements:

- comfortably sized touch targets
- swipe interaction
- no hover dependency
- responsive typography
- safe areas for modern phones
- portrait-first composition

Landscape/tablet:

The 3D composition can expand horizontally.

Desktop:

More depth and peripheral visuals can be displayed.

---

# 50. 3D Performance Strategy

Although the full 3D experience must be preserved, performance must remain controlled.

Techniques:

- InstancedMesh for heart particles
- limited draw calls
- compressed textures
- lazy video loading
- poster-first video strategy
- optimized geometry
- shared materials
- capped device pixel ratio
- conditional postprocessing quality
- avoid hundreds of individual React mesh nodes
- unload unnecessary assets between heavy scenes where appropriate

Target:

The experience should feel smooth on modern mobile devices.

Do not create a separate 2D/light version.

---

# 51. Reusable Configuration

All personalized content must live in:

`src/config/config.js`

Example:

```js
export const invitationConfig = {
  recipientName: "Sassy",
  senderName: "User",

  hero: {
    greeting:
      "Hellooo my beautiful Sassy, my cutieeeeeee 💗"
  },

  letter: {
    greeting:
      "Hellooo my beautiful Sassy, my cutieeeeeee 💗",

    body: [
      "I just want to say… I really love spending time with you.",
      "Even the smallest things somehow feel more fun, more ridiculous, and more special when I’m with you.",
      "So, I was thinking…",
      "What if we make one little day that belongs only to us?",
      "We can go out, eat something delicious, laugh about random things, take photos, and make another cute memory together."
    ],

    question:
      "Would you go on a date with me? 🥺💗"
  },

  places: [
    {
      id: "aquarium",
      title: "Aquarium Date",
      copy: "Let's get lost with the fishies together 🐠💗",
      poster: "/assets/places/aquarium.webp",
      video: "/assets/places/aquarium.mp4"
    },

    {
      id: "cinema",
      title: "Cinema Date",
      copy: "Movie, popcorn, and maybe stealing your hand 🍿🤏💗",
      poster: "/assets/places/cinema.webp",
      video: "/assets/places/cinema.mp4"
    },

    {
      id: "ragunan",
      title: "Ragunan Zoo Date",
      copy: "A cute little zoo adventure with you 🐘💕",
      poster: "/assets/places/ragunan.webp",
      video: "/assets/places/ragunan.mp4"
    },

    {
      id: "dufan",
      title: "Ancol / Dufan Date",
      copy: "Screaming together sounds romantic enough 🎢💗",
      poster: "/assets/places/dufan.webp",
      video: "/assets/places/dufan.mp4"
    },

    {
      id: "lego",
      title: "Lego Date",
      copy: "Let's build something cute together 🧱✨",
      poster: "/assets/places/lego.webp",
      video: "/assets/places/lego.mp4"
    }
  ],

  calendar: {
    year: 2026,
    minDateMode: "today",
    maxDate: "2026-12-31"
  },

  surprise: {
    gif: "/assets/gifs/surprise.gif",
    title: "Yay, it's a date! 💗",
    subtitle:
      "Can't wait to spend this cute little day with you 🥹✨"
  },

  whatsapp: {
    number: "628xxxxxxxxxx"
  },

  audio: {
    backgroundMusic: "/assets/audio/music.mp3"
  }
};
```

---

# 52. State Management

Minimum application state:

```js
{
  acceptedInvitation: false,
  noClickCount: 0,

  selectedPlace: null,

  selectedDate: null,
  dateConfirmed: false,

  musicEnabled: false,

  currentScene: 0
}
```

No backend persistence is required.

---

# 53. Refresh Behavior

When the website is:

- refreshed
- reopened
- reloaded

all progress returns to the beginning.

Do not use:

- localStorage
- sessionStorage
- database
- server session

The experience always starts from the preloader.

---

# 54. Deployment Requirements

The application must be deployable as a static site.

Required compatibility:

- GitHub Pages
- Vercel
- Netlify

Primary requirement:

**GitHub Pages support**

The Vite `base` configuration must support a repository path.

Example:

```js
export default defineConfig({
  base: "/repository-name/"
});
```

For custom-domain/root deployment, the base can be adjusted accordingly.

The application should not depend on server-side routing.

---

# 55. Backend

The MVP does not require a backend.

It does not require:

- authentication
- database
- API server
- admin panel
- server runtime

All personalization comes from `config.js`.

---

# 56. Browser Support

Target modern browsers:

### Mobile

- Safari iOS
- Chrome Android
- Samsung Internet

### Tablet

- Safari iPadOS
- Chrome

### Desktop

- Chrome
- Safari
- Edge
- modern Firefox

WebGL availability is required for the full experience.

---

# 57. Key Non-Functional Requirements

### Performance

Initial critical assets must be optimized.

Heavy assets must be lazy-loaded.

### Visual Stability

No major layout shifts.

### Touch UX

All critical interactions must be usable without hover.

### Readability

The letter must remain readable even while displayed inside the 3D environment.

### Audio Control

The user must always have the option to mute/unmute audio.

---

# 58. MVP Scope

The MVP includes:

1. 3D preloader.
2. Glassmorphic navbar.
3. Thin scroll progress.
4. 3D heart bubble Hero.
5. Handwriting greeting.
6. Realistic envelope.
7. Letter extraction animation.
8. Invitation letter.
9. Scroll lock.
10. Yes/No interaction.
11. Five-stage No joke.
12. 3D celebration.
13. 3D destination carousel.
14. Five destination videos.
15. Destination confirmation.
16. 3D calendar journey.
17. Dynamic past-date disabling.
18. Date confirmation.
19. 3D GIF reveal.
20. Final Digital Date Ticket.
21. PNG ticket export.
22. Optional PDF export.
23. Google Calendar integration.
24. ICS calendar export.
25. WhatsApp deep link.
26. Background music.
27. Sound effects.
28. Config-based personalization.
29. GitHub Pages deployment.

---

# 59. Out of Scope for MVP

Not included:

- backend
- login
- user accounts
- database
- admin dashboard
- invitation analytics
- payment
- RSVP server
- multiple recipients simultaneously
- cloud media uploader
- CMS
- permanent progress saving

---

# 60. Acceptance Criteria

The product is considered successful when:

1. The website can be opened on mobile, tablet, and desktop.
2. The Hero displays a responsive Three.js 3D heart environment.
3. The cinematic journey follows scrolling.
4. The envelope and letter have believable 3D depth.
5. The letter exits the envelope according to scroll progression.
6. Scrolling locks during the Yes/No interaction.
7. No can be pressed five times.
8. Every No click makes Yes larger.
9. Yes eventually takes up most/all of the viewport.
10. Yes triggers an immersive 3D celebration.
11. Scrolling becomes active again after acceptance.
12. The user can view five destinations.
13. The active destination plays its video.
14. Inactive videos do not play simultaneously.
15. A destination can be confirmed.
16. The calendar allows only valid dates.
17. All past dates are disabled.
18. The selected date requires the “This date 💗” button.
19. The GIF reveal appears after confirmation.
20. The final ticket displays recipient, sender, destination, and date.
21. The ticket can be saved as a PNG.
22. PDF can be selected as an alternative export format.
23. The event can be added as an all-day event.
24. The WhatsApp CTA opens a prefilled message.
25. All personalized content can be changed through `config.js`.
26. Refreshing restarts the experience from the beginning.
27. The production build can run on GitHub Pages.

---

# 61. Core Emotional Journey

The experience must follow this emotional curve:

**Curiosity**  
↓  
**Cute Surprise**  
↓  
**Romantic Buildup**  
↓  
**Playful Tension**  
↓  
**YES Celebration**  
↓  
**Excitement**  
↓  
**Choice & Participation**  
↓  
**Surprise**  
↓  
**Confirmation**  
↓  
**Memorable Keepsake**

The final objective is not merely to receive a “Yes.”

The final objective is to make the recipient feel that the entire journey was created specifically for them.

---

# 62. Final Product Definition

The final product is:

> **A mobile-first immersive 3D romantic date invitation experience where a personalized love letter transforms into an interactive journey for choosing a date destination and date, ending with a shareable digital date ticket.**

The experience should feel like:

**a tiny romantic interactive movie that the recipient controls herself. 💗**
