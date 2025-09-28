import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  useFonts,
} from "@expo-google-fonts/poppins";
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Heart, MapPin, User } from "lucide-react-native";
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
import { supabase } from "../src/services/supabase/client";
import { useAuthStore } from "../src/stores/auth-store";

type ProfileData = {
  name: string;
  bio: string;
  profilePicture?: string;
  countriesVisited: string[];
  bucketList: string[];
  interests: string[];
};

const interests = [
  "Adventure", "Beach", "City Tours", "Culture", "Food", "History",
  "Mountains", "Nature", "Photography", "Nightlife", "Art", "Music"
];

const bucketListDestinations = [
  "Japan", "Iceland", "New Zealand", "Peru", "Morocco", "Thailand",
  "Norway", "Italy", "Greece", "Egypt", "Bali", "Patagonia"
];

export default function ProfileSetupScreen() {
  const insets = useSafeAreaInsets();
  const { updateProfile } = useAuthStore();
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    bio: "",
    profilePicture: undefined,
    countriesVisited: [],
    bucketList: [],
    interests: []
  });

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleBackPress = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    // Validate required fields
    if (!profileData.name.trim()) {
      Alert.alert("Required Field", "Please enter your name");
      return;
    }

    try {
      // Split name into first and last name
      const nameParts = profileData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Save profile data
      const result = await updateProfile({
        first_name: firstName,
        last_name: lastName,
        bio: profileData.bio,
        avatar_url: profileData.profilePicture,
        preferences: {
          countriesVisited: profileData.countriesVisited,
          bucketList: profileData.bucketList,
          interests: profileData.interests,
        },
      });

      if (!result.success) {
        Alert.alert("Error", result.error || "Failed to save profile");
        return;
      }

      // Navigate to main app
      router.replace("/(tabs)" as any);
    } catch (error) {
      Alert.alert("Error", "Failed to save profile data");
    }
  };

  const toggleSelection = (item: string, category: 'countriesVisited' | 'bucketList' | 'interests') => {
    setProfileData(prev => ({
      ...prev,
      [category]: prev[category].includes(item)
        ? prev[category].filter(i => i !== item)
        : [...prev[category], item]
    }));
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        // Upload to Supabase and get URL
        const fileName = `profile-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const filePath = `profiles/${fileName}`;

        const response = await fetch(asset.uri);
        const blob = await response.blob();

        const { data, error } = await supabase.storage
          .from('profiles')
          .upload(filePath, blob, {
            contentType: 'image/jpeg',
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('profiles')
          .getPublicUrl(filePath);

        setProfileData(prev => ({ ...prev, profilePicture: publicUrl }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission needed', 'Please grant permission to access your camera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        // Upload to Supabase and get URL
        const fileName = `profile-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const filePath = `profiles/${fileName}`;

        const response = await fetch(asset.uri);
        const blob = await response.blob();

        const { data, error } = await supabase.storage
          .from('profiles')
          .upload(filePath, blob, {
            contentType: 'image/jpeg',
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('profiles')
          .getPublicUrl(filePath);

        setProfileData(prev => ({ ...prev, profilePicture: publicUrl }));
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <User size={32} color="#138AFE" />
              <Text style={styles.stepTitle}>Tell us about yourself</Text>
              <Text style={styles.stepSubtitle}>
                Create your travel profile to connect with like-minded explorers
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your name"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={profileData.name}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, name: text }))}
              />
            </View>

            {/* Profile Picture */}
            <View style={styles.profilePictureContainer}>
              <TouchableOpacity style={styles.profileImageContainer} onPress={pickImage}>
                {profileData.profilePicture ? (
                  <Image source={{ uri: profileData.profilePicture }} style={styles.profileImage} />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <User size={40} color="#666" />
                  </View>
                )}
                <View style={styles.cameraButton}>
                  <Text style={styles.cameraIcon}>📷</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.takePhotoButton} onPress={takePhoto}>
                <Text style={styles.takePhotoText}>Take Photo</Text>
              </TouchableOpacity>
              <Text style={styles.profilePictureHint}>Tap to select from gallery or take a photo</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Bio (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Tell us about your travel style and interests..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={profileData.bio}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, bio: text }))}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <MapPin size={32} color="#138AFE" />
              <Text style={styles.stepTitle}>Countries You&apos;ve Visited</Text>
              <Text style={styles.stepSubtitle}>
                Share your travel experience to find fellow explorers
              </Text>
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="Type a country name..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />

            <View style={styles.chipsContainer}>
              {["USA", "France", "Japan", "Australia", "Brazil", "Germany", "Thailand", "Italy"].map((country) => (
                <TouchableOpacity
                  key={country}
                  style={[
                    styles.chip,
                    profileData.countriesVisited.includes(country) && styles.chipSelected
                  ]}
                  onPress={() => toggleSelection(country, "countriesVisited")}
                >
                  <Text style={[
                    styles.chipText,
                    profileData.countriesVisited.includes(country) && styles.chipTextSelected
                  ]}>
                    {country}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Heart size={32} color="#138AFE" />
              <Text style={styles.stepTitle}>Bucket List Destinations</Text>
              <Text style={styles.stepSubtitle}>
                Where do you dream of traveling next?
              </Text>
            </View>

            <View style={styles.chipsContainer}>
              {bucketListDestinations.map((destination) => (
                <TouchableOpacity
                  key={destination}
                  style={[
                    styles.chip,
                    profileData.bucketList.includes(destination) && styles.chipSelected
                  ]}
                  onPress={() => toggleSelection(destination, "bucketList")}
                >
                  <Text style={[
                    styles.chipText,
                    profileData.bucketList.includes(destination) && styles.chipTextSelected
                  ]}>
                    {destination}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <View style={styles.interestsIcon}>
                <Text style={styles.interestsIconText}>✨</Text>
              </View>
              <Text style={styles.stepTitle}>Travel Interests</Text>
              <Text style={styles.stepSubtitle}>
                What kind of experiences do you enjoy most?
              </Text>
            </View>

            <View style={styles.chipsContainer}>
              {interests.map((interest) => (
                <TouchableOpacity
                  key={interest}
                  style={[
                    styles.chip,
                    profileData.interests.includes(interest) && styles.chipSelected
                  ]}
                  onPress={() => toggleSelection(interest, "interests")}
                >
                  <Text style={[
                    styles.chipText,
                    profileData.interests.includes(interest) && styles.chipTextSelected
                  ]}>
                    {interest}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background */}
      <LinearGradient
        colors={["#1A1A1A", "#000000"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(step / 4) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{step} of 4</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 40 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>
              {step === 4 ? "Complete Setup" : "Next"}
            </Text>
          </TouchableOpacity>

          {step < 4 && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => setStep(step + 1)}
              activeOpacity={0.8}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  progressContainer: {
    flex: 1,
    alignItems: "center",
  },
  progressBar: {
    width: "80%",
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#138AFE",
    borderRadius: 2,
  },
  progressText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
  },
  stepContainer: {
    flex: 1,
    minHeight: 400,
  },
  stepHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  stepTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 24,
    color: "white",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  stepSubtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "white",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "white",
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 16,
  },
  chip: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipSelected: {
    backgroundColor: "#138AFE",
    borderColor: "#138AFE",
  },
  chipText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  chipTextSelected: {
    color: "#000",
    fontFamily: "Poppins_600SemiBold",
  },
  navigationContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  nextButton: {
    backgroundColor: "#138AFE",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  nextButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#000",
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
  },
  interestsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(19, 138, 254, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  interestsIconText: {
    fontSize: 20,
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    alignSelf: 'center',
    marginBottom: 12,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
  takePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "rgba(19, 138, 254, 0.1)",
    borderRadius: 20,
    marginBottom: 8,
  },
  takePhotoText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#138AFE",
  },
  profilePictureHint: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
});