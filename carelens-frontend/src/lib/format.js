export function formatCurrency(value) {
  const n = Number(value);

  if (Number.isNaN(n)) {
    return '—';
  }

  return `₹${n.toLocaleString('en-IN')}`;
}

export function formatDate(value) {
  if (!value) {
    return '—';
  }

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) {
    return String(value);
  }

  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}