import React from 'react';
import { Eye, Trash2, User, MapPin, Calendar, Tag } from 'lucide-react';
import { Profile } from '../types/Profile';
import { useTranslation } from '../hooks/useTranslation';

interface ProfileListProps {
  profiles: Profile[];
  onProfileSelect: (profile: Profile) => void;
  onProfileDelete: (profileId: string) => void;
  loading: boolean;
}

const ProfileList: React.FC<ProfileListProps> = ({
  profiles,
  onProfileSelect,
  onProfileDelete,
  loading,
}) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">{t('noProfilesFound')}</h3>
        <p className="text-gray-500">{t('generateFirstProfile')}</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {profiles.map((profile) => (
        <div
          key={profile.id}
          className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors"
        >
          {/* Profile Header */}
          <div className="p-6">
            <div className="flex items-start space-x-4">
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={`${profile.first_name} ${profile.last_name}`}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white truncate">
                  {profile.first_name} {profile.last_name}
                </h3>
                <p className="text-sm text-gray-400 truncate">{profile.email}</p>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{profile.city}, {profile.country}</span>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{t('age')}:</span>
                <span className="text-white">{profile.age}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{t('gender')}:</span>
                <span className="text-white capitalize">{profile.gender}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{t('nationality')}:</span>
                <span className="text-white">{profile.nationality}</span>
              </div>
            </div>

            {/* Tags */}
            {profile.tags && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-1">
                  {profile.tags.split(',').map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 text-xs bg-blue-900/50 text-blue-300 rounded-full"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Created Date */}
            {profile.created_at && (
              <div className="mt-4 flex items-center text-xs text-gray-500">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{t('created')} {formatDate(profile.created_at)}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-750 border-t border-gray-700 flex items-center justify-between">
            <button
              onClick={() => onProfileSelect(profile)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>{t('viewDetails')}</span>
            </button>
            <button
              onClick={() => {
                if (confirm(t('deleteConfirm'))) {
                  onProfileDelete(profile.id);
                }
              }}
              className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>{t('delete')}</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileList;