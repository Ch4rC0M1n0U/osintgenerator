import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Globe, Copy, ExternalLink } from 'lucide-react';
import { Profile, SocialMediaProfile } from '../types/Profile';
import { useTranslation } from '../hooks/useTranslation';

interface ProfileDetailsProps {
  profile: Profile;
  socialMediaProfiles: SocialMediaProfile[];
  onBack: () => void;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({
  profile,
  socialMediaProfiles,
  onBack,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'basic' | 'social'>('basic');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const platformIcons = {
    Facebook: '📘',
    Instagram: '📷',
    Twitter: '🐦',
    LinkedIn: '💼',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>{t('backToProfiles')}</span>
        </button>
      </div>

      {/* Profile Header */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-start space-x-6">
          {profile.photo_url ? (
            <img
              src={profile.photo_url}
              alt={`${profile.first_name} ${profile.last_name}`}
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-600"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center">
              <User className="h-12 w-12 text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">
              {profile.first_name} {profile.last_name}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{profile.email}</span>
                <button
                  onClick={() => copyToClipboard(profile.email, 'email')}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
              {profile.phone && (
                <div className="flex items-center space-x-2 text-gray-300">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{profile.phone}</span>
                  <button
                    onClick={() => copyToClipboard(profile.phone, 'phone')}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              )}
              <div className="flex items-center space-x-2 text-gray-300">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{profile.city}, {profile.country}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{profile.age} {t('yearsOld')}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Globe className="h-4 w-4 text-gray-400" />
                <span>{profile.nationality}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <User className="h-4 w-4 text-gray-400" />
                <span className="capitalize">{profile.gender}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('basic')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'basic'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            {t('basicInformation')}
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'social'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            {t('socialMediaProfiles')}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'basic' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">{t('personalInformation')}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">{t('fullName')}</label>
                <p className="text-white">{profile.first_name} {profile.last_name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">{t('emailAddress')}</label>
                <p className="text-white">{profile.email}</p>
              </div>
              {profile.phone && (
                <div>
                  <label className="text-sm text-gray-400">{t('phoneNumber')}</label>
                  <p className="text-white">{profile.phone}</p>
                </div>
              )}
              <div>
                <label className="text-sm text-gray-400">{t('age')}</label>
                <p className="text-white">{profile.age} {t('yearsOld')}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">{t('gender')}</label>
                <p className="text-white capitalize">{profile.gender}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">{t('nationality')}</label>
                <p className="text-white">{profile.nationality}</p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">{t('addressInformation')}</h3>
            <div className="space-y-4">
              {profile.address && (
                <div>
                  <label className="text-sm text-gray-400">{t('streetAddress')}</label>
                  <p className="text-white">{profile.address}</p>
                </div>
              )}
              {profile.city && (
                <div>
                  <label className="text-sm text-gray-400">{t('city')}</label>
                  <p className="text-white">{profile.city}</p>
                </div>
              )}
              {profile.state && (
                <div>
                  <label className="text-sm text-gray-400">{t('state')}</label>
                  <p className="text-white">{profile.state}</p>
                </div>
              )}
              {profile.country && (
                <div>
                  <label className="text-sm text-gray-400">{t('country')}</label>
                  <p className="text-white">{profile.country}</p>
                </div>
              )}
              {profile.postcode && (
                <div>
                  <label className="text-sm text-gray-400">{t('postalCode')}</label>
                  <p className="text-white">{profile.postcode}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'social' && (
        <div className="space-y-6">
          {socialMediaProfiles.map((smProfile) => {
            // Handle both parsed objects and JSON strings
            const platformData = typeof smProfile.data === 'string' 
              ? JSON.parse(smProfile.data) 
              : smProfile.data || {};
            const interests = typeof smProfile.interests === 'string' 
              ? JSON.parse(smProfile.interests) 
              : smProfile.interests || [];
            
            return (
              <div key={smProfile.platform} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                    <span className="text-2xl">{platformIcons[smProfile.platform as keyof typeof platformIcons]}</span>
                    <span>{smProfile.platform}</span>
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyToClipboard(smProfile.username, `${smProfile.platform} username`)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Profile Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400">{t('username')}</label>
                      <p className="text-white font-mono">{smProfile.username}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">{t('bio')}</label>
                      <p className="text-white">{smProfile.bio}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-gray-400">{t('followers')}</label>
                        <p className="text-white font-semibold">{smProfile.followers.toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">{t('following')}</label>
                        <p className="text-white font-semibold">{smProfile.following.toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">{t('posts')}</label>
                        <p className="text-white font-semibold">{smProfile.posts_count.toLocaleString()}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">{t('interests')}</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {interests.map((interest: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-900/50 text-blue-300 text-xs rounded-full"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Platform-specific Data */}
                  <div className="space-y-4">
                    <label className="text-sm text-gray-400">{t('platformSpecificInfo')}</label>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <pre className="text-xs text-gray-300 overflow-auto">
                        {JSON.stringify(platformData, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Copy Status */}
      {copiedText && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
          {t('copiedToClipboard', { item: copiedText })}
        </div>
      )}
    </div>
  );
};

export default ProfileDetails;