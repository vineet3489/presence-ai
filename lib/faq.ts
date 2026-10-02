export interface Faq { q: string; a: string }

export const FAQ_GROUPS: { title: string; items: Faq[] }[] = [
  {
    title: 'Trial & billing',
    items: [
      { q: 'Will I be charged today?', a: 'No. You pay ₹0 today. Your first ₹79 charge is on Day 4 — only if you don\'t cancel before then.' },
      { q: 'How do I cancel?', a: 'Go to Settings and tap Cancel subscription. It takes about ten seconds, and you keep access until the end of the period you\'ve paid for.' },
      { q: 'Can I try it without a card?', a: 'Yes. Your first Perception Check is free and needs no card. You only add a card or UPI when you want every tool unlocked.' },
      { q: 'Which payment methods work?', a: 'Debit and credit cards and UPI AutoPay, processed securely by Razorpay. We never see or store your card number.' },
    ],
  },
  {
    title: 'How it works',
    items: [
      { q: 'What is a Perception Check?', a: 'You upload a photo and your dating bio, pick who you want to impress — say, a 25-year-old professional in Mumbai — and get your swipe and reply odds, a one-line read of their first impression, and the single change most likely to improve it.' },
      { q: 'Are real people rating my photo?', a: 'No. Your profile is read by personas modelled on how different people swipe — by age, city, and personality. Nobody you know will ever see your photo, and nothing is posted anywhere.' },
      { q: 'How accurate are the swipe odds?', a: 'Treat them as a compass, not a verdict. They\'re most useful for comparison — the same profile before and after a change — so you can see which tweaks move the needle.' },
      { q: 'What do Face Scan and Voice Check do?', a: 'Face Scan suggests the haircut, colours, and grooming that suit your face. Voice Check counts your filler words, measures your pace, and gives you short drills to sound more confident.' },
      { q: 'Is this only for dating?', a: 'Dating is where most people start, but the same skills — a clean look, a calm voice, a confident first impression — help in interviews, networking, and everyday conversations.' },
    ],
  },
  {
    title: 'Privacy',
    items: [
      { q: 'Is my photo safe?', a: 'Your photos and results are visible only to you. They\'re stored in secure, access-controlled storage and are never sold or shared for advertising.' },
      { q: 'Can I delete my data?', a: 'Yes. Email support@mypresence.in and we\'ll delete your account and all associated photos, recordings, and results within 30 days.' },
    ],
  },
];

export const ALL_FAQS: Faq[] = FAQ_GROUPS.flatMap((g) => g.items);

export function faqJsonLd(items: Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}
