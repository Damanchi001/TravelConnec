import {
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    useFonts,
} from "@expo-google-fonts/poppins";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, FileText, HelpCircle, MessageCircle, Phone } from "lucide-react-native";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HelpScreen() {
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

  const renderHelpItem = (
    title: string,
    subtitle: string,
    icon: React.ReactNode,
    onPress?: () => void
  ) => (
    <TouchableOpacity
      style={styles.helpItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.helpLeft}>
        <View style={styles.helpIcon}>
          {icon}
        </View>
        <View style={styles.helpText}>
          <Text style={styles.helpTitle}>{title}</Text>
          <Text style={styles.helpSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Text style={styles.arrow}>›</Text>
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

        <Text style={styles.headerTitle}>Help Center</Text>

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
        {/* Welcome Message */}
        <View style={styles.welcomeSection}>
          <HelpCircle size={48} color="#138AFE" />
          <Text style={styles.welcomeTitle}>How can we help you?</Text>
          <Text style={styles.welcomeSubtitle}>
            Find answers to common questions or get in touch with our support team.
          </Text>
        </View>

        {/* Quick Help */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Help</Text>

          {renderHelpItem(
            'Getting Started',
            'Learn the basics of using the app',
            <HelpCircle size={20} color="#138AFE" />
          )}

          {renderHelpItem(
            'Booking a Trip',
            'How to find and book accommodations',
            <FileText size={20} color="#138AFE" />
          )}

          {renderHelpItem(
            'Payment & Refunds',
            'Questions about payments and refunds',
            <FileText size={20} color="#138AFE" />
          )}

          {renderHelpItem(
            'Account & Profile',
            'Managing your account settings',
            <FileText size={20} color="#138AFE" />
          )}
        </View>

        {/* Contact Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>

          {renderHelpItem(
            'Chat with Support',
            'Get instant help from our team',
            <MessageCircle size={20} color="#138AFE" />
          )}

          {renderHelpItem(
            'Call Us',
            'Speak directly with a representative',
            <Phone size={20} color="#138AFE" />
          )}

          {renderHelpItem(
            'Email Support',
            'Send us a detailed message',
            <MessageCircle size={20} color="#138AFE" />
          )}
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

          {renderHelpItem(
            'Safety & Security',
            'Your safety is our top priority',
            <HelpCircle size={20} color="#138AFE" />
          )}

          {renderHelpItem(
            'Cancellation Policy',
            'Understand our cancellation terms',
            <FileText size={20} color="#138AFE" />
          )}

          {renderHelpItem(
            'Host Guidelines',
            'Information for property hosts',
            <FileText size={20} color="#138AFE" />
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
  welcomeSection: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  welcomeTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 24,
    color: "#000",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  welcomeSubtitle: {
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
  helpItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 8,
  },
  helpLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  helpIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  helpText: {
    flex: 1,
  },
  helpTitle: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: "#000",
    marginBottom: 2,
  },
  helpSubtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#666",
  },
  arrow: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 20,
    color: "#999",
  },
});