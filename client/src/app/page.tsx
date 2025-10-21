import LandingView from '../components/landingView';
import { generateMetadata } from '@/lib/generate-metadata';

export const metadata = generateMetadata({
  title: 'Nika - DeFi your way.',
  description:
    'Nika unifies your portfolio across every chain with rebalancing, AI guidance, and built-in risk management. Trade smarter with real-time PnL, auto-compounding, and total self-custody. No seed phrases. No endless tabs. No stress.',
});

export default function Home() {
  return <LandingView />;
}
