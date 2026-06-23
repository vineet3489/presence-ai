# PresenceAI — Full Product & Technical PRD
**Live:** https://mypresence.in  
**Repo:** https://github.com/vineet3489/presence-ai  
**Stack:** Next.js 15 App Router · Supabase · Anthropic Claude · HeyGen · Razorpay  
**Owner:** Vineet (vineetee.mmmec@gmail.com)

---

## 1. Product Vision

PresenceAI is an AI coaching platform for **Indian men** targeting appearance, voice, and social confidence. Users upload a face photo and record their voice → AI analyzes both → gives personalized coaching on grooming, style, speech patterns, and confidence. The end goal is a "presence score" that improves over time as the user acts on the coaching.

**Target user:** Urban Indian men, 25–40, Tier 1 cities, who want to improve their first impression for dating, career, and social situations.

**Core loop:**
1. Do Face Scan → get appearance score + coaching
2. Do Voice Check → get voice score + coaching
3. View Style Profile → get archetype, colors, outfit suggestions
4. Generate AI Avatar → 15-second video of yourself at your best
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
| AI — Video | HeyGen API | Talking photo → video. `upload.heygen.com/v1/talking_photo` |
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
│   │   ├── layout.tsx                  # Gate: auth + onboarding + paywall (currently disabled)
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
│   │   ├── analyze-appearance/route.ts # POST: photo → Claude → appearance result
│   │   ├── analyze-voice/route.ts      # POST: transcript → Claude → voice result
│   │   ├── avatar/
│   │   │   ├── generate/route.ts       # POST: talking photo upload + HeyGen video kickoff
│   │   │   ├── status/route.ts         # GET: poll HeyGen for video completion
│   │   │   └── last-video/route.ts     # GET: return signed URL for saved video
│   │   ├── style-profile/
│   │   │   ├── route.ts                # GET: generate/cache style profile via Claude
│   │   │   ├── generate-image/route.ts # POST: Gemini image (BROKEN — quota exceeded)
│   │   │   └── last-look/route.ts      # GET: return last-look.jpg signed URL
│   │   ├── daily-tips/
│   │   │   ├── route.ts                # GET: generate 3 tips (phrase/aura/dating)
│   │   │   └── [id]/complete/route.ts  # POST: mark tip done, award XP
│   │   ├── payment/
│   │   │   ├── create-subscription/route.ts  # POST: create Razorpay plan + subscription
│   │   │   ├── verify-subscription/route.ts  # POST: verify HMAC, set trial status
│   │   │   ├── cancel-subscription/route.ts  # POST: cancel on Razorpay + set expired
│   │   │   └── webhook/route.ts              # POST: handle Razorpay events
│   │   ├── zodiac/route.ts             # GET: compute zodiac from DOB, generate insights
│   │   ├── chat-coach/route.ts         # POST: DM analysis via Claude
│   │   ├── date-coaching/route.ts      # POST: date prep coaching
│   │   ├── roleplay/route.ts           # POST: conversation simulation
│   │   ├── weekly-report/route.ts      # GET: weekly AI performance report
│   │   ├── outfit-builder/route.ts     # POST: outfit recommendations
│   │   └── face-scan/signed-url/route.ts  # GET: create signed URL for storage path
│   ├── onboarding/page.tsx             # Personality quiz (5 steps + info)
│   ├── trial/
│   │   ├── page.tsx                    # Trial/paywall gate
│   │   └── TrialCheckout.tsx           # Razorpay checkout UI
│   ├── layout.tsx                      # Root layout + Meta Pixel
│   └── page.tsx                        # Landing page
├── components/
│   ├── camera/
│   │   ├── CameraCapture.tsx           # Photo capture (camera/upload)
│   │   └── AppearanceResults.tsx       # Face scan results display
│   ├── voice/
│   │   ├── VoiceRecorder.tsx           # Record audio + Speech Recognition + review step
│   │   └── TranscriptViewer.tsx        # Voice analysis results display
│   ├── dashboard/
│   │   ├── DashboardSidebar.tsx        # Desktop nav sidebar
│   │   ├── MobileNav.tsx               # Bottom mobile nav
│   │   ├── AvatarCard.tsx              # HeyGen avatar video card (background render)
│   │   ├── DailyTips.tsx               # Daily tips with XP/streak
│   │   ├── PresenceScoreRing.tsx       # SVG score rings
│   │   ├── WelcomeVoice.tsx            # Welcome audio message
│   │   └── ZodiacSection.tsx           # Zodiac personality insights
│   └── ui/
│       ├── PresenceLogo.tsx            # Logo component (SVG person + aura rings)
│       └── [shadcn components]         # button, card, etc.
├── lib/
│   ├── claude/
│   │   ├── client.ts                   # callClaude(), callClaudeWithImage()
│   │   └── prompts.ts                  # All Claude prompt builders
│   ├── supabase/
│   │   ├── client.ts                   # Browser Supabase client
│   │   ├── server.ts                   # Server Supabase client
│   │   └── admin.ts                    # Service role client (singleton)
│   └── scoring/
│       └── presenceScore.ts            # Score calculation functions
├── types/index.ts                      # Shared TypeScript types
└── public/
    ├── presence-logo.svg               # Main logo
    └── icon.svg                        # Favicon
```

---

## 4. Database Schema (Supabase PostgreSQL)

### `user_profiles`
| Column | Type | Notes |
|---|---|---|
| `user_id` | UUID (PK, FK → auth.users) | |
| `big_five` | JSONB | `{openness, conscientiousness, extraversion, agreeableness, neuroticism}` each 1–5 |
| `style_preference` | TEXT | `classic \| bold \| smart-casual \| streetwear` |
| `goals` | TEXT[] | e.g. `['look more put-together']` |
| `age` | INTEGER | |
| `city` | TEXT | e.g. `'Delhi'` |
| `occupation` | TEXT | |
| `education` | TEXT | |
| `date_of_birth` | DATE | For zodiac. **Run migration if not exists** |
| `place_of_birth` | TEXT | For zodiac context |
| `onboarding_completed` | BOOLEAN | |
| `subscription_status` | TEXT | `none \| trial \| active \| expired` |
| `trial_started_at` | TIMESTAMPTZ | Set when Razorpay mandate authorized |
| `subscription_ends_at` | TIMESTAMPTZ | Set by webhook on charge |
| `razorpay_subscription_id` | TEXT | **Run migration if not exists** |
| `presence_xp` | INTEGER | Total XP earned from daily tips |
| `tip_streak` | INTEGER | Current daily streak |

### `analysis_sessions`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID (FK) | |
| `session_type` | TEXT | `appearance \| voice \| date_prep` |
| `appearance_result` | JSONB | Full Claude appearance analysis |
| `appearance_score` | INTEGER | 0–100 |
| `voice_data` | JSONB | `{transcript, durationSeconds}` |
| `voice_result` | JSONB | Full Claude voice analysis |
| `voice_score` | INTEGER | 0–100 |
| `date_prep_result` | JSONB | Used for: date coaching, style_profile cache, zodiac cache |
| `social_score` | INTEGER | 0–100 |
| `created_at` | TIMESTAMPTZ | |

**Note on `date_prep_result` overloading:** This column is reused to cache multiple AI results by storing a `type` field:
- `{type: 'style_profile_v1', data: {...}}` — cached style profile
- `{type: 'zodiac_v1', sign: 'Scorpio', insights: {...}}` — cached zodiac insights
- Regular date coaching data

### `daily_tips`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID (FK) | |
| `date` | DATE | Today's date (YYYY-MM-DD) |
| `category` | TEXT | `phrase \| aura \| dating` (was `voice` before — auto-regenerates) |
| `tip_text` | TEXT | The actual tip |
| `completed` | BOOLEAN | |
| `created_at` | TIMESTAMPTZ | |

### Supabase Storage Buckets
| Bucket | Path pattern | Contents |
|---|---|---|
| `face-scans` | `{user_id}/{session_id}.jpg` | Face scan photos |
| `face-scans` | `{user_id}/voice_{session_id}.webm` | Voice recordings |
| `face-scans` | `{user_id}/heygen_photo_id_{path}.txt` | Cached HeyGen talking_photo_id |
| `avatar-videos` | `{user_id}/latest.mp4` | Saved HeyGen avatar video |

---

## 5. Features — Full Detail

### 5.1 Onboarding (`/onboarding`)
- 5-question personality quiz + 1 info step
- Captures: vibe/style, social energy, social kryptonite, openness, goals
- Info step: age, city, occupation, education (all optional)
- Saves to `user_profiles` via Supabase upsert
- **Important:** Does NOT set `subscription_status` — stays `'none'` until Razorpay

### 5.2 Face Scan (`/face-scan`)
- **Objective picker first:** date / interview / general vibe — affects Claude prompt context
- CameraCapture component: live camera or file upload
- Sends base64 photo + objective to `/api/analyze-appearance`
- Claude (`claude-sonnet-4-6`) analyzes: face shape, skin tone, expression score, posture score, hairstyle recs, clothing colors, grooming tips, posture corrections, expression tips, overall coaching
- **Age-aware:** 35+ users get oral hygiene, teeth, fragrance, skin prioritized
- Photo stored in `face-scans` bucket as `{user_id}/{session_id}.jpg`
- `photoStoragePath` saved in `appearance_result` JSONB for later retrieval
- History: last 5 scans shown with lazy-loaded signed URLs (1hr expiry)
- Score: 0–100 stored as `appearance_score`

### 5.3 Voice Check (`/voice-check`)
- **Objective picker first:** date / interview / general
- VoiceRecorder component:
  - Uses Web Speech API (SpeechRecognition) for real-time transcription
  - Also runs MediaRecorder in parallel for audio blob capture
  - After stopping: shows **review step** with editable transcript + "Analyze My Voice" button
  - If Speech Recognition fails: shows text input fallback
  - Works even if browser doesn't support Speech API
- Audio blob uploaded to `/api/voice/save-audio` → stored as `voice_{sessionId}.webm`
- Claude analyzes: filler words, grammar issues, pace (WPM), clarity score, tone assessment, strengths, improvements, exercises
- History: last 5 recordings with audio playback (signed URLs)

### 5.4 Style Profile (`/style-profile`)
- **Gate:** requires both face scan AND voice scan
- Fetches from `/api/style-profile` (Claude generates, caches 7 days)
- Cache uses `date_prep` session type with `type: 'style_profile_v1'`
- `?refresh=1` param forces regeneration
- **Output:**
  - Archetype (e.g. "The Power Architect")
  - Archetype description (starts with genuine compliment)
  - Color palette: primary (3), accent (2), avoid (with reason)
  - 2 signature outfits: Casual + Work
  - Hair advice (exact style name)
  - Grooming priorities (age-sensitive: 35+ gets teeth/skin/fragrance)
- **Presence ID Card:** shows zodiac + city + archetype as identity tags
- **AI Avatar Video:** embedded `AvatarCard` component (see 5.5)
- Age-based prompt: 35+ gets hygiene/fragrance/skin care as top priorities

### 5.5 AI Avatar (`AvatarCard` component — used in dashboard + style profile)
- **Goal:** 15-second video of the user speaking confidently with their actual face
- **Flow:**
  1. Generate script via Claude (based on archetype + voice improvements + goal)
  2. Upload face scan photo to HeyGen as "talking photo" (`upload.heygen.com/v1/talking_photo`)
  3. Cache the `talking_photo_id` in Supabase storage
  4. Submit video generation job to HeyGen (`api.heygen.com/v2/video/generate`)
  5. Poll `api.heygen.com/v1/video_status.get` every 8 seconds
  6. When done: download video, save to `avatar-videos/{user_id}/latest.mp4`
  7. Return signed URL for playback
- **UX:** Background rendering — compact progress bar, user can use app freely
- **Retry:** "Try Again" button uses `?force=1` to bypass cached talking_photo_id
- **Known issue:** HeyGen talking photo upload can fail if photo MIME type contains extra params (stripped now) or if face photo quality is poor
- Takes ~60–90 seconds to render
- No brand names shown in UI

### 5.6 Daily Coaching (`DailyTips` component)
- Generates 3 tips daily via Claude, cached in `daily_tips` table
- **Categories:**
  - `phrase` — a specific phrase to say today, direct upgrade of weak speech patterns
  - `aura` — body language / presence / energy action
  - `dating` — one specific social action or shift
- Personalized by: goals, personality (big five), age, city
- Old `voice` category tips auto-regenerated on next load
- Mark as done → +5 XP
- Streak tracks consecutive daily completions
- Shows on both dashboard and as "Today's Coaching" section

### 5.7 Zodiac Section (`ZodiacSection` component)
- Shows on dashboard
- **Requires:** `date_of_birth` in user profile (set in Settings → Identity)
- Calls `/api/zodiac` → computes sign from DOB → Claude generates insights
- **Output:**
  - Tagline (5–7 words)
  - Core traits (3 tags)
  - Social strength
  - Blind spot
  - Daily presence tip
  - Phrase to own (a specific phrase for today)
- Cached 30 days in `date_prep` sessions as `type: 'zodiac_v1'`
- If no DOB set: shows CTA to add in Settings

### 5.8 Settings (`/settings`)
- **Account section:** signed-in email
- **Identity section:** DOB + place of birth (for zodiac)
- **Plan section:** current status, renewal date
- **Manage Plan (hidden):** collapsible accordion → type "cancel" to confirm → cancel subscription

### 5.9 Date Prep (`/date-prep`)
- Form: about me (communication style, nervousness, past challenge, personality), about them (interests, vibe, profession), occasion (type, location, time)
- Claude output: what to wear, conversation starters (5), body language tips, nervousness strategy, things to avoid, how to open

### 5.10 Chat Coach (`/chat-coach`)
- Paste DM conversation + set intention (keep fun / build connection / romantic escalate / get a date / re-engage)
- Claude analyzes: your personality, their personality, interest level (0–100), 3 reply options with reasoning

### 5.11 Roleplay (`/roleplay`)
- 5 scenarios: café, gym, class, DM→IRL, house party
- Claude plays realistic character, responds in-character
- After each message: JSON coaching block with confidence/warmth/naturalness scores + 1 sentence of coaching

### 5.12 Progress (`/progress`)
- Charts: appearance score over time, voice score over time, social score over time
- Streak visualization

### 5.13 Weekly Report (`/report`)
- Claude generates: coach summary, top improvement, focus area for next week
- Based on week's session averages vs previous week

---

## 6. Payments — Razorpay Subscriptions

### Flow
1. User lands on `/trial` after onboarding
2. `TrialCheckout.tsx` shows: "3 days free → ₹79/week auto" timeline
3. User clicks → creates Razorpay subscription via `/api/payment/create-subscription`
4. Plan: ₹79/week (7900 paise), `start_at = now + 3 days`
5. Razorpay checkout opens → user sets up UPI AutoPay (no charge today)
6. On success: HMAC verified via `/api/payment/verify-subscription` → sets `subscription_status: 'trial'`
7. Webhook at `/api/payment/webhook`:
   - `subscription.charged` → `status: 'active'`
   - `subscription.authenticated` → `status: 'trial'` (backup)
   - `subscription.halted/cancelled/completed` → `status: 'expired'`

### Key details
- Plan ID cached as env var `RAZORPAY_PLAN_ID` (logged on first creation)
- `trial_started_at` = timestamp of mandate authorization (not onboarding)
- Trial = 3 days from `trial_started_at`
- `razorpay_subscription_id` stored for cancel API

### Paywall gate (in `layout.tsx`)
- Currently **DISABLED** for testing (one commented line)
- Re-enable: uncomment `if (!hasActiveAccess(profile)) redirect('/trial');`
- `hasActiveAccess()` logic:
  - `active` → check `subscription_ends_at > now`
  - `trial` → if no `trial_started_at`, grant access; else check 3-day window
  - All else → block

### Cancel flow
- Settings → Manage Plan → type "cancel" → confirm
- Calls `/api/payment/cancel-subscription` → Razorpay cancel (immediate) → DB sets `expired`

---

## 7. Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=                    # Gemini (currently unused — quota blown on free tier)

# Payments (LIVE keys)
RAZORPAY_KEY_ID=rzp_live_T1St5zZyIwo4Zy
RAZORPAY_KEY_SECRET=L8iRxTiyEGMiwwrs7VTt347Z
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_T1St5zZyIwo4Zy
RAZORPAY_WEBHOOK_SECRET=
RAZORPAY_PLAN_ID=                     # Set after first successful subscription creation

# HeyGen
HEYGEN_API_KEY=
```

---

## 8. Claude Prompts Architecture (`lib/claude/prompts.ts`)

### System prompts (exported constants)
- `APPEARANCE_SYSTEM_PROMPT` — celebrity stylist + image consultant
- `VOICE_SYSTEM_PROMPT` — no-nonsense vocal coach
- `DATE_PREP_SYSTEM_PROMPT` — dating + social confidence coach
- `CHAT_COACH_SYSTEM_PROMPT` — psychology + communication expert
- `ROLEPLAY_SYSTEM_PROMPT` — realistic character simulator with coaching JSON
- `OUTFIT_BUILDER_SYSTEM_PROMPT` — personal stylist
- `PRE_DATE_CHECKLIST_SYSTEM_PROMPT` — pre-date ritual coach
- `WEEKLY_REPORT_SYSTEM_PROMPT` — weekly performance coach
- `DAILY_TIPS_SYSTEM_PROMPT` — daily tip generator (phrase/aura/dating)

### Key prompt builders
- `buildAppearancePrompt(profile, objective?)` — includes age-based hygiene notes for 35+, objective context (date/interview/general)
- `buildVoicePrompt(data, profile?, objective?)` — includes objective context
- `buildDailyTipsPrompt(profile)` — includes age, city, personality, goals
- `buildDailyTipsPrompt` produces phrase tips with exact "Instead of X, say Y" format

### Objective types (`ScanObjective`)
- `'date'` → warmth, attractiveness, approachability focus
- `'interview'` → professionalism, composure, credibility focus
- `'general'` → balanced presence improvement

---

## 9. Scoring System (`lib/scoring/presenceScore.ts`)

- `scoreAppearance(result)` → 0–100 weighted from expression, posture, grooming adherence
- `scoreVoice(result)` → 0–100 weighted from clarity, filler count, pace
- `compositeScore(appearance, voice, social)` → weighted average
- Used for dashboard rings and progress tracking

---

## 10. Known Issues & Workarounds

### Active issues
| Issue | Status | Workaround |
|---|---|---|
| HeyGen talking photo upload failing | Being debugged (MIME fix applied) | Retry button uses `?force=1` to bypass cache |
| Gemini image generation (style profile) | Broken — free tier quota exhausted | Replaced with HeyGen avatar video in Style Profile |
| Zodiac not showing | Column `date_of_birth` may not exist yet | Run SQL migration below |

### Required SQL migrations (run in Supabase SQL editor)
```sql
-- Razorpay subscription ID column
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT;

-- Zodiac / identity columns
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS place_of_birth TEXT;
```

### Performance indexes
```sql
-- analysis_sessions composite index
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_user_type_date
  ON public.analysis_sessions (user_id, session_type, created_at DESC);

-- daily_tips index
CREATE INDEX IF NOT EXISTS idx_daily_tips_user_date
  ON public.daily_tips (user_id, date);
```

### Admin SQL — reset user subscription for testing
```sql
UPDATE public.user_profiles
SET subscription_status = 'none',
    trial_started_at = NULL,
    razorpay_subscription_id = NULL,
    subscription_ends_at = NULL
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'vineetee.mmmec@gmail.com');
```

---

## 11. Razorpay Webhook Setup
- **URL:** `https://mypresence.in/api/payment/webhook`
- **Events to subscribe:**
  - `subscription.authenticated`
  - `subscription.charged`
  - `subscription.halted`
  - `subscription.cancelled`
  - `subscription.completed`
- Set `RAZORPAY_WEBHOOK_SECRET` env var to the secret from Razorpay dashboard

---

## 12. Deployment (Vercel)

- Repo: `vineet3489/presence-ai` on GitHub
- Auto-deploys on push to `main`
- After adding/changing env vars: must trigger a manual redeploy
- Function timeout: default 10s (Vercel free); avatar generation is long-running but client polls separately

---

## 13. Features Roadmap (Not Yet Built)

### Planned
- **BMI tracking** — height + weight input → BMI-based fitness recommendations in coaching
- **Progress photos** — compare face scan photos week over week
- **Phrase practice** — interactive drills for voice improvement
- **Community** — leaderboard by city, share score card
- **WhatsApp reminders** — daily tip via WhatsApp Business API

### Partially started / broken
- **Gemini style image** — `/api/style-profile/generate-image/route.ts` exists but Gemini quota exhausted; needs paid key or alternative (DALL-E 3, Stable Diffusion)
- **Outfit builder** — API exists at `/api/outfit-builder` but no UI page yet
- **Pre-date checklist** — API at `/api/pre-date-checklist` but UI incomplete

---

## 14. Logo & Branding

- **Logo:** SVG person silhouette (head circle + shoulder arc) inside violet aura rings
- **Colors:** `#c4b5fd → #8b5cf6 → #5b21b6` (violet gradient)
- **Files:** `public/presence-logo.svg`, `app/icon.svg`, `components/ui/PresenceLogo.tsx`
- **Meta Pixel:** `2056835818377240` (in `app/layout.tsx`)

---

## 15. Development Commands

```bash
# Setup
cd presence-ai
npm install
cp .env.example .env.local   # fill in all vars

# Run dev
npm run dev                   # Turbopack, http://localhost:3000

# Type check
npx tsc --noEmit

# Deploy
git push origin main          # Vercel auto-deploys
```

---

## 16. Re-enabling Paywall (when ready to go live)

In `app/(dashboard)/layout.tsx`, uncomment this line:
```ts
if (!hasActiveAccess(profile)) redirect('/trial');
```

Also ensure:
1. `RAZORPAY_PLAN_ID` env var is set (check Vercel logs after first subscription)
2. Webhook is configured in Razorpay dashboard
3. `RAZORPAY_WEBHOOK_SECRET` env var is set
4. Run the Supabase SQL migrations for the new columns
