/**
 * 3D Romantic Date Invitation - Global Configuration
 * All personalized copy, destinations, assets, and contact details are customized here.
 */

export const invitationConfig = {
  recipientName: "Sassy",
  senderName: "User",

  hero: {
    badge: "A Special Delivery Just For You ✨",
    greeting: "Hellooo my beautiful Sassy, my cutieeeeeee 💗",
    subtitle: "I made this little universe just for you...",
    scrollPrompt: "Scroll down to open your letter"
  },

  preloader: {
    badge: "Express Delivery • For {{recipientName}}",
    title: "A Sealed Secret for {{recipientName}}",
    coverHeadline: "A Sealed Secret",
    coverSubtext: "is waiting for you...",
    sealHint: "Tap the gold seal on the envelope to open",
    openLabel: "Open {{recipientName}}'s invitation",
    phases: [
      { start: 0, key: "crafting", message: "Folding a little note..." },
      { start: 31, key: "writing", message: "Writing something just for {{recipientName}}..." },
      { start: 66, key: "sealing", message: "Adding a touch of golden wax..." },
      { start: 91, key: "ready", message: "Your invitation is ready!" }
    ]
  },

  letter: {
    tag: "A Note From My Heart 💌",
    greeting: "Hellooo my beautiful Sassy, my cutieeeeeee 💗",
    body: [
      "I just want to say… I really love spending time with you.",
      "Even the smallest things somehow feel more fun, more ridiculous, and more special when I’m with you.",
      "So, I was thinking…",
      "What if we make one little day that belongs only to us?",
      "We can go out, eat something delicious, laugh about random things, take photos, and make another cute memory together.",
      "I’ve already prepared everything here. There’s just one thing left…"
    ],
    question: "Would you go on a date with me? 🥺💗",
    subtext: "Choose what feels right for you 💌"
  },

  noProgression: [
    "No 🙄",
    "Are you sure? 🥺",
    "Seriously? 😭",
    "Really now? 😤",
    "Pleaseee 💗"
  ],

  places: [
    {
      id: "aquarium",
      title: "Aquarium Date",
      emoji: "🐠",
      copy: "Let's get lost with the fishies together 🐠💗",
      accent: "from-cyan-400/20 via-blue-500/20 to-indigo-600/30",
      themeColor: "#38bdf8",
      poster: "/assets/places/aquarium.webp",
      video: "/assets/places/aquarium.mp4",
      highlights: ["Manta Rays", "Glass Tunnel Walk", "Holding Hands"]
    },
    {
      id: "cinema",
      title: "Cinema Date",
      emoji: "🍿",
      copy: "Movie, popcorn, and maybe stealing your hand 🍿🤏💗",
      accent: "from-purple-500/20 via-pink-500/20 to-rose-600/30",
      themeColor: "#c084fc",
      poster: "/assets/places/cinema.webp",
      video: "/assets/places/cinema.mp4",
      highlights: ["Caramel Popcorn", "Cozy Premiere Seats", "Post-Movie Chill"]
    },
    {
      id: "ragunan",
      title: "Ragunan Zoo Date",
      emoji: "🐘",
      copy: "A cute little zoo adventure with you 🐘💕",
      accent: "from-emerald-400/20 via-teal-500/20 to-lime-600/30",
      themeColor: "#34d399",
      poster: "/assets/places/ragunan.webp",
      video: "/assets/places/ragunan.mp4",
      highlights: ["Tandem Bicycle Ride", "Otters & Capybaras", "Iced Matcha Picnic"]
    },
    {
      id: "dufan",
      title: "Ancol / Dufan Date",
      emoji: "🎢",
      copy: "Screaming together sounds romantic enough 🎢💗",
      accent: "from-amber-400/20 via-orange-500/20 to-rose-500/30",
      themeColor: "#fbbf24",
      poster: "/assets/places/dufan.webp",
      video: "/assets/places/dufan.mp4",
      highlights: ["Ferris Wheel Sunset", "Roller Coaster Screams", "Cotton Candy"]
    },
    {
      id: "lego",
      title: "Lego Date",
      emoji: "🧱",
      copy: "Let's build something cute together 🧱✨",
      accent: "from-pink-400/20 via-fuchsia-500/20 to-purple-600/30",
      themeColor: "#f472b6",
      poster: "/assets/places/lego.webp",
      video: "/assets/places/lego.mp4",
      highlights: ["Custom Mini-figs", "Building Our Dream House", "Coffee & Cookies"]
    }
  ],

  calendar: {
    year: 2026,
    minDateMode: "today",
    maxDate: "2026-12-31",
    subtitle: "Pick any day that works best for your schedule in 2026"
  },

  surprise: {
    gif: "/assets/gifs/surprise.gif",
    title: "Yay, it's a date! 💗",
    subtitle: "Can't wait to spend this cute little day with you 🥹✨",
    caption: "Official Date Confirmation Unlocked!"
  },

  whatsapp: {
    number: "628xxxxxxxxxx",
    messageTemplate: `Hellooo {{senderName}}, my handsome, cute, funny, sweet guyyyy 😚💗

I’d love to spend this day with you 💗

💌 *Our Date Plan*
📍 Place: *{{selectedPlace}}*
📅 Date: *{{selectedDate}}*

If this still feels good for you, I can’t wait to make the day ours.

See you soon 🫶🏻✨`
  },

  audio: {
    backgroundMusic: "/assets/audio/music.mp3",
    enableSynthesizerFallback: true
  }
};
