import { AlertTriangle, Check, Info } from 'lucide-react';

const MAP = {
  verified: { label: 'Consistent', cls: 'bg-verified-soft text-verified border-verified-line', Icon: Check },
  review: { label: 'Review', cls: 'bg-review-soft text-review border-review-line', Icon: AlertTriangle },
  information: { label: 'More information needed', cls: 'bg-accent-soft text-accent border-accent-line', Icon: Info },
};

export default function StatusBadge({ status = 'information', compact = false }) {
  const { label, cls, Icon } = MAP[status] ?? MAP.information;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-medium ${compact ? 'text-[12px]' : 'text-[13px]'} ${cls}`}>
      <Icon size={12} strokeWidth={2.6} aria-hidden="true" />
      {label}
    </span>
  );
}
