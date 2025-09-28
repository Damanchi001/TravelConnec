import {
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    useFonts,
} from "@expo-google-fonts/poppins";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNotificationStore } from "../../src/stores/notification-store";

export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useNotificationStore();

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

  const handleSettingToggle = (key: keyof typeof settings, value: boolean) => {
    updateSettings({ [key]: value });
  };

  const renderSettingItem = (
    title: string,
    subtitle: string,
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E5E7EB', true: '#138AFE' }}
        thumbColor={value ? '#FFFFFF' : '#F3F4F6'}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notification Settings</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 40 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Push Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Push Notifications</Text>

          {renderSettingItem(
            'Enable Push Notifications',
            'Receive notifications on your device',
            settings.pushEnabled,
            (value) => handleSettingToggle('pushEnabled', value)
          )}
        </View>

        {/* Booking Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking & Reservations</Text>

          {renderSettingItem(
            'Booking Confirmations',
            'Get notified when bookings are confirmed',
            settings.bookingConfirmations,
            (value) => handleSettingToggle('bookingConfirmations', value)
          )}

          {renderSettingItem(
            'Booking Status Changes',
            'Updates when booking status changes',
            settings.bookingConfirmations, // Using same setting for now
            (value) => handleSettingToggle('bookingConfirmations', value)
          )}

          {renderSettingItem(
            'Check-in Reminders',
            'Reminders before your check-in date',
            settings.checkInReminders,
            (value) => handleSettingToggle('checkInReminders', value)
          )}
        </View>

        {/* Payment Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payments & Earnings</Text>

          {renderSettingItem(
            'Payment Confirmations',
            'Notifications for successful payments',
            settings.paymentUpdates,
            (value) => handleSettingToggle('paymentUpdates', value)
          )}

          {renderSettingItem(
            'Payout Notifications',
            'Get notified when you receive payouts',
            settings.payoutNotifications,
            (value) => handleSettingToggle('payoutNotifications', value)
          )}
        </View>

        {/* Communication */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Communication</Text>

          {renderSettingItem(
            'Messages',
            'New messages from hosts and guests',
            settings.messages,
            (value) => handleSettingToggle('messages', value)
          )}
        </View>

        {/* Marketing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Marketing & Updates</Text>

          {renderSettingItem(
            'Marketing Communications',
            'Promotional offers and travel tips',
            settings.marketing,
            (value) => handleSettingToggle('marketing', value)
          )}
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
  headerSpacer: {
    width: 40,
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
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 8,
  },
  settingText: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: "#000",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#666",
  },
});