import LoginView from './components/loginView';
import { generateMetadata } from '@/lib/generate-metadata';

export const metadata = generateMetadata({
  title: 'Login | Nika',
  description: 'Login to your Nika account',
});

export default function LoginPage() {
  return <LoginView />;
}
