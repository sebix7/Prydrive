import { describe, it, expect } from 'vitest';
import {
  formatBytes,
  formatStorageQuota,
  calculateQuotaPercentage
} from '../../src/shared/quota-formatter';

describe('Storage Quota Formatter (US-4 / T4)', () => {
  describe('formatBytes', () => {
    it('should format 0 bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 B');
    });

    it('should format bytes correctly into KB, MB, GB, and TB', () => {
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(1073741824)).toBe('1 GB');
      expect(formatBytes(1610612736)).toBe('1.5 GB');
      expect(formatBytes(1099511627776)).toBe('1 TB');
    });

    it('should handle small fractional decimals gracefully', () => {
      expect(formatBytes(1536)).toBe('1.5 KB');
      expect(formatBytes(524288000)).toBe('500 MB');
    });
  });

  describe('calculateQuotaPercentage', () => {
    it('should calculate accurate percentage between 0 and 100', () => {
      expect(calculateQuotaPercentage(500, 1000)).toBe(50);
      expect(calculateQuotaPercentage(250, 1000)).toBe(25);
      expect(calculateQuotaPercentage(0, 1000)).toBe(0);
      expect(calculateQuotaPercentage(1000, 1000)).toBe(100);
    });

    it('should clamp percentage to 100 when usage exceeds limit', () => {
      expect(calculateQuotaPercentage(1200, 1000)).toBe(100);
    });

    it('should clamp percentage to 0 on negative usage', () => {
      expect(calculateQuotaPercentage(-100, 1000)).toBe(0);
    });

    it('should return 0 when total is null, undefined, or unmetered (EC-3)', () => {
      expect(calculateQuotaPercentage(5000000, null)).toBe(0);
      expect(calculateQuotaPercentage(5000000, undefined)).toBe(0);
      expect(calculateQuotaPercentage(5000000, 0)).toBe(0);
    });
  });

  describe('formatStorageQuota', () => {
    it('should return full formatted quota object for metered accounts (FR-10)', () => {
      // 5 GB used of 15 GB
      const used = 5 * 1073741824;
      const total = 15 * 1073741824;
      const result = formatStorageQuota(used, total);

      expect(result.usedBytes).toBe(used);
      expect(result.totalBytes).toBe(total);
      expect(result.formattedUsed).toBe('5 GB');
      expect(result.formattedTotal).toBe('15 GB');
      expect(result.percentage).toBe(33.3);
      expect(result.isUnmetered).toBe(false);
    });

    it('should adapt cleanly to unmetered or unlimited Google Workspace accounts (EC-3)', () => {
      const used = 12 * 1073741824; // 12 GB
      const result = formatStorageQuota(used, null);

      expect(result.usedBytes).toBe(used);
      expect(result.totalBytes).toBeNull();
      expect(result.formattedUsed).toBe('12 GB');
      expect(result.formattedTotal).toBe('Unlimited');
      expect(result.percentage).toBe(0);
      expect(result.isUnmetered).toBe(true);
    });

    it('should support string number inputs from Google API responses', () => {
      const result = formatStorageQuota('1073741824', '2147483648');
      expect(result.formattedUsed).toBe('1 GB');
      expect(result.formattedTotal).toBe('2 GB');
      expect(result.percentage).toBe(50);
      expect(result.isUnmetered).toBe(false);
    });
  });
});
