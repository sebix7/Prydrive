import packageInfo from '../../package.json';

/**
 * Single source of truth for the application version, dynamically derived from package.json.
 */
export const APP_VERSION = `v${packageInfo.version}`;
export const APP_NAME = 'Prydrive';
export const RAW_VERSION = packageInfo.version;
export const APP_DESCRIPTION = packageInfo.description || 'Desktop client for Google Drive';
export const APP_LICENSE = packageInfo.license || 'MIT';
