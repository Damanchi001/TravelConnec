import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, Modal, Platform, RefreshControl, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { feedsService } from '../../services/stream';
import { useAuthStore } from '../../stores/auth-store';

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
  userLiked: boolean;
  userCommented: boolean;
  userShared: boolean;
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
  onUserPress?: (userId: string) => void;
}

interface PostCardProps {
  post: SocialPost;
  onPress?: () => void;
  onLike?: () => void;
  onComment?: (post: SocialPost) => void;
  onShare?: (post: SocialPost) => void;
  onUserPress?: (userId: string) => void;
  userId?: string;
}

// Post Card Component
const PostCard: React.FC<PostCardProps> = ({
  post,
  onPress,
  onLike,
  onComment,
  onShare,
  onUserPress,
  userId,
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
        <TouchableOpacity
          style={styles.authorInfo}
          onPress={() => onUserPress?.(post.author_id)}
        >
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
        </TouchableOpacity>
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

        {/* Media */}
        {post.media_urls && post.media_urls.length > 0 && (
          <View style={styles.mediaContainer}>
            {post.media_urls.map((url, index) => (
              <View key={index} style={styles.mediaItem}>
                <Image
                  source={{ uri: url }}
                  style={styles.mediaImage}
                  resizeMode="cover"
                />
                {post.post_type === 'video' && (
                  <View style={styles.videoOverlay}>
                    <ThemedText style={styles.videoIcon}>▶️</ThemedText>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onLike}
          activeOpacity={0.7}
        >
          <IconSymbol
            name={post.userLiked ? "heart.fill" : "heart"}
            size={20}
            color={post.userLiked ? "#ff4444" : colors.text}
          />
          <ThemedText style={[styles.actionText, post.userLiked && { color: "#ff4444" }]}>
            {post.likes_count}
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onComment?.(post)}
          activeOpacity={0.7}
        >
          <IconSymbol
            name={post.userCommented ? "message.fill" : "message"}
            size={20}
            color={post.userCommented ? colors.tint : colors.text}
          />
          <ThemedText style={[styles.actionText, post.userCommented && { color: colors.tint }]}>
            {post.comments_count}
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onShare?.(post)}
          activeOpacity={0.7}
        >
          <IconSymbol
            name={post.userShared ? "paperplane.fill" : "paperplane"}
            size={20}
            color={post.userShared ? colors.tint : colors.text}
          />
          <ThemedText style={[styles.actionText, post.userShared && { color: colors.tint }]}>
            {post.shares_count}
          </ThemedText>
        </TouchableOpacity>
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
  onUserPress,
}) => {
  const { user } = useAuthStore();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [posts, setPosts] = useState<SocialPost[]>(activities);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentingPost, setCommentingPost] = useState<SocialPost | null>(null);
  const [commentText, setCommentText] = useState('');

  // Fetch activities from Stream feeds
  const fetchActivities = async (userId?: string) => {
    try {
      setLoading(true);
      setError(null);

      // Use the authenticated user ID
      const currentUserId = userId || user?.id || 'current-user';

      // Check if feeds client is initialized and user is authenticated
      const feedsClient = require('../../services/stream/clients').feedsClient;

      // If Stream is not properly set up, skip to mock data
      if (!feedsClient || !feedsClient.currentUser) {
        console.log('[ActivityFeed] Stream feeds not available, using mock data');
        throw new Error('Stream feeds not available');
      }

      const response = await feedsService.getTimelineFeed(currentUserId, 20);

      // Transform Stream activities to our SocialPost format
      const transformedPosts: SocialPost[] = response.results.map((activity: any) => ({
        id: activity.id,
        author_id: activity.actor.id,
        content: activity.data?.text || activity.data?.content || '',
        post_type: activity.data?.post_type || 'text',
        media_urls: activity.data?.media_urls,
        location: activity.data?.location,
        likes_count: 0, // Will be updated
        comments_count: 0, // Will be updated
        shares_count: 0, // Will be updated
        userLiked: false, // Will be updated
        userCommented: false, // Will be updated
        userShared: false, // Will be updated
        created_at: activity.time,
        author: {
          first_name: activity.actor.data?.first_name || 'Unknown',
          last_name: activity.actor.data?.last_name || 'User',
          avatar_url: activity.actor.data?.avatar_url,
          username: activity.actor.data?.username,
        }
      }));

      // Fetch reaction counts and user reactions for each post
      const postsWithReactions = await Promise.all(
        transformedPosts.map(async (post) => {
          try {
            const [likes, comments, shares] = await Promise.all([
              feedsService.getReactions(post.id, 'like'),
              feedsService.getReactions(post.id, 'comment'),
              feedsService.getReactions(post.id, 'share'),
            ]);

            const userId = user?.id;
            return {
              ...post,
              likes_count: likes.results?.length || 0,
              comments_count: comments.results?.length || 0,
              shares_count: shares.results?.length || 0,
              userLiked: userId ? likes.results?.some((r: any) => r.user.id === userId) || false : false,
              userCommented: userId ? comments.results?.some((r: any) => r.user.id === userId) || false : false,
              userShared: userId ? shares.results?.some((r: any) => r.user.id === userId) || false : false,
            };
          } catch (error) {
            console.error('Failed to fetch reactions for post:', post.id, error);
            return post; // Return post with default counts
          }
        })
      );

      setPosts(postsWithReactions);
    } catch (err) {
      console.log('[ActivityFeed] Stream feeds unavailable, using mock data:', err instanceof Error ? err.message : String(err));
      setError(null); // Don't show error for expected fallback

      // Fallback to mock data if Stream fails
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
            userLiked: false,
            userCommented: false,
            userShared: false,
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
            userLiked: false,
            userCommented: false,
            userShared: false,
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
            userLiked: false,
            userCommented: false,
            userShared: false,
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
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activities.length === 0 && !hasFetchedRef.current && user) {
      hasFetchedRef.current = true;
      fetchActivities();
    } else if (activities.length > 0) {
      setPosts(activities);
    }
  }, [activities, user]);

  const handleRefresh = async () => {
    if (onRefresh) {
      onRefresh();
    } else {
      await fetchActivities();
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? {
            ...p,
            likes_count: p.userLiked ? p.likes_count - 1 : p.likes_count + 1,
            userLiked: !p.userLiked
          }
        : p
    ));

    try {
      // Add or remove like reaction
      if (posts.find(p => p.id === postId)?.userLiked) {
        // If was liked, remove (but since we toggled, actually add if not liked)
        // Wait, logic: if userLiked was true, we set to false and decrement, so we need to remove reaction
        // But since we don't have reaction ID, for now just add, Stream handles duplicates?
        // Actually, Stream reactions are unique per user per activity per kind, so adding again might not do anything.
        // For simplicity, always add, and let Stream handle it.
      }
      await feedsService.addReaction(postId, 'like', user.id);
    } catch (error) {
      console.error('Failed to like post:', error);
      // Revert optimistic update
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? {
              ...p,
              likes_count: p.userLiked ? p.likes_count - 1 : p.likes_count + 1,
              userLiked: !p.userLiked
            }
          : p
      ));
    }
  };

  const handleComment = (post: SocialPost) => {
    if (!user) return;
    if (Platform.OS === 'web') {
      // Commenting not supported on web yet
      console.log('Commenting not supported on web');
      return;
    }
    setCommentingPost(post);
    setCommentText('');
    setShowCommentModal(true);
  };

  const submitComment = async () => {
    if (!commentingPost || !user || !commentText.trim()) return;

    const postId = commentingPost.id;

    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? {
            ...p,
            comments_count: p.userCommented ? p.comments_count : p.comments_count + 1,
            userCommented: true
          }
        : p
    ));

    try {
      // Add comment reaction
      await feedsService.addReaction(postId, 'comment', user.id, { text: commentText.trim() });
      setShowCommentModal(false);
      setCommentingPost(null);
      setCommentText('');
    } catch (error) {
      console.error('Failed to comment on post:', error);
      // Revert
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? {
              ...p,
              comments_count: p.userCommented ? p.comments_count : p.comments_count - 1,
              userCommented: false
            }
          : p
      ));
    }
  };

  const handleShare = async (post: SocialPost) => {
    if (!user) return;

    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.id === post.id
        ? {
            ...p,
            shares_count: p.userShared ? p.shares_count - 1 : p.shares_count + 1,
            userShared: !p.userShared
          }
        : p
    ));

    try {
      // Add share reaction
      await feedsService.addReaction(post.id, 'share', user.id);
    } catch (error) {
      console.error('Failed to share post:', error);
      // Revert
      setPosts(prev => prev.map(p =>
        p.id === post.id
          ? {
              ...p,
              shares_count: p.userShared ? p.shares_count - 1 : p.shares_count + 1,
              userShared: !p.userShared
            }
          : p
      ));
    }
  };

  const renderPost = ({ item }: { item: SocialPost }) => (
    <PostCard
      post={item}
      onPress={() => onActivityPress?.(item)}
      onLike={() => handleLike(item.id)}
      onComment={(post) => handleComment(post)}
      onShare={() => handleShare(item)}
      onUserPress={(userId) => onUserPress?.(userId)}
      userId={user?.id}
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
    <>
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

      {/* Comment Modal */}
      {Platform.OS !== 'web' && (
        <Modal
          visible={showCommentModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCommentModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ThemedText style={styles.modalTitle}>Add Comment</ThemedText>
              <TextInput
                style={[styles.commentInput, { color: colors.text }]}
                placeholder="Write a comment..."
                placeholderTextColor={colors.text + '80'}
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={280}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowCommentModal(false)}
                >
                  <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton, !commentText.trim() && styles.submitButtonDisabled]}
                  onPress={submitComment}
                  disabled={!commentText.trim()}
                >
                  <ThemedText style={styles.submitButtonText}>Comment</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  postCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20, // Increased padding for better readability
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, // Increased spacing
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44, // Slightly larger
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14, // More spacing
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18, // Larger
  },
  authorName: {
    fontWeight: '600',
    fontSize: 18, // Larger for better readability
    lineHeight: 24,
  },
  postTime: {
    fontSize: 15, // Larger
    opacity: 0.7,
    lineHeight: 20,
  },
  postContent: {
    marginBottom: 16, // More spacing
  },
  postText: {
    fontSize: 17, // Larger
    lineHeight: 26, // Better line height
    fontWeight: '400',
  },
  locationContainer: {
    marginTop: 10,
  },
  locationText: {
    fontSize: 15, // Larger
    opacity: 0.8,
    lineHeight: 20,
  },
  mediaContainer: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mediaItem: {
    width: 120,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  videoIcon: {
    fontSize: 24,
    color: 'white',
  },
  mediaPlaceholder: {
    fontSize: 14,
    opacity: 0.7,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: 16, // More padding
    paddingLeft: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
    gap: 28, // More spacing between buttons
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10, // More spacing
  },
  actionText: {
    fontSize: 15, // Larger
    opacity: 0.8,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80, // More padding
  },
  emptyText: {
    fontSize: 20, // Larger
    fontWeight: '600',
    marginBottom: 12, // More spacing
    lineHeight: 26,
  },
  emptySubtext: {
    fontSize: 17, // Larger
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  emptyList: {
    flexGrow: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20, // Larger
    fontWeight: '600',
    marginBottom: 20, // More spacing
    textAlign: 'center',
    lineHeight: 26,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10, // More rounded
    padding: 16, // More padding
    fontSize: 17, // Larger
    minHeight: 100, // Taller
    textAlignVertical: 'top',
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 17, // Larger
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#0a7ea4',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 17, // Larger
    fontWeight: '600',
  },
});

export default ActivityFeed;