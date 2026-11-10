import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { getTechnicalIndexStrip } from '../../src/shared/theme';

describe('Swiss Archive Modal Dialogs (Spec 006 US-5, FR-17, EC-4, EC-7)', () => {
  describe('Technical Index Strip Definitions (FR-17)', () => {
    it('should return exact left and right labels for awaiting_auth modal', () => {
      const strip = getTechnicalIndexStrip('awaiting_auth');
      expect(strip.leftLabel).toBe('OAUTH 2.0 LOOPBACK');
      expect(strip.rightLabel).toBe('127.0.0.1');
    });

    it('should return exact left and right labels for about modal', () => {
      const strip = getTechnicalIndexStrip('about');
      expect(strip.leftLabel).toBe('SYSTEM // ABOUT');
      expect(strip.rightLabel).toBe('[ESC]');
    });

    it('should return exact left and right labels for disconnect modal', () => {
      const strip = getTechnicalIndexStrip('disconnect');
      expect(strip.leftLabel).toBe('SECURITY // REVOKE SESSION');
      expect(strip.rightLabel).toBe('SAFE_STORAGE');
    });
  });

  describe('AboutModal.tsx Swiss Archive Implementation (FR-17, EC-7)', () => {
    const aboutSource = readFileSync(
      resolve(__dirname, '../../src/renderer/src/components/shell/AboutModal.tsx'),
      'utf-8'
    );

    it('should render 6px container with Swiss Archive surfaces and 1px strong borders', () => {
      expect(aboutSource).toContain('rounded-[6px]');
      expect(aboutSource).toContain('border-[#C9C6BD]');
      expect(aboutSource).toContain('dark:border-[#2C323D]');
      expect(aboutSource).toContain('bg-[#FFFFFF]');
      expect(aboutSource).toContain('dark:bg-[#181C23]');
    });

    it('should render upper Technical Index Strip with [ESC] button', () => {
      expect(aboutSource).toContain("getTechnicalIndexStrip('about')");
      expect(aboutSource).toContain('strip.leftLabel');
      expect(aboutSource).toContain('strip.rightLabel');
      expect(aboutSource).toContain('font-mono');
    });

    it('should render rectangular 3px-radius version badge and 1px framed metadata box', () => {
      expect(aboutSource).toContain('rounded-[3px]');
      expect(aboutSource).toContain('font-mono');
      expect(aboutSource).toContain('ABOUT_METADATA.version');
    });

    it('should render bordered COPY/COPIAR email action button with localized keys', () => {
      expect(aboutSource).toContain('about_copy_short');
      expect(aboutSource).toContain('about_copied_short');
      expect(aboutSource).toContain('rounded-[4px]');
    });

    it('should render 4px-radius Klein Blue dismiss action button', () => {
      expect(aboutSource).toContain('rounded-[4px]');
      expect(aboutSource).toContain('bg-[#1B44E8]');
      expect(aboutSource).toContain('dark:bg-[#3B66FF]');
    });

    it('should render geometric two-tone PrydriveWordmark brand header', () => {
      expect(aboutSource).toContain('PrydriveWordmark');
      expect(aboutSource).toContain('about-modal-title');
      expect(aboutSource).toContain('theme={theme}');
    });
  });

  describe('AwaitingAuthModal.tsx Swiss Archive Implementation (FR-17)', () => {
    const awaitingSource = readFileSync(
      resolve(__dirname, '../../src/renderer/src/components/auth/AwaitingAuthModal.tsx'),
      'utf-8'
    );

    it('should render 6px container with Swiss Archive surfaces and 1px strong borders', () => {
      expect(awaitingSource).toContain('rounded-[6px]');
      expect(awaitingSource).toContain('border-[#C9C6BD]');
      expect(awaitingSource).toContain('dark:border-[#2C323D]');
      expect(awaitingSource).toContain('bg-[#FFFFFF]');
      expect(awaitingSource).toContain('dark:bg-[#181C23]');
    });

    it('should render upper Technical Index Strip with OAUTH 2.0 LOOPBACK and 127.0.0.1', () => {
      expect(awaitingSource).toContain("getTechnicalIndexStrip('awaiting_auth')");
      expect(awaitingSource).toContain('strip.leftLabel');
      expect(awaitingSource).toContain('strip.rightLabel');
      expect(awaitingSource).toContain('font-mono');
    });

    it('should render 4px-radius geometric cancel button', () => {
      expect(awaitingSource).toContain('rounded-[4px]');
      expect(awaitingSource).toContain('border-[#C9C6BD]');
      expect(awaitingSource).toContain('dark:border-[#2C323D]');
    });
  });

  describe('DisconnectModal.tsx Swiss Archive Implementation (FR-17)', () => {
    const disconnectSource = readFileSync(
      resolve(__dirname, '../../src/renderer/src/components/auth/DisconnectModal.tsx'),
      'utf-8'
    );

    it('should render 6px container with Swiss Archive surfaces and 1px strong borders', () => {
      expect(disconnectSource).toContain('rounded-[6px]');
      expect(disconnectSource).toContain('border-[#C9C6BD]');
      expect(disconnectSource).toContain('dark:border-[#2C323D]');
      expect(disconnectSource).toContain('bg-[#FFFFFF]');
      expect(disconnectSource).toContain('dark:bg-[#181C23]');
    });

    it('should render upper Technical Index Strip with SECURITY // REVOKE SESSION and SAFE_STORAGE', () => {
      expect(disconnectSource).toContain("getTechnicalIndexStrip('disconnect')");
      expect(disconnectSource).toContain('strip.leftLabel');
      expect(disconnectSource).toContain('strip.rightLabel');
      expect(disconnectSource).toContain('font-mono');
    });

    it('should render 4px-radius geometric action buttons', () => {
      expect(disconnectSource).toContain('rounded-[4px]');
      expect(disconnectSource).toContain('border-[#C9C6BD]');
      expect(disconnectSource).toContain('dark:border-[#2C323D]');
    });
  });
});
