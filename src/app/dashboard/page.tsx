import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // Redirect to simple dashboard for better UX
  redirect('/dashboard-simple');
}