import { useInfiniteQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import {
    ArrowLeft,
    CheckCircle,
    MapPin,
    MessageCircle,
    Search,
    User,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/src/constants/theme';
import { followersService, User as UserType } from '@/src/services/followers';
import { useAuthStore } from '@/src/stores/auth-store';

const { width: screenWidth } = Dimensions.get('window');

type TabType = 'followers' | 'following';

interface UserItemProps {
  user: UserType;
  onViewProfile: (userId: string) => void;
  onMessage: (userId: string) => void;
}

const UserItem: React.FC<UserItemProps> = ({ user, onViewProfile, onMessage }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.userItem, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        style={styles.userContent}
        onPress={() => onViewProfile(user.id)}
      >
        <Image
          source={{ uri: user.avatar_url }}
          style={styles.avatar}
          contentFit="cover"
          placeholder={require('@/assets/images/icon.png')}
        />

        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.text }]}>
              {user.first_name} {user.last_name}
            </Text>
            {user.is_verified && (
              <CheckCircle size={16} color="#138AFE" fill="#138AFE" />
            )}
          </View>

          <Text style={[styles.username, { color: colors.secondaryText }]}>
            @{user.username}
          </Text>

          {user.bio && (
            <Text
              style={[styles.bio, { color: colors.secondaryText }]}
              numberOfLines={1}
            >
              {user.bio}
            </Text>
          )}

          {user.location && (
            <View style={styles.locationRow}>
              <MapPin size={12} color={colors.secondaryText} />
              <Text style={[styles.location, { color: colors.secondaryText }]}>
                {user.location.city}, {user.location.country}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewProfileButton]}
          onPress={() => onViewProfile(user.id)}
        >
          <User size={16} color="#138AFE" />
          <Text style={styles.viewProfileText}>View Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.messageButton]}
          onPress={() => onMessage(user.id)}
        >
          <MessageCircle size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface EmptyStateProps {
  type: TabType;
  searchQuery?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, searchQuery }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getMessage = () => {
    if (searchQuery) {
      return `No ${type} found matching "${searchQuery}"`;
    }
    return type === 'followers'
      ? "No followers yet"
      : "Not following anyone yet";
  };

  const getSubMessage = () => {
    if (searchQuery) {
      return "Try adjusting your search terms";
    }
    return type === 'followers'
      ? "When people follow you, they'll appear here"
      : "Start following travelers to see their updates";
  };

  return (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
        {getMessage()}
      </Text>
      <Text style={[styles.emptyStateSubtext, { color: colors.secondaryText }]}>
        {getSubMessage()}
      </Text>
    </View>
  );
};

interface LoadingSkeletonProps {}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.userItem, { backgroundColor: colors.background }]}>
      <View style={styles.userContent}>
        <View style={[styles.avatar, styles.skeletonAvatar]} />
        <View style={styles.userInfo}>
          <View style={[styles.skeletonText, styles.skeletonName]} />
          <View style={[styles.skeletonText, styles.skeletonUsername]} />
          <View style={[styles.skeletonText, styles.skeletonBio]} />
          <View style={[styles.skeletonText, styles.skeletonLocation]} />
        </View>
      </View>
      <View style={styles.actionButtons}>
        <View style={[styles.actionButton, styles.skeletonButton]} />
        <View style={[styles.actionButton, styles.skeletonButton]} />
      </View>
    </View>
  );
};

export default function FollowersFollowingScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { profile } = useAuthStore();
  const { userId, initialTab } = useLocalSearchParams<{
    userId?: string;
    initialTab?: TabType;
  }>();

  const [activeTab, setActiveTab] = useState<TabType>(initialTab || 'followers');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const targetUserId = userId || profile?.id || '';

  const {
    data: followersData,
    isLoading: followersLoading,
    error: followersError,
    refetch: refetchFollowers,
    fetchNextPage: fetchNextFollowers,
    hasNextPage: hasNextFollowers,
    isFetchingNextPage: isFetchingNextFollowers,
  } = useInfiniteQuery({
    queryKey: ['followers', targetUserId, searchQuery],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      followersService.getFollowers(targetUserId, pageParam, 20, searchQuery || undefined),
    enabled: activeTab === 'followers' && !!targetUserId,
    initialPageParam: 1,
    getNextPageParam: (lastPage: any, pages: any[]) => {
      return lastPage.hasMore ? pages.length + 1 : undefined;
    },
  });

  const {
    data: followingData,
    isLoading: followingLoading,
    error: followingError,
    refetch: refetchFollowing,
    fetchNextPage: fetchNextFollowing,
    hasNextPage: hasNextFollowing,
    isFetchingNextPage: isFetchingNextFollowing,
  } = useInfiniteQuery({
    queryKey: ['following', targetUserId, searchQuery],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      followersService.getFollowing(targetUserId, pageParam, 20, searchQuery || undefined),
    enabled: activeTab === 'following' && !!targetUserId,
    initialPageParam: 1,
    getNextPageParam: (lastPage: any, pages: any[]) => {
      return lastPage.hasMore ? pages.length + 1 : undefined;
    },
  });

  const currentData = activeTab === 'followers' ? followersData : followingData;
  const isLoading = activeTab === 'followers' ? followersLoading : followingLoading;
  const error = activeTab === 'followers' ? followersError : followingError;
  const refetch = activeTab === 'followers' ? refetchFollowers : refetchFollowing;
  const fetchNextPage = activeTab === 'followers' ? fetchNextFollowers : fetchNextFollowing;
  const hasNextPage = activeTab === 'followers' ? hasNextFollowers : hasNextFollowing;
  const isFetchingNextPage = activeTab === 'followers' ? isFetchingNextFollowers : isFetchingNextFollowing;

  const users = useMemo(() => {
    if (!currentData?.pages) return [];
    return currentData.pages.flatMap(page => page.users);
  }, [currentData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleViewProfile = useCallback((userId: string) => {
    router.push(`/profile/${userId}` as any);
  }, []);

  const handleMessage = useCallback((userId: string) => {
    router.push(`/chat/new?userId=${userId}` as any);
  }, []);

  const renderUserItem = useCallback(({ item }: { item: UserType }) => (
    <UserItem
      user={item}
      onViewProfile={handleViewProfile}
      onMessage={handleMessage}
    />
  ), [handleViewProfile, handleMessage]);

  const renderLoadingSkeleton = useCallback(() => <LoadingSkeleton />, []);

  const renderEmptyState = useCallback(() => (
    <EmptyState type={activeTab} searchQuery={searchQuery} />
  ), [activeTab, searchQuery]);

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.tint} />
      </View>
    );
  }, [isFetchingNextPage, colors.tint]);

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {activeTab === 'followers' ? 'Followers' : 'Following'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Failed to load {activeTab}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.tint }]}
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {activeTab === 'followers' ? 'Followers' : 'Following'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground }]}>
        <Search size={20} color={colors.secondaryText} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search users..."
          placeholderTextColor={colors.secondaryText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.cardBackground }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'followers' && [styles.activeTab, { borderBottomColor: colors.tint }]
          ]}
          onPress={() => setActiveTab('followers')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'followers' ? colors.tint : colors.secondaryText }
          ]}>
            Followers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'following' && [styles.activeTab, { borderBottomColor: colors.tint }]
          ]}
          onPress={() => setActiveTab('following')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'following' ? colors.tint : colors.secondaryText }
          ]}>
            Following
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderUserItem}
        ListEmptyComponent={isLoading ? renderLoadingSkeleton : renderEmptyState}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.tint]}
            tintColor={colors.tint}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    backgroundColor: 'rgba(19, 138, 254, 0.05)',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
  username: {
    fontSize: 14,
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 12,
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewProfileButton: {
    backgroundColor: 'rgba(19, 138, 254, 0.1)',
    flexDirection: 'row',
    gap: 4,
  },
  viewProfileText: {
    color: '#138AFE',
    fontSize: 12,
    fontWeight: '500',
  },
  messageButton: {
    backgroundColor: '#138AFE',
    width: 36,
    height: 36,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  skeletonAvatar: {
    backgroundColor: '#E5E7EB',
  },
  skeletonText: {
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  skeletonName: {
    height: 16,
    width: 120,
    marginBottom: 6,
  },
  skeletonUsername: {
    height: 14,
    width: 80,
    marginBottom: 8,
  },
  skeletonBio: {
    height: 14,
    width: 150,
    marginBottom: 6,
  },
  skeletonLocation: {
    height: 12,
    width: 100,
  },
  skeletonButton: {
    backgroundColor: '#E5E7EB',
    width: 80,
    height: 32,
  },
  footerLoader: {
    paddingVertical: 20,
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
});