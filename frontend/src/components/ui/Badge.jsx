const statusMap = {
  active: 'success',
  accepted: 'success',
  completed: 'neutral',
  pending: 'warning',
  rejected: 'danger',
  cancelled: 'danger',
  paused: 'warning',
  draft: 'neutral',
  archived: 'neutral',
};

export default function Badge({ children, tone }) {
  const label = String(children || '').toLowerCase();
  return <span className={`badge badge-${tone || statusMap[label] || 'neutral'}`}>{children}</span>;
}
