import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../services/supabase/client';

export interface ImagePickerProps {
  onImageSelected?: (uri: string) => void;
  onMultipleImagesSelected?: (uris: string[]) => void;
  children: React.ReactNode;
  aspect?: [number, number];
  allowsMultipleSelection?: boolean;
  quality?: number;
  storageBucket: string;
  storagePath?: string;
  disabled?: boolean;
  style?: any;
  source?: 'library' | 'camera' | 'both';
}

export const ImagePickerComponent: React.FC<ImagePickerProps> = ({
  onImageSelected,
  onMultipleImagesSelected,
  children,
  aspect = [4, 3],
  allowsMultipleSelection = false,
  quality = 0.8,
  storageBucket,
  storagePath = '',
  disabled = false,
  style,
  source = 'both',
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const requestPermissions = async (type: 'camera' | 'library') => {
    try {
      if (type === 'camera') {
        const { granted } = await ImagePicker.requestCameraPermissionsAsync();
        if (!granted) {
          Alert.alert('Permission needed', 'Please grant permission to access your camera');
          return false;
        }
      } else {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) {
          Alert.alert('Permission needed', 'Please grant permission to access your photos');
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request permissions');
      return false;
    }
  };

  const pickImage = async (source: 'library' | 'camera') => {
    if (disabled || isUploading) return;

    const hasPermission = await requestPermissions(source === 'camera' ? 'camera' : 'library');
    if (!hasPermission) return;

    try {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect,
        quality,
        allowsMultipleSelection,
      };

      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets.length > 0) {
        setIsUploading(true);
        const urls = await Promise.all(
          result.assets.map(asset => uploadImage(asset))
        );
        setIsUploading(false);

        if (allowsMultipleSelection && onMultipleImagesSelected) {
          onMultipleImagesSelected(urls);
        } else if (urls.length > 0 && onImageSelected) {
          onImageSelected(urls[0]);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
      setIsUploading(false);
    }
  };

  const uploadImage = async (asset: ImagePicker.ImagePickerAsset): Promise<string> => {
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const filePath = `${storagePath}${fileName}`.replace(/^\/+/, ''); // Remove leading slashes

    const response = await fetch(asset.uri);
    const blob = await response.blob();

    const { error } = await supabase.storage
      .from(storageBucket)
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(storageBucket)
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const showOptions = () => {
    if (disabled || isUploading) return;

    if (source === 'library') {
      pickImage('library');
    } else if (source === 'camera') {
      pickImage('camera');
    } else {
      Alert.alert(
        'Select Image',
        'Choose how to add an image',
        [
          { text: 'Camera', onPress: () => pickImage('camera') },
          { text: 'Photo Library', onPress: () => pickImage('library') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={showOptions}
      disabled={disabled || isUploading}
    >
      {children}
      {isUploading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
});

export default ImagePickerComponent;