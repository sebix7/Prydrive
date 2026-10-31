import { describe, it, expect, vi, afterEach } from 'vitest';
import { isNetworkAvailable } from '../../src/main/core/network';
import dns from 'dns';

describe('Network Connectivity Check (EC-2)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return true when DNS lookup to accounts.google.com succeeds', async () => {
    vi.spyOn(dns, 'lookup').mockImplementation((_hostname, callback) => {
      // simulate successful lookup
      (callback as (err: Error | null, address: string, family: number) => void)(null, '142.250.190.42', 4);
    });

    const isOnline = await isNetworkAvailable(100);
    expect(isOnline).toBe(true);
  });

  it('should return false when DNS lookup fails with ENOTFOUND', async () => {
    vi.spyOn(dns, 'lookup').mockImplementation((_hostname, callback) => {
      const err = new Error('getaddrinfo ENOTFOUND accounts.google.com') as NodeJS.ErrnoException;
      err.code = 'ENOTFOUND';
      (callback as (err: Error | null, address: string, family: number) => void)(err, '', 4);
    });

    const isOnline = await isNetworkAvailable(100);
    expect(isOnline).toBe(false);
  });

  it('should return false when DNS lookup times out', async () => {
    vi.spyOn(dns, 'lookup').mockImplementation(() => {
      // Never calls callback to simulate complete hang
    });

    const isOnline = await isNetworkAvailable(50);
    expect(isOnline).toBe(false);
  });
});
