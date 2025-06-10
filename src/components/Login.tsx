import React, { useState } from 'react';
import { Shield, Mail, Lock, AlertCircle, UserPlus } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import LanguageSelector from './LanguageSelector';

interface LoginProps {
  onLogin: (token: string) => void;
  onShowRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onShowRegister }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate email domain
    if (!email.endsWith('@police.belgium.eu')) {
      setError(t('accessDenied'));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        onLogin(data.token);
      } else {
        setError(data.error || t('invalidCredentials'));
      }
    } catch (error) {
      setError(t('invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-full shadow-lg">
              <Shield className="h-12 w-12 text-blue-800" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {t('loginTitle')}
          </h2>
          <p className="text-blue-200">
            {t('loginSubtitle')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-2" />
                {t('email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="nom@police.belgium.eu"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="inline h-4 w-4 mr-2" />
                {t('password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                t('login')
              )}
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-6 text-center">
            <button
              onClick={onShowRegister}
              className="flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-500 text-sm font-medium mx-auto"
            >
              <UserPlus className="h-4 w-4" />
              <span>Créer un compte</span>
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-800/50 rounded-lg p-4 text-center">
          <p className="text-blue-200 text-sm">
            🔒 Accès sécurisé réservé au personnel de la Police Fédérale Belge
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;