import Link from 'next/link';

export const metadata = { title: 'Terms of Service — PresenceAI' };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-xl font-black gradient-text">PresenceAI</Link>
        <h1 className="text-3xl font-bold text-white mt-8 mb-2">Terms of Service</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: March 2026</p>

        {[
          {
            title: '1. Acceptance of Terms',
            body: `By accessing or using PresenceAI ("Service"), you agree to be bound by these Terms. If you do not agree, do not use the Service. These Terms constitute a legally binding agreement between you and PresenceAI.`,
          },
          {
            title: '2. Description of Service',
            body: `PresenceAI provides AI-powered personal presence coaching through photo analysis, voice coaching, conversation practice, and related features. The Service is offered on a subscription basis after a 48-hour free trial.`,
          },
          {
            title: '3. Account & Eligibility',
            body: `You must be at least 13 years old to use this Service. You are responsible for maintaining the security of your account and for all activities under your account. You agree to provide accurate information during sign-up.`,
          },
          {
            title: '4. Subscription & Payments',
            body: `After your 48-hour free trial, continued access requires a paid subscription (currently ₹99/week). Payments are processed by Razorpay. Subscriptions are non-refundable unless required by applicable law. We reserve the right to change pricing with 7 days' notice.`,
          },
          {
            title: '5. Acceptable Use',
            body: `You agree not to:\n• Use the Service for any unlawful purpose\n• Upload content that is offensive, harmful, or violates third-party rights\n• Attempt to reverse-engineer, hack, or disrupt the Service\n• Misrepresent yourself or impersonate others\n• Use automated tools to abuse the Service`,
          },
          {
            title: '6. AI Coaching Disclaimer',
            body: `PresenceAI provides AI-generated coaching for informational and self-improvement purposes only. It is not a substitute for professional advice (medical, psychological, or otherwise). Results vary and are not guaranteed. Use your own judgment when applying any suggestions.`,
          },
          {
            title: '7. Content Ownership',
            body: `You retain ownership of content you submit. By submitting content, you grant PresenceAI a limited, non-exclusive licence to process it for delivering the Service. We do not use your personal content to train AI models.`,
          },
          {
            title: '8. Limitation of Liability',
            body: `To the maximum extent permitted by law, PresenceAI shall not be liable for indirect, incidental, or consequential damages arising from use of the Service. Our total liability to you shall not exceed the amount you paid us in the 30 days preceding the claim.`,
          },
          {
            title: '9. Termination',
            body: `We may suspend or terminate your account for violation of these Terms. You may cancel your subscription at any time. Upon termination, your access to paid features ends at the conclusion of your current billing period.`,
          },
          {
            title: '10. Governing Law',
            body: `These Terms are governed by the laws of India. Disputes shall be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra.`,
          },
          {
            title: '11. Contact',
            body: `For questions about these Terms, contact: support@mypresence.in`,
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
