/**
 * CivicPulse Priority Engine
 *
 * Deterministic, explainable severity scoring for civic complaints.
 *
 * Rules (documented so administrators can justify a priority):
 *  1. A complaint flagged as an emergency is always Critical.
 *  2. Otherwise the score is the sum of the weights of the DISTINCT severity
 *     terms found in the complaint description.
 *  3. Each distinct term contributes its weight at most once. Repeating the
 *     same term ("fire fire fire") cannot inflate the score.
 *  4. The total score is capped at MAX_SCORE so keyword stuffing stays bounded.
 *
 * Terms are matched as whole phrases (single words and multi-word phrases are
 * both supported) using word-boundary regexes against a normalised description,
 * so "gas leak" and "electrical danger" are detected, not just "gas"/"danger".
 */

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface PriorityResult {
  score: number;
  level: PriorityLevel;
  /** Distinct severity terms that contributed to the score, for explainability. */
  terms: string[];
}

export const MAX_SCORE = 10;

export const EMERGENCY_SCORE = MAX_SCORE;

export const THRESHOLDS: { level: PriorityLevel; minScore: number }[] = [
  { level: 'Critical', minScore: 5 },
  { level: 'High', minScore: 3 },
  { level: 'Medium', minScore: 2 },
  { level: 'Low', minScore: 0 },
];

/**
 * Severity vocabulary. Weights follow the project specification:
 * Critical 5, High 3, Medium 2, Low 1.
 */
export const SEVERITY_TERMS: { term: string; weight: number }[] = [
  // Critical
  { term: 'gas leak', weight: 5 },
  { term: 'electrical danger', weight: 5 },
  { term: 'fire', weight: 5 },
  { term: 'collapse', weight: 5 },
  { term: 'critical', weight: 5 },
  // High
  { term: 'accident', weight: 3 },
  { term: 'dangerous', weight: 3 },
  { term: 'severe leakage', weight: 3 },
  { term: 'sewage overflow', weight: 3 },
  { term: 'stranded', weight: 3 },
  // Medium
  { term: 'pothole', weight: 2 },
  { term: 'road damage', weight: 2 },
  { term: 'water leakage', weight: 2 },
  { term: 'broken', weight: 2 },
  { term: 'blocked', weight: 2 },
  // Low
  { term: 'garbage', weight: 1 },
  { term: 'streetlight', weight: 1 },
  { term: 'faded sign', weight: 1 },
  { term: 'unlit', weight: 1 },
];

/** Compiled once at module load. Escape the term so regex metacharacters are literal. */
const COMPILED_TERMS = SEVERITY_TERMS.map(({ term, weight }) => ({
  term,
  weight,
  pattern: new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`),
}));

function normalise(text: string): string {
  return ` ${text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()} `;
}

export function getPriorityLevel(score: number): PriorityLevel {
  const threshold = THRESHOLDS.find(t => score >= t.minScore);
  return threshold ? threshold.level : 'Low';
}

export function calculatePriority(description: string, isEmergency = false): PriorityResult {
  if (isEmergency) {
    return { score: EMERGENCY_SCORE, level: 'Critical', terms: ['emergency'] };
  }

  const text = normalise(description || '');

  const matched = COMPILED_TERMS.filter(({ pattern }) => pattern.test(text));
  const score = Math.min(
    MAX_SCORE,
    matched.reduce((total, entry) => total + entry.weight, 0)
  );

  return {
    score,
    level: getPriorityLevel(score),
    terms: matched.map(entry => entry.term),
  };
}