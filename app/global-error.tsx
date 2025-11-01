"use client";
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body className="p-6">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <pre className="mt-2 text-sm opacity-80 whitespace-pre-wrap">{error.message}</pre>
        <button className="mt-4 px-3 py-2 rounded bg-black text-white" onClick={reset}>Try again</button>
      </body>
    </html>
  );
}
