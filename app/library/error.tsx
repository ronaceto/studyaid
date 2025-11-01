"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-2">Something went wrong loading the library.</h2>
      <pre className="text-sm opacity-80 mb-4 whitespace-pre-wrap">{error.message}</pre>
      <button onClick={reset} className="px-3 py-2 rounded bg-black text-white">Try again</button>
    </div>
  );
}
