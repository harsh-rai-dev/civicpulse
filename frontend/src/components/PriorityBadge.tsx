import React from 'react';

interface PriorityBadgeProps {
  level: string;
  score?: number;
  showScore?: boolean;
}

export default function PriorityBadge({ level, score, showScore = false }: PriorityBadgeProps) {
  const normalizedLevel = (level || 'Low').toLowerCase();

  let badgeClass = 'priority-low';
  let label = level || 'Low';

  if (normalizedLevel.includes('critical')) {
    badgeClass = 'priority-critical';
    label = 'Critical';
  } else if (normalizedLevel.includes('high')) {
    badgeClass = 'priority-high';
    label = 'High';
  } else if (normalizedLevel.includes('medium')) {
    badgeClass = 'priority-medium';
    label = 'Medium';
  } else {
    badgeClass = 'priority-low';
    label = 'Low';
  }

  return (
    <span className={`priority-badge ${badgeClass}`} title={`Priority: ${label}${score !== undefined ? ` (Score: ${score})` : ''}`}>
      <span className="priority-label">{label}</span>
      {showScore && score !== undefined && <span className="priority-score-tag">{score} pts</span>}
    </span>
  );
}