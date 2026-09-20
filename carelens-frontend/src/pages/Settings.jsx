import AppLayout from '../components/layout/AppLayout.jsx';
import PageContainer from '../components/layout/PageContainer.jsx';
import Button from '../components/ui/Button.jsx';

export default function Settings() {
  return (
    <AppLayout title="Settings">
      <PageContainer width="narrow">
        <section className="card px-5 py-5">
          <h2 className="text-[15px] font-semibold text-ink">Your data</h2>
          <p className="mt-1 text-sm text-slate-muted">
            The last analysis is kept in this browser tab only. Clear it to remove it.
          </p>
          <Button
            className="mt-4"
            variant="secondary"
            size="sm"
            onClick={() => {
              sessionStorage.removeItem('carelens.analysis');
              window.location.reload();
            }}
          >
            Clear last analysis
          </Button>
        </section>
        <p className="mt-5 text-[13px] leading-relaxed text-slate-muted">
          CareLens provides informational explanations based on available billing documents. It does not
          provide medical or legal advice.
        </p>
      </PageContainer>
    </AppLayout>
  );
}
