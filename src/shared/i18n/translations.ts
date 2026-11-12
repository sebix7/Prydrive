import type { LanguageCode } from '../types';

export const translations = {
  en: {
    // Welcome Screen
    welcome_title: 'Welcome to Prydrive',
    welcome_subtitle: 'Connect to your cloud storage to manage your files directly from your desktop.',
    connect_google_drive: 'Connect to Google Drive',
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
    error_offline_general: 'You are offline. Google Drive features require an active internet connection.',

    // Shell - Menu Bar
    menu_options: 'Options',
    menu_language: 'Language',
    menu_disconnect: 'Disconnect',
    menu_help: 'Help',
    menu_about: 'About Prydrive',
    menu_file: 'File',
    menu_close_window: 'Close Window',
    menu_view: 'View',
    menu_toggle_sidebar: 'Toggle Storage Sidebar',

    // Shell - Navigation Rail
    nav_prydrive_tooltip: 'Prydrive Workspace',
    nav_google_drive_tooltip: 'Google Drive',

    // Shell - Central Workspace Canvas
    canvas_prydrive_title: 'Prydrive Workspace',
    canvas_drive_title: 'Google Drive Connected',
    canvas_placeholder_desc: 'File and folder explorer will be available in the next release. Your cloud connection is active and synchronized.',
    canvas_ready_status: 'Ready to explore',

    // Shell - Telemetry Sidebar
    sidebar_connected: 'Connected',
    sidebar_account: 'Account',
    sidebar_storage: 'Storage',
    sidebar_collapse_tooltip: 'Collapse sidebar',
    sidebar_expand_tooltip: 'Expand sidebar',

    // Shell - About Modal
    about_title: 'About Prydrive',
    about_description: 'Fast, visual native desktop client for Google Drive.',
    about_repository: 'Repository:',
    about_board: 'Board:',
    about_contact: 'Contact:',
    about_copy_email: 'Copy email',
    about_copied: 'Copied!',
    about_copy_short: 'COPY',
    about_copied_short: 'COPIED!',
    about_close: 'Close',
    about_got_it: 'Got it',

    // Drive Explorer
    explorer_col_type: 'Type',
    explorer_col_name: 'Name',
    explorer_col_created: 'Created',
    explorer_col_size: 'Size',
    explorer_parent_folder: 'Parent directory',
    explorer_empty_folder: 'Empty folder',
    explorer_refresh: 'Refresh',
    explorer_status_counts: '{folders}, {files}',
    explorer_status_total_size: 'Total: {size}',
    explorer_loading: 'Loading files...',
    explorer_loading_more: 'Loading more...',
    explorer_error_title: 'Unable to load folder',
    explorer_retry: 'Retry',

    // Theme Mode (Spec 005)
    menu_theme: 'Theme',
    theme_light: 'Light',
    theme_dark: 'Dark',
    theme_switch_to_dark: 'Switch to dark mode',
    theme_switch_to_light: 'Switch to light mode'
  },
  es: {
    // Welcome Screen
    welcome_title: 'Bienvenido a Prydrive',
    welcome_subtitle: 'Conéctate a tu almacenamiento en la nube para gestionar tus archivos directamente desde tu escritorio.',
    connect_google_drive: 'Conectarse a Google Drive',
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
    error_offline_general: 'Estás sin conexión. Las funciones de Google Drive requieren internet.',

    // Shell - Menu Bar
    menu_options: 'Opciones',
    menu_language: 'Idioma',
    menu_disconnect: 'Desconectar',
    menu_help: 'Ayuda',
    menu_about: 'Acerca de Prydrive',
    menu_file: 'Archivo',
    menu_close_window: 'Cerrar ventana',
    menu_view: 'Ver',
    menu_toggle_sidebar: 'Alternar panel de almacenamiento',

    // Shell - Navigation Rail
    nav_prydrive_tooltip: 'Espacio de trabajo Prydrive',
    nav_google_drive_tooltip: 'Google Drive',

    // Shell - Central Workspace Canvas
    canvas_prydrive_title: 'Espacio de Trabajo Prydrive',
    canvas_drive_title: 'Google Drive Conectado',
    canvas_placeholder_desc: 'El explorador de archivos y carpetas estará disponible en la próxima actualización. Tu conexión con la nube está activa y sincronizada.',
    canvas_ready_status: 'Listo para explorar',

    // Shell - Telemetry Sidebar
    sidebar_connected: 'Conectado',
    sidebar_account: 'Cuenta',
    sidebar_storage: 'Almacenamiento',
    sidebar_collapse_tooltip: 'Ocultar panel',
    sidebar_expand_tooltip: 'Mostrar panel',

    // Shell - About Modal
    about_title: 'Acerca de Prydrive',
    about_description: 'Gestor de escritorio visual, rápido y nativo para tus archivos de Google Drive.',
    about_repository: 'Repositorio:',
    about_board: 'Tablero:',
    about_contact: 'Contacto:',
    about_copy_email: 'Copiar correo',
    about_copied: '¡Copiado!',
    about_copy_short: 'COPIAR',
    about_copied_short: '¡COPIADO!',
    about_close: 'Cerrar',
    about_got_it: 'Entendido',

    // Drive Explorer
    explorer_col_type: 'Tipo',
    explorer_col_name: 'Nombre',
    explorer_col_created: 'Fecha de creación',
    explorer_col_size: 'Tamaño',
    explorer_parent_folder: 'Subir nivel',
    explorer_empty_folder: 'Carpeta vacía',
    explorer_refresh: 'Actualizar',
    explorer_status_counts: '{folders}, {files}',
    explorer_status_total_size: 'Total: {size}',
    explorer_loading: 'Cargando archivos...',
    explorer_loading_more: 'Cargando más...',
    explorer_error_title: 'No se pudo cargar la carpeta',
    explorer_retry: 'Reintentar',

    // Theme Mode (Spec 005)
    menu_theme: 'Tema',
    theme_light: 'Claro',
    theme_dark: 'Oscuro',
    theme_switch_to_dark: 'Cambiar a modo oscuro',
    theme_switch_to_light: 'Cambiar a modo claro'
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
