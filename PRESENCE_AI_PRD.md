# PresenceAI — Full Product & Technical PRD
**Live:** https://mypresence.in  
**Repo:** https://github.com/vineet3489/presence-ai  
**Stack:** Next.js 15 App Router · Supabase · Anthropic Claude · HeyGen · Razorpay  
**Owner:** Vineet (vineetee.mmmec@gmail.com)  
**Last updated:** 2026-06-23

---

## 1. Product Vision

PresenceAI is an AI coaching platform for **Indian men** targeting appearance, voice, and social confidence. Users upload a face photo and record their voice → AI analyzes both → gives personalized coaching on grooming, style, speech patterns, and confidence. The end goal is a "presence score" that improves over time as the user acts on the coaching.

**Target user:** Urban Indian men, 25–40, Tier 1 cities, who want to improve their first impression for dating, career, and social situations.

**Core loop:**
1. Do Face Scan → get appearance score + coaching
2. Do Voice Check → get voice score + coaching
3. View Style Profile → get archetype, colors, outfit suggestions
4. Generate AI Avatar → 15-second video of yourself with your cloned voice at your best
5. Do daily tips → build streak → improve score over time

---

## 2. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 15.1.6 (App Router) | Turbopack in dev |
| Auth | Supabase Auth (Google OAuth only) | Server + client components |
| Database | Supabase PostgreSQL | Row-Level Security enabled |
| Storage | Supabase Storage | Buckets: `face-scans`, `avatar-videos` |
| AI — Analysis | Anthropic Claude (`claude-sonnet-4-6`) | Appearance, voice, style, tips, roleplay, chat coach |
| AI — Avatar script | Anthropic Claude (`claude-sonnet-4-6`) | 15-second script generation |
| AI — Video | HeyGen API | Talking photo + voice clone → video |
| AI — Image (broken) | Google Gemini `gemini-2.5-flash-image` | Free tier quota exhausted — not in use |
| Payments | Razorpay Subscriptions API | ₹79/week, 3-day trial via `start_at` delay |
| Styling | Tailwind CSS + shadcn/ui | Dark theme, violet primary |
| Deployment | Vercel | Auto-deploy from GitHub main branch |
| Meta Analytics | Meta Pixel `2056835818377240` | In `app/layout.tsx` via Next.js Script |

---

## 3. Project Structure

```
presence-ai/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx              # Google OAuth sign-in
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                  # Gate: auth + onboarding + paywall (currently DISABLED)
│   │   ├── dashboard/page.tsx          # Main dashboard
│   │   ├── face-scan/page.tsx          # Face scan + history
│   │   ├── voice-check/page.tsx        # Voice check + history
│   │   ├── style-profile/page.tsx      # Style profile + avatar video
│   │   ├── date-prep/page.tsx          # Date coaching
│   │   ├── chat-coach/page.tsx         # DM analysis
│   │   ├── roleplay/page.tsx           # Conversation practice
│   │   ├── progress/page.tsx           # Score history charts
│   │   ├── report/page.tsx             # Weekly AI report
│   │   └── settings/page.tsx           # Account, identity (DOB), cancel sub
│   ├── api/
│   │   ├── analyze-appearance/route.ts # POST: photo + objective → Claude → appearance result
│   │   ├── analyze-voice/route.ts      # POST: transcript + objective → Claude → voice result
│   │   ├── avatar/
│   │   │   ├── generate/route.ts       # POST: face upload + voice clone + HeyGen video kickoff
│   │   │   ├── status/route.ts         # GET: poll HeyGen status, save video to storage when done
│   │   │   └── last-video/route.ts     # GET: signed URL for saved avatar video
│   │   ├── style-profile/
│   │   │   ├── route.ts                # GET: generate/cache style profile via Claude (?refresh=1)
│   │   │   ├── generate-image/route.ts # POST: Gemini image — BROKEN (quota exhausted, unused)
│   │   │   └── last-look/route.ts      # GET: signed URL for last-look.jpg
│   │   ├── daily-tips/
│   │   │   ├── route.ts                # GET: 3 tips (phrase/aura/dating), auto-regenerate stale
│   │   │   └── [id]/complete/route.ts  # POST: mark tip done, award XP
│   │   ├── payment/
│   │   │   ├── create-subscription/route.ts  # POST: create Razorpay plan + subscription
│   │   │   ├── verify-subscription/route.ts  # POST: verify HMAC, set trial status
│   │   │   ├── cancel-subscription/route.ts  # POST: cancel on Razorpay + set expired in DB
│   │   │   └── webhook/route.ts              # POST: handle Razorpay lifecycle events
│   │   ├── zodiac/route.ts             # GET: compute zodiac from DOB, generate Claude insights
│   │   ├── chat-coach/route.ts         # POST: DM analysis
│   │   ├── date-coaching/route.ts      # POST: date prep coaching
│   │   ├── roleplay/route.ts           # POST: conversation simulation
│   │   ├── weekly-report/route.ts      # GET: weekly AI performance report
│   │   ├── outfit-builder/route.ts     # POST: outfit recommendations (no UI yet)
│   │   ├── voice/save-audio/route.ts   # POST: save voice recording blob to storage
│   │   └── face-scan/signed-url/route.ts  # GET: create signed URL for any storage path
│   ├── onboarding/page.tsx             # Personality quiz (5 steps + info)
│   ├── trial/
│   │   ├── page.tsx                    # Trial/paywall gate (server component)
│   │   └── TrialCheckout.tsx           # Razorpay checkout client component
│   ├── layout.tsx                      # Root layout + Meta Pixel
│   └── page.tsx                        # Landing page
├── components/
│   ├── camera/
│   │   ├── CameraCapture.tsx           # Photo capture (live camera or file upload)
│   │   └── AppearanceResults.tsx       # Face scan results display
│   ├── voice/
│   │   ├── VoiceRecorder.tsx           # Record + SpeechRecognition + review/submit step
│   │   └── TranscriptViewer.tsx        # Voice analysis results display
│   ├── dashboard/
│   │   ├── DashboardSidebar.tsx        # Desktop nav sidebar (Settings link included)
│   │   ├── MobileNav.tsx               # Bottom mobile nav
│   │   ├── AvatarCard.tsx              # Avatar video card — background render, voice clone badge
│   │   ├── DailyTips.tsx               # Daily tips with XP/streak (phrase/aura/dating)
│   │   ├── PresenceScoreRing.tsx       # SVG animated score rings
│   │   ├── WelcomeVoice.tsx            # Welcome audio message
│   │   └── ZodiacSection.tsx           # Zodiac personality insights (needs DOB in Settings)
│   └── ui/
│       ├── PresenceLogo.tsx            # Logo component (SVG person + violet aura rings)
│       └── [shadcn components]         # button, card, etc.
├── lib/
│   ├── claude/
│   │   ├── client.ts                   # callClaude(), callClaudeWithImage()
│   │   └── prompts.ts                  # All Claude prompt builders + system prompts
│   ├── supabase/
│   │   ├── client.ts                   # Browser Supabase client
│   │   ├── server.ts                   # Server Supabase client (cookies)
│   │   └── admin.ts                    # Service role client (singleton pattern)
│   └── scoring/
│       └── presenceScore.ts            # scoreAppearance(), scoreVoice(), compositeScore()
├── types/index.ts                      # Shared TypeScript types (AppearanceResult, VoiceResult, etc.)
└── public/
    ├── presence-logo.svg               # Main logo (person + aura rings, violet gradient)
    └── icon.svg                        # Favicon (dark background variant)
```

---

## 4. Database Schema (Supabase PostgreSQL)

### `user_profiles`
| Column | Type | Notes |
|---|---|---|
| `user_id` | UUID (PK, FK → auth.users) | |
| `big_five` | JSONB | `{openness, conscientiousness, extraversion, agreeableness, neuroticism}` — each 1–5 |
| `style_preference` | TEXT | `classic \| bold \| smart-casual \| streetwear` |
| `goals` | TEXT[] | e.g. `['look more put-together']` |
| `age` | INTEGER | |
| `city` | TEXT | e.g. `'Delhi'` |
| `occupation` | TEXT | |
| `education` | TEXT | |
| `date_of_birth` | DATE | For zodiac — **run migration if not exists** |
| `place_of_birth` | TEXT | For zodiac context — **run migration if not exists** |
| `onboarding_completed` | BOOLEAN | |
| `subscription_status` | TEXT | `none \| trial \| active \| expired` |
| `trial_started_at` | TIMESTAMPTZ | Set when Razorpay mandate authorized (not on onboarding) |
| `subscription_ends_at` | TIMESTAMPTZ | Set by webhook on `subscription.charged` |
| `razorpay_subscription_id` | TEXT | **Run migration if not exists** |
| `presence_xp` | INTEGER | Total XP earned from daily tips |
| `tip_streak` | INTEGER | Current daily streak |

### `analysis_sessions`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID (FK) | |
| `session_type` | TEXT | `appearance \| voice \| date_prep` |
| `appearance_result` | JSONB | Full Claude appearance analysis including `photoStoragePath` |
| `appearance_score` | INTEGER | 0–100 |
| `voice_data` | JSONB | `{transcript, durationSeconds}` |
| `voice_result` | JSONB | Full Claude voice analysis including `audioStoragePath` |
| `voice_score` | INTEGER | 0–100 |
| `date_prep_result` | JSONB | Reused for: date coaching, style_profile cache, zodiac cache |
| `social_score` | INTEGER | 0–100 |
| `created_at` | TIMESTAMPTZ | |

**`date_prep_result` JSONB type field convention:**
- `{type: 'style_profile_v1', data: {...}}` — cached style profile (7-day TTL)
- `{type: 'zodiac_v1', sign: 'Scorpio', insights: {...}}` — cached zodiac (30-day TTL)
- No `type` field — actual date coaching result

### `daily_tips`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID (FK) | |
| `date` | DATE | `YYYY-MM-DD` — one set per user per day |
| `category` | TEXT | `phrase \| aura \| dating` |
| `tip_text` | TEXT | The tip content |
| `completed` | BOOLEAN | Default false |
| `created_at` | TIMESTAMPTZ | |

### Supabase Storage Buckets
| Bucket | Path | Contents |
|---|---|---|
| `face-scans` | `{user_id}/{session_id}.jpg` | Face scan photos |
| `face-scans` | `{user_id}/voice_{session_id}.webm` | Voice Check audio recordings |
| `face-scans` | `{user_id}/heygen_photo_id_{path}.txt` | Cached HeyGen `talking_photo_id` |
| `face-scans` | `{user_id}/cloned_voice_id_{path}.txt` | Cached HeyGen cloned `voice_id` |
| `avatar-videos` | `{user_id}/latest.mp4` | Saved completed avatar video |

---

## 5. Features — Full Detail

### 5.1 Onboarding (`/onboarding`)
- 5-question personality quiz + 1 info step
- Questions: vibe/style archetype, social energy, social kryptonite, openness to new things, primary goal
- Info step: age, city, occupation, education (all optional)
- Saves to `user_profiles` via Supabase upsert
- **Critical:** Does NOT set `subscription_status` — stays `'none'` until Razorpay mandate
- After completion → redirects to `/dashboard` (paywall currently disabled)

### 5.2 Face Scan (`/face-scan`)
- **Step 1 — Objective picker:** user selects what this scan is for
  - "A date" → warmth, attractiveness, approachability focus
  - "Interview" → professionalism, composure, credibility focus
  - "General vibe" → balanced presence improvement
- **Step 2 — Capture:** CameraCapture component (live camera or file upload)
- Sends `{imageBase64, mediaType, objective}` to `/api/analyze-appearance`
- Claude analyzes: face shape, skin tone, expression score (0–100), posture score, hairstyle recommendations (3), clothing colors (3, with specific garment suggestions), grooming tips (2), posture corrections, expression tips, overall coaching
- **Age-aware prompting:** 35+ gets oral hygiene, teeth whitening, fragrance, skin care explicitly called out
- Photo saved to `face-scans/{user_id}/{session_id}.jpg`; `photoStoragePath` embedded in `appearance_result` JSONB
- History: last 5 sessions shown with lazy-loaded signed URLs (1hr expiry from `/api/face-scan/signed-url`)
- Score: 0–100 as `appearance_score`

### 5.3 Voice Check (`/voice-check`)
- **Step 1 — Objective picker:** same date/interview/general options as Face Scan
- **Step 2 — Record:**
  - `VoiceRecorder` component runs **two parallel streams:**
    1. Web Speech API (`SpeechRecognition`) → real-time transcript
    2. `MediaRecorder` → raw audio blob (webm/mp4) for storage and voice cloning
  - After stopping → **review step** with editable transcript textarea + "Analyze My Voice" button
  - If Speech Recognition fails (mobile, some browsers): shows text input fallback — user types what they said
  - Transcription happens regardless of browser Speech API support
- Sends `{transcript, durationSeconds, objective}` to `/api/analyze-voice`
- Claude analyzes: filler words (exact count + which words), grammar issues (with before/after), pace (WPM), clarity score, tone assessment, strengths list, improvements list, exercises (3 specific drills with exact words)
- After analysis: audio blob uploaded as FormData to `/api/voice/save-audio` → saved as `voice_{sessionId}.webm`; `audioStoragePath` patched into `voice_result`
- History: last 5 recordings with audio playback via signed URLs
- Score: 0–100 as `voice_score`

### 5.4 Style Profile (`/style-profile`)
- **Gate:** requires at least one face scan AND one voice scan (checked client-side)
- Lock screen with CTAs if either is missing
- Calls `/api/style-profile` (GET) — Claude generates, cached 7 days
- Cache: looks for recent `date_prep` sessions with `date_prep_result.type === 'style_profile_v1'` (JS-side filter of last 10 records)
- `?refresh=1` bypasses cache and forces regeneration
- **Claude output:**
  - `archetype` — 2–3 word style identity (e.g. "The Power Architect")
  - `archetypeDescription` — 1 sentence starting with a genuine compliment
  - `colorPalette.primary` (3 colors), `.accent` (2), `.avoid` (with reason)
  - `signatureOutfits` — exactly 2: Casual + Work (specific garments + colors)
  - `hairAdvice` — exact hairstyle name + why
  - `grooming` — 1–2 sentences, age-sensitive (35+ gets teeth/skin/fragrance explicitly)
- **Presence ID Card:** displays zodiac sign + emoji, city, and archetype as pill tags
- **AI Avatar Video:** embeds `AvatarCard` component (see 5.5) — this IS the "ideal look" visual
- Refresh button regenerates profile with latest scan data

### 5.5 AI Avatar (`AvatarCard` — used in both Dashboard and Style Profile)
**Purpose:** 15-second video of the user's actual face, speaking with their actual cloned voice, saying a confident script tailored to their archetype.

**Full generation flow:**

**Step 1 — Script generation (Claude)**
- Input: archetype, voice improvements, voice strengths, goal
- Output: 38–42 word script with zero fillers, confident endings, observational opener, ends with one direct question
- Script reflects their best speaking version — not robotic, shaped by their natural strengths

**Step 2 — Talking photo (face personalization)**
- Gets `photoStoragePath` from latest appearance session's `appearance_result`
- Checks cache: `face-scans/{user_id}/heygen_photo_id_{path}.txt`
- If not cached (or `?force=1`): downloads photo from Supabase Storage → strips MIME type params → uploads to `https://upload.heygen.com/v1/talking_photo`
- Saves returned `talking_photo_id` to cache file
- **Failure:** throws a clear error (no silent fallback to generic avatar)

**Step 3 — Voice cloning (user's real voice)**
- Gets `audioStoragePath` from latest voice session's `voice_result`
- Checks cache: `face-scans/{user_id}/cloned_voice_id_{path}.txt`
- If not cached (or `?force=1`): downloads audio from Supabase Storage → uploads to `https://api.heygen.com/v2/voice_clone` as `multipart/form-data`
- Minimum viable audio: ~40KB (~5+ seconds). Shorter recordings skip cloning gracefully
- Saves returned `voice_id` to cache file
- **Fallback:** if cloning fails or no recording exists, uses best available HeyGen English male preset voice
- UI shows "your cloned voice" vs "AI voice" in the video footer

**Step 4 — Video generation**
- Calls `POST https://api.heygen.com/v2/video/generate`
- Character: `{type: 'talking_photo', talking_photo_id}`
- Voice: `{type: 'text', input_text: script, voice_id: clonedOrPreset, speed: 1.0}`
- Background: dark (`#0f172a`)
- Dimension: 720×1280 (portrait)
- Returns `videoId`

**Step 5 — Polling**
- Client stores `videoId` in `localStorage` key `avatar_video_id`
- Polls `/api/avatar/status?videoId=` every 8 seconds
- When `status === 'completed'`: downloads video from HeyGen URL → saves to `avatar-videos/{user_id}/latest.mp4` → returns signed URL

**UX:**
- Generation is **non-blocking** — compact progress bar while rendering, user can navigate freely
- "Your avatar is rendering… Takes ~1–2 minutes. Use the app — we'll update this when ready."
- "Try Again (Fresh Upload)" after error → uses `?force=1` to bypass all caches and re-clone voice + re-upload face

**API params:**
- `POST /api/avatar/generate` — standard
- `POST /api/avatar/generate?force=1` — clears all caches, fresh upload + clone

### 5.6 Daily Coaching (`DailyTips` component on Dashboard)
- Generates 3 tips daily via Claude, cached in `daily_tips` table per user per date
- **Categories (updated — old `voice` category auto-regenerates):**
  - `phrase` — exact phrase upgrade: "Instead of [weak phrase], say: '[exact upgrade]' — [why]"
  - `aura` — body language / presence / energy — one concrete action today
  - `dating` — specific social action or mindset shift for today
- Personalized by: goals, big five personality, age, city
- Tips with old `voice` category are auto-deleted and regenerated on next load
- Mark as done → +5 XP → streak increments
- `?reset=1` param forces full regeneration of today's tips
- Shows on dashboard as "Today's Coaching" section

### 5.7 Zodiac Section (`ZodiacSection` component on Dashboard)
- **Requires:** `date_of_birth` in user profile (added via Settings → Identity)
- `GET /api/zodiac` computes sign from DOB → calls Claude for insights
- **Zodiac computation:** pure JS, no external API
- **Claude output:**
  - `tagline` — 5–7 words defining this sign's social energy
  - `coreTraits` — 3 short trait strings shown as pills
  - `socialStrength` — 1 sentence on natural social power
  - `blindSpot` — 1 sentence on what undercuts their magnetism
  - `dailyPresenceTip` — specific actionable tip rooted in their sign's energy
  - `phraseToOwn` — one specific phrase they can say today
- Cached 30 days as `date_prep` session with `{type: 'zodiac_v1', sign, insights}`
- If no DOB: shows CTA linking to Settings

### 5.8 Settings (`/settings`)
- **Account:** signed-in email (read-only)
- **Identity:** date of birth (date input) + place of birth (text) → save to `user_profiles`
  - Used for zodiac insights. Both optional.
- **Plan:** current subscription status, renewal/trial end date, Active/Inactive badge
- **Manage Plan** (hidden collapsible):
  - Cancellation requires typing the word `cancel` in a confirmation input
  - Red outline button activates only when confirmed
  - Calls `/api/payment/cancel-subscription` → Razorpay cancel (immediate) → DB `expired`
  - Redirects to `/trial` after cancel

### 5.9 Date Prep (`/date-prep`)
- Form captures: communication style, nervousness, past challenge, personality snapshot; interests/vibe/profession of who they're meeting; occasion type/location/time
- Claude output: what to wear (specific outfit), how to open (specific line), 5 conversation starters (reference their actual interests), body language tips, things to avoid, nervousness strategy

### 5.10 Chat Coach (`/chat-coach`)
- Paste DM conversation + select intention: keep fun / build connection / romantic escalate / get a date / re-engage
- Claude analyzes: your texting personality (strengths + blind spots), their personality (what they respond to, red flags), dynamic between you, interest level 0–100, 3 reply options with tone + reasoning

### 5.11 Roleplay (`/roleplay`)
- 5 scenarios: café, gym, class, DM→IRL, house party
- Claude plays a realistic, slightly guarded character — not a helpful AI
- After each user message: in-character response + `COACHING_JSON:{confidence, warmth, naturalness, coaching}` appended
- Scores + one-line coaching extracted and displayed below each exchange

### 5.12 Progress (`/progress`)
- Charts of appearance, voice, social scores over time (from `analysis_sessions`)
- Streak visualization

### 5.13 Weekly Report (`/report`)
- Claude generates 3-field summary: `coachSummary`, `topImprovement`, `focusArea`
- Data: this week's average scores vs last week's averages from `analysis_sessions`

---

## 6. Payments — Razorpay Subscriptions

### Flow
1. User completes onboarding → status stays `'none'`
2. With paywall enabled, redirected to `/trial`
3. `TrialCheckout.tsx` shows day-by-day timeline: "Today: Set up UPI AutoPay (no charge) → Days 1–3: Free → Day 4+: ₹79/week"
4. Calls `/api/payment/create-subscription` → creates plan (₹79/week = 7900 paise) + subscription with `start_at = now + 3 days`
5. Razorpay checkout modal opens → user authorizes UPI AutoPay mandate
6. On success: HMAC verified by `/api/payment/verify-subscription` → sets `subscription_status: 'trial'`, `trial_started_at: now`, `razorpay_subscription_id`
7. Webhook at `/api/payment/webhook`:
   - `subscription.authenticated` → `status: 'trial'` (backup path)
   - `subscription.charged` → `status: 'active'`, sets `subscription_ends_at`
   - `subscription.halted / cancelled / completed` → `status: 'expired'`

### Key details
- `RAZORPAY_PLAN_ID` env var: set after first successful subscription creation (logged as `RAZORPAY_PLAN_ID=plan_xxx` in Vercel logs)
- `trial_started_at = null` → edge case: mandate just authorized, webhook pending → `hasActiveAccess()` grants access
- Trial window: `trial_started_at + 3 days > now`

### Paywall gate (`app/(dashboard)/layout.tsx`)
```ts
// CURRENTLY DISABLED FOR TESTING — uncomment to re-enable:
// if (!hasActiveAccess(profile)) redirect('/trial');
```
`hasActiveAccess()` logic:
- `active` + `subscription_ends_at > now` (or ends_at not set yet) → ✅
- `trial` + `trial_started_at` null → ✅ (webhook pending)
- `trial` + within 3-day window → ✅
- Everything else → ❌ → redirect `/trial`

### First-time vs returning trial
- `isFirstTrial = true` when `status === 'none'` OR (`status === 'trial'` AND no `razorpay_subscription_id`)
- First trial: shows full onboarding timeline
- Returning: shows "Subscribe ₹79/week" directly

---

## 7. Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=         # Gemini — currently unused (free tier quota exhausted)

# Payments — LIVE keys
RAZORPAY_KEY_ID=rzp_live_T1St5zZyIwo4Zy
RAZORPAY_KEY_SECRET=L8iRxTiyEGMiwwrs7VTt347Z
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_T1St5zZyIwo4Zy
RAZORPAY_WEBHOOK_SECRET=   # From Razorpay dashboard webhook settings
RAZORPAY_PLAN_ID=          # Log from Vercel after first subscription creation

# HeyGen
HEYGEN_API_KEY=
```

---

## 8. Claude Prompts Architecture (`lib/claude/prompts.ts`)

### System prompts (constants)
| Export | Role |
|---|---|
| `APPEARANCE_SYSTEM_PROMPT` | Celebrity-level stylist + image consultant |
| `VOICE_SYSTEM_PROMPT` | No-nonsense vocal coach quoting user's exact words |
| `DATE_PREP_SYSTEM_PROMPT` | Dating + social confidence coach |
| `CHAT_COACH_SYSTEM_PROMPT` | Psychology + communication dynamics expert |
| `ROLEPLAY_SYSTEM_PROMPT` | Realistic character + JSON coaching block |
| `OUTFIT_BUILDER_SYSTEM_PROMPT` | Personal stylist (specific garments, colors) |
| `PRE_DATE_CHECKLIST_SYSTEM_PROMPT` | Pre-date ritual coach |
| `WEEKLY_REPORT_SYSTEM_PROMPT` | Weekly performance coach |
| `DAILY_TIPS_SYSTEM_PROMPT` | Daily tip generator (phrase/aura/dating) |

### Key prompt builders
| Function | Inputs | Key behavior |
|---|---|---|
| `buildAppearancePrompt(profile, objective?)` | profile, `ScanObjective` | Age 35+: adds hygiene/teeth/fragrance note; objective changes focus |
| `buildVoicePrompt(data, profile?, objective?)` | transcript+duration, profile, `ScanObjective` | Objective shifts: date=warmth, interview=authority |
| `buildDailyTipsPrompt(profile)` | profile | Phrase tips give exact "Instead of X, say Y" upgrades |
| `buildScript(archetype, fixes, goal, strengths)` | avatar context | In generate/route.ts — 38–42 words, zero fillers, archetype-matched |

### `ScanObjective` type
```ts
type ScanObjective = 'date' | 'interview' | 'general'
```
- `date` → warmth, attractiveness, approachability
- `interview` → professionalism, composure, credibility
- `general` → balanced presence improvement

---

## 9. Scoring System (`lib/scoring/presenceScore.ts`)

- `scoreAppearance(result)` → 0–100 weighted composite from expression, posture, grooming
- `scoreVoice(result)` → 0–100 weighted from clarity, filler count, pace WPM
- `compositeScore(appearance, voice, social)` → weighted average of all three
- Displayed as animated SVG rings on dashboard

---

## 10. Known Issues & Current Status

| Issue | Status | Notes |
|---|---|---|
| HeyGen talking photo upload | Intermittent — MIME fix applied | Use "Try Again (Fresh Upload)" to bypass cache |
| Gemini image generation | Broken — quota exhausted | Replaced: Style Profile now shows avatar video instead |
| Zodiac column missing | Needs SQL migration | Run `ALTER TABLE` below before zodiac works |
| Paywall disabled | By design (testing) | One commented line in `layout.tsx` to re-enable |
| Voice clone minimum audio | Need 5+ seconds of recording | Short recordings fall back to preset voice silently |

---

## 11. Required SQL Migrations

Run all of these in the Supabase SQL editor before enabling all features:

```sql
-- Razorpay subscription ID
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT;

-- Zodiac / identity fields
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS place_of_birth TEXT;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_user_type_date
  ON public.analysis_sessions (user_id, session_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_daily_tips_user_date
  ON public.daily_tips (user_id, date);
```

### Reset subscription for testing (vineet's account)
```sql
UPDATE public.user_profiles
SET subscription_status = 'none',
    trial_started_at = NULL,
    razorpay_subscription_id = NULL,
    subscription_ends_at = NULL
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'vineetee.mmmec@gmail.com');
```

---

## 12. Razorpay Webhook Configuration

- **URL:** `https://mypresence.in/api/payment/webhook`
- **Events:** `subscription.authenticated`, `subscription.charged`, `subscription.halted`, `subscription.cancelled`, `subscription.completed`
- **Secret:** copy from Razorpay dashboard → set as `RAZORPAY_WEBHOOK_SECRET` in Vercel

---

## 13. Deployment (Vercel)

- Repo: `vineet3489/presence-ai` → branch `main`
- Auto-deploys on every `git push origin main`
- Env var changes require a **manual redeploy** in Vercel dashboard
- Function timeout: 10s default (free plan) — avatar polling is client-side so this is fine

---

## 14. Features Roadmap

### Planned (not built)
- **BMI tracking** — height + weight inputs → BMI-based fitness coaching in appearance recommendations
- **Progress photos** — side-by-side face scan comparison week over week
- **Phrase practice** — interactive speaking drills with real-time filler detection
- **Community** — city leaderboard, shareable score card
- **WhatsApp reminders** — daily tip pushed via WhatsApp Business API

### Partially built (API exists, no UI)
- **Outfit builder** — `/api/outfit-builder` complete, no frontend page
- **Pre-date checklist** — `/api/pre-date-checklist` complete, UI incomplete

### Known tech debt
- `date_prep` session type is overloaded for style profiles + zodiac caches — ideally gets its own DB column
- `generate-image/route.ts` (Gemini) is dead code — can be deleted or replaced with DALL-E 3 / Stable Diffusion with a paid key
- Avatar voice clone caches per audio path — if user redoes Voice Check, old clone remains cached until `?force=1`

---

## 15. Logo & Branding

- **Logo:** SVG person silhouette (head circle + shoulder arc) inside dashed/solid violet aura rings
- **Gradient:** `#c4b5fd → #8b5cf6 → #5b21b6`
- **Background:** transparent (logo) / `#0f0726` rounded rect (favicon)
- **Files:** `public/presence-logo.svg` · `app/icon.svg` · `components/ui/PresenceLogo.tsx`
- **Meta Pixel:** `2056835818377240` in `app/layout.tsx` via `<Script strategy="afterInteractive">`

---

## 16. Development Commands

```bash
cd presence-ai
npm install
cp .env.example .env.local    # fill in all vars

npm run dev                    # localhost:3000 with Turbopack
npx tsc --noEmit               # type check
git push origin main           # deploys to Vercel
```

---

## 17. Re-enabling Paywall for Production

In `app/(dashboard)/layout.tsx`, uncomment:
```ts
if (!hasActiveAccess(profile)) redirect('/trial');
```

Checklist before re-enabling:
1. ✅ Run all SQL migrations
2. ✅ `RAZORPAY_PLAN_ID` set in Vercel (check logs after first sub)
3. ✅ Razorpay webhook configured + `RAZORPAY_WEBHOOK_SECRET` set
4. ✅ Test full trial flow with a real UPI account
5. ✅ Verify webhook fires correctly for `subscription.charged`
