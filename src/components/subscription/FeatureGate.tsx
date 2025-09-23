import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useFeatureAccess } from '@/src/hooks/useFeatureAccess';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { UpgradePromptModal } from './UpgradePromptModal';

interface FeatureGateProps {
  feature: string;
  requiredTier: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showLockIcon?: boolean;
  onFeatureAccessed?: () => void;
}

/**
 * FeatureGate component that wraps premium features and shows upgrade prompts
 * when users try to access features they don't have permission for.
 *
 * Usage examples:
 *
 * // Basic usage - shows upgrade prompt on press
 * <FeatureGate feature="travel_buddy_matching" requiredTier="traveler">
 *   <TravelBuddyButton />
 * </FeatureGate>
 *
 * // Custom fallback UI
 * <FeatureGate
 *   feature="create_paid_listings"
 *   requiredTier="entrepreneur"
 *   fallback={<LockedListingButton />}
 * >
 *   <CreateListingButton />
 * </FeatureGate>
 *
 * // With callback when feature is accessed
 * <FeatureGate
 *   feature="advanced_filters"
 *   requiredTier="traveler"
 *   onFeatureAccessed={() => console.log('Advanced filters accessed')}
 * >
 *   <AdvancedFilters />
 * </FeatureGate>
 */
export function FeatureGate({
  feature,
  requiredTier,
  children,
  fallback,
  showLockIcon = true,
  onFeatureAccessed
}: FeatureGateProps) {
  const textColor = useThemeColor({}, 'text');
  const { checkFeatureAccess, canAccessFeature } = useFeatureAccess();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const hasAccess = canAccessFeature(feature);

  const handlePress = () => {
    if (checkFeatureAccess(feature, requiredTier)) {
      // User has access, call the callback if provided
      onFeatureAccessed?.();
    } else {
      // User doesn't have access, modal will be shown by checkFeatureAccess
      setShowUpgradeModal(true);
    }
  };

  // If user has access, render children directly
  if (hasAccess) {
    return <>{children}</>;
  }

  // If custom fallback is provided, use it
  if (fallback) {
    return (
      <>
        {fallback}
        <UpgradePromptModal
          visible={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature={feature}
          requiredTier={requiredTier}
        />
      </>
    );
  }

  // Default behavior: wrap children in TouchableOpacity that shows upgrade prompt
  return (
    <>
      <TouchableOpacity
        style={styles.gatedContainer}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.gatedContent}>
          {children}
          {showLockIcon && (
            <View style={styles.lockOverlay}>
              <ThemedText style={styles.lockIcon}>🔒</ThemedText>
              <ThemedText style={[styles.lockText, { color: textColor }]}>
                Premium
              </ThemedText>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <UpgradePromptModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={feature}
        requiredTier={requiredTier}
      />
    </>
  );
}

const styles = StyleSheet.create({
  gatedContainer: {
    position: 'relative',
  },
  gatedContent: {
    // Children render normally
  },
  lockOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 60,
  },
  lockIcon: {
    fontSize: 12,
    color: 'white',
  },
  lockText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
});