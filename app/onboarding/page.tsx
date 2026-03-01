import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PersonalityQuiz } from '@/components/quiz/PersonalityQuiz';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Skip onboarding if already completed
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('onboarding_completed')
    .eq('user_id', user.id)
    .single();

  if (profile?.onboarding_completed) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <span className="text-2xl font-black gradient-text">PresenceAI</span>
          <h1 className="text-3xl font-bold text-white mt-4 mb-2">Let's personalize your coaching</h1>
          <p className="text-slate-400">8 quick questions — takes about 2 minutes</p>
        </div>
        <PersonalityQuiz userId={user.id} />
      </div>
    </div>
  );
}
