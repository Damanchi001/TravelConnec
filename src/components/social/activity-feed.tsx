import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

// Types
interface SocialPost {
  id: string;
  author_id: string;
  content: string;
  post_type: 'text' | 'image' | 'video' | 'listing_share' | 'trip_update';
  media_urls?: string[];
  location?: {
    name: string;
    coordinates: { lat: number; lng: number };
  };
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  author: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
    username?: string;
  };
}

interface ActivityFeedProps {
  activities?: SocialPost[];
  onActivityPress?: (activity: SocialPost) => void;
  onLoadMore?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

interface PostCardProps {
  post: SocialPost;
  onPress?: () => void;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onUserPress?: (userId: string) => void;
}

// Post Card Component
const PostCard: React.FC<PostCardProps> = ({
  post,
  onPress,
  onLike,
  onComment,
  onShare,
  onUserPress,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return postDate.toLocaleDateString();
  };

  return (
    <ThemedView style={styles.postCard}>
      {/* Header */}
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
            <ThemedText style={styles.avatarText}>
              {post.author.first_name[0]}{post.author.last_name[0]}
            </ThemedText>
          </View>
          <View>
            <ThemedText style={styles.authorName}>
              {post.author.first_name} {post.author.last_name}
            </ThemedText>
            <ThemedText style={styles.postTime}>
              {formatTimeAgo(post.created_at)}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.postContent}>
        <ThemedText style={styles.postText}>{post.content}</ThemedText>

        {/* Location */}
        {post.location && (
          <View style={styles.locationContainer}>
            <ThemedText style={styles.locationText}>
              📍 {post.location.name}
            </ThemedText>
          </View>
        )}

        {/* Media would go here - placeholder for now */}
        {post.media_urls && post.media_urls.length > 0 && (
          <View style={styles.mediaContainer}>
            <ThemedText style={styles.mediaPlaceholder}>
              [Media: {post.media_urls.length} item{post.media_urls.length > 1 ? 's' : ''}]
            </ThemedText>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.postActions}>
        <View style={styles.actionButton}>
          <ThemedText style={styles.actionText}>❤️ {post.likes_count}</ThemedText>
        </View>
        <View style={styles.actionButton}>
          <ThemedText style={styles.actionText}>💬 {post.comments_count}</ThemedText>
        </View>
        <View style={styles.actionButton}>
          <ThemedText style={styles.actionText}>↗️ {post.shares_count}</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
};

// Activity Feed Component
export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities = [],
  onActivityPress,
  onLoadMore,
  refreshing = false,
  onRefresh,
}) => {
  const [posts, setPosts] = useState<SocialPost[]>(activities);

  // Mock data for development
  useEffect(() => {
    if (activities.length === 0) {
      const mockPosts: SocialPost[] = [
        {
          id: '1',
          author_id: 'user1',
          content: 'Just arrived in Paris! The city of lights is absolutely magical. Can\'t wait to explore the Eiffel Tower tomorrow! 🇫🇷✨',
          post_type: 'text',
          location: {
            name: 'Paris, France',
            coordinates: { lat: 48.8566, lng: 2.3522 }
          },
          likes_count: 24,
          comments_count: 8,
          shares_count: 3,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          author: {
            first_name: 'Sarah',
            last_name: 'Johnson',
            avatar_url: undefined,
            username: 'sarah_travels'
          }
        },
        {
          id: '2',
          author_id: 'user2',
          content: 'Amazing sunset at the beach! Nature never ceases to amaze me. 🌅🏖️',
          post_type: 'image',
          media_urls: ['https://example.com/sunset.jpg'],
          location: {
            name: 'Malibu, California',
            coordinates: { lat: 34.0259, lng: -118.7798 }
          },
          likes_count: 156,
          comments_count: 23,
          shares_count: 12,
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          author: {
            first_name: 'Mike',
            last_name: 'Chen',
            avatar_url: undefined,
            username: 'mike_adventures'
          }
        },
        {
          id: '3',
          author_id: 'user3',
          content: 'Backpacking through the Swiss Alps was incredible! The views, the fresh air, the adventure - pure bliss! 🏔️⛰️',
          post_type: 'text',
          likes_count: 89,
          comments_count: 15,
          shares_count: 7,
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          author: {
            first_name: 'Emma',
            last_name: 'Davis',
            avatar_url: undefined,
            username: 'emma_explores'
          }
        }
      ];
      setPosts(mockPosts);
    } else {
      setPosts(activities);
    }
  }, [activities]);

  const renderPost = ({ item }: { item: SocialPost }) => (
    <PostCard
      post={item}
      onPress={() => onActivityPress?.(item)}
      onLike={() => console.log('Like post', item.id)}
      onComment={() => console.log('Comment on post', item.id)}
      onShare={() => console.log('Share post', item.id)}
      onUserPress={(userId) => console.log('User pressed', userId)}
    />
  );

  const renderEmpty = () => (
    <ThemedView style={styles.emptyContainer}>
      <ThemedText style={styles.emptyText}>No posts yet</ThemedText>
      <ThemedText style={styles.emptySubtext}>
        Be the first to share your travel experiences!
      </ThemedText>
    </ThemedView>
  );

  return (
    <FlatList
      data={posts}
      renderItem={renderPost}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={posts.length === 0 ? styles.emptyList : undefined}
    />
  );
};

const styles = StyleSheet.create({
  postCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  authorName: {
    fontWeight: '600',
    fontSize: 16,
  },
  postTime: {
    fontSize: 14,
    opacity: 0.7,
  },
  postContent: {
    marginBottom: 12,
  },
  postText: {
    fontSize: 16,
    lineHeight: 22,
  },
  locationContainer: {
    marginTop: 8,
  },
  locationText: {
    fontSize: 14,
    opacity: 0.8,
  },
  mediaContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    alignItems: 'center',
  },
  mediaPlaceholder: {
    fontSize: 14,
    opacity: 0.7,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    opacity: 0.8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  emptyList: {
    flexGrow: 1,
  },
});

export default ActivityFeed;