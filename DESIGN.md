---
name: 3D Romantic Date Invitation
description: A tactile, cinematic date invitation that feels like a private letter at dusk.
colors:
  romantic-50: "#f6f2ed"
  romantic-100: "#f0e7e2"
  romantic-500: "#a34e5d"
  romantic-700: "#6e3547"
  romantic-900: "#3b202c"
  lavender-100: "#eee7f0"
  lavender-500: "#876d91"
  ivory-100: "#fcfbf7"
  ink: "#332c2f"
  ink-soft: "#685b5f"
typography:
  display:
    fontFamily: "Playfair Display, Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(2.5rem, 8vw, 5rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  handwriting:
    fontFamily: "Dancing Script, Caveat, cursive"
    fontSize: "clamp(2.5rem, 8vw, 5rem)"
    fontWeight: 700
    lineHeight: 1.05
  body:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "0.7rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.12em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  pill: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "20px"
  lg: "32px"
  xl: "56px"
components:
  button-primary:
    backgroundColor: "{colors.romantic-700}"
    textColor: "{colors.romantic-50}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "16px 32px"
  button-ghost:
    backgroundColor: "{colors.ivory-100}"
    textColor: "{colors.romantic-700}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  paper-letter:
    backgroundColor: "{colors.ivory-100}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "40px"
  glass-navigation:
    backgroundColor: "{colors.ivory-100}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
---

# Design System: 3D Romantic Date Invitation

## 1. Overview

**Creative North Star: "Private letter at dusk"**

This experience should feel like a personal letter discovered in a quiet room
after sunset. The invitation is intimate before it is impressive. Paper, ink,
soft shadow, and a small amount of atmosphere make the recipient feel that the
whole journey was prepared for one person.

The system combines romantic editorial typography with playful interaction and
cinematic depth. It rejects generic SaaS dashboards, neon AI gradients,
interchangeable landing-page templates, dense card grids, game-like confetti,
and childish sticker collages.

**Key Characteristics:**
- Personal stationery with visible paper layering.
- Deep rose actions against an ivory field.
- Muted violet used as atmosphere, not decoration everywhere.
- Tactile controls with clear pressed and focused states.
- Motion that builds anticipation, then settles gently.

## 2. Colors

The palette is burgundy paper with violet shadow: deep rose ink carries action
and emotion, while the quiet neutrals keep long letter copy readable.

### Primary
- **Muted rose ink:** used for the main action, wax seal, progress, and emotional emphasis.
- **Deep rose anchor:** reserved for primary buttons, confirmations, and the strongest hierarchy.

### Secondary
- **Dusk violet:** used for depth, background atmosphere, and secondary emphasis.

### Neutral
- **Warm ivory field:** the main reading surface and page background.
- **Ivory paper:** the letter and ticket surface, brighter than the page field.
- **Ink charcoal:** primary body copy and display text.
- **Soft ink:** supporting copy, metadata, and quiet controls.

**The One-Accent Rule.** Rose is the emotional signal. Violet supports depth, but
must not compete with the primary action on the same surface.

## 3. Typography

**Display Font:** Playfair Display with Cormorant Garamond and Georgia fallbacks.
**Body Font:** Plus Jakarta Sans with system-ui fallbacks.
**Handwriting Font:** Dancing Script with Caveat and cursive fallbacks.

**Character:** The serif creates a keepsake quality, the sans keeps dates and
actions legible, and the handwriting voice makes the greeting feel written rather
than generated.

### Hierarchy
- **Display** (700, responsive clamp up to 5rem, 1.05 line-height): hero and scene titles.
- **Headline** (700, 2rem to 3rem, tight line-height): section moments and the question.
- **Title** (600 to 700, 1.25rem to 1.5rem): destinations, ticket labels, and controls.
- **Body** (400, 1rem, 1.7 line-height): letter paragraphs and supporting copy, kept readable on mobile.
- **Label** (700, 0.7rem, 0.12em tracking, short uppercase phrases only): progress, status, and stationery marks.

**The Letter Rule.** Let the handwriting and serif carry personality. Never use
display type for long instructions or date metadata.

## 4. Elevation

Depth is layered and tactile rather than universally glossy. The page field stays
quiet, paper sheets lift only when they are the focus, and violet light appears as
an ambient shadow behind a meaningful object. Use one soft light direction from
the upper left. Avoid stacking borders and wide generic shadows on every control.

### Shadow Vocabulary
- **Paper lift:** `0 18px 38px -14px rgba(96, 52, 57, 0.28)`, for the letter and ticket.
- **Glass navigation:** `0 18px 50px -24px rgba(82, 44, 50, 0.34)`, for the floating navbar only.
- **Rose glow:** `0 0 32px -12px rgba(163, 78, 93, 0.7)`, for primary action feedback.

**The Quiet Field Rule.** Most of the screen should remain calm so the current
scene has somewhere to breathe.

## 5. Components

### Buttons
- **Shape:** full pill for actions (9999px), tighter inner icons and marks (8px to 12px).
- **Primary:** deep rose ink with ivory text, generous touch padding, and a restrained rose glow on hover.
- **Hover / Focus:** translate or scale only slightly, show a visible rose focus ring, and preserve readable contrast.
- **Secondary / Ghost:** ivory or transparent paper treatment with a rose or ink outline, never a competing gradient.

### Chips
- **Style:** small stationery labels may use a muted tinted background and short uppercase text.
- **State:** selected chips gain ink contrast and a single rose mark; they do not become noisy badges.

### Cards / Containers
- **Corner Style:** 8px to 16px for paper and scene containers; full pills are reserved for controls.
- **Background:** ivory paper for reading, translucent ivory for the navbar, muted scene surfaces for destinations.
- **Shadow Strategy:** use the elevation vocabulary only when the object needs to lift from the page.
- **Border:** hairline rose or ivory rules, never a thick colored side stripe.
- **Internal Padding:** 20px on mobile, 32px to 40px on larger screens.

### Navigation
- **Style:** a minimal floating stationery rail with recipient name, music control, and a thin progress line.
- **States:** the music control has clear on/off labels, visible focus, and a calmer surface when scrolled.
- **Mobile treatment:** respect safe areas and keep the control at least 44px tall.

### Paper Letter and Date Ticket
The letter is the signature surface: a backing sheet, warm paper, a seal, airmail
edge detail, and a typed question. The ticket repeats the same paper language at
the end, adding a small surprise thumbnail without turning the keepsake into a
dashboard card.

## 6. Do's and Don'ts

### Do:
- **Do** make the recipient's name and the handwritten greeting the first emotional signal.
- **Do** use warm ivory, deep rose ink, and dusk violet consistently.
- **Do** keep body copy readable with generous line-height and short measure.
- **Do** use paper layering, rules, and shadow to explain depth.
- **Do** preserve keyboard focus, 44px touch targets, reduced motion, and contrast.
- **Do** let each scene have one visual hero instead of many competing cards.

### Don't:
- **Don't** use generic SaaS dashboards, neon AI gradients, or interchangeable landing-page templates.
- **Don't** use dense card grids, game-like confetti, or childish sticker collages.
- **Don't** make decorative glass surfaces the default treatment.
- **Don't** use gradient text, thick colored side stripes, or wide black shadows.
- **Don't** repeat tiny uppercase eyebrows above every section.
- **Don't** let violet compete with the rose action on the same surface.
