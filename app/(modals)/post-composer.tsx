import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface MediaItem {
  uri: string;
  type: 'image' | 'video';
  fileName?: string | null;
}

interface LocationData {
  name: string;
  coordinates: { lat: number; lng: number };
}

export default function PostComposerModal() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [content, setContent] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

      if (mediaStatus !== 'granted' || cameraStatus !== 'granted') {
        Alert.alert('Permissions needed', 'Please grant camera and media library permissions to add photos/videos.');
      }

      if (locationStatus !== 'granted') {
        Alert.alert('Location permission needed', 'Please grant location permission to tag your location.');
      }
    }
  };

  const pickImage = async () => {
    await requestPermissions();

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newMedia: MediaItem[] = result.assets.map(asset => ({
        uri: asset.uri,
        type: asset.type === 'video' ? 'video' : 'image',
        fileName: asset.fileName,
      }));
      setMediaItems(prev => [...prev, ...newMedia]);
    }
  };

  const takePhoto = async () => {
    await requestPermissions();

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newMedia: MediaItem = {
        uri: result.assets[0].uri,
        type: 'image',
        fileName: result.assets[0].fileName,
      };
      setMediaItems(prev => [...prev, newMedia]);
    }
  };

  const addLocation = async () => {
    await requestPermissions();

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to tag your location.');
        return;
      }

      const locationResult = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = locationResult.coords;

      // Reverse geocode to get location name
      const address = await Location.reverseGeocodeAsync({ latitude, longitude });
      const locationName = address[0]
        ? `${address[0].city || address[0].region || 'Unknown'}, ${address[0].country || ''}`
        : 'Current Location';

      setLocation({
        name: locationName,
        coordinates: { lat: latitude, lng: longitude },
      });
    } catch {
      Alert.alert('Error', 'Failed to get your location. Please try again.');
    }
  };

  const removeMedia = (index: number) => {
    setMediaItems(prev => prev.filter((_, i) => i !== index));
  };

  const removeLocation = () => {
    setLocation(null);
  };

  const handlePost = async () => {
    if (!content.trim() && mediaItems.length === 0) {
      Alert.alert('Empty post', 'Please add some content or media to your post.');
      return;
    }

    setIsLoading(true);

    try {
      // Here you would typically upload media to storage and create the post
      // For now, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert('Success', 'Your post has been shared!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch {
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMediaPreview = () => {
    if (mediaItems.length === 0) return null;

    return (
      <View style={styles.mediaContainer}>
        <ThemedText style={styles.sectionTitle}>Media ({mediaItems.length})</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaScroll}>
          {mediaItems.map((item, index) => (
            <View key={index} style={styles.mediaItem}>
              <View style={styles.mediaPlaceholder}>
                <ThemedText style={styles.mediaType}>
                  {item.type === 'video' ? '🎥' : '📷'}
                </ThemedText>
              </View>
              <TouchableOpacity
                style={styles.removeMediaButton}
                onPress={() => removeMedia(index)}
              >
                <IconSymbol name="plus" size={16} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText style={styles.cancelButton}>Cancel</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>New Post</ThemedText>
        <TouchableOpacity
          onPress={handlePost}
          disabled={isLoading}
          style={[styles.postButton, isLoading && styles.postButtonDisabled]}
        >
          <ThemedText style={[styles.postButtonText, isLoading && styles.postButtonTextDisabled]}>
            {isLoading ? 'Posting...' : 'Share'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Content Input */}
        <TextInput
          style={[styles.textInput, { color: colors.text }]}
          placeholder="What's on your mind?"
          placeholderTextColor={colors.text + '80'}
          multiline
          value={content}
          onChangeText={setContent}
          maxLength={500}
        />

        {/* Media Preview */}
        {renderMediaPreview()}

        {/* Location */}
        {location && (
          <View style={styles.locationContainer}>
            <View style={styles.locationInfo}>
              <ThemedText style={styles.locationIcon}>📍</ThemedText>
              <ThemedText style={styles.locationText}>{location.name}</ThemedText>
              <TouchableOpacity onPress={removeLocation}>
                <IconSymbol name="plus" size={16} color={colors.text + '80'} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Character Count */}
        <ThemedText style={styles.charCount}>
          {content.length}/500
        </ThemedText>
      </ScrollView>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolbarButton} onPress={pickImage}>
          <IconSymbol name="house.fill" size={24} color={colors.tint} />
          <ThemedText style={styles.toolbarText}>Photo</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolbarButton} onPress={takePhoto}>
          <IconSymbol name="paperplane.fill" size={24} color={colors.tint} />
          <ThemedText style={styles.toolbarText}>Camera</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolbarButton} onPress={addLocation}>
          <ThemedText style={styles.locationToolbarIcon}>📍</ThemedText>
          <ThemedText style={styles.toolbarText}>Location</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  postButton: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  postButtonTextDisabled: {
    opacity: 0.7,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  textInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  mediaContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  mediaScroll: {
    marginBottom: 8,
  },
  mediaItem: {
    width: 80,
    height: 80,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mediaPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaType: {
    fontSize: 24,
  },
  removeMediaButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '45deg' }],
  },
  locationContainer: {
    marginTop: 16,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 16,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 14,
    opacity: 0.7,
    marginTop: 8,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  toolbarButton: {
    alignItems: 'center',
  },
  toolbarText: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
  locationToolbarIcon: {
    fontSize: 24,
  },
});