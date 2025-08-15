import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "i-Dentity - Dental Clinic to Lab Platform",
  description: "Connect dental clinics and labs digitally for seamless case management and 3D file sharing",
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div className="min-h-dvh">
          {children}
        </div>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#0f172a', color: '#e5e7eb', border: '1px solid rgba(148,163,184,0.2)' },
            success: {
              duration: 3000,
              style: {
                background: '#065f46',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#7f1d1d',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
