import { describe, it, expect } from 'vitest';
import {
  shellReducer,
  initialShellState,
  getSidebarClasses,
  truncateEmail,
  shouldAutoCollapseSidebar,
  type ShellState
} from '../../src/shared/shell-state';

describe('Telemetry Sidebar & Divider Toggle (US-4 / T4)', () => {
  it('should initialize with expanded right sidebar by default (FR-9)', () => {
    expect(initialShellState.isSidebarExpanded).toBe(true);
  });

  it('should toggle sidebar between expanded (260px) and collapsed (0px) states (FR-12 / NFR-3)', () => {
    let state = initialShellState;
    expect(state.isSidebarExpanded).toBe(true);

    // Toggle to collapsed
    state = shellReducer(state, { type: 'TOGGLE_SIDEBAR' });
    expect(state.isSidebarExpanded).toBe(false);

    // Toggle back to expanded
    state = shellReducer(state, { type: 'TOGGLE_SIDEBAR' });
    expect(state.isSidebarExpanded).toBe(true);

    // Set directly to collapsed
    state = shellReducer(state, { type: 'SET_SIDEBAR_EXPANDED', payload: false });
    expect(state.isSidebarExpanded).toBe(false);
  });

  it('should resolve CSS width and transition classes for sidebar (NFR-3)', () => {
    const expandedClasses = getSidebarClasses(true);
    expect(expandedClasses.container).toContain('w-[260px]');
    expect(expandedClasses.container).toContain('transition-all');

    const collapsedClasses = getSidebarClasses(false);
    expect(collapsedClasses.container).toContain('w-0');
    expect(collapsedClasses.container).toContain('border-l-0');
  });

  it('should truncate long emails gracefully with tooltip compatibility (EC-1)', () => {
    const shortEmail = 'user@gmail.com';
    expect(truncateEmail(shortEmail, 24)).toBe('user@gmail.com');

    const longEmail = 'extremelylongusernamefortesting@companydomain.com';
    const truncated = truncateEmail(longEmail, 24);
    expect(truncated.length).toBeLessThanOrEqual(24);
    expect(truncated).toContain('...');
    expect(truncated).toContain('@companydomain.com');
  });

  it('should preserve storage quota state in memory across toggling (FR-13)', () => {
    const state: ShellState = {
      ...initialShellState,
      isSidebarExpanded: true
    };

    // Toggling collapsed does not corrupt or alter other state
    const collapsed = shellReducer(state, { type: 'TOGGLE_SIDEBAR' });
    expect(collapsed.isSidebarExpanded).toBe(false);
    expect(collapsed.activeNav).toBe(state.activeNav);

    // Re-expanding retains original active navigation
    const reExpanded = shellReducer(collapsed, { type: 'TOGGLE_SIDEBAR' });
    expect(reExpanded.isSidebarExpanded).toBe(true);
    expect(reExpanded.activeNav).toBe(state.activeNav);
  });

  it('should trigger auto-collapse when window width drops below 804px (EC-2)', () => {
    expect(shouldAutoCollapseSidebar(960)).toBe(false);
    expect(shouldAutoCollapseSidebar(804)).toBe(false);
    expect(shouldAutoCollapseSidebar(803)).toBe(true);
    expect(shouldAutoCollapseSidebar(600)).toBe(true);
  });
});
