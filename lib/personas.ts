export interface Persona {
  id: string;
  label: string;
  demographic: string;
  promptDescriptor: string;
}

export const PERSONAS: Persona[] = [
  {
    id: 'delhi_23f',
    label: '23F, Delhi',
    demographic: 'Early-20s, Delhi/NCR',
    promptDescriptor: 'A 23-year-old woman in Delhi/NCR, urban upper-middle-class. Swipes fast (2-3 seconds per profile). Values confidence and directness. Put off by generic gym/try-hard photos and vague bios. Responds well to specificity and humor.',
  },
  {
    id: 'mumbai_25f',
    label: '25F, Mumbai',
    demographic: 'Mid-20s working professional, Mumbai',
    promptDescriptor: 'A 25-year-old working professional in Mumbai, career-focused. Skeptical of posed/generic photos. Values ambition, wit, and authenticity over posturing.',
  },
  {
    id: 'nyc_24f',
    label: '24F, NYC',
    demographic: 'Mid-20s, NYC',
    promptDescriptor: 'A 24-year-old woman in NYC, dating-app-savvy from heavy swipe-culture exposure. Expects concise, witty bios. Values personality signals over looks-first framing. Low tolerance for overly formal or try-hard tone.',
  },
  {
    id: 'introverted',
    label: 'Introverted user',
    demographic: 'Quieter, thoughtful swiper',
    promptDescriptor: 'A quieter, more thoughtful swiper who reads bios carefully rather than skimming. Values depth and calm authenticity over loud group photos or "life of the party" framing.',
  },
  {
    id: 'high_income_pro',
    label: 'High-income professional',
    demographic: 'Ambitious, selective',
    promptDescriptor: 'An ambitious, selective professional. Reads status and substance signals (career, education cues) alongside warmth. Less swayed by looks alone; wants to see substance in the bio, not just a job title.',
  },
];

export function getPersonaById(id: string): Persona | undefined {
  return PERSONAS.find(p => p.id === id);
}
