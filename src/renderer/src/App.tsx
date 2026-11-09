import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, Loader2, Info } from 'lucide-react';
import type { AuthState, UserProfile, StorageQuota, LanguageCode } from '../../shared/types';
import { getTranslation } from '../../shared/i18n/translations';
import type { TranslationKey } from '../../shared/i18n/translations';
import { getTechnicalIndexStrip, SWISS_CONTROL_LAYOUT } from '../../shared/theme';
import { WelcomeScreen } from './components/auth/WelcomeScreen';
import { AwaitingAuthModal } from './components/auth/AwaitingAuthModal';
import { DisconnectModal } from './components/auth/DisconnectModal';
import { AboutModal } from './components/shell/AboutModal';
import { AppShell } from './components/shell/AppShell';
import { LanguageToggle } from './components/ui/LanguageToggle';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { useTheme } from './hooks/useTheme';

export const App: React.FC = () => {
  const { theme, setTheme, toggleTheme } = useTheme();
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
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

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

  const isDark = theme === 'dark';

  if (authState === 'restoring_session') {
    return (
      <div
        data-theme={theme}
        className="w-full h-full flex flex-col items-center justify-center transition-colors swiss-dot-matrix bg-[#FAF9F6] dark:bg-[#101216] text-[#111315] dark:text-[#F3F4F6]"
      >
        <Loader2 className="w-8 h-8 text-[#1B44E8] dark:text-[#3B66FF] animate-spin mb-3" />
        <p className="font-mono text-xs text-[#7C8087] dark:text-[#6B7280]">
          {getTranslation(language, 'validating_session')}
        </p>
      </div>
    );
  }

  const offlineStrip = getTechnicalIndexStrip('offline');

  return (
    <div
      data-theme={theme}
      className="w-full h-full flex flex-col relative overflow-hidden bg-[#FAF9F6] dark:bg-[#101216] text-[#111315] dark:text-[#F3F4F6]"
    >
      {/* Offline Alert Banner (FR-8, EC-1) */}
      {isOffline && (
        <div
          className="px-4 py-2 text-xs border-b border-[#C9C6BD] dark:border-[#2C323D] bg-[#F2F0EA] dark:bg-[#15181E] text-[#D95D1E] dark:text-[#F97316] flex items-center justify-between font-mono select-none"
        >
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-[#D95D1E] dark:text-[#F97316]" />
            <span>{getTranslation(language, 'offline_banner')}</span>
          </div>
          <button
            type="button"
            onClick={checkSession}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-[4px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#FFFFFF] dark:bg-[#181C23] hover:bg-[#ECEAE3] dark:hover:bg-[#1E232C] text-[#111315] dark:text-[#F3F4F6] transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{getTranslation(language, 'retry_connection')}</span>
          </button>
        </div>
      )}

      {/* General Notification Banner */}
      {!isOffline && (errorKey || customError) && (
        <div
          className="px-4 py-2 text-xs border-b border-[#C9C6BD] dark:border-[#2C323D] bg-[#F2F0EA] dark:bg-[#15181E] text-[#4A4E54] dark:text-[#9CA3AF] text-center font-mono select-none"
        >
          {errorKey ? getTranslation(language, errorKey) : customError}
        </div>
      )}

      {authState === 'offline' ? (
        <div
          className="relative flex-1 flex flex-col items-center justify-center p-6 transition-colors swiss-dot-matrix bg-[#FAF9F6] dark:bg-[#101216] text-[#111315] dark:text-[#F3F4F6] select-none overflow-hidden"
        >
          {/* Top-right theme, language, and about switches (FR-4, FR-5, FR-7) */}
          <div className={SWISS_CONTROL_LAYOUT.topRightClusterClass}>
            <button
              type="button"
              data-testid="about-btn"
              onClick={() => setIsAboutModalOpen(true)}
              title={getTranslation(language, 'about_title')}
              aria-label={getTranslation(language, 'about_title')}
              className="inline-flex items-center justify-center w-[30px] h-[30px] rounded-[4px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#FFFFFF] dark:bg-[#181C23] text-[#111315] dark:text-[#F3F4F6] hover:bg-[#ECEAE3] dark:hover:bg-[#1E232C] hover:border-[#1B44E8] dark:hover:border-[#3B66FF] hover:text-[#1B44E8] dark:hover:text-[#3B66FF] transition-all duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1B44E8] dark:focus-visible:ring-[#3B66FF] active:scale-95"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
            <ThemeToggle
              theme={theme}
              onToggle={toggleTheme}
              language={language}
            />
            <LanguageToggle
              currentLanguage={language}
              onLanguageChange={handleLanguageChange}
              theme={theme}
            />
          </div>

          <div
            className="max-w-[420px] w-full rounded-[6px] border border-[#C9C6BD] dark:border-[#2C323D] bg-[#FFFFFF] dark:bg-[#181C23] overflow-hidden shadow-sm flex flex-col text-center transition-colors"
          >
            {/* Technical Index Strip for Offline (FR-6, EC-1) */}
            <div className="h-8 px-4 bg-[#F2F0EA] dark:bg-[#15181E] border-b border-[#C9C6BD] dark:border-[#2C323D] flex items-center justify-between font-mono text-[10.5px] text-[#7C8087] dark:text-[#6B7280] tracking-wider select-none">
              <span>{offlineStrip.leftLabel}</span>
              <span>{offlineStrip.rightLabel}</span>
            </div>

            <div className="p-8 flex flex-col items-center text-center">
              <div
                className="w-14 h-14 rounded-[6px] border border-[rgba(217,93,30,0.25)] dark:border-[rgba(249,115,22,0.32)] bg-[rgba(217,93,30,0.08)] dark:bg-[rgba(249,115,22,0.14)] text-[#D95D1E] dark:text-[#F97316] flex items-center justify-center mb-5"
              >
                <WifiOff className="w-8 h-8" />
              </div>

              <h2 className="font-display text-xl font-bold mb-1 text-[#111315] dark:text-[#F3F4F6]">
                {getTranslation(language, 'offline_mode_title')}
              </h2>
              {userProfile?.email && (
                <p className="font-mono text-xs text-[#7C8087] dark:text-[#6B7280] mb-2">
                  {userProfile.email}
                </p>
              )}

              <div
                className="w-full p-3.5 border border-[#C9C6BD] dark:border-[#2C323D] bg-[#F2F0EA] dark:bg-[#15181E] rounded-[4px] font-sans text-xs text-[#4A4E54] dark:text-[#9CA3AF] leading-relaxed my-3 text-center"
              >
                {userProfile?.email
                  ? getTranslation(language, 'offline_mode_desc_saved')
                  : getTranslation(language, 'offline_mode_desc_no_session')}
              </div>

              <button
                type="button"
                onClick={checkSession}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-[4px] font-display transition-colors border border-[#1B44E8] dark:border-[#3B66FF] bg-[#1B44E8] dark:bg-[#3B66FF] hover:bg-[#1435B8] dark:hover:bg-[#5278FF] text-white mt-1 shadow-xs active:scale-[0.99]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{getTranslation(language, 'retry_connection')}</span>
              </button>
            </div>
          </div>
        </div>
      ) : authState === 'authenticated' && userProfile ? (
        <AppShell
          userProfile={userProfile}
          storageQuota={quota}
          isLoadingQuota={isLoadingQuota}
          quotaError={quotaError}
          language={language}
          theme={theme}
          onSetTheme={setTheme}
          onDisconnect={() => setIsDisconnectModalOpen(true)}
          onSetLanguage={handleLanguageChange}
          onRefreshQuota={loadQuota}
        />
      ) : (
        <WelcomeScreen
          onSignIn={handleSignIn}
          disabled={authState === 'awaiting_authorization'}
          language={language}
          onLanguageChange={handleLanguageChange}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenAbout={() => setIsAboutModalOpen(true)}
        />
      )}

      <AwaitingAuthModal
        isOpen={authState === 'awaiting_authorization'}
        onCancel={handleCancel}
        language={language}
        theme={theme}
      />

      <DisconnectModal
        isOpen={isDisconnectModalOpen}
        isDisconnecting={isDisconnecting}
        language={language}
        theme={theme}
        onConfirm={handleConfirmDisconnect}
        onCancel={() => setIsDisconnectModalOpen(false)}
      />

      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        language={language}
        theme={theme}
      />
    </div>
  );
};

export default App;
