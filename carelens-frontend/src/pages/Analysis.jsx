import { useEffect, useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, MessagesSquare } from 'lucide-react';

import AppLayout from '../components/layout/AppLayout.jsx';
import PageContainer from '../components/layout/PageContainer.jsx';

import BillSummary from '../components/analysis/BillSummary.jsx';
import ChargeTable from '../components/analysis/ChargeTable.jsx';
import DiscrepancyCard from '../components/analysis/DiscrepancyCard.jsx';
import EvidencePanel from '../components/analysis/EvidencePanel.jsx';

import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

import { loadAnalysis } from '../lib/store.js';

export default function Analysis() {
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [dismissed, setDismissed] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [evidence, setEvidence] = useState(null);
  const [evidenceBilled, setEvidenceBilled] = useState(null);

  useEffect(() => {
    const storedAnalysis = loadAnalysis();

    if (storedAnalysis) {
      setAnalysis(storedAnalysis);
    }
  }, []);

  function openEvidence(
    evidenceItem,
    billedValue = null
  ) {
    setEvidence(evidenceItem ?? null);
    setEvidenceBilled(billedValue);
    setPanelOpen(true);
  }

  function inspectDiscrepancy(discrepancyId) {
    const found = analysis?.discrepancies?.find(
      (discrepancy) =>
        discrepancy.id === discrepancyId
    );

    if (!found) {
      return;
    }

    const evidenceItem =
      found.evidence?.[0] ?? null;

    openEvidence(
      evidenceItem,
      found.billedValue
    );
  }

  const visibleDiscrepancies =
    (analysis?.discrepancies ?? []).filter(
      (discrepancy) =>
        !dismissed.includes(discrepancy.id)
    );

  return (
    <AppLayout
      title="Bill analysis"
      description={
        analysis?.knowledgeBase ??
        'Review your bill and supporting evidence.'
      }
      actions={
        <Button
          as={Link}
          to="/chat"
          size="sm"
        >
          <MessagesSquare
            size={15}
            strokeWidth={2}
            aria-hidden="true"
          />

          Ask CareLens
        </Button>
      }
    >
      <PageContainer width="wide">
        {!analysis ? (
          <EmptyState
            title="No analysis available"
            description="Upload a medical bill first to generate a CareLens analysis."
            action={
              <Button as={Link} to="/upload">
                Upload a bill
              </Button>
            }
          />
        ) : (
          <div className="space-y-6">
            <BillSummary
              analysis={analysis}
            />

            <section
              aria-labelledby="discrepancies-heading"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2
                  id="discrepancies-heading"
                  className="text-sm font-semibold text-ink"
                >
                  Potential discrepancies
                </h2>

                <p className="text-[13px] text-slate-muted">
                  {visibleDiscrepancies.length}{' '}
                  open
                </p>
              </div>

              {visibleDiscrepancies.length ? (
                <div className="space-y-4">
                  {visibleDiscrepancies.map(
                    (discrepancy, index) => (
                      <DiscrepancyCard
                        key={
                          discrepancy.id ??
                          `${discrepancy.type}-${index}`
                        }
                        discrepancy={discrepancy}
                        onViewEvidence={() =>
                          inspectDiscrepancy(
                            discrepancy.id
                          )
                        }
                        onDismiss={(id) =>
                          setDismissed((prev) =>
                            prev.includes(id)
                              ? prev
                              : [...prev, id]
                          )
                        }
                        onAsk={() =>
                          navigate('/chat')
                        }
                      />
                    )
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={CheckCircle2}
                  title="Nothing flagged for review"
                  description="Based on the available documentation, no potential discrepancy was identified."
                />
              )}
            </section>

            {/* ALL CHARGES */}
            <ChargeTable
              analysis={analysis}
              onInspect={inspectDiscrepancy}
            />

            {analysis.questionsToAsk?.length ? (
              <section className="card px-5 py-5 sm:px-6">
                <h2 className="text-[15px] font-semibold text-ink">
                  Questions to ask the hospital
                </h2>

                <ul className="mt-3 space-y-2">
                  {analysis.questionsToAsk.map(
                    (question, index) => (
                      <li
                        key={index}
                        className="text-sm leading-relaxed text-slate-muted"
                      >
                        {question}
                      </li>
                    )
                  )}
                </ul>
              </section>
            ) : null}

            <section className="card flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-6">
              <div>
                <h2 className="text-[15px] font-semibold text-ink">
                  Ask CareLens
                </h2>

                <p className="mt-1 max-w-prose text-sm leading-relaxed text-slate-muted">
                  What would you like to understand
                  about this bill?
                </p>
              </div>

              <Button
                as={Link}
                to="/chat"
              >
                Ask CareLens
              </Button>
            </section>
          </div>
        )}
      </PageContainer>

      <EvidencePanel
        open={panelOpen}
        onClose={() =>
          setPanelOpen(false)
        }
        evidence={evidence}
        billedValue={evidenceBilled}
        loading={false}
        error={
          panelOpen && !evidence
        }
      />
    </AppLayout>
  );
}