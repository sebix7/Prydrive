import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, Loader2, Cloud } from 'lucide-react';
import type { AuthState, UserProfile, StorageQuota } from '../../shared/types';
import { WelcomeScreen } from './components/auth/WelcomeScreen';
import { AwaitingAuthModal } from './components/auth/AwaitingAuthModal';
import { DisconnectModal } from './components/auth/DisconnectModal';
import { Header } from './components/layout/Header';

export const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>('restoring_session');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [quota, setQuota] = useState<StorageQuota | null>(null);
  const [isLoadingQuota, setIsLoadingQuota] = useState(false);
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleConfirmDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      if (window.api?.auth) {
        await window.api.auth.disconnect();
      }
      setUserProfile(null);
      setQuota(null);
      setAuthState('unauthenticated');
      setIsOffline(false);
      setErrorMessage(null);
    } catch (err) {
      setErrorMessage((err as Error).message || 'Failed to disconnect account');
    } finally {
      setIsDisconnecting(false);
      setIsDisconnectModalOpen(false);
    }
  };

  const loadQuota = async () => {
    setIsLoadingQuota(true);
    setQuotaError(null);
    try {
      if (window.api?.storage) {
        const result = await window.api.storage.getQuota();
        if (result.success && result.data) {
          setQuota(result.data);
        } else {
          setQuotaError(result.error?.message || 'Storage details unavailable');
        }
      }
    } catch (err) {
      setQuotaError((err as Error).message || 'Storage details unavailable');
    } finally {
      setIsLoadingQuota(false);
    }
  };

  const checkSession = async () => {
    setAuthState('restoring_session');
    setErrorMessage(null);
    setIsOffline(false);

    try {
      if (!window.api?.auth) {
        setAuthState('unauthenticated');
        return;
      }

      const result = await window.api.auth.restoreSession();
      if (result.success && result.data) {
        if (result.data.state === 'authenticated' && result.data.profile) {
          setUserProfile(result.data.profile);
          setAuthState('authenticated');
        } else {
          setAuthState('unauthenticated');
        }
      } else {
        if (result.error?.code === 'NETWORK_OFFLINE') {
          if (result.data?.profile) {
            setUserProfile(result.data.profile);
          }
          setIsOffline(true);
          setAuthState('offline');
          setErrorMessage('You are offline. Google Drive features require an active internet connection.');
        } else if (result.error?.code === 'TOKEN_REVOKED') {
          setUserProfile(null);
          setAuthState('unauthenticated');
          setErrorMessage('Your session has expired or been revoked. Please sign in again.');
        } else {
          setUserProfile(null);
          setAuthState('unauthenticated');
        }
      }
    } catch {
      setAuthState('unauthenticated');
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (authState === 'authenticated') {
      loadQuota();
    }
  }, [authState]);

  const handleSignIn = async () => {
    if (!navigator.onLine) {
      setIsOffline(true);
      setAuthState('offline');
      setErrorMessage('No internet connection. Please verify your network and retry.');
      return;
    }

    setErrorMessage(null);
    setAuthState('awaiting_authorization');

    try {
      if (!window.api?.auth) {
        throw new Error('Electron IPC bridge is unavailable');
      }

      const result = await window.api.auth.initiateLogin();
      if (result.success && result.data) {
        setUserProfile(result.data);
        setAuthState('authenticated');
        setIsOffline(false);
      } else {
        if (result.error?.code === 'AUTH_CANCELLED') {
          setErrorMessage(null);
          setAuthState('unauthenticated');
        } else if (result.error?.code === 'AUTH_TIMEOUT') {
          setErrorMessage('Authorization timed out after 60 seconds. Please try again.');
          setAuthState('unauthenticated');
        } else if (result.error?.code === 'NETWORK_OFFLINE') {
          setIsOffline(true);
          setAuthState('offline');
          setErrorMessage(result.error.message || 'No internet connection. Please verify your network and retry.');
        } else {
          setErrorMessage(result.error?.message || 'Login failed');
          setAuthState('unauthenticated');
        }
      }
    } catch (err) {
      setErrorMessage((err as Error).message);
      setAuthState('unauthenticated');
    }
  };

  const handleCancel = async () => {
    try {
      if (window.api?.auth) {
        await window.api.auth.cancelLogin();
      }
    } finally {
      setAuthState('unauthenticated');
    }
  };

  if (authState === 'restoring_session') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-medium">Validating session...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Offline Alert Banner (FR-8, EC-5) */}
      {isOffline && (
        <div className="bg-amber-50 text-amber-900 px-4 py-2 text-xs border-b border-amber-200 flex items-center justify-between font-medium shadow-sm">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-700" />
            <span>Working offline. Saved session preserved.</span>
          </div>
          <button
            type="button"
            onClick={checkSession}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-amber-200/60 hover:bg-amber-200 text-amber-900 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* General Notification Banner */}
      {!isOffline && errorMessage && (
        <div className="bg-slate-100 text-slate-700 px-4 py-2.5 text-xs border-b border-slate-200 text-center font-medium shadow-sm">
          {errorMessage}
        </div>
      )}

      {authState === 'offline' ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-sm text-center max-w-sm w-full flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-amber-50 text-amber-600">
              <WifiOff className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-bold text-slate-800 mb-1">Offline Mode</h2>
            {userProfile?.email && (
              <p className="text-sm font-medium text-slate-600 mb-2">{userProfile.email}</p>
            )}

            <div className="w-full p-3.5 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-800 leading-relaxed my-3 text-center">
              {userProfile?.email
                ? 'Your session is safely saved on this computer. Reconnect to the internet to access your Google Drive files.'
                : 'Prydrive requires an active internet connection to communicate with Google Drive.'}
            </div>

            <button
              type="button"
              onClick={checkSession}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl transition-colors shadow-sm mt-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        </div>
      ) : authState === 'authenticated' && userProfile ? (
        <div className="flex-1 flex flex-col w-full h-full bg-slate-50 overflow-hidden">
          <Header
            userProfile={userProfile}
            quota={quota}
            isLoadingQuota={isLoadingQuota}
            quotaError={quotaError}
            onRetryQuota={loadQuota}
            onDisconnect={() => setIsDisconnectModalOpen(true)}
          />
          <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-sm max-w-sm w-full flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-blue-50 text-blue-600">
                <Cloud className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">Google Drive Connected</h2>
              <p className="text-sm font-medium text-slate-600 mb-2">{userProfile.email}</p>
              <p className="text-xs text-slate-400">Authenticated and ready for file explorer</p>
            </div>
          </main>
        </div>
      ) : (
        <WelcomeScreen
          onSignIn={handleSignIn}
          disabled={authState === 'awaiting_authorization'}
        />
      )}

      <AwaitingAuthModal
        isOpen={authState === 'awaiting_authorization'}
        onCancel={handleCancel}
      />

      <DisconnectModal
        isOpen={isDisconnectModalOpen}
        isDisconnecting={isDisconnecting}
        onConfirm={handleConfirmDisconnect}
        onCancel={() => setIsDisconnectModalOpen(false)}
      />
    </div>
  );
};

export default App;
