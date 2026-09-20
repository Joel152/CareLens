export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="card flex flex-col items-center px-6 py-10 text-center">
      {Icon ? <Icon size={26} strokeWidth={1.8} className="text-verified" aria-hidden="true" /> : null}
      <h3 className="mt-3 text-[15px] font-semibold text-ink">{title}</h3>
      {description ? <p className="mt-1 max-w-prose text-sm text-slate-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
