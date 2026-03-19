import Link from 'next/link';

export const metadata = { title: 'Privacy Policy — PresenceAI' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-xl font-black gradient-text">PresenceAI</Link>
        <h1 className="text-3xl font-bold text-white mt-8 mb-2">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: March 2026</p>

        {[
          {
            title: '1. Information We Collect',
            body: `We collect your Google account name and email address when you sign in via Google OAuth. We also collect content you voluntarily submit — including photos, voice recordings, and text — to provide our AI coaching services. Usage data such as session activity and scores are stored to personalise your experience.`,
          },
          {
            title: '2. How We Use Your Information',
            body: `Your data is used exclusively to provide and improve PresenceAI's coaching features. Photos and voice recordings are sent to Anthropic's Claude AI for analysis and are not stored beyond your session results. We do not sell your personal information to third parties.`,
          },
          {
            title: '3. Third-Party Services',
            body: `We use the following third-party services:\n• Google (authentication) — https://policies.google.com/privacy\n• Supabase (database & auth) — https://supabase.com/privacy\n• Anthropic Claude (AI analysis) — https://www.anthropic.com/privacy\n• Razorpay (payments) — https://razorpay.com/privacy\n• Vercel (hosting) — https://vercel.com/legal/privacy-policy\n\nEach service processes data per their own privacy policies.`,
          },
          {
            title: '4. Data Storage & Security',
            body: `Your data is stored on Supabase servers with row-level security — only you can access your own data. All connections are encrypted via HTTPS/TLS. We implement industry-standard security measures to protect your information.`,
          },
          {
            title: '5. Data Retention',
            body: `We retain your account data for as long as your account is active. You may request deletion of your account and all associated data by emailing us. Upon deletion, your data is removed from our systems within 30 days.`,
          },
          {
            title: '6. Your Rights',
            body: `You have the right to access, correct, or delete your personal data. You may also withdraw consent at any time by discontinuing use and requesting account deletion. For users in the European Economic Area, additional rights under GDPR apply.`,
          },
          {
            title: '7. Children\'s Privacy',
            body: `PresenceAI is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will delete the information promptly.`,
          },
          {
            title: '8. Changes to This Policy',
            body: `We may update this policy periodically. We will notify users of significant changes via email or an in-app notice. Continued use after changes constitutes acceptance of the updated policy.`,
          },
          {
            title: '9. Contact',
            body: `For privacy-related questions or data requests, contact us at: support@mypresence.in`,
          },
        ].map(({ title, body }) => (
          <div key={title} className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-2">{title}</h2>
            <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{body}</p>
          </div>
        ))}

        <div className="border-t border-slate-800 pt-8 text-center">
          <Link href="/" className="text-violet-400 text-sm hover:underline">← Back to PresenceAI</Link>
        </div>
      </div>
    </div>
  );
}
