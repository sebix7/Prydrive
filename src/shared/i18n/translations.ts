import type { LanguageCode } from '../types';

export const translations = {
  en: {
    // Welcome Screen
    welcome_title: 'Welcome to Prydrive',
    welcome_subtitle: 'Fast, visual, and native desktop management for your Google Drive files.',
    sign_in_google: 'Sign in with Google',
    browser_notice: 'Authentication is safely handled in your default system browser.',

    // Session Validation
    validating_session: 'Validating session...',

    // Offline Handling
    offline_banner: 'Working offline. Saved session preserved.',
    retry_connection: 'Retry Connection',
    offline_mode_title: 'Offline Mode',
    offline_mode_desc_saved: 'Your session is safely saved on this computer. Reconnect to the internet to access your Google Drive files.',
    offline_mode_desc_no_session: 'Prydrive requires an active internet connection to communicate with Google Drive.',

    // Authenticated View & Header
    app_name: 'Prydrive',
    service_name: 'Google Drive',
    connected_title: 'Google Drive Connected',
    connected_ready: 'Authenticated and ready for file explorer',
    disconnect: 'Disconnect',
    disconnecting: 'Disconnecting...',

    // Storage Quota
    quota_unmetered: '{used} used (Unlimited)',
    quota_usage_format: '{used} / {total}',
    quota_unavailable: 'Storage details unavailable',
    quota_retry_tooltip: 'Retry loading storage quota',

    // Awaiting Auth Modal
    awaiting_title: 'Waiting for Google Authorization',
    awaiting_desc: 'Complete sign-in in your browser window to connect your Google Drive account.',
    awaiting_cancel: 'Cancel',

    // Disconnect Modal
    disconnect_modal_title: 'Disconnect Google Account?',
    disconnect_modal_desc: 'Your saved session credentials will be completely purged from this computer. You will need to sign in again to access your Google Drive files.',
    disconnect_modal_cancel: 'Cancel',
    disconnect_modal_confirm: 'Disconnect',

    // Notifications & Error Messages
    error_no_internet: 'No internet connection. Please verify your network and retry.',
    error_auth_timeout: 'Authorization timed out after 60 seconds. Please try again.',
    error_session_expired: 'Your session has expired or been revoked. Please sign in again.',
    error_login_failed: 'Login failed',
    error_offline_general: 'You are offline. Google Drive features require an active internet connection.'
  },
  es: {
    // Welcome Screen
    welcome_title: 'Bienvenido a Prydrive',
    welcome_subtitle: 'Gestión de archivos rápida, visual y nativa para Google Drive.',
    sign_in_google: 'Iniciar sesión con Google',
    browser_notice: 'La autenticación se realiza de forma segura en tu navegador predeterminado.',

    // Session Validation
    validating_session: 'Validando sesión...',

    // Offline Handling
    offline_banner: 'Trabajando sin conexión. Sesión guardada preservada.',
    retry_connection: 'Reintentar conexión',
    offline_mode_title: 'Modo sin conexión',
    offline_mode_desc_saved: 'Tu sesión está guardada de forma segura en este equipo. Vuelve a conectarte a internet para acceder a tus archivos.',
    offline_mode_desc_no_session: 'Prydrive requiere una conexión a internet activa para comunicarse con Google Drive.',

    // Authenticated View & Header
    app_name: 'Prydrive',
    service_name: 'Google Drive',
    connected_title: 'Google Drive conectado',
    connected_ready: 'Autenticado y listo para el explorador de archivos',
    disconnect: 'Desconectar',
    disconnecting: 'Desconectando...',

    // Storage Quota
    quota_unmetered: '{used} utilizados (Ilimitado)',
    quota_usage_format: '{used} / {total}',
    quota_unavailable: 'Detalles de almacenamiento no disponibles',
    quota_retry_tooltip: 'Reintentar carga de cuota',

    // Awaiting Auth Modal
    awaiting_title: 'Esperando autorización de Google',
    awaiting_desc: 'Completa el inicio de sesión en tu navegador para conectar tu cuenta de Google Drive.',
    awaiting_cancel: 'Cancelar',

    // Disconnect Modal
    disconnect_modal_title: '¿Desconectar cuenta de Google?',
    disconnect_modal_desc: 'Tus credenciales de sesión se eliminarán completamente de este equipo. Deberás iniciar sesión nuevamente para acceder a tus archivos.',
    disconnect_modal_cancel: 'Cancelar',
    disconnect_modal_confirm: 'Desconectar',

    // Notifications & Error Messages
    error_no_internet: 'Sin conexión a internet. Verifica tu red e intenta nuevamente.',
    error_auth_timeout: 'La autorización expiró tras 60 segundos. Intenta nuevamente.',
    error_session_expired: 'Tu sesión ha expirado o fue revocada. Inicia sesión nuevamente.',
    error_login_failed: 'Fallo al iniciar sesión',
    error_offline_general: 'Estás sin conexión. Las funciones de Google Drive requieren internet.'
  }
} as const;

export type TranslationKey = keyof typeof translations.en;

/**
 * Retrieves the translation string for the given language and key.
 * Interpolates optional parameters specified as {paramName}.
 */
export function getTranslation(
  lang: LanguageCode,
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  const selectedLang = lang in translations ? lang : 'en';
  let text = translations[selectedLang][key] || translations.en[key] || key;

  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), String(value)) as unknown as typeof text;
    });
  }

  return text;
}
