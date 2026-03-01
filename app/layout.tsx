import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PresenceAI — Your Personal AI Presence Coach',
  description: 'AI-powered coaching for appearance, voice, and social confidence. Look better, speak better, show up better.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
