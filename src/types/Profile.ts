export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  gender: string;
  nationality: string;
  age: number;
  photo_url?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
  created_at?: string;
  updated_at?: string;
  tags?: string;
}

export interface SocialMediaProfile {
  id?: number;
  profile_id: string;
  platform: string;
  username: string;
  bio: string;
  followers: number;
  following: number;
  posts_count: number;
  interests: string[] | string;
  data: Record<string, any> | string;
  created_at?: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

export interface GenerateProfileOptions {
  nationality?: string;
  gender?: 'male' | 'female';
  minAge?: number;
  maxAge?: number;
}