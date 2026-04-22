import { extractInitials, nameToColor } from '../data/sync/syncService';

/**
 * Tests for the pure avatar utility functions.
 * These are framework-free and run fast in Jest.
 */
describe('extractInitials', () => {
  it('extracts two initials from a full name', () => {
    expect(extractInitials('Santiago Lopez')).toBe('SL');
  });

  it('extracts two initials from a three-word name (first + last)', () => {
    expect(extractInitials('Maria del Carmen')).toBe('MC');
  });

  it('extracts a single initial from a single-word name', () => {
    expect(extractInitials('Ana')).toBe('A');
  });

  it('handles names with extra whitespace', () => {
    expect(extractInitials('  John   Doe  ')).toBe('JD');
  });

  it('returns "?" for an empty string', () => {
    expect(extractInitials('')).toBe('?');
  });

  it('returns "?" for a whitespace-only string', () => {
    expect(extractInitials('   ')).toBe('?');
  });

  it('uppercases lowercase initials', () => {
    expect(extractInitials('alice bob')).toBe('AB');
  });
});

describe('nameToColor', () => {
  it('returns a string starting with "hsl("', () => {
    const color = nameToColor('Santiago Lopez');
    expect(color).toMatch(/^hsl\(/);
  });

  it('returns the same color for the same name (deterministic)', () => {
    const name = 'Carlos Rivera';
    expect(nameToColor(name)).toBe(nameToColor(name));
  });

  it('returns different colors for different names', () => {
    expect(nameToColor('Alice Martin')).not.toBe(nameToColor('Bob Chen'));
  });
});
