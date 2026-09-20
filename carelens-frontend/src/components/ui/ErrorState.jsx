import { AlertCircle } from 'lucide-react';
import Button from './Button.jsx';

export default function ErrorState({ title, description, onRetry }) {
  return (
    <div role="alert" className="card flex flex-col items-center border-alert-line bg-alert-soft px-6 py-10 text-center">
      <AlertCircle size={26} strokeWidth={1.8} className="text-alert" aria-hidden="true" />
      <h3 className="mt-3 text-[15px] font-semibold text-ink">{title}</h3>
      {description ? <p className="mt-1 max-w-prose text-sm text-slate-muted">{description}</p> : null}
      {onRetry ? (
        <Button className="mt-4" variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
