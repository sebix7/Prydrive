import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, Loader2, Cloud } from 'lucide-react';
import type { AuthState, UserProfile, StorageQuota, LanguageCode } from '../../shared/types';
import { getTranslation } from '../../shared/i18n/translations';
import type { TranslationKey } from '../../shared/i18n/translations';
import { WelcomeScreen } from './components/auth/WelcomeScreen';
import { AwaitingAuthModal } from './components/auth/AwaitingAuthModal';
import { DisconnectModal } from './components/auth/DisconnectModal';
import { Header } from './components/layout/Header';
import { LanguageToggle } from './components/ui/LanguageToggle';

export const App: React.FC = () => {
  const [language, setLanguage] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('prydrive_lang');
      return saved === 'es' ? 'es' : 'en';
    } catch {
      return 'en';
    }
  });

  const handleLanguageChange = (lang: LanguageCode) => {
    setLanguage(lang);
    try {
      localStorage.setItem('prydrive_lang', lang);
    } catch {
      // Ignore storage errors
    }
  };

  const [authState, setAuthState] = useState<AuthState>('restoring_session');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [errorKey, setErrorKey] = useState<TranslationKey | null>(null);
  const [customError, setCustomError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [quota, setQuota] = useState<StorageQuota | null>(null);
  const [isLoadingQuota, setIsLoadingQuota] = useState(false);
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const clearError = () => {
    setErrorKey(null);
    setCustomError(null);
  };

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
      clearError();
    } catch (err) {
      setCustomError((err as Error).message || 'Failed to disconnect account');
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
    clearError();
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
          setErrorKey('error_offline_general');
        } else if (result.error?.code === 'TOKEN_REVOKED') {
          setUserProfile(null);
          setAuthState('unauthenticated');
          setErrorKey('error_session_expired');
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
      setErrorKey('error_no_internet');
      return;
    }

    clearError();
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
          clearError();
          setAuthState('unauthenticated');
        } else if (result.error?.code === 'AUTH_TIMEOUT') {
          setErrorKey('error_auth_timeout');
          setAuthState('unauthenticated');
        } else if (result.error?.code === 'NETWORK_OFFLINE') {
          setIsOffline(true);
          setAuthState('offline');
          setErrorKey('error_no_internet');
        } else {
          setCustomError(result.error?.message || 'Login failed');
          setAuthState('unauthenticated');
        }
      }
    } catch (err) {
      setCustomError((err as Error).message);
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
        <p className="text-xs text-slate-500 font-medium">
          {getTranslation(language, 'validating_session')}
        </p>
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
            <span>{getTranslation(language, 'offline_banner')}</span>
          </div>
          <button
            type="button"
            onClick={checkSession}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-amber-200/60 hover:bg-amber-200 text-amber-900 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{getTranslation(language, 'retry_connection')}</span>
          </button>
        </div>
      )}

      {/* General Notification Banner */}
      {!isOffline && (errorKey || customError) && (
        <div className="bg-slate-100 text-slate-700 px-4 py-2.5 text-xs border-b border-slate-200 text-center font-medium shadow-sm">
          {errorKey ? getTranslation(language, errorKey) : customError}
        </div>
      )}

      {authState === 'offline' ? (
        <div className="relative flex-1 flex flex-col items-center justify-center p-6 bg-slate-50">
          {/* Top-right language switch when offline */}
          <div className="absolute top-6 right-6">
            <LanguageToggle
              currentLanguage={language}
              onLanguageChange={handleLanguageChange}
            />
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-sm text-center max-w-sm w-full flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-amber-50 text-amber-600">
              <WifiOff className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-bold text-slate-800 mb-1">
              {getTranslation(language, 'offline_mode_title')}
            </h2>
            {userProfile?.email && (
              <p className="text-sm font-medium text-slate-600 mb-2">{userProfile.email}</p>
            )}

            <div className="w-full p-3.5 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-800 leading-relaxed my-3 text-center">
              {userProfile?.email
                ? getTranslation(language, 'offline_mode_desc_saved')
                : getTranslation(language, 'offline_mode_desc_no_session')}
            </div>

            <button
              type="button"
              onClick={checkSession}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl transition-colors shadow-sm mt-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{getTranslation(language, 'retry_connection')}</span>
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
            language={language}
            onLanguageChange={handleLanguageChange}
            onRetryQuota={loadQuota}
            onDisconnect={() => setIsDisconnectModalOpen(true)}
          />
          <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-sm max-w-sm w-full flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-blue-50 text-blue-600">
                <Cloud className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">
                {getTranslation(language, 'connected_title')}
              </h2>
              <p className="text-sm font-medium text-slate-600 mb-2">{userProfile.email}</p>
              <p className="text-xs text-slate-400">
                {getTranslation(language, 'connected_ready')}
              </p>
            </div>
          </main>
        </div>
      ) : (
        <WelcomeScreen
          onSignIn={handleSignIn}
          disabled={authState === 'awaiting_authorization'}
          language={language}
          onLanguageChange={handleLanguageChange}
        />
      )}

      <AwaitingAuthModal
        isOpen={authState === 'awaiting_authorization'}
        onCancel={handleCancel}
        language={language}
      />

      <DisconnectModal
        isOpen={isDisconnectModalOpen}
        isDisconnecting={isDisconnecting}
        language={language}
        onConfirm={handleConfirmDisconnect}
        onCancel={() => setIsDisconnectModalOpen(false)}
      />
    </div>
  );
};

export default App;
