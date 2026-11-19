export const IPC_CHANNELS = {
  AUTH_INITIATE: 'auth:initiate',
  AUTH_CANCEL: 'auth:cancel',
  AUTH_RESTORE_SESSION: 'auth:restore-session',
  AUTH_DISCONNECT: 'auth:disconnect',
  STORAGE_GET_QUOTA: 'storage:get-quota',
  STORAGE_LIST_DIRECTORY: 'storage:list-directory',
  APP_SET_LANGUAGE: 'app:set-language',
  DOWNLOAD_START: 'download:start',
  DOWNLOAD_CANCEL: 'download:cancel',
  DOWNLOAD_RETRY: 'download:retry',
  DOWNLOAD_OPEN_FOLDER: 'download:open-folder',
  DOWNLOAD_GET_SETTINGS: 'download:get-settings',
  DOWNLOAD_SET_SETTINGS: 'download:set-settings',
  DOWNLOAD_SELECT_DIRECTORY: 'download:select-directory',
  DOWNLOAD_PROGRESS_EVENT: 'download:progress-event'
} as const;

export type IpcChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS];
