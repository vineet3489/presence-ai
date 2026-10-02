import type { Metadata } from 'next';
import { ContentPage } from '@/components/marketing/SiteChrome';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms for using PresenceAI, including the 3-day free trial, ₹79/week subscription, and cancellation.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <ContentPage crumbs={[{ name: 'Terms of service', href: '/terms' }]}>
        <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
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
            body: `After your 3-day free trial, continued access requires a paid subscription (currently ₹79/week, billed weekly until cancelled). You will not be charged if you cancel before the trial ends. Payments are processed by Razorpay. Subscriptions are non-refundable unless required by applicable law. We reserve the right to change pricing with 7 days' notice.`,
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

    </ContentPage>
  );
}
