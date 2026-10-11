import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const norm = (status || 'Pending').toLowerCase();
  let statusClass = 'status-pending';
  let display = 'Pending';

  if (norm.includes('progress')) {
    statusClass = 'status-inprogress';
    display = 'In Progress';
  } else if (norm.includes('resolved')) {
    statusClass = 'status-resolved';
    display = 'Resolved';
  } else {
    statusClass = 'status-pending';
    display = 'Pending';
  }

  return (
    <span className={`status-badge ${statusClass}`}>
      {display}
    </span>
  );
}