import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Location from 'expo-location';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { feedsService } from '../../services/stream';
import { supabase } from '../../services/supabase/client';
import { useAuthStore } from '../../stores/auth-store';
import { LocationData, MediaAttachment, PostComposerProps, PostContent } from '../../types';
import { ImagePickerComponent } from '../forms';

export const PostComposer: React.FC<PostComposerProps> = ({
  onPost,
  placeholder = "What's on your mind?",
  maxLength = 500,
  allowMedia = true,
  allowLocation = true,
  initialContent,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuthStore();

  const [content, setContent] = useState(initialContent?.text || '');
  const [mediaAttachments, setMediaAttachments] = useState<MediaAttachment[]>(
    initialContent?.mediaUrls?.map((url: string) => ({ uri: url, type: 'image' as const })) || []
  );
  const [location, setLocation] = useState<LocationData | null>(
    initialContent?.location || null
  );
  const [isPosting, setIsPosting] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const textInputRef = useRef<TextInput>(null);

  const handleTextChange = (text: string) => {
    if (text.length <= maxLength) {
      setContent(text);
    }
  };

  const addMediaAttachment = (uri: string) => {
    const attachment: MediaAttachment = {
      uri,
      type: 'image',
      fileName: undefined,
      fileSize: undefined,
    };
    setMediaAttachments(prev => [...prev, attachment]);
  };


  const addLocation = async () => {
    if (!allowLocation) return;

    try {
      const permissionResult = await Location.requestForegroundPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission needed', 'Please grant permission to access your location');
        return;
      }

      setIsUploadingMedia(true);
      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Reverse geocode to get location name
      const geocodeResult = await Location.reverseGeocodeAsync({
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
      });

      const locationData: LocationData = {
        name: geocodeResult[0]?.city && geocodeResult[0]?.country
          ? `${geocodeResult[0].city}, ${geocodeResult[0].country}`
          : 'Current Location',
        coordinates: {
          lat: locationResult.coords.latitude,
          lng: locationResult.coords.longitude,
        },
        address: geocodeResult[0]?.name || undefined,
      };

      setLocation(locationData);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const removeMedia = (index: number) => {
    setMediaAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const removeLocation = () => {
    setLocation(null);
  };

  const uploadMediaToSupabase = async (attachment: MediaAttachment): Promise<string> => {
    const fileName = `post-media-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const filePath = `posts/${user?.id}/${fileName}`;

    const response = await fetch(attachment.uri);
    const blob = await response.blob();

    const { data, error } = await supabase.storage
      .from('posts')
      .upload(filePath, blob, {
        contentType: attachment.type === 'image' ? 'image/jpeg' : 'video/mp4',
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('posts')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handlePost = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to post');
      return;
    }

    if (!content.trim() && mediaAttachments.length === 0) {
      Alert.alert('Error', 'Please add some content or media to your post');
      return;
    }

    try {
      setIsPosting(true);

      // Upload media if any
      let mediaUrls: string[] = [];
      if (mediaAttachments.length > 0) {
        setIsUploadingMedia(true);
        mediaUrls = await Promise.all(
          mediaAttachments.map(attachment => uploadMediaToSupabase(attachment))
        );
        setIsUploadingMedia(false);
      }

      // Determine post type
      let postType: PostContent['postType'] = 'text';
      if (mediaUrls.length > 0) {
        postType = mediaAttachments[0].type === 'video' ? 'video' : 'image';
      }

      const postContent: PostContent = {
        text: content.trim(),
        postType,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
        location: location || undefined,
      };

      // Create the post via Stream
      await feedsService.addActivity(user.id, {
        actor: user.id,
        verb: 'post',
        object: content.trim() || 'Posted media',
        data: {
          text: content.trim(),
          post_type: postType,
          media_urls: mediaUrls,
          location,
        },
      });

      // Call the onPost callback
      await onPost(postContent);

      // Reset form
      setContent('');
      setMediaAttachments([]);
      setLocation(null);

      Alert.alert('Success', 'Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
      setIsUploadingMedia(false);
    }
  };

  const canPost = (content.trim().length > 0 || mediaAttachments.length > 0) && !isPosting && !isUploadingMedia;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <ThemedText style={styles.headerText}>Share your travel experience</ThemedText>
      </View>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag">
        {/* Text Input */}
        <View style={styles.inputContainer}>
          <TextInput
            ref={textInputRef}
            style={[styles.textInput, { color: colors.text }]}
            placeholder={placeholder}
            placeholderTextColor="#138AFE"
            value={content}
            onChangeText={handleTextChange}
            multiline
            maxLength={maxLength}
            autoFocus
          />
          <ThemedText style={[styles.charCount, { color: '#138AFE' }]}>
            {content.length}/{maxLength}
          </ThemedText>
        </View>

        {/* Media Attachments */}
        {mediaAttachments.length > 0 && (
          <View style={styles.mediaContainer}>
            {mediaAttachments.map((attachment, index) => (
              <View key={index} style={styles.mediaItem}>
                <Image source={{ uri: attachment.uri }} style={styles.mediaImage} />
                <TouchableOpacity
                  style={styles.removeMediaButton}
                  onPress={() => removeMedia(index)}
                >
                  <IconSymbol name="xmark.circle.fill" size={24} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Location */}
        {location && (
          <View style={styles.locationContainer}>
            <IconSymbol name="location.fill" size={16} color={colors.tint} />
            <ThemedText style={styles.locationText}>{location.name}</ThemedText>
            <TouchableOpacity onPress={removeLocation}>
              <IconSymbol name="xmark.circle.fill" size={16} color={colors.text + '80'} />
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {allowMedia && (
            <View style={styles.mediaButtons}>
              <ImagePickerComponent
                onImageSelected={addMediaAttachment}
                aspect={[4, 3]}
                quality={0.8}
                storageBucket="posts"
                source="library"
              >
                <View style={styles.actionButton}>
                  <IconSymbol name="photo" size={20} color={colors.text} />
                  <ThemedText style={styles.actionText}>Photo</ThemedText>
                </View>
              </ImagePickerComponent>
              <ImagePickerComponent
                onImageSelected={addMediaAttachment}
                aspect={[4, 3]}
                quality={0.8}
                storageBucket="posts"
                source="camera"
              >
                <View style={styles.actionButton}>
                  <IconSymbol name="camera" size={20} color={colors.text} />
                  <ThemedText style={styles.actionText}>Camera</ThemedText>
                </View>
              </ImagePickerComponent>
            </View>
          )}

          {allowLocation && (
            <TouchableOpacity style={styles.actionButton} onPress={addLocation}>
              <IconSymbol name="location" size={20} color={colors.text} />
              <ThemedText style={styles.actionText}>Location</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Post Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.postButton,
            canPost ? styles.postButtonEnabled : styles.postButtonDisabled,
          ]}
          onPress={handlePost}
          disabled={!canPost}
        >
          {isPosting || isUploadingMedia ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <ThemedText style={styles.postButtonText}>Post</ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0a7ea4',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  mediaContainer: {
    marginBottom: 16,
  },
  mediaItem: {
    position: 'relative',
    marginBottom: 8,
  },
  mediaImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeMediaButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  locationText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  actionsContainer: {
    marginBottom: 16,
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#138AFE',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  postButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonEnabled: {
    backgroundColor: '#0a7ea4',
  },
  postButtonDisabled: {
    backgroundColor: '#ccc',
  },
  postButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PostComposer;