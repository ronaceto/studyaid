import Link from 'next/link';

export default function TutorHintPage() {
  return (
    <main className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Tutor Hint</h1>
      <p className="text-muted-foreground">
        UI scaffold for the <code>/tutor/hint</code> route. This prevents 404s and provides a stable anchor for future step-specific UX.
      </p>
      <Link className="underline" href="/tutor">Back to Tutor Flow</Link>
    </main>
  );
}
