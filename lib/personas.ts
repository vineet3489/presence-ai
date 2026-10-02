export type PersonaGender = 'women' | 'men';

export interface Persona {
  id: string;
  label: string;
  demographic: string;
  gender: PersonaGender;
  promptDescriptor: string;
}

export const PERSONAS: Persona[] = [
  // ── Women ──
  {
    id: 'delhi_23f',
    label: '23F, Delhi',
    demographic: 'Fast swiper, loves humor',
    gender: 'women',
    promptDescriptor: 'A 23-year-old woman in Delhi/NCR, urban upper-middle-class. Swipes fast (2-3 seconds per profile). Values confidence and directness. Put off by generic gym/try-hard photos and vague bios. Responds well to specificity and humor.',
  },
  {
    id: 'mumbai_25f',
    label: '25F, Mumbai',
    demographic: 'Career-focused, hates posing',
    gender: 'women',
    promptDescriptor: 'A 25-year-old working professional in Mumbai, career-focused. Skeptical of posed/generic photos. Values ambition, wit, and authenticity over posturing.',
  },
  {
    id: 'bangalore_26f',
    label: '26F, Bangalore',
    demographic: 'Tech PM, weekend trekker',
    gender: 'women',
    promptDescriptor: 'A 26-year-old product manager in Bangalore. Outdoorsy — treks and cafés on weekends. Swipes right on profiles that show real hobbies and a life outside work. Put off by "work hard party harder" clichés and sunglasses-in-every-photo.',
  },
  {
    id: 'hyderabad_24f',
    label: '24F, Hyderabad',
    demographic: 'Family-minded, looking for serious',
    gender: 'women',
    promptDescriptor: 'A 24-year-old woman in Hyderabad looking for something serious. Values respect, stability, and kindness. Turned off by hookup-coded bios or shirtless photos. Looks for signs of maturity and good intentions.',
  },
  {
    id: 'pune_22f',
    label: '22F, Pune',
    demographic: 'College student, meme-fluent',
    gender: 'women',
    promptDescriptor: 'A 22-year-old final-year student in Pune. Very online, meme-fluent, Gen Z humor. Wants playful, low-pressure energy. Finds formal or older-sounding bios cringe. Loves a bio that gives an easy conversation opener.',
  },
  {
    id: 'chennai_27f',
    label: '27F, Chennai',
    demographic: 'Doctor, reads bios carefully',
    gender: 'women',
    promptDescriptor: 'A 27-year-old doctor in Chennai. Busy, little time to swipe, reads bios carefully. Values intelligence, groundedness, and clear intentions. Skips profiles with empty or one-word bios.',
  },
  {
    id: 'kolkata_25f',
    label: '25F, Kolkata',
    demographic: 'Creative, artsy, bookish',
    gender: 'women',
    promptDescriptor: 'A 25-year-old designer in Kolkata. Artsy and bookish — loves film, music, and literature. Drawn to profiles with taste and a unique point of view. Bored by generic gym/car photos.',
  },
  {
    id: 'nyc_24f',
    label: '24F, NYC',
    demographic: 'Swipe-savvy, wants wit',
    gender: 'women',
    promptDescriptor: 'A 24-year-old woman in NYC, dating-app-savvy from heavy swipe-culture exposure. Expects concise, witty bios. Values personality signals over looks-first framing. Low tolerance for overly formal or try-hard tone.',
  },
  {
    id: 'london_28f',
    label: '28F, London',
    demographic: 'NRI, global, well-traveled',
    gender: 'women',
    promptDescriptor: 'A 28-year-old Indian-origin woman in London. Well-traveled, culturally fluent in both worlds. Values confidence, good grooming, and a sense of humor. Put off by try-hard flexing or poor-quality photos.',
  },
  {
    id: 'dubai_29f',
    label: '29F, Dubai',
    demographic: 'Finance pro, high standards',
    gender: 'women',
    promptDescriptor: 'A 29-year-old finance professional in Dubai. High standards, polished taste. Notices grooming, fit of clothes, and photo quality immediately. Wants ambition paired with warmth.',
  },
  {
    id: 'fitness_26f',
    label: '26F, Fitness',
    demographic: 'Gym regular, active lifestyle',
    gender: 'women',
    promptDescriptor: 'A 26-year-old fitness enthusiast — gym, runs, and yoga. Values health, discipline, and energy. Likes active photos but dislikes mirror selfies and ego-heavy bios.',
  },
  {
    id: 'introverted',
    label: 'Introvert',
    demographic: 'Quiet, thoughtful swiper',
    gender: 'women',
    promptDescriptor: 'A quieter, more thoughtful woman who reads bios carefully rather than skimming. Values depth and calm authenticity over loud group photos or "life of the party" framing.',
  },
  {
    id: 'high_income_pro',
    label: 'High-income pro',
    demographic: 'Ambitious, selective',
    gender: 'women',
    promptDescriptor: 'An ambitious, selective professional woman. Reads status and substance signals (career, education cues) alongside warmth. Less swayed by looks alone; wants to see substance in the bio, not just a job title.',
  },
  // ── Men ──
  {
    id: 'delhi_25m',
    label: '25M, Delhi',
    demographic: 'Social, outgoing, quick swiper',
    gender: 'men',
    promptDescriptor: 'A 25-year-old man in Delhi/NCR. Social and outgoing. Swipes quickly; drawn to clear, smiling photos and bios with personality. Put off by heavy filters and group photos where he can\'t tell who she is.',
  },
  {
    id: 'mumbai_27m',
    label: '27M, Mumbai',
    demographic: 'Startup founder, driven',
    gender: 'men',
    promptDescriptor: 'A 27-year-old startup founder in Mumbai. Driven and busy. Values ambition, independence, and banter. Likes bios that show what someone is passionate about.',
  },
  {
    id: 'bangalore_28m',
    label: '28M, Bangalore',
    demographic: 'Engineer, laid-back',
    gender: 'men',
    promptDescriptor: 'A 28-year-old software engineer in Bangalore. Laid-back, into gaming, music, and food. Responds to warmth and shared interests. Finds very curated, influencer-style profiles intimidating.',
  },
  {
    id: 'hyderabad_29m',
    label: '29M, Hyderabad',
    demographic: 'Looking for long-term',
    gender: 'men',
    promptDescriptor: 'A 29-year-old man in Hyderabad looking for a long-term partner. Values kindness, family orientation, and clear intentions. Reads bios fully.',
  },
  {
    id: 'nri_30m',
    label: '30M, NRI',
    demographic: 'Abroad, well-traveled',
    gender: 'men',
    promptDescriptor: 'A 30-year-old Indian-origin man living abroad. Well-traveled and culturally mixed. Values independence, curiosity, and humor. Put off by generic "love to travel" bios with nothing specific.',
  },
  {
    id: 'creative_26m',
    label: '26M, Creative',
    demographic: 'Musician / filmmaker',
    gender: 'men',
    promptDescriptor: 'A 26-year-old musician and filmmaker. Values originality and taste. Drawn to candid, unposed photos and bios with a distinct voice.',
  },
  {
    id: 'fitness_27m',
    label: '27M, Fitness',
    demographic: 'Athlete, early riser',
    gender: 'men',
    promptDescriptor: 'A 27-year-old athlete and early riser. Values energy, health, and positivity. Likes active, outdoorsy photos; less interested in nightlife-heavy profiles.',
  },
];

export function getPersonaById(id: string): Persona | undefined {
  return PERSONAS.find(p => p.id === id);
}
