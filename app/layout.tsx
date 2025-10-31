import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SessionProvider } from '@/components/SessionProvider';
import { Navigation } from '@/components/Navigation';
import Link from "next/link";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StudyRight - WCMS Edition',
  description: 'Socratic tutoring for 8th-grade students',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

 return (
  <html lang="en">
    <body className={inter.className}>
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
