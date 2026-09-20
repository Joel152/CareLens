import {
  AlertTriangle,
  FileSearch,
  MessagesSquare,
} from 'lucide-react';

import Button from '../ui/Button.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';

function EvidenceSummary({ evidence }) {
  if (!evidence) return null;

  return (
    <div className="rounded-md border border-slate-line bg-slate-soft px-4 py-3">
      <p className="text-[12px] text-slate-muted">
        Supporting document
      </p>

      <p className="mt-1 text-[13px] font-semibold text-ink">
        {evidence.document ?? 'Supporting document'}
      </p>

      {evidence.page ? (
        <p className="mt-0.5 text-[12px] text-slate-muted">
          Page {evidence.page}
        </p>
      ) : null}
    </div>
  );
}

export default function DiscrepancyCard({
  discrepancy,
  onViewEvidence,
  onAsk,
  onDismiss,
}) {
  const evidence = discrepancy?.evidence?.[0] ?? null;

  return (
    <article className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-review-line bg-review-soft px-5 py-3">
        <div className="flex items-center gap-2.5">
          <AlertTriangle
            size={17}
            strokeWidth={2.2}
            className="text-review"
            aria-hidden="true"
          />

          <h3 className="text-sm font-semibold text-ink">
            {discrepancy.title ?? 'Potential discrepancy'}
          </h3>
        </div>

        <StatusBadge
          status="review"
          compact
        />
      </div>

      <div className="px-5 py-5">
        {discrepancy.description ? (
          <p className="max-w-prose text-sm leading-relaxed text-slate-muted">
            {discrepancy.description}
          </p>
        ) : null}

        {discrepancy.whyItMatters ? (
          <div className="mt-5">
            <h4 className="text-[13px] font-semibold text-ink">
              Why this was flagged
            </h4>

            <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-slate-muted">
              {discrepancy.whyItMatters}
            </p>
          </div>
        ) : null}

        {discrepancy.suggestedAction ? (
          <div className="mt-5">
            <h4 className="text-[13px] font-semibold text-ink">
              Suggested next step
            </h4>

            <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-slate-muted">
              {discrepancy.suggestedAction}
            </p>
          </div>
        ) : null}

        {evidence ? (
          <div className="mt-5">
            <EvidenceSummary evidence={evidence} />
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              onViewEvidence?.(discrepancy.id)
            }
            disabled={!evidence}
          >
            <FileSearch
              size={15}
              strokeWidth={2}
              aria-hidden="true"
            />
            View evidence
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              onAsk?.(discrepancy)
            }
          >
            <MessagesSquare
              size={15}
              strokeWidth={2}
              aria-hidden="true"
            />
            Ask CareLens
          </Button>

          <Button
            variant="quiet"
            size="sm"
            onClick={() =>
              onDismiss?.(discrepancy.id)
            }
          >
            Dismiss
          </Button>
        </div>
      </div>
    </article>
  );
}