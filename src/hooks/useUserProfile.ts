import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/auth-store';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
  location?: {
    city?: string;
    country?: string;
  };
  created_at: string;
  is_verified?: boolean;
  preferences?: {
    interests?: string[];
    countriesVisited?: string[];
  };
}

interface UseUserProfileResult {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUserProfile = (userId: string): UseUserProfileResult => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      // const response = await userService.getUserProfile(userId);

      // Mock data for now
      const mockProfile: UserProfile = {
        id: userId,
        first_name: 'Sarah',
        last_name: 'Johnson',
        username: 'sarah_travels',
        bio: 'Digital nomad exploring the world ✈️',
        avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b4f04e31?w=200&h=200&fit=crop&crop=face',
        location: { city: 'Paris', country: 'France' },
        created_at: '2023-01-15T00:00:00Z',
        is_verified: true,
        preferences: {
          interests: ['Photography', 'Hiking', 'Food', 'Culture'],
          countriesVisited: ['France', 'Italy', 'Spain', 'Japan']
        }
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setProfile(mockProfile);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
  };
};

interface UseFollowStatusResult {
  isFollowing: boolean;
  loading: boolean;
  error: string | null;
  toggleFollow: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useFollowStatus = (targetUserId: string): UseFollowStatusResult => {
  const { profile: currentUser } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkFollowStatus = async () => {
    if (!currentUser?.id || !targetUserId) return;

    try {
      // TODO: Replace with actual API call to check follow status
      // const response = await feedsService.getFollowStatus(currentUser.id, targetUserId);

      // Mock: randomly set follow status for demo
      const mockIsFollowing = Math.random() > 0.5;
      setIsFollowing(mockIsFollowing);
    } catch (err) {
      console.error('Failed to check follow status:', err);
      setError('Failed to check follow status');
    }
  };

  const toggleFollow = async () => {
    if (!currentUser?.id || !targetUserId) return;

    try {
      setLoading(true);
      setError(null);

      if (isFollowing) {
        // TODO: Replace with actual unfollow API call
        // await feedsService.unfollowUser(currentUser.id, targetUserId);
        console.log('Unfollowing user:', targetUserId);
      } else {
        // TODO: Replace with actual follow API call
        // await feedsService.followUser(currentUser.id, targetUserId);
        console.log('Following user:', targetUserId);
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error('Failed to toggle follow:', err);
      setError('Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkFollowStatus();
  }, [currentUser?.id, targetUserId]);

  return {
    isFollowing,
    loading,
    error,
    toggleFollow,
    refetch: checkFollowStatus,
  };
};