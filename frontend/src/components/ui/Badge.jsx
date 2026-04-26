const statusMap = {
  active: 'success',
  accepted: 'success',
  reserved: 'success',
  'checked in': 'success',
  checked_in: 'success',
  'awaiting payment': 'warning',
  awaiting_payment: 'warning',
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
