export const IPC_CHANNELS = {
  AUTH_INITIATE: 'auth:initiate',
  AUTH_CANCEL: 'auth:cancel',
  AUTH_RESTORE_SESSION: 'auth:restore-session',
  AUTH_DISCONNECT: 'auth:disconnect',
  STORAGE_GET_QUOTA: 'storage:get-quota',
  APP_SET_LANGUAGE: 'app:set-language'
} as const;

export type IpcChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS];
