import { Link } from 'react-router-dom';
import { FileUp } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout.jsx';
import PageContainer from '../components/layout/PageContainer.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { loadAnalysis } from '../lib/store.js';
import { formatCurrency } from '../lib/format.js';

export default function Dashboard() {
  const last = loadAnalysis();

  return (
    <AppLayout
      title="Dashboard"
      description="Your latest bill analysis"
      actions={
        <Button as={Link} to="/upload" size="sm">
          <FileUp size={15} strokeWidth={2} aria-hidden="true" />
          Analyze a bill
        </Button>
      }
    >
      <PageContainer>
        {last ? (
          <Link to="/analysis" className="card block px-5 py-5 hover:bg-slate-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[15px] font-semibold text-ink">{last.hospital ?? 'Uploaded bill'}</p>
                <p className="mt-0.5 text-[13px] text-slate-muted">{last.billReference ?? ''}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="tnum font-semibold text-ink">{formatCurrency(last.summary?.total)}</span>
                <StatusBadge status={last.summary?.issueCount ? 'review' : 'verified'} compact />
              </div>
            </div>
          </Link>
        ) : (
          <EmptyState
            title="No bills analyzed yet"
            description="Upload a PDF or image of a medical bill to see its charges checked against available documents."
            action={
              <Button as={Link} to="/upload">
                Analyze a bill
              </Button>
            }
          />
        )}
      </PageContainer>
    </AppLayout>
  );
}
