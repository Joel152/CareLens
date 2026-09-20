import { useEffect, useRef } from 'react';

import { FileText, X } from 'lucide-react';

import Button from '../ui/Button.jsx';
import ErrorState from '../ui/ErrorState.jsx';
import { SkeletonLine } from '../ui/Skeleton.jsx';

export default function EvidencePanel({
  open,
  onClose,
  evidence,
  billedValue,
  loading,
  error,
}) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    closeRef.current?.focus();

    const onKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener(
      'keydown',
      onKey
    );

    return () =>
      document.removeEventListener(
        'keydown',
        onKey
      );
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="evidence-heading"
    >
      <div
        className="absolute inset-0 bg-ink-900/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative flex h-full w-full max-w-lg flex-col bg-white shadow-panel">
        <div className="flex items-start justify-between gap-3 border-b border-slate-line px-5 py-4">
          <div>
            <h2
              id="evidence-heading"
              className="text-[15px] font-semibold text-ink"
            >
              Evidence used by CareLens
            </h2>

            <p className="mt-0.5 text-[13px] text-slate-muted">
              Supporting documentation retrieved from the CareLens knowledge base
            </p>
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-muted hover:bg-slate-soft hover:text-ink"
            aria-label="Close evidence"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {loading ? (
            <div className="space-y-3">
              <SkeletonLine className="h-4 w-1/2" />
              <SkeletonLine className="h-24 w-full" />
              <SkeletonLine className="h-4 w-2/3" />
            </div>
          ) : error ? (
            <ErrorState
              title="Evidence unavailable"
              description="We couldn't find enough supporting documentation for this discrepancy."
            />
          ) : evidence ? (
            <>
              {billedValue !== null &&
              billedValue !== undefined ? (
                <section>
                  <p className="label">
                    Your bill
                  </p>

                  <div className="mt-2 rounded-md border border-review-line bg-review-soft px-4 py-3">
                    <p className="tnum text-[15px] font-semibold text-ink">
                      {billedValue}
                    </p>

                    <p className="mt-1 text-[12px] text-slate-muted">
                      Extracted from the document you uploaded
                    </p>
                  </div>
                </section>
              ) : null}

              <section>
                <p className="label">
                  Source evidence
                </p>

                <div className="mt-2 rounded-md border border-slate-line bg-slate-soft p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-accent">
                      <FileText
                        size={17}
                        strokeWidth={1.9}
                        aria-hidden="true"
                      />
                    </span>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">
                        {evidence.document ??
                          'Supporting document'}
                      </p>

                      {evidence.page ? (
                        <p className="mt-0.5 text-[13px] text-slate-muted">
                          Page {evidence.page}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <p className="mt-4 text-[12px] text-slate-muted">
                    Relevant section
                  </p>

                  <blockquote className="mt-1 border-l-2 border-accent bg-white px-4 py-3 text-sm leading-relaxed text-ink">
                    {evidence.quote ??
                      evidence.content ??
                      'No excerpt available.'}
                  </blockquote>
                </div>
              </section>

              {evidence.score !== null &&
              evidence.score !== undefined ? (
                <section>
                  <p className="text-[12px] text-slate-muted">
                    Retrieval similarity
                  </p>

                  <p className="mt-0.5 text-[13px] font-medium text-ink">
                    {Number(evidence.score).toFixed(3)}
                  </p>
                </section>
              ) : null}

              <p className="text-[13px] leading-relaxed text-slate-muted">
                This evidence shows the documentation retrieved
                by CareLens that was relevant to the analysis. It
                does not by itself establish that a charge was
                incorrect, unlawful, or refundable. Review anything
                unclear with the hospital or insurer.
              </p>
            </>
          ) : null}
        </div>

        <div className="border-t border-slate-line px-5 py-4">
          <Button
            variant="secondary"
            size="sm"
            disabled
          >
            Source document
          </Button>
        </div>
      </div>
    </div>
  );
}