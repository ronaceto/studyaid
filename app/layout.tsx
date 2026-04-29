import './globals.css';
import type { Metadata } from 'next';

import { getServerSession } from 'next-auth';
import { SessionProvider } from '@/components/SessionProvider';
import { Navigation } from '@/components/Navigation';
import Link from "next/link";


export const metadata: Metadata = {
  title: 'StudyAid4U',
  description: 'AI Study Helper',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  if (process.env.DATABASE_URL) {
    try {
      const { authOptions } = await import('@/lib/auth');
      session = await getServerSession(authOptions);
    } catch (error) {
      console.error('Session initialization failed:', error);
      session = null;
    }
  }

 return (
  <html lang="en">
    <body className="antialiased">
      <SessionProvider session={session}>
        <Navigation />

        {/* 👇 Add this small header bar */}
        <header className="p-4 border-b flex gap-4 bg-gray-50">
          <Link href="/">Home</Link>
          <Link href="/quick-quiz">Quick Quiz</Link>
        </header>

        {children}
      </SessionProvider>
    </body>
  </html>
  );
}
