export default function Loading() {
  return (
    <div className="p-6 animate-pulse">
      <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
      <div className="space-y-2">
        <div className="h-4 w-64 bg-gray-200 rounded" />
        <div className="h-4 w-56 bg-gray-200 rounded" />
        <div className="h-4 w-48 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
