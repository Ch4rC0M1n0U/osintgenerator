import React, { useState, useEffect } from 'react';
import { User, Plus, Search, Tag, Download, Settings, Eye, Trash2, Users, LogOut } from 'lucide-react';
import ProfileGenerator from './components/ProfileGenerator';
import ProfileList from './components/ProfileList';
import ProfileDetails from './components/ProfileDetails';
import Login from './components/Login';
import Register from './components/Register';
import LanguageSelector from './components/LanguageSelector';
import { Profile, SocialMediaProfile } from './types/Profile';
import { useTranslation } from './hooks/useTranslation';

function App() {
  const { t, language, setLanguage } = useTranslation();
  const [activeTab, setActiveTab] = useState<'generate' | 'manage' | 'details'>('generate');
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [socialMediaProfiles, setSocialMediaProfiles] = useState<SocialMediaProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Check for existing auth token on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      verifyToken(token);
    }
  }, []);

  // Update language when user language changes
  useEffect(() => {
    if (user?.language && user.language !== language) {
      setLanguage(user.language);
    }
  }, [user, language, setLanguage]);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAuthToken(token);
        setUser(data.user);
      } else {
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('authToken');
    }
  };

  const handleLogin = (token: string) => {
    setAuthToken(token);
    verifyToken(token);
  };

  const handleRegister = (token: string) => {
    setAuthToken(token);
    verifyToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setUser(null);
    setProfiles([]);
    setSelectedProfile(null);
    setSocialMediaProfiles([]);
    setAuthView('login');
  };

  const updateLanguagePreference = async (newLanguage: string) => {
    if (!authToken) return;

    try {
      await fetch('/api/auth/language', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ language: newLanguage })
      });
    } catch (error) {
      console.error('Failed to update language preference:', error);
    }
  };

  // Watch for language changes and update server
  useEffect(() => {
    if (user && language !== user.language) {
      updateLanguagePreference(language);
    }
  }, [language, user, authToken]);

  const fetchProfiles = async () => {
    if (!authToken) return;

    try {
      setLoading(true);
      const response = await fetch('/api/profiles', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await response.json();
      setProfiles(data);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileGenerated = (profile: Profile, socialMedia: SocialMediaProfile[]) => {
    setProfiles(prev => [profile, ...prev]);
    setSelectedProfile(profile);
    setSocialMediaProfiles(socialMedia);
    setActiveTab('details');
  };

  const handleProfileSelect = async (profile: Profile) => {
    if (!authToken) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/profiles/${profile.id}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await response.json();
      setSelectedProfile(data.profile);
      setSocialMediaProfiles(data.socialMediaProfiles || []);
      setActiveTab('details');
    } catch (error) {
      console.error('Error fetching profile details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileDelete = async (profileId: string) => {
    if (!authToken) return;

    try {
      await fetch(`/api/profiles/${profileId}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      setProfiles(prev => prev.filter(p => p.id !== profileId));
      if (selectedProfile?.id === profileId) {
        setSelectedProfile(null);
        setSocialMediaProfiles([]);
        setActiveTab('manage');
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchProfiles();
    }
  }, [authToken]);

  const filteredProfiles = profiles.filter(profile =>
    profile.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show authentication views if not authenticated
  if (!authToken) {
    if (authView === 'register') {
      return (
        <Register 
          onRegister={handleRegister}
          onBackToLogin={() => setAuthView('login')}
        />
      );
    }
    return (
      <Login 
        onLogin={handleLogin}
        onShowRegister={() => setAuthView('register')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-400" />
              <h1 className="text-xl font-bold">OSINT Profile Generator</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                {t('profilesGenerated', { count: profiles.length })}
              </span>
              <span className="text-sm text-gray-400">
                {user?.email}
              </span>
              <LanguageSelector />
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>{t('logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('generate')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'generate'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <Plus className="h-4 w-4" />
              <span>{t('generateProfile')}</span>
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'manage'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <User className="h-4 w-4" />
              <span>{t('manageProfiles')}</span>
            </button>
            {selectedProfile && (
              <button
                onClick={() => setActiveTab('details')}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'details'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <Eye className="h-4 w-4" />
                <span>{t('profileDetails')}</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'generate' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-100 mb-4">{t('generateNewProfile')}</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                {t('generateDescription')}
              </p>
            </div>
            <ProfileGenerator onProfileGenerated={handleProfileGenerated} authToken={authToken} />
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-100">{t('manageProfiles')}</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('searchProfiles')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            <ProfileList
              profiles={filteredProfiles}
              onProfileSelect={handleProfileSelect}
              onProfileDelete={handleProfileDelete}
              loading={loading}
            />
          </div>
        )}

        {activeTab === 'details' && selectedProfile && (
          <ProfileDetails
            profile={selectedProfile}
            socialMediaProfiles={socialMediaProfiles}
            onBack={() => setActiveTab('manage')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p className="text-sm">
              ⚠️ <strong>{t('disclaimer')}</strong>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;