import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { ThemedView } from '../../../../components/themed-view';
import { Colors } from '../../../../constants/colors';
import { useListingAnalytics } from '../../../../src/hooks/queries/use-listing-analytics';

const { width } = Dimensions.get('window');

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, icon, color }) => (
  <View style={[styles.metricCard, { borderLeftColor: color }]}>
    <View style={styles.metricHeader}>
      <Ionicons name={icon as any} size={24} color={color} />
      <Text style={styles.metricTitle}>{title}</Text>
    </View>
    <Text style={[styles.metricValue, { color }]}>{value}</Text>
    {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
  </View>
);

interface SimpleBarChartProps {
  data: Array<{ label: string; value: number }>;
  color: string;
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data, color }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <View style={styles.chartContainer}>
      {data.map((item, index) => (
        <View key={index} style={styles.barContainer}>
          <Text style={styles.barLabel}>{item.label}</Text>
          <View style={styles.barWrapper}>
            <View
              style={[
                styles.bar,
                {
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: color,
                },
              ]}
            />
            <Text style={styles.barValue}>{item.value}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export default function ListingAnalyticsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: analytics, isLoading, error } = useListingAnalytics(id);

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>Failed to load analytics</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  if (!analytics) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No analytics data available</Text>
        </View>
      </ThemedView>
    );
  }

  // Prepare chart data
  const bookingStatusData = [
    { label: 'Pending', value: analytics.bookings.pending },
    { label: 'Confirmed', value: analytics.bookings.confirmed },
    { label: 'Completed', value: analytics.bookings.completed },
  ];

  const revenueComparisonData = [
    { label: 'Last Month', value: analytics.revenue.lastMonth },
    { label: 'This Month', value: analytics.revenue.thisMonth },
  ];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Analytics</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Key Metrics */}
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <MetricCard
              title="Views"
              value={analytics.views.toLocaleString()}
              icon="eye"
              color="#3b82f6"
            />
            <MetricCard
              title="Total Bookings"
              value={analytics.bookings.total}
              icon="calendar"
              color="#10b981"
            />
            <MetricCard
              title="Total Revenue"
              value={`$${analytics.revenue.total.toLocaleString()}`}
              icon="cash"
              color="#f59e0b"
            />
            <MetricCard
              title="Average Rating"
              value={analytics.ratings.average.toFixed(1)}
              subtitle={`${analytics.ratings.count} reviews`}
              icon="star"
              color="#ef4444"
            />
          </View>

          {/* Booking Status Chart */}
          <Text style={styles.sectionTitle}>Booking Status</Text>
          <View style={styles.chartCard}>
            <SimpleBarChart data={bookingStatusData} color="#10b981" />
          </View>

          {/* Revenue Comparison */}
          <Text style={styles.sectionTitle}>Monthly Revenue</Text>
          <View style={styles.chartCard}>
            <SimpleBarChart data={revenueComparisonData} color="#f59e0b" />
          </View>

          {/* Recent Activity */}
          <Text style={styles.sectionTitle}>Recent Activity (Last 30 Days)</Text>
          <View style={styles.activityCard}>
            <Text style={styles.activityText}>
              Bookings: {analytics.timeSeries.bookings.reduce((sum, b) => sum + b.count, 0)}
            </Text>
            <Text style={styles.activityText}>
              Revenue: ${analytics.timeSeries.revenue.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: (width - 40 - 16) / 2,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  chartCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartContainer: {
    gap: 12,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  barLabel: {
    width: 80,
    fontSize: 14,
    color: Colors.text,
  },
  barWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bar: {
    height: 24,
    borderRadius: 4,
  },
  barValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    minWidth: 30,
    textAlign: 'right',
  },
  activityCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '500',
  },
});