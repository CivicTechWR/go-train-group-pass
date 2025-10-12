import { notFound } from 'next/navigation';
import { TodayDemoClient } from './TodayDemoClient';

export default function TodayDemoPage() {
  if (process.env.NEXT_PUBLIC_ENABLE_DEMO_PAGE !== 'true') {
    notFound();
  }

  return <TodayDemoClient />;
}
