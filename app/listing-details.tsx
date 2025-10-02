import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Calendar, MapPin, Plus, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ImagePickerComponent } from "../src/components/forms";

interface ListingFormData {
  title: string;
  shortDescription: string;
  fullDescription: string;
  price: string;
  location: string;
  availabilityDates: string;
  images: string[];
  // Experience specific
  duration?: string;
  maxGuests?: string;
  // Gear specific
  category?: string;
  rentalType?: 'rent' | 'buy';
}

const GEAR_CATEGORIES = [
  'bags',
  'clothing',
  'camping',
  'electronics',
  'sports',
  'photography',
  'other'
];

export default function ListingDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { type } = useLocalSearchParams<{ type: string }>();
  const isExperience = type === 'experience';

  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    shortDescription: '',
    fullDescription: '',
    price: '',
    location: '',
    availabilityDates: '',
    images: [],
    ...(isExperience ? {
      duration: '',
      maxGuests: '',
    } : {
      category: '',
      rentalType: 'rent',
    })
  });

  const [errors, setErrors] = useState<Partial<ListingFormData>>({});

  const updateFormData = (field: keyof ListingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const addImageUrl = (url: string) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, url]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ListingFormData> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.shortDescription.trim()) newErrors.shortDescription = 'Short description is required';
    if (!formData.price.trim()) newErrors.price = 'Price is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.availabilityDates.trim()) newErrors.availabilityDates = 'Availability dates are required';

    if (isExperience) {
      if (!formData.duration?.trim()) newErrors.duration = 'Duration is required';
      if (!formData.maxGuests?.trim()) newErrors.maxGuests = 'Max guests is required';
    } else {
      if (!formData.category?.trim()) newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      router.push({
        pathname: '/listing-preview',
        params: { type, data: JSON.stringify(formData) }
      });
    }
  };

  const renderExperienceFields = () => (
    <>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Duration</Text>
        <TextInput
          style={[styles.input, errors.duration && styles.inputError]}
          placeholder="e.g., 3 hours"
          value={formData.duration}
          onChangeText={(value) => updateFormData('duration', value)}
        />
        {errors.duration && <Text style={styles.errorText}>{errors.duration}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Maximum Guests</Text>
        <TextInput
          style={[styles.input, errors.maxGuests && styles.inputError]}
          placeholder="e.g., 8"
          keyboardType="numeric"
          value={formData.maxGuests}
          onChangeText={(value) => updateFormData('maxGuests', value)}
        />
        {errors.maxGuests && <Text style={styles.errorText}>{errors.maxGuests}</Text>}
      </View>
    </>
  );

  const renderGearFields = () => (
    <>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
          {GEAR_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                formData.category === category && styles.categoryButtonActive
              ]}
              onPress={() => updateFormData('category', category)}
            >
              <Text style={[
                styles.categoryText,
                formData.category === category && styles.categoryTextActive
              ]}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Rental Type</Text>
        <View style={styles.rentalTypeContainer}>
          {(['rent', 'buy'] as const).map((rentalType) => (
            <TouchableOpacity
              key={rentalType}
              style={[
                styles.rentalTypeButton,
                formData.rentalType === rentalType && styles.rentalTypeButtonActive
              ]}
              onPress={() => updateFormData('rentalType', rentalType)}
            >
              <Text style={[
                styles.rentalTypeText,
                formData.rentalType === rentalType && styles.rentalTypeTextActive
              ]}>
                {rentalType.charAt(0).toUpperCase() + rentalType.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isExperience ? 'Experience Details' : 'Gear Details'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {isExperience ? 'Experience Title' : 'Item Name'}
            </Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder={isExperience ? "e.g., Private Cooking Class" : "e.g., DSLR Camera"}
              value={formData.title}
              onChangeText={(value) => updateFormData('title', value)}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Short Description (1-2 lines)</Text>
            <TextInput
              style={[styles.input, errors.shortDescription && styles.inputError]}
              placeholder="Brief description that appears in search results"
              multiline
              numberOfLines={2}
              value={formData.shortDescription}
              onChangeText={(value) => updateFormData('shortDescription', value)}
            />
            {errors.shortDescription && <Text style={styles.errorText}>{errors.shortDescription}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, errors.fullDescription && styles.inputError]}
              placeholder="Detailed description of your offering"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={formData.fullDescription}
              onChangeText={(value) => updateFormData('fullDescription', value)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing & Availability</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Price {isExperience ? 'per person' : formData.rentalType === 'rent' ? 'per day' : ''}
            </Text>
            <TextInput
              style={[styles.input, errors.price && styles.inputError]}
              placeholder="e.g., 25"
              keyboardType="numeric"
              value={formData.price}
              onChangeText={(value) => updateFormData('price', value)}
            />
            {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <View style={styles.locationInput}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }, errors.location && styles.inputError]}
                placeholder="City, Country"
                value={formData.location}
                onChangeText={(value) => updateFormData('location', value)}
              />
              <TouchableOpacity style={styles.mapButton}>
                <MapPin size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Availability Dates</Text>
            <View style={styles.dateInput}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }, errors.availabilityDates && styles.inputError]}
                placeholder="Select dates"
                value={formData.availabilityDates}
                onChangeText={(value) => updateFormData('availabilityDates', value)}
              />
              <TouchableOpacity style={styles.calendarButton}>
                <Calendar size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            {errors.availabilityDates && <Text style={styles.errorText}>{errors.availabilityDates}</Text>}
          </View>
        </View>

        {isExperience ? renderExperienceFields() : renderGearFields()}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <Text style={styles.sectionSubtitle}>Add up to 10 photos to showcase your offering</Text>

          <View style={styles.imagesContainer}>
            {formData.images.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: image }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <X size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}

            {formData.images.length < 10 && (
              <ImagePickerComponent
                onImageSelected={addImageUrl}
                aspect={[4, 3]}
                quality={0.8}
                storageBucket="listing-images"
                source="both"
              >
                <View style={styles.addImageButton}>
                  <Plus size={24} color="#64748B" />
                  <Text style={styles.addImageText}>Add Photo</Text>
                </View>
              </ImagePickerComponent>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue to Preview</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1E293B",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    marginTop: 4,
  },
  locationInput: {
    flexDirection: "row",
    alignItems: "center",
  },
  mapButton: {
    padding: 12,
    marginLeft: 8,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
  },
  calendarButton: {
    padding: 12,
    marginLeft: 8,
  },
  categoryContainer: {
    flexDirection: "row",
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: "#0EA5E9",
  },
  categoryText: {
    fontSize: 14,
    color: "#64748B",
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
  rentalTypeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  rentalTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  rentalTypeButtonActive: {
    backgroundColor: "#0EA5E9",
    borderColor: "#0EA5E9",
  },
  rentalTypeText: {
    fontSize: 16,
    color: "#64748B",
  },
  rentalTypeTextActive: {
    color: "#FFFFFF",
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  imageWrapper: {
    position: "relative",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  addImageText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  footer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  continueButton: {
    backgroundColor: "#0EA5E9",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});