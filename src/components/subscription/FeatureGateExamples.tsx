import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useFeatureAccess } from '@/src/hooks/useFeatureAccess';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FeatureGate } from './FeatureGate';

/**
 * Example component showing how to use FeatureGate throughout the app
 * This demonstrates various patterns for implementing subscription-gated features
 */
export function FeatureGateExamples() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <ThemedText style={[styles.title, { color: textColor }]}>
          Feature Gate Examples
        </ThemedText>

        <ThemedText style={[styles.description, { color: textColor, opacity: 0.7 }]}>
          These examples show how to integrate subscription upgrade prompts throughout your app.
        </ThemedText>

        {/* Example 1: Basic Feature Gate */}
        <View style={styles.example}>
          <ThemedText style={[styles.exampleTitle, { color: textColor }]}>
            1. Basic Feature Gate
          </ThemedText>
          <ThemedText style={[styles.exampleDesc, { color: textColor, opacity: 0.7 }]}>
            Wrap any component to require a specific subscription tier
          </ThemedText>

          <FeatureGate feature="travel_buddy_matching" requiredTier="traveler">
            <TouchableOpacity style={[styles.button, styles.primaryButton]}>
              <ThemedText style={styles.buttonText}>Find Travel Buddies</ThemedText>
            </TouchableOpacity>
          </FeatureGate>
        </View>

        {/* Example 2: Custom Fallback */}
        <View style={styles.example}>
          <ThemedText style={[styles.exampleTitle, { color: textColor }]}>
            2. Custom Fallback UI
          </ThemedText>
          <ThemedText style={[styles.exampleDesc, { color: textColor, opacity: 0.7 }]}>
            Show custom locked state instead of overlay
          </ThemedText>

          <FeatureGate
            feature="create_paid_listings"
            requiredTier="entrepreneur"
            fallback={
              <View style={[styles.lockedButton, { borderColor: textColor, opacity: 0.5 }]}>
                <ThemedText style={[styles.lockedText, { color: textColor }]}>
                  🔒 Create Paid Listing (Entrepreneur Only)
                </ThemedText>
              </View>
            }
          >
            <TouchableOpacity style={[styles.button, styles.successButton]}>
              <ThemedText style={styles.buttonText}>Create Paid Listing</ThemedText>
            </TouchableOpacity>
          </FeatureGate>
        </View>

        {/* Example 3: Multiple Features */}
        <View style={styles.example}>
          <ThemedText style={[styles.exampleTitle, { color: textColor }]}>
            3. Multiple Gated Features
          </ThemedText>
          <ThemedText style={[styles.exampleDesc, { color: textColor, opacity: 0.7 }]}>
            Different features can require different tiers
          </ThemedText>

          <View style={styles.buttonRow}>
            <FeatureGate feature="advanced_filters" requiredTier="traveler">
              <TouchableOpacity style={[styles.smallButton, styles.secondaryButton]}>
                <ThemedText style={styles.smallButtonText}>Advanced Filters</ThemedText>
              </TouchableOpacity>
            </FeatureGate>

            <FeatureGate feature="insights_dashboard" requiredTier="entrepreneur">
              <TouchableOpacity style={[styles.smallButton, styles.purpleButton]}>
                <ThemedText style={styles.smallButtonText}>View Insights</ThemedText>
              </TouchableOpacity>
            </FeatureGate>
          </View>
        </View>

        {/* Example 4: Screen-Level Feature Gate */}
        <View style={styles.example}>
          <ThemedText style={[styles.exampleTitle, { color: textColor }]}>
            4. Screen-Level Protection
          </ThemedText>
          <ThemedText style={[styles.exampleDesc, { color: textColor, opacity: 0.7 }]}>
            Protect entire screens or major features
          </ThemedText>

          <FeatureGate
            feature="host_group_trips"
            requiredTier="entrepreneur"
            showLockIcon={false}
          >
            <View style={[styles.card, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
              <ThemedText style={[styles.cardTitle, { color: textColor }]}>
                🏖️ Host Group Trip
              </ThemedText>
              <ThemedText style={[styles.cardDesc, { color: textColor, opacity: 0.8 }]}>
                Create and manage TravelConnec-branded group trips for your clients.
              </ThemedText>
              <TouchableOpacity style={[styles.cardButton, { backgroundColor: '#7C3AED' }]}>
                <ThemedText style={styles.cardButtonText}>Start Hosting</ThemedText>
              </TouchableOpacity>
            </View>
          </FeatureGate>
        </View>

        {/* Example 5: Inline Feature Access */}
        <View style={styles.example}>
          <ThemedText style={[styles.exampleTitle, { color: textColor }]}>
            5. Conditional Rendering
          </ThemedText>
          <ThemedText style={[styles.exampleDesc, { color: textColor, opacity: 0.7 }]}>
            Use hooks directly for conditional rendering
          </ThemedText>

          <ConditionalFeatureExample />
        </View>

        {/* Implementation Notes */}
        <View style={styles.notes}>
          <ThemedText style={[styles.notesTitle, { color: textColor }]}>
            💡 Implementation Notes
          </ThemedText>

          <View style={styles.noteItem}>
            <ThemedText style={[styles.bullet, { color: textColor }]}>•</ThemedText>
            <ThemedText style={[styles.noteText, { color: textColor, opacity: 0.8 }]}>
              FeatureGate automatically shows upgrade modals when users try to access locked features
            </ThemedText>
          </View>

          <View style={styles.noteItem}>
            <ThemedText style={[styles.bullet, { color: textColor }]}>•</ThemedText>
            <ThemedText style={[styles.noteText, { color: textColor, opacity: 0.8 }]}>
              Use feature strings like &apos;travel_buddy_matching&apos;, &apos;create_paid_listings&apos;, etc.
            </ThemedText>
          </View>

          <View style={styles.noteItem}>
            <ThemedText style={[styles.bullet, { color: textColor }]}>•</ThemedText>
            <ThemedText style={[styles.noteText, { color: textColor, opacity: 0.8 }]}>
              Required tiers: &apos;traveler&apos;, &apos;entrepreneur&apos; (social is free)
            </ThemedText>
          </View>

          <View style={styles.noteItem}>
            <ThemedText style={[styles.bullet, { color: textColor }]}>•</ThemedText>
            <ThemedText style={[styles.noteText, { color: textColor, opacity: 0.8 }]}>
              All upgrade prompts include trial offers and direct purchase options
            </ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

/**
 * Example showing conditional rendering using hooks directly
 */
function ConditionalFeatureExample() {
  const { canAccessFeature } = useFeatureAccess();
  const textColor = useThemeColor({}, 'text');

  const hasAdvancedFilters = canAccessFeature('advanced_filters');
  const hasVoiceCalling = canAccessFeature('voice_video_calling');

  return (
    <View style={styles.conditionalContainer}>
      <ThemedText style={[styles.conditionalTitle, { color: textColor }]}>
        Available Features:
      </ThemedText>

      {hasAdvancedFilters && (
        <View style={styles.featureBadge}>
          <ThemedText style={styles.featureBadgeText}>✓ Advanced Filters</ThemedText>
        </View>
      )}

      {hasVoiceCalling && (
        <View style={styles.featureBadge}>
          <ThemedText style={styles.featureBadgeText}>✓ Voice & Video Calling</ThemedText>
        </View>
      )}

      {!hasAdvancedFilters && !hasVoiceCalling && (
        <ThemedText style={[styles.noFeatures, { color: textColor, opacity: 0.6 }]}>
          Upgrade to unlock premium features
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 32,
    lineHeight: 24,
  },
  example: {
    marginBottom: 32,
  },
  exampleTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  exampleDesc: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  successButton: {
    backgroundColor: '#10B981',
  },
  secondaryButton: {
    backgroundColor: '#6B7280',
  },
  purpleButton: {
    backgroundColor: '#7C3AED',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  lockedButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  lockedText: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  smallButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  smallButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    padding: 20,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  cardButton: {
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  cardButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  conditionalContainer: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  conditionalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  featureBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  featureBadgeText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  noFeatures: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  notes: {
    padding: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  noteItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bullet: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});