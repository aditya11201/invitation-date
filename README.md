# 💗 3D Romantic Date Invitation

An interactive, mobile-first 3D romantic date invitation website built with **React + Vite**, **Three.js**, **Tailwind CSS**, and **Web Audio API**.

Transforms asking your partner on a date into a cinematic, personal, and unforgettable digital experience.

---

## ✨ Experience Journey

1. **Scene 0 — 3D Preloader**: Floating 3D heart with soft pink & lavender glow and entry button unlocking audio autoplay.
2. **Scene 1 — Hero Greeting**: Dynamic Three.js WebGL love bubble hearts environment with handwriting reveal copy.
3. **Scene 2 & 3 — Realistic 3D Paper Envelope & Letter**: Envelope unseals with realistic paper physics, letter extracts and reveals heartfelt paragraphs in a staged sequence.
4. **Scene 4 — YES / NO Gimmick**: Scroll locks at the proposal question. The playful NO button can be clicked up to 5 times, each time enlarging the YES button until it takes over the screen.
5. **Scene 5 & 6 — 3D Celebration**: Pink-lavender light burst, 3D heart particle explosion in WebGL, confetti, romantic fanfare, and letter flip transition.
6. **Scene 7 — 3D Destination Carousel**: 3D spatial depth carousel showcasing 5 date destinations (Aquarium, Cinema, Ragunan Zoo, Dufan, Lego Date) with inline playback and custom SVG vector art fallbacks.
7. **Scene 8 — 3D Calendar Journey**: 2026 dynamic date picker. Dates before today are unselectable with a faded glass effect. Requires explicit confirmation.
8. **Scene 9 — GIF Surprise Reveal**: Floating 3D surprise reveal card with mouse/gyroscope parallax tilt and romantic copy.
9. **Scene 10 — Digital Date Ticket**: 3D boarding pass date ticket with holographic sheen, cut-out notches, and 4 primary actions:
   - 💌 **Send to WhatsApp**: Prefilled URL-encoded confirmation message to your partner.
   - 📸 **Save Ticket (PNG)**: High-resolution PNG image download.
   - 📄 **Export as PDF**: Formatted keepsake PDF document.
   - 📅 **Add to Calendar**: Prefilled Google Calendar all-day event link & `.ics` file download for Apple/Outlook.
   - 🔄 **Replay / Reset**: Smooth refresh to experience the journey again from the start.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **3D Engine**: Three.js (WebGL renderer, extruded 3D heart geometry, instanced particles, lighting, camera dolly)
- **Styling**: Tailwind CSS (custom romantic palette, glassmorphism, paper textures)
- **Audio**: Web Audio API Procedural Synthesizer (dreamy harp/synth chords + sound effects) + external audio fallback
- **Exporting**: `html2canvas` (3x High-DPI PNG) & `jspdf` (PDF keepsake)
- **Calendar**: RFC 5545 iCalendar (`.ics`) generator & Google Calendar URL builder
- **Icons**: Lucide React + Canvas Confetti

---

## 🚀 Getting Started

### 1. Installation

```bash
# Clone repository and enter directory
cd invitation-date

# Install dependencies
npm install
```

### 2. Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build

```bash
npm run build
```

The compiled static site will be located in the `dist/` folder.

---

## 🎨 Customization (`src/config/config.js`)

All personalized texts, names, dates, WhatsApp number, and media paths can be customized in a single file: `src/config/config.js`.

```javascript
export const invitationConfig = {
  recipientName: "Sassy",
  senderName: "Aditya",

  hero: {
    badge: "A Special Delivery Just For You ✨",
    greeting: "Hellooo my beautiful Sassy, my cutieeeeeee 💗",
    subtitle: "I made this little universe just for you...",
  },

  letter: {
    greeting: "Hellooo my beautiful Sassy, my cutieeeeeee 💗",
    body: [
      "I just want to say… I really love spending time with you.",
      "Even the smallest things somehow feel more fun, more ridiculous, and more special when I’m with you.",
      "So, I was thinking…",
      "What if we make one little day that belongs only to us?",
      "We can go out, eat something delicious, laugh about random things, take photos, and make another cute memory together."
    ],
    question: "Would you go on a date with me? 🥺💗",
    subtext: "Choose wisely… even though there’s actually only one correct answer 😌"
  },

  places: [
    {
      id: "aquarium",
      title: "Aquarium Date",
      emoji: "🐠",
      copy: "Let's get lost with the fishies together 🐠💗",
      poster: "/assets/places/aquarium.webp",
      video: "/assets/places/aquarium.mp4"
    },
    // ... other destinations
  ],

  calendar: {
    year: 2026,
    minDateMode: "today",
    maxDate: "2026-12-31"
  },

  surprise: {
    gif: "/assets/gifs/surprise.gif",
    title: "Yay, it's a date! 💗",
    subtitle: "Can't wait to spend this cute little day with you 🥹✨"
  },

  whatsapp: {
    number: "6281234567890",
    messageTemplate: `...`
  },

  audio: {
    backgroundMusic: "/assets/audio/music.mp3"
  }
};
```

---

## 📁 Optional Media Asset Directory Structure

If you wish to provide your own video clips, posters, or MP3 music, drop them into the `public/` directory:

```text
public/
├── assets/
│   ├── audio/
│   │   └── music.mp3
│   ├── places/
│   │   ├── aquarium.mp4 / aquarium.webp
│   │   ├── cinema.mp4 / cinema.webp
│   │   ├── ragunan.mp4 / ragunan.webp
│   │   ├── dufan.mp4 / dufan.webp
│   │   └── lego.mp4 / lego.webp
│   └── gifs/
│       └── surprise.gif
```

> **Note**: If no external audio, video, or GIF files are provided, the application automatically uses its built-in Web Audio API romantic synthesizer and animated SVG vector artwork previews. No broken icons or silent states will ever appear.

---

## 🌐 Deploy to GitHub Pages

1. Ensure `base: './'` is set in `vite.config.js` (already pre-configured).
2. Build the project: `npm run build`.
3. Deploy the `dist/` directory using GitHub Actions or your preferred static site hosting (Vercel, Netlify, Cloudflare Pages).
