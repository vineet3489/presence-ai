import { redirect } from 'next/navigation';

// All sign-up is handled via Google OAuth on the login page
export default function SignupPage() {
  redirect('/login');
}
