import React from 'react';
import DashboardView from './components/dashboardView';
import { generateMetadata } from '@/lib/generate-metadata';

export const metadata = generateMetadata({
  title: 'Dashboard | Nika',
  description: 'Dashboard page of Nika',
});

const Dashboard = () => {
  return <DashboardView />;
};

export default Dashboard;
