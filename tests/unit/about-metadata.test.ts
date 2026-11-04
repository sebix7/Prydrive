import { describe, it, expect } from 'vitest';
import { ABOUT_METADATA, formatMailtoUrl } from '../../src/shared/shell-state';

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

describe('Contact Email & Mailto Launcher (US-2 / T2)', () => {
  it('should define official contact email in ABOUT_METADATA (FR-3)', () => {
    expect(ABOUT_METADATA.contactEmail).toBe('sebiplay@hotmail.com');
  });

  it('should format valid mailto: link for system email client (FR-4)', () => {
    expect(formatMailtoUrl('sebiplay@hotmail.com')).toBe('mailto:sebiplay@hotmail.com');
    expect(formatMailtoUrl('  user@test.com  ')).toBe('mailto:user@test.com');
  });
});
