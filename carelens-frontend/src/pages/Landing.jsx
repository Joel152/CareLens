import { Link } from 'react-router-dom';

import {
  AlertTriangle,
  Check,
  FileSearch,
  FileText,
  Info,
  MessagesSquare,
  ShieldCheck,
  Upload,
} from 'lucide-react';

import Button from '../components/ui/Button.jsx';
import DemoBadge from '../components/ui/DemoBadge.jsx';

import { formatCurrency } from '../lib/format.js';

function Mark({ dark = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="flex h-7 w-7 items-center justify-center rounded-md bg-accent"
      >
        <span className="h-2.5 w-2.5 rounded-full border-2 border-white" />
      </span>

      <span
        className={`text-[15px] font-semibold tracking-tight ${
          dark ? 'text-white' : 'text-ink'
        }`}
      >
        CareLens
      </span>
    </div>
  );
}

/**
 * Hero visual: a fictional medical bill with
 * supporting evidence from the demo knowledge base.
 */
function HeroVisual() {
  return (
    <div className="relative">
      <div className="card p-5">
        <div className="flex items-center justify-between border-b border-slate-line pb-3">
          <div>
            <p className="text-sm font-semibold text-ink">
              Gopal Hospital
            </p>

            <p className="mt-0.5 text-[12px] text-slate-muted">
              GH/IP/2026/04417
            </p>
          </div>

          <DemoBadge label="Demo" />
        </div>

        <ul className="divide-y divide-slate-line text-sm">
          {[
            ['Private room — 3 days', 16500, 'review'],
            ['Consultant visit — 4 visits', 6000, 'review'],
            ['Complete blood count', 900, 'verified'],
            ['Chest radiograph', 600, 'verified'],
          ].map(([label, amount, status]) => (
            <li
              key={label}
              className="flex items-center gap-3 py-2.5"
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  status === 'review'
                    ? 'bg-review-soft text-review'
                    : 'bg-verified-soft text-verified'
                }`}
              >
                {status === 'review' ? (
                  <AlertTriangle
                    size={11}
                    strokeWidth={2.8}
                    aria-hidden="true"
                  />
                ) : (
                  <Check
                    size={11}
                    strokeWidth={3}
                    aria-hidden="true"
                  />
                )}
              </span>

              <span className="min-w-0 flex-1 truncate text-ink">
                {label}
              </span>

              <span className="tnum font-semibold text-ink">
                {formatCurrency(amount)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card mt-3 border-accent-line bg-accent-soft p-4 sm:ml-10">
        <p className="text-[12px] font-medium text-accent">
          Evidence · Master Tariff, page 3
        </p>

        <p className="mt-1.5 text-sm leading-relaxed text-ink">
          Private room — single occupancy with attached sanitation
          and one attendant bed — per day — ₹5,000
        </p>
      </div>
    </div>
  );
}

const STEPS = [
  {
    title: 'Upload your bill',
    body: 'Upload a PDF or image of your medical bill.',
    Icon: Upload,
  },
  {
    title: 'CareLens analyzes it',
    body: 'AI extracts charges, quantities and other billing details from the document.',
    Icon: FileText,
  },
  {
    title: 'Evidence is retrieved',
    body: 'CareLens checks relevant hospital tariffs, policies and available documentation.',
    Icon: FileSearch,
  },
  {
    title: 'Understand your bill',
    body: 'Get a clear explanation and ask follow-up questions.',
    Icon: MessagesSquare,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Mark />

          <nav className="flex items-center gap-2">
            <Button
              as="a"
              href="#how-it-works"
              variant="quiet"
              size="sm"
              className="hidden sm:inline-flex"
            >
              How it works
            </Button>

            <Button
              as={Link}
              to="/dashboard"
              variant="secondary"
              size="sm"
            >
              Open dashboard
            </Button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="border-b border-slate-line bg-slate-soft">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-2 lg:items-center">
            <div>
              <h1 className="max-w-[16ch] text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
                Understand your medical bill.
              </h1>

              <p className="mt-5 max-w-[56ch] text-[17px] leading-relaxed text-slate-muted">
                CareLens uses AI to help you understand medical
                charges, identify potential discrepancies, and find
                the evidence behind your bill.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  as={Link}
                  to="/upload"
                  size="lg"
                >
                  Analyze a bill
                </Button>

                <Button
                  as="a"
                  href="#how-it-works"
                  variant="secondary"
                  size="lg"
                >
                  See how it works
                </Button>
              </div>
            </div>

            <HeroVisual />
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="border-b border-slate-line"
        >
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              How it works
            </h2>

            <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map(({ title, body, Icon }, index) => (
                <li
                  key={title}
                  className="relative"
                >
                  <div className="flex items-center gap-3">
                    <span className="tnum text-[13px] font-semibold text-accent">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <span
                      className="h-px flex-1 bg-slate-line"
                      aria-hidden="true"
                    />
                  </div>

                  <span className="mt-5 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
                    <Icon
                      size={19}
                      strokeWidth={1.9}
                      aria-hidden="true"
                    />
                  </span>

                  <h3 className="mt-4 text-[15px] font-semibold text-ink">
                    {title}
                  </h3>

                  <p className="mt-1.5 text-sm leading-relaxed text-slate-muted">
                    {body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Trust and safety */}
        <section className="bg-ink-900">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              <div>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white">
                  <ShieldCheck
                    size={19}
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />
                </span>

                <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white">
                  Built for transparency, not diagnosis.
                </h2>

                <p className="mt-4 max-w-[60ch] leading-relaxed text-white/70">
                  CareLens does not replace doctors, insurers, or
                  legal professionals. It helps you understand the
                  billing information available to you and identify
                  items that may require clarification.
                </p>
              </div>

              <ul className="space-y-4">
                {[
                  [
                    'It flags, it does not accuse.',
                    'A comparison between a bill and a published document can show that two documents appear inconsistent. CareLens says "potential discrepancy" and asks you to seek clarification.',
                  ],
                  [
                    'Every flag shows its source.',
                    'Each finding links to the document, page and section it came from, so you can read the evidence yourself.',
                  ],
                  [
                    'Your next step is a question.',
                    'CareLens helps you ask your hospital or insurer a specific, informed question — not make an allegation.',
                  ],
                ].map(([title, body]) => (
                  <li
                    key={title}
                    className="rounded-lg border border-white/10 bg-white/5 px-5 py-4"
                  >
                    <p className="text-sm font-semibold text-white">
                      {title}
                    </p>

                    <p className="mt-1.5 text-sm leading-relaxed text-white/65">
                      {body}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10 flex items-start gap-3 rounded-lg border border-white/10 px-5 py-4">
              <Info
                size={17}
                strokeWidth={2}
                className="mt-0.5 shrink-0 text-white/60"
                aria-hidden="true"
              />

              <p className="text-[13px] leading-relaxed text-white/60">
                This prototype uses Gopal Hospital, a fictional
                academic demo knowledge base. Nothing shown represents
                a real hospital, a real patient, or a real charge.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 sm:px-8">
          <Mark />

          <p className="max-w-[60ch] text-[13px] leading-relaxed text-slate-muted">
            CareLens provides informational explanations based on
            available billing documents and evidence. It does not
            provide medical or legal advice.
          </p>
        </div>
      </footer>
    </div>
  );
}