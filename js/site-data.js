/*
 * POCA site data — the one file to edit each year.
 *
 * main.js reads these values and applies them to every element marked with a
 * matching data-* hook in index.html (links, phone numbers, address, stats,
 * event date, countdown, calendar file).
 *
 * The HTML also contains the same values as plain text so the page works
 * without JavaScript. When you change a value here, search index.html for the
 * old value too (e.g. "2026", "December 24") and update the fallback text.
 */
window.POCA = {
  ORG_NAME: "Police Officers Christmas Angels",
  SITE_URL: "https://www.pocacc.org/",
  FOUNDED: 1976,
  CURRENT_YEAR: 2026,

  DONATE: {
    corpusChristi: "https://donate.stripe.com/aFa28r8Z92AYcfj4LEdjO00",
    beeville: "https://donate.stripe.com/14A9ASczl85Gchi4Vz2sM00",
    suggestedGift: "$200 or more" // Display only. Minimums are set in Stripe, not here.
  },

  MAIL: {
    payableTo: "POCA, Inc.",
    lines: [
      "POCA, Inc.",
      "c/o Hopkins CPA Firm",
      "6262 Weber Road, Ste 101",
      "Corpus Christi, TX 78413"
    ]
  },

  CONTACT: {
    officePhone: "361-360-3855",
    officePhoneTel: "+13613603855",
    email: "info@pocacc.org",
    eventEmail: "rncj@cccranch.org",
    elfSubject: "Join as an Elf – POCA 50th Anniversary Christmas Eve"
  },

  // Personal cell numbers stay hidden until the client confirms they may be published.
  SHOW_PERSONAL_NUMBERS: false,
  PERSONAL_NUMBERS: {
    joeHopkinsCell: "361-537-5503", // "(texting preferred)"
    bobCorriganCell: "361-813-0145"
  },

  // Live-site counters. "Years" is the anniversary number.
  STATS: [
    { value: 50, suffix: "", label: "Years & more coming", highlight: true },
    { value: 400, suffix: "K", label: "Donated & Giving" },
    { value: 100, suffix: "+", label: "Police Officers & Citizens Participants" },
    { value: 250, suffix: "+", label: "Family surprised each year on Christmas" }
  ],
  HERO_TOTAL: { value: 935700, suffix: "$" },

  EVENT: {
    // Christmas Eve morning, Central Time (CST = UTC-6 in December).
    start: "2026-12-24T07:00:00-06:00",
    end: "2026-12-24T11:00:00-06:00",
    dateLabel: "Thursday, December 24, 2026",
    title: "POCA Christmas Eve Grocery Delivery (50th Anniversary)",
    venue: "Windsor Park Elementary School",
    address: "4525 South Alameda Street, Corpus Christi, TX",
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Windsor+Park+Elementary+School%2C+4525+South+Alameda+Street%2C+Corpus+Christi%2C+TX"
  },

  // TODO(client): drop the letter PDF into /assets with this name.
  LETTER_PDF: "assets/poca-2026-50th-anniversary-letter.pdf",

  // Satisfaction survey ("Are you satisfied with what we are doing ?").
  // TODO(client): set endpoint to a URL that accepts a JSON POST (e.g. a form service or
  // the future backend). While it is null, visitors see the thank-you message but
  // NO answers are recorded anywhere.
  SURVEY: {
    endpoint: null
  },

  // TODO(client): real profile URLs. Networks left as null are not shown.
  SOCIAL: {
    facebook: null,
    instagram: null,
    youtube: null,
    x: null,
    linkedin: null
  }
};
