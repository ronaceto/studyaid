import Link from 'next/link';

const steps = [
  { slug: 'hint', title: 'Hint step', description: 'Get a guided hint for a question.' },
  { slug: 'attempt', title: 'Attempt step', description: 'Submit your own answer attempt.' },
  { slug: 'reflection', title: 'Reflection step', description: 'Reflect on what you learned.' },
  { slug: 'reveal', title: 'Reveal step', description: 'Reveal model answer and rationale.' },
];

export default function TutorPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Tutor Flow</h1>
      <p className="text-muted-foreground">
        This page exposes each tutor flow step so navigation and smoke checks have stable routes.
      </p>

      <ul className="grid gap-3">
        {steps.map((step) => (
          <li key={step.slug} className="rounded-lg border p-4">
            <h2 className="font-medium">{step.title}</h2>
            <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
            <Link className="text-sm underline" href={`/tutor/${step.slug}`}>
              Open /tutor/{step.slug}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
