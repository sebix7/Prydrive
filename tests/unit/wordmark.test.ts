import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('PrydriveWordmark SVG Component', () => {
  const wordmarkSource = readFileSync(
    resolve(__dirname, '../../src/renderer/src/components/ui/PrydriveWordmark.tsx'),
    'utf-8'
  );

  it('should define viewBox with proportional dimensions for PRYDRIVE glyphs', () => {
    expect(wordmarkSource).toContain('viewBox="0 0 95 15.5"');
    expect(wordmarkSource).toContain('role="img"');
  });

  it('should render PRYD in Klein Blue / Electric Blue across themes', () => {
    expect(wordmarkSource).toContain("theme === 'dark' ? '#3B66FF' : theme === 'light' ? '#1B44E8'");
    expect(wordmarkSource).toContain('prydrive-wordmark-pryd');
  });

  it('should render RIVE in White (Dark mode) / Solid Black (Light mode)', () => {
    expect(wordmarkSource).toContain("theme === 'dark' ? '#FFFFFF' : theme === 'light' ? '#111315'");
    expect(wordmarkSource).toContain('prydrive-wordmark-rive');
  });

  it('should include all 8 letter paths corresponding to favicon geometric styling', () => {
    // P path matching favicon: M0 1.5 H6.5 C8.9853
    expect(wordmarkSource).toContain('M0 1.5 H6.5');
    // R path
    expect(wordmarkSource).toContain('M13 1.5 H19.5');
    // Y path
    expect(wordmarkSource).toContain('M26.5 1.5');
    // D path
    expect(wordmarkSource).toContain('M39.5 1.5');
    // Second R path
    expect(wordmarkSource).toContain('M53.5 1.5');
    // I path
    expect(wordmarkSource).toContain('M67 1.5 H70');
    // V path
    expect(wordmarkSource).toContain('M72 1.5');
    // E path
    expect(wordmarkSource).toContain('M85 1.5');
  });
});
