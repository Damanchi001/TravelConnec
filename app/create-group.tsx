import { useInfiniteQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
    ArrowLeft,
    Check,
    Search,
    Users,
    X,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/src/constants/theme';
import { groupsService, MutualFollower } from '@/src/services/groups';
import { useAuthStore } from '@/src/stores/auth-store';

const { width: screenWidth } = Dimensions.get('window');

interface SelectedUser extends MutualFollower {
  selected: boolean;
}

export default function CreateGroupScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { profile } = useAuthStore();

  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const {
    data: followersData,
    isLoading: followersLoading,
    error: followersError,
    refetch: refetchFollowers,
  } = useInfiniteQuery({
    queryKey: ['mutual-followers', profile?.id, searchQuery],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      groupsService.getMutualFollowers(profile?.id || ''),
    enabled: !!profile?.id,
    initialPageParam: 1,
    getNextPageParam: (lastPage: any, pages: any[]) => {
      return lastPage.length === 20 ? pages.length + 1 : undefined;
    },
  });

  const followers = useMemo(() => {
    if (!followersData?.pages) return [];
    return followersData.pages.flatMap(page => page);
  }, [followersData]);

  const filteredFollowers = useMemo(() => {
    return followers.filter(follower =>
      follower.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      follower.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      follower.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [followers, searchQuery]);

  const toggleUserSelection = useCallback((user: MutualFollower) => {
    setSelectedUsers(prev => {
      const existing = prev.find(u => u.user_id === user.user_id);
      if (existing) {
        return prev.filter(u => u.user_id !== user.user_id);
      } else {
        return [...prev, { ...user, selected: true }];
      }
    });
  }, []);

  const removeSelectedUser = useCallback((userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u.user_id !== userId));
  }, []);

  const handleCreateGroup = useCallback(async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (selectedUsers.length === 0) {
      Alert.alert('Error', 'Please select at least one member');
      return;
    }

    if (selectedUsers.length > 49) { // Max 50 including creator
      Alert.alert('Error', 'Groups can have maximum 50 members');
      return;
    }

    try {
      setIsCreating(true);

      const memberIds = selectedUsers.map(u => u.user_id);
      const group = await groupsService.createGroup({
        name: groupName.trim(),
        memberIds,
      });

      Alert.alert(
        'Success',
        'Group created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to the group chat
              router.replace(`/chat?id=${group.stream_channel_id}` as any);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group. Please try again.');
    } finally {
      setIsCreating(false);
    }
  }, [groupName, selectedUsers]);

  const renderSelectedUser = useCallback(({ item }: { item: SelectedUser }) => (
    <View style={styles.selectedUserChip}>
      <Image
        source={{ uri: item.avatar_url }}
        style={styles.selectedUserAvatar}
        contentFit="cover"
      />
      <Text style={styles.selectedUserName} numberOfLines={1}>
        {item.first_name} {item.last_name}
      </Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeSelectedUser(item.user_id)}
      >
        <X size={16} color="#666" />
      </TouchableOpacity>
    </View>
  ), [removeSelectedUser]);

  const renderFollowerItem = useCallback(({ item }: { item: MutualFollower }) => {
    const isSelected = selectedUsers.some(u => u.user_id === item.user_id);

    return (
      <TouchableOpacity
        style={[styles.followerItem, isSelected && styles.selectedFollowerItem]}
        onPress={() => toggleUserSelection(item)}
      >
        <View style={styles.followerLeft}>
          <Image
            source={{ uri: item.avatar_url }}
            style={styles.followerAvatar}
            contentFit="cover"
          />
          <View style={styles.followerInfo}>
            <View style={styles.followerNameRow}>
              <Text style={styles.followerName}>
                {item.first_name} {item.last_name}
              </Text>
              {item.is_verified && (
                <View style={styles.verifiedBadge}>
                  <Check size={12} color="#138AFE" />
                </View>
              )}
            </View>
            <Text style={styles.followerUsername}>@{item.username}</Text>
            {item.bio && (
              <Text style={styles.followerBio} numberOfLines={1}>
                {item.bio}
              </Text>
            )}
          </View>
        </View>

        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Check size={16} color="#FFF" />}
        </View>
      </TouchableOpacity>
    );
  }, [selectedUsers, toggleUserSelection]);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <Users size={48} color="#E5E7EB" />
      <Text style={styles.emptyStateTitle}>No mutual followers found</Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery
          ? "Try adjusting your search terms"
          : "You need mutual followers to create groups. Start following travelers who follow you back!"
        }
      </Text>
    </View>
  ), [searchQuery]);

  if (followersError) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Create Group</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Failed to load mutual followers
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.tint }]}
            onPress={() => refetchFollowers()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Create Group</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Group Name Input */}
      <View style={styles.groupNameContainer}>
        <TextInput
          style={[styles.groupNameInput, { color: colors.text }]}
          placeholder="Enter group name..."
          placeholderTextColor={colors.secondaryText}
          value={groupName}
          onChangeText={setGroupName}
          maxLength={50}
        />
        <Text style={[styles.charCount, { color: colors.secondaryText }]}>
          {groupName.length}/50
        </Text>
      </View>

      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <View style={styles.selectedUsersContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Selected ({selectedUsers.length})
          </Text>
          <FlatList
            data={selectedUsers}
            keyExtractor={(item) => item.user_id}
            renderItem={renderSelectedUser}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectedUsersList}
          />
        </View>
      )}

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground }]}>
        <Search size={20} color={colors.secondaryText} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search mutual followers..."
          placeholderTextColor={colors.secondaryText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Followers List */}
      <FlatList
        data={filteredFollowers}
        keyExtractor={(item) => item.user_id}
        renderItem={renderFollowerItem}
        ListEmptyComponent={followersLoading ? null : renderEmptyState}
        ListHeaderComponent={
          followersLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.tint} />
            </View>
          ) : null
        }
        contentContainerStyle={styles.followersList}
        showsVerticalScrollIndicator={false}
      />

      {/* Create Button */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={[
            styles.createButton,
            (!groupName.trim() || selectedUsers.length === 0 || isCreating) && styles.createButtonDisabled
          ]}
          onPress={handleCreateGroup}
          disabled={!groupName.trim() || selectedUsers.length === 0 || isCreating}
        >
          {isCreating ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Users size={20} color="#FFF" />
              <Text style={styles.createButtonText}>
                Create Group ({selectedUsers.length + 1})
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  groupNameContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  groupNameInput: {
    fontSize: 18,
    fontWeight: '500',
    paddingVertical: 8,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  selectedUsersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  selectedUsersList: {
    paddingVertical: 4,
  },
  selectedUserChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    maxWidth: 150,
  },
  selectedUserAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  selectedUserName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    flex: 1,
  },
  removeButton: {
    marginLeft: 8,
    padding: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  followersList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  followerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
  },
  selectedFollowerItem: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#138AFE',
  },
  followerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  followerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  followerInfo: {
    flex: 1,
  },
  followerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  followerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginRight: 4,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(19, 138, 254, 0.1)',
    borderRadius: 8,
    padding: 2,
  },
  followerUsername: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  followerBio: {
    fontSize: 14,
    color: '#666',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#138AFE',
    borderColor: '#138AFE',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#138AFE',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  createButtonDisabled: {
    backgroundColor: '#CCC',
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});