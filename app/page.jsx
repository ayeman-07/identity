'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Spotlight from '@/components/Spotlight';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background grid/gradient are defined globally; add a soft vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_60%)]" />

      {/* Hero */}
      <header className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <Spotlight />
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: copy & CTAs */}
          <div className="lg:col-span-6 text-left">
            <span className="inline-block px-3 py-1 rounded-full border border-white/15 bg-white/5 text-xs text-gray-300 tracking-wide mb-4">
              The digital dental collaboration platform
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight mb-4">
              <span className="tx-gradient">i-Dentity</span>
            </h1>
            <p className="text-gray-300 text-lg sm:text-xl max-w-xl">
              Connect clinics and labs, share 3D files, track case progress, and deliver with confidence — on a modern, secure, and beautiful workspace.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/login" className="btn-gradient px-6 py-3 text-base">Get Started</Link>
              <Link href="/register" className="btn-ghost px-6 py-3 hover:bg-white/5">Create Account</Link>
              <Link href="/map" className="px-6 py-3 rounded-lg border border-white/15 bg-white/5 text-gray-200 hover:bg-white/10 transition">Explore Map</Link>
            </div>

            {/* Hero stats */}
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg">
              {[{k:'Clinics',v:'500+'},{k:'Partner Labs',v:'120+'},{k:'Files',v:'50k+'}].map((s)=> (
                <div key={s.k} className="glass-card p-5 hover:bg-white/10 transition">
                  <div className="text-2xl font-semibold text-gray-100">{s.v}</div>
                  <div className="text-xs uppercase tracking-wide text-gray-400">{s.k}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: illustration */}
          <div className="lg:col-span-6">
            <div className="relative">
              <div className="absolute -inset-4 rounded-2xl bg-[conic-gradient(from_180deg_at_50%_50%,rgba(99,102,241,0.15),transparent_30%)] blur-xl" />
              <div className="relative glass-card p-2 rounded-2xl">
                <Image
                  src="/hero-illustration.svg"
                  alt="Dental collaboration illustration"
                  width={1100}
                  height={760}
                  priority
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold"><span className="tx-gradient">Why i-Dentity</span></h2>
          <p className="text-gray-400 mt-2">A streamlined, secure workflow from upload to delivery.</p>
        </div>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr items-stretch">
          {[
            {
              title:'Seamless Case Workflow',
              desc:'From upload to delivery — statuses, history, and communication in one place.',
              tint:'indigo'
            },
            {
              title:'3D File Friendly',
              desc:'Share and preview STL files with confidence and clarity.',
              tint:'purple'
            },
            {
              title:'Maps, not guesswork',
              desc:'Find and collaborate with nearby labs and clinics using our map view.',
              tint:'blue'
            },
            {
              title:'Real-time Messaging',
              desc:'Keep context with built-in threads directly on each case.',
              tint:'emerald'
            },
            {
              title:'Transparent Progress',
              desc:'Everyone sees what’s next — READY, DISPATCHED, DELIVERED.',
              tint:'amber'
            },
            {
              title:'Secure by Design',
              desc:'Best practices for auth and file handling; your data stays yours.',
              tint:'rose'
            }
          ].map((f) => (
            <div key={f.title} className="glass-card p-6 h-full group transition transform hover:-translate-y-1">
              <div className="mb-4 inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/15 bg-white/5 text-gray-200 group-hover:bg-white/10">
                <span>★</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-100 mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="glass-card p-6 h-full">
            <h3 className="text-xl font-semibold text-gray-100 mb-2">For Clinics</h3>
            <p className="text-gray-400 mb-4">Upload cases, choose labs, track progress, and get great outcomes for your patients.</p>
            <div className="flex gap-3">
              <Link href="/register" className="btn-gradient px-5 py-2">Join as Clinic</Link>
              <Link href="/login" className="btn-ghost px-5 py-2 hover:bg-white/5">Sign In</Link>
            </div>
          </div>
          <div className="glass-card p-6 h-full">
            <h3 className="text-xl font-semibold text-gray-100 mb-2">For Labs</h3>
            <p className="text-gray-400 mb-4">Receive jobs, message clinics, and streamline production with status-driven workflows.</p>
            <div className="flex gap-3">
              <Link href="/register" className="btn-gradient px-5 py-2">Join as Lab</Link>
              <Link href="/login" className="btn-ghost px-5 py-2 hover:bg-white/5">Sign In</Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8"><span className="tx-gradient">How it works</span></h2>
        <div className="relative">
          <div className="hidden md:block absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-white/10" />
          <ol className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {[
              { n:1, t:'Create account', d:'Sign up as a clinic or lab.' },
              { n:2, t:'Upload & assign', d:'Clinics create cases and pick labs.' },
              { n:3, t:'Collaborate', d:'Share files, message, and update status.' },
              { n:4, t:'Deliver', d:'Track dispatch and delivery to completion.' },
            ].map(step => (
              <li key={step.n} className="glass-card p-6 relative pt-10 text-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-sm text-gray-200 z-10">{step.n}</div>
                <div className="text-gray-100 font-semibold">{step.t}</div>
                <div className="text-gray-400 text-sm mt-1">{step.d}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10"><span className="tx-gradient">Loved by clinics and labs</span></h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr items-stretch">
          {[
            {
              name:'Dr. A. Mehta', role:'Clinic Owner', quote:'Switching to i-Dentity elevated our lab communication. Turnaround is faster and clearer.'
            },
            {
              name:'SmileCraft Labs', role:'Dental Lab', quote:'Statuses + messaging in one view cut our back-and-forth in half.'
            },
            {
              name:'Dr. R. Singh', role:'Orthodontist', quote:'Patients notice the difference. Our team loves the clean workflow.'
            }
          ].map((t, idx) => (
      <figure key={t.name} className="glass-card p-6 hover:bg-white/10 transition h-full">
              <blockquote className="text-gray-200">“{t.quote}”</blockquote>
              <figcaption className="mt-4 text-sm text-gray-400">
                <span className="font-medium text-gray-200">{t.name}</span> · {t.role}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="glass-card p-8 text-center">
          <h3 className="text-2xl sm:text-3xl font-bold mb-3">
            <span className="tx-gradient">Ready to get started?</span>
          </h3>
          <p className="text-gray-300 mb-6">Create your account in minutes and start collaborating today.</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register" className="btn-gradient px-6 py-3">Create Account</Link>
            <Link href="/login" className="btn-ghost px-6 py-3 hover:bg-white/5">Sign In</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-gray-400 text-sm">© {new Date().getFullYear()} i-Dentity. All rights reserved.</div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/login" className="text-gray-300 hover:text-white">Login</Link>
            <Link href="/register" className="text-gray-300 hover:text-white">Register</Link>
            <Link href="/map" className="text-gray-300 hover:text-white">Map</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
