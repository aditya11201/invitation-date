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
    subtitle: "I made all of this just for you hehe...",
    scrollPrompt: "Scroll down to open your letter"
  },

  preloader: {
    badge: "Express Delivery • For {{recipientName}}",
    title: "Something for You 💌",
    coverHeadline: "A Sealed Secret",
    coverSubtext: "is waiting for you...",
    sealHint: "Tap the gold seal on the envelope to open",
    openLabel: "Open {{recipientName}}'s invitation",
    phases: [
      { start: 0, key: "crafting", message: "Folding a little note..." },
      { start: 31, key: "writing", message: "Writing something just for {{recipientName}}..." },
      { start: 66, key: "sealing", message: "Adding a touch of golden wax..." },
      { start: 91, key: "ready", message: "Your invitation is ready!" }
    ],
    loadingCrafting: "Getting your letter ready...",
    loadingFoil: "Adding the gold trim...",
    loadingReady: "Your invitation is ready 💌",
    progressSealing: "Sealing a surprise for"
  },

  letter: {
    tag: "Okay, I Wanna Tell You Something 💌",
    greeting: "Hellooo my beautiful Sassy, my cutieeeeeee 💗",
    body: [
      "I don't know if I say this enough, but I really love spending time with you.",
      "I swear even doing random stupid stuff feels fun when it's with you wkwk.",
      "So, I was thinking…",
      "So... can I steal you for a day?",
      "We eat, jalan-jalan, take random photos, bully each other a little bit, and just have fun. Deal?",
      "I’ve already prepared everything here. There’s just one thing left…"
    ],
    question: "Would you go on a date with me? 🥺💗",
    subtext: "Soooo... what do you say?"
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
      media: {
        type: "image",
        src: "/assets/places/aquarium-date.webp",
      },
      highlights: ["Manta Rays", "Glass Tunnel Walk", "Holding Hands"],
      book: {
        tag: "Underwater Realm",
        spine: "Aquarium · Vol. 1",
        chapter: "Chapter 01 · Underwater Realm",
        quote: '"The fish are cute. Youre still cuter tho."',
        badge: "🐟",
        emoji: "🐠"
      }
    },
    {
      id: "cinema",
      title: "Cinema Date",
      emoji: "🍿",
      copy: "Movie, popcorn, and maybe stealing your hand 🍿🤏💗",
      accent: "from-purple-500/20 via-pink-500/20 to-rose-600/30",
      themeColor: "#c084fc",
      media: {
        type: "image",
        src: "/assets/places/cinema-date.webp",
      },
      highlights: ["Caramel Popcorn", "Cozy Premiere Seats", "Post-Movie Chill"],
      book: {
        tag: "Cozy Screening",
        spine: "Cinema · Vol. 2",
        chapter: "Chapter 02 · Cozy Screening",
        quote: '"The best scene is always the one where you laugh."',
        badge: "🎬",
        emoji: "🍿"
      }
    },
    {
      id: "museum",
      title: "Museum Date",
      emoji: "🏛️",
      copy: "Strolling through quiet galleries, admiring art, and making cute memories 🏛️✨",
      accent: "from-amber-400/20 via-orange-500/20 to-rose-600/30",
      themeColor: "#e0a96d",
      media: {
        type: "image",
        src: "/assets/places/museum-date.webp",
      },
      highlights: ["Art Exhibits", "Quiet Walk", "Aesthetic Photos"],
      book: {
        tag: "Art & History",
        spine: "Museum · Vol. 3",
        chapter: "Chapter 03 · Art & History",
        quote: '"Looking at art is great, but walking beside you is the masterpiece."',
        badge: "🏛️",
        emoji: "🎨"
      }
    }
  ],

  calendar: {
    year: 2026,
    minDateMode: "today",
    maxDate: "2026-12-31",
    subtitle: "Pick a day when I can steal you for the whole day 👀💗"
  },

  surprise: {
    gif: "/assets/gifs/surprise.gif",
    title: "Yay, it's a date! 💗",
    subtitle: "Now I actually can't wait for this day 😭💗",
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
  },

  ui: {
    question: {
      yesButton: "YES 💗",
      acceptedBanner: "SHE SAID YES! 🎉💗"
    },

    celebration: {
      ribbon: "She said YES! Best decision ever 🎉",
      heading: "Now let's plan our special day together! ✨",
      nextStep: "Next step: Choose where we're going...",
      cta: "Pick Our Destination"
    },

    destinationPicker: {
      eyebrow: "STEP 01 • THE DESTINATION",
      heading: "Where should we go?",
      headingHeart: "💗",
      hint: "Swipe or tap the arrows to explore our options",
      confirmedHint: "Destination confirmed!",
      chooseButton: "Yep, I Want This One 💗",
      lockedPrefix: "Okay, we're going to:"
    },

    calendarSection: {
      eyebrow: "STEP 02 • THE DATE",
      heading: "When are you free? 💗",
      confirmedHint: "Date confirmed!",
      chooseButton: "This One 💗",
      lockedPrefix: "Date Locked:",
      destinationLabel: "Destination:",
      months: [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ],
      days: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
    },

    surpriseUi: {
      badge: "OKAY IT'S OFFICIAL 💌",
      claimButton: "Gimme Our Ticket 🎟️"
    },

    ticket: {
      handNote: "for the record",
      eyebrow: "FOR US 💗",
      heading: "Our Date Ticket 🎟️",
      subline: "Keep this. No backing out now 😌💗",
      stampConfirmed: "Confirmed",
      labelAdmit: "Admit Two",
      cardTitle: "Romantic Date Pass",
      labelDateWith: "Date With",
      labelFrom: "From",
      labelDestination: "Destination",
      labelSchedule: "Date & Schedule",
      noteAllDay: "You're stuck with me all day 💗",
      footerFor: "For",
      footerOnly: "Only",
      footerSignOff: "see you there",
      btnWhatsapp: "Send to WhatsApp",
      btnSave: "Save Ticket",
      btnSavePng: "Save as Image (PNG)",
      btnSavePdf: "Export as PDF Document",
      btnCalendar: "Add to Calendar",
      btnGoogleCal: "Google Calendar",
      btnIcs: "Apple / Outlook (.ICS)",
      btnReplay: "Wanna See All This Again?",
      exporting: "Exporting…",
      recommended: "Recommended",
      saveError: "Couldn't save the ticket.",
      retry: "Try again"
    }
  }
};
