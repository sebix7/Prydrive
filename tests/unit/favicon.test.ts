import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

describe('Prydrive Favicon & App Icon Assets', () => {
  const rootDir = resolve(__dirname, '../..');
  const publicDir = resolve(rootDir, 'src/renderer/public');
  const resourcesDir = resolve(rootDir, 'resources');
  const indexHtmlPath = resolve(rootDir, 'src/renderer/index.html');

  it('declares favicon and apple-touch-icon link tags in index.html', () => {
    const html = readFileSync(indexHtmlPath, 'utf8');
    expect(html).toContain('<link rel="icon" type="image/svg+xml" href="/favicon.svg" />');
    expect(html).toContain('<link rel="alternate icon" type="image/x-icon" href="/favicon.ico" />');
    expect(html).toContain('<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />');
  });

  it('provides a valid and responsive favicon.svg with Klein Blue brand colors', () => {
    const svgPath = resolve(publicDir, 'favicon.svg');
    expect(existsSync(svgPath)).toBe(true);

    const svg = readFileSync(svgPath, 'utf8');
    expect(svg).toContain('<svg');
    expect(svg).toContain('viewBox="0 0 24 24"');
    expect(svg).toContain('#1B44E8');
    expect(svg).toContain('#3B66FF');
    expect(svg).toContain('prefers-color-scheme: dark');
    expect(svg).toContain('fill-rule="evenodd"');
  });

  it('provides binary favicon.ico and PNG multi-size variants', () => {
    const icoPath = resolve(publicDir, 'favicon.ico');
    const png16Path = resolve(publicDir, 'favicon-16x16.png');
    const png32Path = resolve(publicDir, 'favicon-32x32.png');
    const appleIconPath = resolve(publicDir, 'apple-touch-icon.png');

    expect(existsSync(icoPath)).toBe(true);
    expect(existsSync(png16Path)).toBe(true);
    expect(existsSync(png32Path)).toBe(true);
    expect(existsSync(appleIconPath)).toBe(true);

    expect(readFileSync(icoPath).length).toBeGreaterThan(100);
    expect(readFileSync(png16Path).length).toBeGreaterThan(50);
    expect(readFileSync(png32Path).length).toBeGreaterThan(100);
    expect(readFileSync(appleIconPath).length).toBeGreaterThan(500);
  });

  it('provides desktop application icon files in resources directory for packaging', () => {
    const resIconPng = resolve(resourcesDir, 'icon.png');
    const resIconIco = resolve(resourcesDir, 'icon.ico');

    expect(existsSync(resIconPng)).toBe(true);
    expect(existsSync(resIconIco)).toBe(true);

    expect(readFileSync(resIconPng).length).toBeGreaterThan(1000);
    expect(readFileSync(resIconIco).length).toBeGreaterThan(1000);
  });
});
