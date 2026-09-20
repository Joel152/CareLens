export default function DemoBadge({ label = 'Demo mode' }) {
  return (
    <span className="rounded-full border border-accent-line bg-accent-soft px-2.5 py-0.5 text-[12px] font-medium text-accent">
      {label}
    </span>
  );
}
