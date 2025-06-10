import React, { useState } from 'react';
import { User, Globe, Calendar, Shuffle, Loader } from 'lucide-react';
import { Profile, SocialMediaProfile, GenerateProfileOptions } from '../types/Profile';
import { useTranslation } from '../hooks/useTranslation';

interface ProfileGeneratorProps {
  onProfileGenerated: (profile: Profile, socialMedia: SocialMediaProfile[]) => void;
  authToken: string;
}

const ProfileGenerator: React.FC<ProfileGeneratorProps> = ({ onProfileGenerated, authToken }) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState<GenerateProfileOptions>({});
  const [loading, setLoading] = useState(false);

  const nationalities = [
    { code: 'US', label: t('countries.US') },
    { code: 'GB', label: t('countries.GB') },
    { code: 'CA', label: t('countries.CA') },
    { code: 'AU', label: t('countries.AU') },
    { code: 'DE', label: t('countries.DE') },
    { code: 'FR', label: t('countries.FR') },
    { code: 'ES', label: t('countries.ES') },
    { code: 'IT', label: t('countries.IT') },
    { code: 'BR', label: t('countries.BR') },
    { code: 'MX', label: t('countries.MX') },
    { code: 'IN', label: t('countries.IN') },
    { code: 'JP', label: t('countries.JP') },
  ];

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profiles/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error('Failed to generate profile');
      }

      const data = await response.json();
      onProfileGenerated(data.profile, data.socialMediaProfiles);
    } catch (error) {
      console.error('Error generating profile:', error);
      alert('Failed to generate profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="space-y-6">
          {/* Nationality Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Globe className="inline h-4 w-4 mr-2" />
              {t('nationality')}
            </label>
            <select
              value={options.nationality || ''}
              onChange={(e) => setOptions({ ...options, nationality: e.target.value || undefined })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('random')}</option>
              {nationalities.map((nat) => (
                <option key={nat.code} value={nat.code}>
                  {nat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <User className="inline h-4 w-4 mr-2" />
              {t('gender')}
            </label>
            <select
              value={options.gender || ''}
              onChange={(e) => setOptions({ ...options, gender: e.target.value as 'male' | 'female' || undefined })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('random')}</option>
              <option value="male">{t('male')}</option>
              <option value="female">{t('female')}</option>
            </select>
          </div>

          {/* Age Range */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar className="inline h-4 w-4 mr-2" />
              {t('ageRange')}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t('minAge')}</label>
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={options.minAge || ''}
                  onChange={(e) => setOptions({ ...options, minAge: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="18"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t('maxAge')}</label>
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={options.maxAge || ''}
                  onChange={(e) => setOptions({ ...options, maxAge: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="65"
                />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>{t('generatingProfile')}</span>
              </>
            ) : (
              <>
                <Shuffle className="h-5 w-5" />
                <span>{t('generateProfile')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Information Box */}
      <div className="mt-6 bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
        <h3 className="text-blue-300 font-medium mb-2">{t('whatGetsGenerated')}</h3>
        <ul className="text-sm text-blue-200 space-y-1">
          <li>• Complete personal information from randomuser.me API</li>
          <li>• Consistent social media profiles (Facebook, Instagram, Twitter, LinkedIn)</li>
          <li>• Realistic interests, hobbies, and behavioral patterns</li>
          <li>• Professional background and education details</li>
          <li>• Cross-platform username variations</li>
        </ul>
      </div>
    </div>
  );
};

export default ProfileGenerator;