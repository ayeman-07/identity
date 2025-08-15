import { redirect } from 'next/navigation';

// Server Component: immediately redirect /clinic -> /clinic/dashboard
export default function ClinicRoot() {
  redirect('/clinic/dashboard');
}
