import { formatCurrency, formatDate } from '../../lib/format.js';

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-[12px] text-slate-muted">{label}</p>
      <p className="tnum mt-1 text-lg font-semibold text-ink">
        {value}
      </p>
    </div>
  );
}

export default function BillSummary({ analysis }) {
  const s = analysis.summaryData ?? {};

  return (
    <section
      className="card px-5 py-5 sm:px-6"
      aria-label="Bill summary"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">
            {analysis.hospital ?? 'Hospital'}
          </h2>

          <p className="mt-0.5 text-[13px] text-slate-muted">
            {analysis.billReference ?? '—'} ·{' '}
            {formatDate(analysis.admittedOn)} to{' '}
            {formatDate(analysis.dischargedOn)}
          </p>
        </div>

        {analysis.payer ? (
          <p className="text-[13px] text-slate-muted">
            {analysis.payer}
          </p>
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-4">
        <Stat
          label="Total billed"
          value={formatCurrency(s.total)}
        />

        <Stat
          label="Consistent with documents"
          value={formatCurrency(s.verifiedAmount)}
        />

        <Stat
          label="May need clarification"
          value={formatCurrency(s.underReviewAmount)}
        />

        <Stat
          label="Charges checked"
          value={s.chargeCount ?? '—'}
        />
      </div>
    </section>
  );
}