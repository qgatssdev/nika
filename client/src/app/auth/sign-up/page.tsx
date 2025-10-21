import SignUpView from './components/signupView';
import { generateMetadata } from '@/lib/generate-metadata';
import { Suspense } from 'react';

export const metadata = generateMetadata({
  title: 'Sign Up | Nika',
  description: 'Create your Nika account',
});

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpView />
    </Suspense>
  );
}
