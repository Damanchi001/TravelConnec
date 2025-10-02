import { supabase } from './supabase/client';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  avatar_url: string;
  bio?: string;
  is_verified?: boolean;
  location?: {
    city?: string;
    country?: string;
  };
}

export interface FollowersResponse {
  users: User[];
  hasMore: boolean;
  total: number;
}

export class FollowersService {
  async getFollowers(
    userId: string,
    page: number = 1,
    limit: number = 20,
    search?: string
  ): Promise<FollowersResponse> {
    try {
      const offset = (page - 1) * limit;

      // Get follower IDs first
      const { data: followerIds, error: followerError } = await supabase
        .from('followers')
        .select('follower_id')
        .eq('following_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (followerError) throw followerError;

      if (!followerIds || followerIds.length === 0) {
        return { users: [], hasMore: false, total: 0 };
      }

      const ids = followerIds.map(f => f.follower_id);

      // Get user profiles
      let query = supabase
        .from('user_profiles')
        .select('id, first_name, last_name, username, avatar_url, bio, verification_status, location')
        .in('id', ids);

      if (search) {
        const searchTerm = `%${search}%`;
        query = query.or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},username.ilike.${searchTerm}`);
      }

      const { data: profiles, error: profileError } = await query;

      if (profileError) throw profileError;

      // Transform the data and maintain order
      const users: User[] = ids.map(id =>
        profiles?.find(p => p.id === id)
      ).filter(Boolean).map(profile => ({
        id: profile!.id,
        first_name: profile!.first_name,
        last_name: profile!.last_name,
        username: profile!.username,
        avatar_url: profile!.avatar_url,
        bio: profile!.bio,
        is_verified: profile!.verification_status === 'verified',
        location: profile!.location,
      }));

      // Get total count
      const { count, error: countError } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      if (countError) throw countError;

      return {
        users,
        hasMore: (count || 0) > offset + limit,
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching followers:', error);
      throw error;
    }
  }

  async getFollowing(
    userId: string,
    page: number = 1,
    limit: number = 20,
    search?: string
  ): Promise<FollowersResponse> {
    try {
      const offset = (page - 1) * limit;

      // Get following IDs first
      const { data: followingIds, error: followingError } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (followingError) throw followingError;

      if (!followingIds || followingIds.length === 0) {
        return { users: [], hasMore: false, total: 0 };
      }

      const ids = followingIds.map(f => f.following_id);

      // Get user profiles
      let query = supabase
        .from('user_profiles')
        .select('id, first_name, last_name, username, avatar_url, bio, verification_status, location')
        .in('id', ids);

      if (search) {
        const searchTerm = `%${search}%`;
        query = query.or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},username.ilike.${searchTerm}`);
      }

      const { data: profiles, error: profileError } = await query;

      if (profileError) throw profileError;

      // Transform the data and maintain order
      const users: User[] = ids.map(id =>
        profiles?.find(p => p.id === id)
      ).filter(Boolean).map(profile => ({
        id: profile!.id,
        first_name: profile!.first_name,
        last_name: profile!.last_name,
        username: profile!.username,
        avatar_url: profile!.avatar_url,
        bio: profile!.bio,
        is_verified: profile!.verification_status === 'verified',
        location: profile!.location,
      }));

      // Get total count
      const { count, error: countError } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      if (countError) throw countError;

      return {
        users,
        hasMore: (count || 0) > offset + limit,
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching following:', error);
      throw error;
    }
  }

  async followUser(followingId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('followers')
        .insert({
          follower_id: user.id,
          following_id: followingId,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  }

  async unfollowUser(followingId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', followingId);

      if (error) throw error;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  }

  async isFollowing(followingId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('followers')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', followingId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"

      return !!data;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  }

  async getFollowersCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting followers count:', error);
      return 0;
    }
  }

  async getFollowingCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting following count:', error);
      return 0;
    }
  }
}

export const followersService = new FollowersService();