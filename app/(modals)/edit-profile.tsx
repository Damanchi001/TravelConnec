import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  User
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ImagePickerComponent } from "../../src/components/forms";
import { useAuthStore } from "../../src/stores/auth-store";

const interests = [
  "Adventure", "Beach", "City Tours", "Culture", "Food", "History",
  "Mountains", "Nature", "Photography", "Nightlife", "Art", "Music"
];

export default function EditProfileModal() {
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    bio: profile?.bio || '',
    avatar_url: profile?.avatar_url || '',
    interests: profile?.preferences?.interests || [],
  });

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleBackPress = () => {
    router.back();
  };

  const handleSave = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert("Required Fields", "Please enter your first and last name");
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateProfile({
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        bio: formData.bio.trim(),
        avatar_url: formData.avatar_url,
        preferences: {
          ...profile?.preferences,
          interests: formData.interests,
        },
      });

      if (result.success) {
        Alert.alert("Success", "Profile updated successfully", [
          { text: "OK", onPress: () => router.back() }
        ]);
      } else {
        Alert.alert("Error", result.error || "Failed to update profile");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i: string) => i !== interest)
        : [...prev.interests, interest]
    }));
  };


  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Edit Profile</Text>

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={[styles.saveButtonText, isLoading && styles.saveButtonTextDisabled]}>
            {isLoading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 40 }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
      >
        {/* Profile Picture Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Picture</Text>
          <ImagePickerComponent
            onImageSelected={(uri) => setFormData(prev => ({ ...prev, avatar_url: uri }))}
            aspect={[1, 1]}
            quality={0.8}
            storageBucket="profiles"
          >
            <View style={styles.profileImageContainer}>
              {formData.avatar_url ? (
                <Image source={{ uri: formData.avatar_url }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <User size={40} color="#666" />
                </View>
              )}
              <View style={styles.cameraButton}>
                <Text style={styles.cameraIcon}>📷</Text>
              </View>
            </View>
          </ImagePickerComponent>
          <Text style={styles.sectionSubtitle}>Tap to select from gallery or take a photo</Text>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>First Name *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.firstName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
              placeholder="Enter your first name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Last Name *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.lastName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
              placeholder="Enter your last name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.bio}
              onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
              placeholder="Tell us about yourself..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{formData.bio.length}/500</Text>
          </View>
        </View>

        {/* Travel Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Travel Interests</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply to help us personalize your experience</Text>

          <View style={styles.interestsContainer}>
            {interests.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.interestChip,
                  formData.interests.includes(interest) && styles.interestChipSelected
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text style={[
                  styles.interestText,
                  formData.interests.includes(interest) && styles.interestTextSelected
                ]}>
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    color: "#000",
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#138AFE",
  },
  saveButtonTextDisabled: {
    color: "#999",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    color: "#000",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  profileImageContainer: {
    alignSelf: "center",
    marginBottom: 12,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#138AFE",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  cameraIcon: {
    fontSize: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  takePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "rgba(19, 138, 254, 0.1)",
    borderRadius: 20,
    marginBottom: 8,
    alignSelf: 'center',
  },
  takePhotoText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#138AFE",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: "#000",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#000",
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 14,
    textAlignVertical: "top",
  },
  charCount: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  interestChip: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  interestChipSelected: {
    backgroundColor: "#138AFE",
    borderColor: "#138AFE",
  },
  interestText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#666",
  },
  interestTextSelected: {
    color: "#FFFFFF",
    fontFamily: "Poppins_500Medium",
  },
});