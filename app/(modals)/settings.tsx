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
  Bell,
  ChevronRight,
  Globe,
  HelpCircle,
  Info,
  LogOut,
  Moon,
  Shield,
} from "lucide-react-native";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/lib/theme-provider";
import { useAuthStore } from "../../src/stores/auth-store";
import { useNotificationStore } from "../../src/stores/notification-store";
import { useSettingsStore } from "../../src/stores/settings-store";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuthStore();
  const { settings: notificationSettings, updateSettings: updateNotificationSettings } = useNotificationStore();
  const {
    darkMode,
    locationServices,
    analytics,
    toggleDarkMode,
    toggleLocationServices,
    toggleAnalytics
  } = useSettingsStore();
  const { colors, isDark } = useTheme();

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

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            console.log('[Settings] Starting logout process');
            try {
              await signOut();
              console.log('[Settings] signOut completed, showing success message');
              Alert.alert(
                'Logged Out',
                'You have been successfully logged out.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      console.log('[Settings] Redirecting to welcome page');
                      router.replace('/welcome' as any);
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('[Settings] Error during logout:', error);
              Alert.alert(
                'Logout Error',
                'There was a problem logging out. You may need to check your internet connection.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  const handleNotificationPress = () => {
    router.push('/(modals)/notification-settings' as any);
  };

  const handlePrivacyPress = () => {
    router.push('/(modals)/privacy-settings' as any);
  };

  const handleHelpPress = () => {
    router.push('/(modals)/help' as any);
  };

  const handleAboutPress = () => {
    router.push('/(modals)/about' as any);
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

        <Text style={styles.headerTitle}>Settings</Text>

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
        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          {renderSettingItem(
            'Notifications',
            'Manage your notification preferences',
            <Bell size={20} color="#138AFE" />,
            <Switch
              value={notificationSettings.pushEnabled}
              onValueChange={(value) => updateNotificationSettings({ pushEnabled: value })}
              trackColor={{ false: '#E5E7EB', true: '#138AFE' }}
              thumbColor={notificationSettings.pushEnabled ? '#FFFFFF' : '#F3F4F6'}
            />
          )}

          {renderSettingItem(
            'Privacy & Security',
            'Control your privacy settings',
            <Shield size={20} color="#138AFE" />,
            <ChevronRight size={20} color="#999" />,
            handlePrivacyPress
          )}
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          {renderSettingItem(
            'Dark Mode',
            'Switch to dark theme',
            <Moon size={20} color="#138AFE" />,
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#E5E7EB', true: '#138AFE' }}
              thumbColor={darkMode ? '#FFFFFF' : '#F3F4F6'}
            />
          )}

          {renderSettingItem(
            'Location Services',
            'Allow access to location for better recommendations',
            <Globe size={20} color="#138AFE" />,
            <Switch
              value={locationServices}
              onValueChange={toggleLocationServices}
              trackColor={{ false: '#E5E7EB', true: '#138AFE' }}
              thumbColor={locationServices ? '#FFFFFF' : '#F3F4F6'}
            />
          )}

          {renderSettingItem(
            'Analytics',
            'Help improve the app with usage data',
            <Info size={20} color="#138AFE" />,
            <Switch
              value={analytics}
              onValueChange={toggleAnalytics}
              trackColor={{ false: '#E5E7EB', true: '#138AFE' }}
              thumbColor={analytics ? '#FFFFFF' : '#F3F4F6'}
            />
          )}
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          {renderSettingItem(
            'Help Center',
            'Get help and find answers',
            <HelpCircle size={20} color="#138AFE" />,
            <ChevronRight size={20} color="#999" />,
            handleHelpPress
          )}

          {renderSettingItem(
            'About',
            'App version and information',
            <Info size={20} color="#138AFE" />,
            <ChevronRight size={20} color="#999" />,
            handleAboutPress
          )}
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
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
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  logoutText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: "#EF4444",
    marginLeft: 8,
  },
});