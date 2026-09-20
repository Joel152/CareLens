import { AlertTriangle, CheckCircle2, FileSearch } from 'lucide-react';

import { formatCurrency } from '../../lib/format.js';
import Button from '../ui/Button.jsx';

function getValidationForCharge(charge, validationDiscrepancies) {
  if (!Array.isArray(validationDiscrepancies)) {
    return null;
  }

  return (
    validationDiscrepancies.find((discrepancy) => {
      if (
        discrepancy.type === 'ITEM_ARITHMETIC_MISMATCH' &&
        discrepancy.item
      ) {
        return (
          discrepancy.item.description === charge.description
        );
      }

      if (
        discrepancy.description &&
        charge.description
      ) {
        return discrepancy.description
          .toLowerCase()
          .includes(charge.description.toLowerCase());
      }

      return false;
    }) ?? null
  );
}

function getAiDiscrepancyForCharge(charge, discrepancies) {
  if (!Array.isArray(discrepancies)) {
    return null;
  }

  return (
    discrepancies.find((discrepancy) => {
      const text = [
        discrepancy.title,
        discrepancy.description,
        discrepancy.type,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const description =
        charge.description?.toLowerCase() ?? '';

      const tariffCode =
        charge.tariffCode?.toLowerCase() ?? '';

      return (
        (description && text.includes(description)) ||
        (tariffCode && text.includes(tariffCode))
      );
    }) ?? null
  );
}

function Status({ validationIssue, aiDiscrepancy }) {
  if (validationIssue) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-review">
        <AlertTriangle
          size={14}
          strokeWidth={2.2}
          aria-hidden="true"
        />
        Arithmetic review
      </span>
    );
  }

  if (aiDiscrepancy) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-review">
        <AlertTriangle
          size={14}
          strokeWidth={2.2}
          aria-hidden="true"
        />
        Potential discrepancy
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-verified">
      <CheckCircle2
        size={14}
        strokeWidth={2.2}
        aria-hidden="true"
      />
      Checked
    </span>
  );
}

export default function ChargeTable({
  analysis,
  onInspect,
}) {
  const charges = analysis?.bill?.items ?? [];

  const validationDiscrepancies =
    analysis?.validation?.discrepancies ?? [];

  const aiDiscrepancies =
    analysis?.discrepancies ?? [];

  if (!charges.length) {
    return (
      <section aria-labelledby="charges-heading">
        <h2
          id="charges-heading"
          className="mb-3 text-sm font-semibold text-ink"
        >
          All charges
        </h2>

        <div className="card px-5 py-6">
          <p className="text-sm text-slate-muted">
            No itemized charges were extracted from this bill.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="charges-heading">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2
          id="charges-heading"
          className="text-sm font-semibold text-ink"
        >
          All charges
        </h2>

        <p className="text-[13px] text-slate-muted">
          {charges.length} charge
          {charges.length === 1 ? '' : 's'} checked
        </p>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-slate-line text-[12px] text-slate-muted">
            <tr>
              <th className="px-4 py-3 font-medium">
                Charge
              </th>

              <th className="px-4 py-3 font-medium">
                Qty
              </th>

              <th className="px-4 py-3 text-right font-medium">
                Unit price
              </th>

              <th className="px-4 py-3 text-right font-medium">
                Amount
              </th>

              <th className="px-4 py-3 font-medium">
                Status
              </th>

              <th className="px-4 py-3" />
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-line">
            {charges.map((charge, index) => {
              const validationIssue =
                getValidationForCharge(
                  charge,
                  validationDiscrepancies
                );

              const aiDiscrepancy =
                getAiDiscrepancyForCharge(
                  charge,
                  aiDiscrepancies
                );

              const discrepancy =
                validationIssue ??
                aiDiscrepancy;

              const quantity =
                charge.quantity ?? 1;

              const unitPrice =
                charge.unitPrice ??
                charge.rate ??
                0;

              const amount =
                charge.amount ??
                charge.total ??
                0;

              return (
                <tr
                  key={
                    charge.id ??
                    `${charge.description}-${index}`
                  }
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">
                      {charge.description ??
                        'Unnamed charge'}
                    </p>

                    {charge.tariffCode ? (
                      <p className="mt-0.5 text-[12px] text-slate-muted">
                        Tariff code: {charge.tariffCode}
                      </p>
                    ) : null}
                  </td>

                  <td className="tnum px-4 py-3 text-slate-muted">
                    {quantity}
                  </td>

                  <td className="tnum px-4 py-3 text-right">
                    {formatCurrency(unitPrice)}
                  </td>

                  <td className="tnum px-4 py-3 text-right font-semibold text-ink">
                    {formatCurrency(amount)}
                  </td>

                  <td className="px-4 py-3">
                    <Status
                      validationIssue={validationIssue}
                      aiDiscrepancy={aiDiscrepancy}
                    />
                  </td>

                  <td className="px-4 py-3 text-right">
                    {discrepancy ? (
                      <Button
                        variant="quiet"
                        size="sm"
                        onClick={() =>
                          onInspect?.(
                            discrepancy.id ??
                              discrepancy.type
                          )
                        }
                      >
                        <FileSearch
                          size={14}
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                        Inspect
                      </Button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}