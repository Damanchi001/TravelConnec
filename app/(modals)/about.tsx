import {
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    useFonts,
} from "@expo-google-fonts/poppins";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Code, Heart, Info, Star } from "lucide-react-native";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AboutScreen() {
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

  const renderInfoItem = (
    title: string,
    value: string,
    icon?: React.ReactNode
  ) => (
    <View style={styles.infoItem}>
      {icon && (
        <View style={styles.infoIcon}>
          {icon}
        </View>
      )}
      <View style={styles.infoText}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
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

        <Text style={styles.headerTitle}>About</Text>

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
        {/* App Info */}
        <View style={styles.appSection}>
          <View style={styles.logoContainer}>
            <Info size={48} color="#138AFE" />
          </View>
          <Text style={styles.appName}>TravelApp</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            Connecting travelers with unique accommodations worldwide
          </Text>
        </View>

        {/* App Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>

          {renderInfoItem(
            'Version',
            '1.0.0 (Build 2024.1)',
            <Info size={20} color="#138AFE" />
          )}

          {renderInfoItem(
            'Developer',
            'TravelApp Team',
            <Code size={20} color="#138AFE" />
          )}

          {renderInfoItem(
            'Compatibility',
            'iOS 13.0+ / Android 8.0+',
            <Info size={20} color="#138AFE" />
          )}
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Star size={16} color="#138AFE" />
              <Text style={styles.featureText}>Book unique accommodations worldwide</Text>
            </View>
            <View style={styles.featureItem}>
              <Star size={16} color="#138AFE" />
              <Text style={styles.featureText}>Connect with hosts and travelers</Text>
            </View>
            <View style={styles.featureItem}>
              <Star size={16} color="#138AFE" />
              <Text style={styles.featureText}>Secure payments and escrow system</Text>
            </View>
            <View style={styles.featureItem}>
              <Star size={16} color="#138AFE" />
              <Text style={styles.featureText}>Real-time messaging and notifications</Text>
            </View>
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>

          {renderInfoItem(
            'Privacy Policy',
            'How we protect your data',
            <Info size={20} color="#138AFE" />
          )}

          {renderInfoItem(
            'Terms of Service',
            'Our terms and conditions',
            <Info size={20} color="#138AFE" />
          )}

          {renderInfoItem(
            'Open Source Licenses',
            'Third-party software licenses',
            <Code size={20} color="#138AFE" />
          )}
        </View>

        {/* Credits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Credits</Text>

          <View style={styles.creditsContainer}>
            <Text style={styles.creditsText}>
              Made with <Heart size={14} color="#EF4444" /> by the TravelApp team
            </Text>
            <Text style={styles.creditsSubtext}>
              Special thanks to our amazing community of hosts and travelers
            </Text>
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
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  appSection: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  appName: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 24,
    color: "#000",
    marginBottom: 4,
  },
  appVersion: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: "#138AFE",
    marginBottom: 12,
  },
  appDescription: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
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
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 8,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  infoValue: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: "#000",
  },
  featuresList: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#000",
    marginLeft: 12,
    flex: 1,
  },
  creditsContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  creditsText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: "#000",
    textAlign: "center",
    marginBottom: 8,
  },
  creditsSubtext: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});