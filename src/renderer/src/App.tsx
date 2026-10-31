import React, { useState } from 'react';
import type { AuthState, UserProfile } from '../../shared/types';
import { WelcomeScreen } from './components/auth/WelcomeScreen';
import { AwaitingAuthModal } from './components/auth/AwaitingAuthModal';

export const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>('unauthenticated');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async () => {
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
      } else {
        if (result.error?.code === 'AUTH_CANCELLED') {
          // Clean exit on cancel without loud error banner
          setErrorMessage(null);
        } else if (result.error?.code === 'AUTH_TIMEOUT') {
          setErrorMessage('Authorization timed out after 60 seconds. Please try again.');
        } else {
          setErrorMessage(result.error?.message || 'Login failed');
        }
        setAuthState('unauthenticated');
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

  return (
    <div className="w-full h-full flex flex-col relative">
      {errorMessage && (
        <div className="bg-amber-50 text-amber-800 px-4 py-2.5 text-xs border-b border-amber-200 text-center font-medium shadow-sm">
          {errorMessage}
        </div>
      )}

      {authState === 'authenticated' && userProfile ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-center max-w-sm w-full">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Authenticated</h2>
            <p className="text-sm text-slate-600 mb-4">{userProfile.email}</p>
          </div>
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
    </div>
  );
};

export default App;
