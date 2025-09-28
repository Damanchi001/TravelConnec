import {
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    useFonts,
} from "@expo-google-fonts/poppins";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Eye, Lock, Shield, UserCheck } from "lucide-react-native";
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

export default function PrivacySettingsScreen() {
  const insets = useSafeAreaInsets();

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

  const renderSettingItem = (
    title: string,
    subtitle: string,
    icon: React.ReactNode,
    rightElement?: React.ReactNode,
    onPress?: () => void
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          {icon}
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      {rightElement && (
        <View style={styles.settingRight}>
          {rightElement}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Privacy & Security</Text>

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
        {/* Data Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Privacy</Text>

          {renderSettingItem(
            'Profile Visibility',
            'Control who can see your profile',
            <Eye size={20} color="#138AFE" />,
            <Text style={styles.valueText}>Public</Text>
          )}

          {renderSettingItem(
            'Booking History',
            'Who can see your booking history',
            <UserCheck size={20} color="#138AFE" />,
            <Text style={styles.valueText}>Private</Text>
          )}
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>

          {renderSettingItem(
            'Change Password',
            'Update your account password',
            <Lock size={20} color="#138AFE" />,
            <Text style={styles.arrow}>›</Text>
          )}

          {renderSettingItem(
            'Two-Factor Authentication',
            'Add an extra layer of security',
            <Shield size={20} color="#138AFE" />,
            <Switch
              value={false}
              onValueChange={() => {}}
              trackColor={{ false: '#E5E7EB', true: '#138AFE' }}
              thumbColor={false ? '#FFFFFF' : '#F3F4F6'}
            />
          )}
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>

          {renderSettingItem(
            'Download My Data',
            'Request a copy of your data',
            <Shield size={20} color="#138AFE" />,
            <Text style={styles.arrow}>›</Text>
          )}

          {renderSettingItem(
            'Delete Account',
            'Permanently delete your account',
            <Shield size={20} color="#EF4444" />,
            <Text style={[styles.arrow, styles.dangerText]}>›</Text>
          )}
        </View>

        {/* Privacy Policy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>

          {renderSettingItem(
            'Privacy Policy',
            'Read our privacy policy',
            <Shield size={20} color="#138AFE" />,
            <Text style={styles.arrow}>›</Text>
          )}

          {renderSettingItem(
            'Terms of Service',
            'Review our terms and conditions',
            <Shield size={20} color="#138AFE" />,
            <Text style={styles.arrow}>›</Text>
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
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingText: {
    flex: 1,
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
  settingRight: {
    marginLeft: 12,
  },
  valueText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: "#138AFE",
  },
  arrow: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 20,
    color: "#999",
  },
  dangerText: {
    color: "#EF4444",
  },
});