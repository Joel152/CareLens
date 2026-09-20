export function SkeletonLine({ className = 'h-4 w-full' }) {
  return <div className={`animate-pulse rounded bg-slate-line ${className}`} />;
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="card space-y-3 p-5">
      <SkeletonLine className="h-4 w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} className="h-3 w-full" />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="card space-y-3 p-5">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonLine key={i} className="h-5 w-full" />
      ))}
    </div>
  );
}
