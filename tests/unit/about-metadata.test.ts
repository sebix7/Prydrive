import { describe, it, expect } from 'vitest';
import { ABOUT_METADATA } from '../../src/shared/shell-state';

describe('About Modal Project Metadata (US-1 / T1)', () => {
  it('should define public Trello management board URL in metadata (FR-1)', () => {
    expect(ABOUT_METADATA.trelloUrl).toBe('https://trello.com/b/aPzGPiHF/prydrive');
  });

  it('should have a valid https URL structure for the Trello board (FR-2)', () => {
    const url = new URL(ABOUT_METADATA.trelloUrl);
    expect(url.protocol).toBe('https:');
    expect(url.hostname).toBe('trello.com');
    expect(url.pathname).toContain('/prydrive');
  });
});
