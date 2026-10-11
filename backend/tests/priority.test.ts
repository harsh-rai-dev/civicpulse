import {
  calculatePriority,
  getPriorityLevel,
  MAX_SCORE,
  EMERGENCY_SCORE,
} from '../src/services/priority';

describe('Priority engine', () => {
  describe('severity vocabulary maps to the documented level', () => {
    const cases: [string, string][] = [
      ['gas leak smell near the kitchen', 'Critical'],
      ['fire breaking out in the factory', 'Critical'],
      ['building collapse on main road', 'Critical'],
      ['electrical danger from a fallen pole', 'Critical'],
      ['accident on the highway', 'High'],
      ['dangerous deep pit on the road', 'High'],
      ['severe leakage from the main pipe', 'High'],
      ['pothole in the middle of the road', 'Medium'],
      ['road damage near the bridge', 'Medium'],
      ['water leakage on the footpath', 'Medium'],
      ['garbage not collected for 3 days', 'Low'],
      ['streetlight not working at night', 'Low'],
      ['faded sign at the junction', 'Low'],
    ];

    it.each(cases)('classifies "%s" as %s', (description, expected) => {
      expect(calculatePriority(description).level).toBe(expected);
    });
  });

  describe('multi-word phrases are detected', () => {
    it('matches phrases rather than isolated words', () => {
      expect(calculatePriority('gas leak near the school gate').terms).toContain('gas leak');
      expect(calculatePriority('electrical danger on the pole').terms).toContain(
        'electrical danger'
      );
    });

    it('does not match a phrase when the words are separated', () => {
      expect(calculatePriority('the leak was gas').terms).not.toContain('gas leak');
    });
  });

  describe('determinism', () => {
    it('returns an identical result for identical input', () => {
      const description = 'garbage near a pothole and a gas leak';
      expect(calculatePriority(description)).toEqual(calculatePriority(description));
    });

    it('is unaffected by casing and punctuation', () => {
      expect(calculatePriority('Dangerous GAS LEAK!!!').score).toBe(
        calculatePriority('dangerous gas leak').score
      );
    });

    it('treats an empty description as Low with no terms', () => {
      expect(calculatePriority('')).toEqual({ score: 0, level: 'Low', terms: [] });
    });
  });

  describe('anti-gaming rule', () => {
    it('does not let a repeated keyword inflate the score', () => {
      const once = calculatePriority('fire');
      const many = calculatePriority('fire fire fire fire fire fire fire fire fire fire');
      expect(many.score).toBe(once.score);
    });

    it('never exceeds the maximum score', () => {
      const stuffed = 'gas leak fire collapse electrical danger accident dangerous ' +
        'severe leakage pothole garbage streetlight';
      expect(calculatePriority(stuffed).score).toBe(MAX_SCORE);
    });
  });

  describe('emergency flag', () => {
    it('always produces Critical at the maximum score', () => {
      const result = calculatePriority('garbage pile', true);
      expect(result.level).toBe('Critical');
      expect(result.score).toBe(EMERGENCY_SCORE);
    });
  });

  describe('level thresholds', () => {
    it('maps scores to levels consistently', () => {
      expect(getPriorityLevel(10)).toBe('Critical');
      expect(getPriorityLevel(5)).toBe('Critical');
      expect(getPriorityLevel(4)).toBe('High');
      expect(getPriorityLevel(3)).toBe('High');
      expect(getPriorityLevel(2)).toBe('Medium');
      expect(getPriorityLevel(1)).toBe('Low');
      expect(getPriorityLevel(0)).toBe('Low');
    });
  });

  describe('explainability', () => {
    it('reports each distinct contributing term exactly once', () => {
      const { terms } = calculatePriority('gas leak and another gas leak plus fire');
      expect(terms.filter(t => t === 'gas leak')).toHaveLength(1);
      expect(terms).toContain('fire');
    });
  });
});