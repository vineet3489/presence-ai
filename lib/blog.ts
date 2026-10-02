export type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string; id: string }
  | { type: 'h3'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'checklist'; title: string; items: string[] }
  | { type: 'tip'; title: string; text: string }
  | { type: 'dodont'; dos: string[]; donts: string[] }
  | { type: 'timeline'; steps: { when: string; what: string }[] }
  | { type: 'stat'; value: string; text: string; source?: string }
  | { type: 'cta' };

export interface Post {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  category: string;
  published: string; // ISO date
  updated: string;
  readMinutes: number;
  takeaways: string[];
  body: Block[];
}

export const POSTS: Post[] = [
  {
    slug: 'how-to-shine-as-a-person',
    title: 'How to Shine as a Person: 9 Habits That Make People Remember You',
    description:
      'Practical personality development habits that make you more confident, magnetic, and memorable — at work, with friends, and on dates. No fake charm, just small things done consistently.',
    keywords: ['personality development', 'how to be more confident', 'how to be memorable', 'self improvement for men', 'how to improve personality', 'charisma tips'],
    category: 'Personality',
    published: '2026-10-02',
    updated: '2026-10-02',
    readMinutes: 7,
    takeaways: [
      'People remember how you made them feel, not what you said.',
      'Confidence is mostly visible habits: posture, pace, eye contact.',
      'Being interested beats trying to be interesting.',
      'Small, repeated improvements compound faster than big makeovers.',
    ],
    body: [
      { type: 'p', text: 'Some people walk into a room and it feels a little warmer. They aren\'t always the best-looking or the funniest. They\'re usually doing a handful of small things well — things anyone can learn. This guide breaks those habits down so you can practise them this week.' },
      { type: 'stat', value: '0.1 sec', text: 'is enough for people to form a judgment of how trustworthy and likeable a face looks — and later impressions tend to confirm it.', source: 'Willis & Todorov, Psychological Science (2006)' },
      { type: 'p', text: 'That sounds harsh, but it\'s good news. If first impressions are fast, then the signals that create them — your expression, posture, grooming, and voice — are concrete. And concrete things can be changed.' },

      { type: 'h2', id: 'presence', text: '1. Make your presence physical before it\'s verbal' },
      { type: 'p', text: 'Before you say a word, your body has already introduced you. Slouched shoulders and a phone in hand say "I\'d rather not be here." An open chest and relaxed hands say "I\'m comfortable, and you can be too."' },
      { type: 'checklist', title: 'The 5-second reset (do it before you walk in)', items: ['Roll your shoulders back and let them drop', 'Lift your chin until it\'s level — not up, just level', 'Put your phone in your pocket, not your hand', 'Unclench your jaw and soften your eyes', 'Take one slow breath out through your mouth'] },

      { type: 'h2', id: 'interested', text: '2. Be interested, not interesting' },
      { type: 'p', text: 'The fastest way to be liked is to make the other person feel understood. Ask a question, then ask a follow-up about their answer. Most people never get a second question — when you ask one, you stand out.' },
      { type: 'dodont', dos: ['"What got you into that?"', '"Wait — how did that end up happening?"', 'Remember one detail and bring it up later'], donts: ['Waiting for your turn to talk', 'Topping their story with a bigger one', 'Interview-style rapid-fire questions'] },

      { type: 'h2', id: 'voice', text: '3. Slow your voice down by 10%' },
      { type: 'p', text: 'Nervous speakers rush and fill silence with "um", "like", and "basically". Confident speakers pause. A half-second pause before an important point makes people lean in. Try it: read the next sentence aloud, pausing at the comma. "I build things, and I\'m proud of that."' },
      { type: 'tip', title: 'Find your filler word', text: 'Record a one-minute voice note describing your day. Play it back and count your most-used filler. Most people have one dominant word. Just noticing it cuts it by half within a week.' },

      { type: 'h2', id: 'eye-contact', text: '4. Hold eye contact one beat longer' },
      { type: 'p', text: 'When you finish a sentence, keep eye contact for one more second before looking away. It signals that you meant what you said. Looking away mid-sentence reads as uncertainty, even when you\'re not uncertain.' },

      { type: 'h2', id: 'grooming', text: '5. Get the basics of grooming right' },
      { type: 'p', text: 'You don\'t need to be handsome to look put-together. Put-together is a decision, and it is mostly about edges: the edges of your haircut, your beard line, your nails, and the fit of your clothes at the shoulders.' },
      { type: 'checklist', title: 'The weekly grooming baseline', items: ['A haircut every 3–4 weeks, not every 3 months', 'A clean neckline and defined beard edges', 'Short, clean nails', 'Moisturiser and sunscreen in the morning', 'One good fragrance, used lightly'] },

      { type: 'h2', id: 'fit', text: '6. Wear clothes that fit your shoulders' },
      { type: 'p', text: 'Fit matters more than brand. A ₹1,200 shirt that fits your shoulders looks better than a ₹6,000 one that doesn\'t. The shoulder seam should sit right where your shoulder ends. If it hangs down your arm, size down or get it tailored.' },

      { type: 'h2', id: 'warmth', text: '7. Lead with warmth, then show competence' },
      { type: 'p', text: 'People first check whether you\'re friendly, then whether you\'re capable. Lead with a genuine smile and a warm greeting, then let your competence show through what you talk about. Reverse the order and you come across as cold, no matter how impressive you are.' },

      { type: 'h2', id: 'stories', text: '8. Have three good stories ready' },
      { type: 'p', text: 'Not rehearsed scripts — just three moments from your life you enjoy telling: something that went hilariously wrong, something you\'re quietly proud of, and something that changed your mind. Stories make you memorable. Facts about your job do not.' },

      { type: 'h2', id: 'measure', text: '9. Measure how you come across — then adjust' },
      { type: 'p', text: 'Most of us have no idea how we actually come across. Friends are too kind to tell us, and strangers never will. Get honest feedback: record yourself, ask one blunt friend, or use a tool that shows you how different people read your photo and voice. Then change one thing at a time.' },
      { type: 'cta' },

      { type: 'h2', id: 'week-plan', text: 'Your 7-day plan' },
      { type: 'timeline', steps: [
        { when: 'Day 1', what: 'Record a 1-minute voice note. Find your filler word.' },
        { when: 'Day 2', what: 'Book a haircut. Fix your beard line.' },
        { when: 'Day 3', what: 'Ask two follow-up questions in every conversation.' },
        { when: 'Day 4', what: 'Try the 5-second posture reset before every meeting.' },
        { when: 'Day 5', what: 'Write down your three stories.' },
        { when: 'Day 6', what: 'Try one outfit that fits your shoulders perfectly.' },
        { when: 'Day 7', what: 'Record the voice note again. Compare.' },
      ] },
      { type: 'p', text: 'None of this is about becoming someone else. It\'s about removing the small things that hide who you already are — so the people you meet actually get to see it.' },
    ],
  },
  {
    slug: 'how-to-look-presentable-on-a-first-date',
    title: 'How to Look More Presentable on a First Date: The Complete Checklist',
    description:
      'A practical first date checklist for men: what to wear, grooming the day before, how to start the conversation, body language, and what to avoid. Show up calm and look your best.',
    keywords: ['first date tips', 'first date tips for men', 'what to wear on a first date', 'how to look presentable', 'first date outfit men', 'dating tips India', 'first date conversation starters'],
    category: 'Dating',
    published: '2026-10-02',
    updated: '2026-10-02',
    readMinutes: 8,
    takeaways: [
      'Dress one level above the venue — never below it.',
      'Do grooming the day before, not an hour before.',
      'Arrive 10 minutes early so you start calm, not rushed.',
      'Your goal isn\'t to impress. It\'s to make her feel comfortable.',
    ],
    body: [
      { type: 'p', text: 'A first date isn\'t an interview, but it is a first impression. The good news: looking presentable is almost entirely about preparation. Here\'s exactly what to do, from 48 hours out to the moment you say goodbye.' },

      { type: 'h2', id: 'timeline', text: 'The first date timeline' },
      { type: 'timeline', steps: [
        { when: '48 hours before', what: 'Get a haircut if you\'re due. Pick your outfit and try it on — in daylight.' },
        { when: 'The night before', what: 'Trim your beard, clean your nails, iron your shirt, polish your shoes. Sleep 7+ hours.' },
        { when: '2 hours before', what: 'Shower, moisturise, light fragrance. Eat something small so you\'re not hungry or jittery.' },
        { when: '30 minutes before', what: 'Leave early. Check the venue location. Phone on silent.' },
        { when: '10 minutes before', what: 'Arrive. Pick a good seat. Do a posture reset and one slow breath.' },
      ] },

      { type: 'h2', id: 'outfit', text: 'What to wear on a first date' },
      { type: 'p', text: 'The rule is simple: dress one level above the venue. Café? Smart casual. Nice restaurant? A step up from that. You want to look like you made an effort — not like you\'re going to a wedding.' },
      { type: 'h3', text: 'Three outfits that almost never fail' },
      { type: 'list', items: [
        'Café or coffee date: a well-fitted plain shirt or polo (white, navy, or olive), dark slim jeans, clean white sneakers.',
        'Dinner date: a crisp linen or cotton shirt (ivory, light blue, or beige), tailored chinos, brown loafers or suede shoes, a simple watch.',
        'Evening drinks: a dark knit polo or a fitted dark shirt, dark trousers, leather shoes. Add a light jacket if it\'s cool.',
      ] },
      { type: 'tip', title: 'The fit test', text: 'Shoulder seams on your shoulders, sleeves ending at your wrist bone, no fabric pooling at the ankle. If you only fix one thing about your outfit, fix the fit.' },
      { type: 'dodont', dos: ['Neutral colours: white, navy, beige, olive, grey', 'Clean, matching shoes and belt', 'One accessory: a watch or a simple bracelet'], donts: ['Big logos or graphic tees', 'Gym wear or worn-out sneakers', 'Strong cologne — she should notice it only when close'] },

      { type: 'h2', id: 'grooming', text: 'Grooming checklist' },
      { type: 'checklist', title: 'Do these the day before', items: ['Haircut 2–4 days before (not the same day — it looks too fresh)', 'Beard trimmed with a clean neckline, or a close shave', 'Nails short and clean', 'Eyebrows tidy (just stray hairs)', 'Lips not dry — use a lip balm', 'Teeth brushed, tongue cleaned, mints in your pocket'] },
      { type: 'stat', value: '0.1 sec', text: 'is how quickly people form a first impression of a face. Grooming and expression are a big part of that snap read.', source: 'Willis & Todorov, Psychological Science (2006)' },

      { type: 'h2', id: 'body-language', text: 'Body language that makes you look confident' },
      { type: 'list', items: [
        'Stand up when she arrives, and greet her with a warm smile before saying anything.',
        'Sit back in your chair. Leaning in constantly reads as anxious; lean in when she says something interesting.',
        'Keep your hands visible and relaxed — on the table, not in your lap or on your phone.',
        'Hold eye contact while she talks; it\'s fine to look away while you\'re thinking.',
        'Mirror her energy. If she\'s calm, slow down. If she\'s animated, match it a little.',
      ] },

      { type: 'h2', id: 'conversation', text: 'How to start — and keep — the conversation' },
      { type: 'p', text: 'Your first line doesn\'t need to be clever. It needs to be warm and easy to answer. Then follow her lead.' },
      { type: 'checklist', title: 'Easy first-date questions that actually work', items: ['"How\'s your week been — anything good happen?"', '"What do you do when you have a completely free Sunday?"', '"What\'s the best thing you\'ve eaten recently?"', '"Is there a place you\'ve travelled that you keep thinking about?"', '"What are you weirdly good at?"'] },
      { type: 'tip', title: 'The follow-up rule', text: 'Whatever she answers, ask one more question about it before changing topic. "Wait, how did you get into that?" It shows you\'re listening — which is rarer, and more attractive, than being funny.' },
      { type: 'dodont', dos: ['Talk about things you\'re genuinely excited about', 'Share a story, not a résumé', 'Laugh at yourself a little'], donts: ['Exes, salary, or complaining about dating apps', 'Checking your phone', 'Interrogating with question after question'] },

      { type: 'h2', id: 'nerves', text: 'If you get nervous' },
      { type: 'p', text: 'Nerves are normal — she\'s probably nervous too. Try a long exhale (count four in, six out) before you walk in. If you blank mid-conversation, just say so with a smile: "Sorry, I lost my train of thought — you were saying?" Being human is more attractive than being polished.' },
      { type: 'cta' },

      { type: 'h2', id: 'ending', text: 'Ending the date well' },
      { type: 'p', text: 'End on a high point rather than letting the conversation fade out. If you enjoyed it, say so directly: "I had a really good time — I\'d like to do this again." Make sure she gets home safely, and send a short message later that evening. Simple, clear, and warm beats playing it cool.' },
      { type: 'checklist', title: 'Your final 60-second check before you walk in', items: ['Shirt tucked or neatly untucked, collar flat', 'Shoes clean', 'Mint, not gum', 'Phone on silent and in your pocket', 'Shoulders back, chin level, one slow breath', 'Smile first, then say hello'] },
    ],
  },
];

export function getPost(slug: string) {
  return POSTS.find((p) => p.slug === slug);
}
