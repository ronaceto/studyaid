'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { BookOpen, Home, BarChart, LogOut } from 'lucide-react';

export function Navigation() {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  const isParent = session.user?.role === 'PARENT';

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href={isParent ? '/parent' : '/student'} className="flex items-center gap-2">
          <div className="text-2xl font-bold text-primary">StudyRight</div>
          <div className="text-xs text-muted-foreground">WCMS Edition</div>
        </Link>

        <div className="flex items-center gap-2">
          {!isParent && (
            <>
              <Link href="/student">
                <Button variant="ghost" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/library">
                <Button variant="ghost" size="sm">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Library
                </Button>
              </Link>
            </>
          )}

          {isParent && (
            <Link href="/parent">
              <Button variant="ghost" size="sm">
                <BarChart className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          )}

          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
}
