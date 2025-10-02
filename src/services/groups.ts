import { chatService } from './stream/chat-service';
import { supabase } from './supabase/client';

export interface Group {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  created_by: string;
  stream_channel_id: string;
  stream_channel_type: string;
  is_active: boolean;
  max_members: number;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  status: 'active' | 'removed' | 'invited';
  invited_by?: string;
  joined_at: string;
  created_at: string;
}

export interface MutualFollower {
  user_id: string;
  first_name: string;
  last_name: string;
  username: string;
  avatar_url: string;
  bio?: string;
  is_verified: boolean;
  location?: {
    city?: string;
    country?: string;
  };
}

export interface UserGroup {
  group_id: string;
  group_name: string;
  group_description?: string;
  group_avatar_url?: string;
  stream_channel_id: string;
  member_count: number;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface CreateGroupData {
  name: string;
  description?: string;
  memberIds: string[];
}

export class GroupsService {
  async getMutualFollowers(userId: string): Promise<MutualFollower[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_mutual_followers', { user_uuid: userId });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching mutual followers:', error);
      throw error;
    }
  }

  async createGroup(data: CreateGroupData): Promise<Group> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Validate that all members are mutual followers
      for (const memberId of data.memberIds) {
        const isMutual = await this.checkMutualFollow(user.id, memberId);
        if (!isMutual) {
          throw new Error(`User ${memberId} is not a mutual follower`);
        }
      }

      // Create Stream channel for the group
      const allMemberIds = [user.id, ...data.memberIds];
      const channel = await chatService.createChannel('messaging', allMemberIds, {
        name: data.name,
      });

      // Create group in database
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: data.name,
          description: data.description,
          created_by: user.id,
          stream_channel_id: channel.id!,
          stream_channel_type: 'messaging',
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add members to group
      const memberInserts = allMemberIds.map(memberId => ({
        group_id: groupData.id,
        user_id: memberId,
        role: memberId === user.id ? 'admin' : 'member',
        status: 'active',
        invited_by: user.id,
      }));

      const { error: membersError } = await supabase
        .from('group_members')
        .insert(memberInserts);

      if (membersError) throw membersError;

      return groupData;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  async getUserGroups(userId: string): Promise<UserGroup[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_groups', { user_uuid: userId });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching user groups:', error);
      throw error;
    }
  }

  async getGroupDetails(groupId: string): Promise<Group | null> {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching group details:', error);
      throw error;
    }
  }

  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .eq('status', 'active')
        .order('joined_at', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching group members:', error);
      throw error;
    }
  }

  async addGroupMember(groupId: string, userId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if current user is admin
      const { data: membership, error: membershipError } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (membershipError || membership.role !== 'admin') {
        throw new Error('Only group admins can add members');
      }

      // Check if user is mutual follower
      const isMutual = await this.checkMutualFollow(user.id, userId);
      if (!isMutual) {
        throw new Error('Can only add mutual followers to groups');
      }

      // Add member to database
      const { error: insertError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: userId,
          role: 'member',
          status: 'active',
          invited_by: user.id,
        });

      if (insertError) throw insertError;

      // Add to Stream channel
      const channel = await chatService.getUserChannels(userId);
      // Note: Stream channel member addition would need to be handled via Stream API
      // This is a simplified version

    } catch (error) {
      console.error('Error adding group member:', error);
      throw error;
    }
  }

  async removeGroupMember(groupId: string, userId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if current user is admin or removing themselves
      const { data: membership, error: membershipError } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (membershipError) throw membershipError;

      if (membership.role !== 'admin' && user.id !== userId) {
        throw new Error('Only admins can remove other members');
      }

      // Remove member from database
      const { error: updateError } = await supabase
        .from('group_members')
        .update({ status: 'removed' })
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Note: Stream channel member removal would need to be handled via Stream API

    } catch (error) {
      console.error('Error removing group member:', error);
      throw error;
    }
  }

  async updateGroupName(groupId: string, name: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if user is admin
      const { data: membership, error: membershipError } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (membershipError || membership.role !== 'admin') {
        throw new Error('Only group admins can update group name');
      }

      const { error } = await supabase
        .from('groups')
        .update({ name, updated_at: new Date().toISOString() })
        .eq('id', groupId);

      if (error) throw error;

    } catch (error) {
      console.error('Error updating group name:', error);
      throw error;
    }
  }

  private async checkMutualFollow(userId1: string, userId2: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('are_mutual_followers', {
          user1_uuid: userId1,
          user2_uuid: userId2
        });

      if (error) throw error;

      return data || false;
    } catch (error) {
      console.error('Error checking mutual follow:', error);
      return false;
    }
  }

  async isUserInGroup(userId: string, groupId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return !!data;
    } catch (error) {
      console.error('Error checking user in group:', error);
      return false;
    }
  }
}

export const groupsService = new GroupsService();