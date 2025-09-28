import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { ThemedView } from '../../components/themed-view';
import { Colors } from '../../constants/colors';
import { EarningsFilters, useEarnings } from '../../src/hooks/queries/use-earnings';

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
            <Text style={styles.barValue}>${item.value.toLocaleString()}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

interface TimeFilterProps {
  selectedPeriod: string;
  onPeriodChange: (period: EarningsFilters['period']) => void;
}

const TimeFilter: React.FC<TimeFilterProps> = ({ selectedPeriod, onPeriodChange }) => {
  const periods = [
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '90d', label: '90 Days' },
    { key: '1y', label: '1 Year' },
    { key: 'all', label: 'All Time' },
  ] as const;

  return (
    <View style={styles.filterContainer}>
      <Text style={styles.filterTitle}>Time Period:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.filterButton,
              selectedPeriod === period.key && styles.filterButtonActive,
            ]}
            onPress={() => onPeriodChange(period.key)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedPeriod === period.key && styles.filterButtonTextActive,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default function EarningsScreen() {
  const router = useRouter();
  const [filters, setFilters] = useState<EarningsFilters>({ period: '30d' });

  const { data: earnings, isLoading, error } = useEarnings(filters);

  const handlePeriodChange = (period: EarningsFilters['period']) => {
    setFilters({ period });
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading earnings...</Text>
        </View>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>Failed to load earnings</Text>
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

  if (!earnings) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No earnings data available</Text>
        </View>
      </ThemedView>
    );
  }

  // Prepare chart data
  const monthlyChartData = earnings.monthlyEarnings.map(item => ({
    label: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    value: item.amount,
  }));

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Earnings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Time Filter */}
          <TimeFilter selectedPeriod={filters.period || '30d'} onPeriodChange={handlePeriodChange} />

          {/* Key Metrics */}
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.metricsGrid}>
            <MetricCard
              title="Total Earnings"
              value={`$${earnings.totalEarnings.toLocaleString()}`}
              icon="cash"
              color="#10b981"
            />
            <MetricCard
              title="Available Balance"
              value={`$${earnings.availableBalance.toLocaleString()}`}
              subtitle="Ready for payout"
              icon="wallet"
              color="#3b82f6"
            />
            <MetricCard
              title="Pending Payouts"
              value={`$${earnings.pendingPayouts.toLocaleString()}`}
              subtitle="In processing"
              icon="time"
              color="#f59e0b"
            />
            <MetricCard
              title="Total Paid Out"
              value={`$${earnings.totalPaid.toLocaleString()}`}
              subtitle="Successfully paid"
              icon="checkmark-circle"
              color="#8b5cf6"
            />
          </View>

          {/* Monthly Earnings Chart */}
          <Text style={styles.sectionTitle}>Monthly Earnings</Text>
          <View style={styles.chartCard}>
            <SimpleBarChart data={monthlyChartData} color="#10b981" />
          </View>

          {/* Period Comparison */}
          <Text style={styles.sectionTitle}>Period Comparison</Text>
          <View style={styles.comparisonGrid}>
            <View style={styles.comparisonCard}>
              <Text style={styles.comparisonTitle}>This Month</Text>
              <Text style={styles.comparisonValue}>${earnings.earningsByPeriod.thisMonth.toLocaleString()}</Text>
            </View>
            <View style={styles.comparisonCard}>
              <Text style={styles.comparisonTitle}>Last Month</Text>
              <Text style={styles.comparisonValue}>${earnings.earningsByPeriod.lastMonth.toLocaleString()}</Text>
            </View>
            <View style={styles.comparisonCard}>
              <Text style={styles.comparisonTitle}>This Year</Text>
              <Text style={styles.comparisonValue}>${earnings.earningsByPeriod.thisYear.toLocaleString()}</Text>
            </View>
            <View style={styles.comparisonCard}>
              <Text style={styles.comparisonTitle}>Last Year</Text>
              <Text style={styles.comparisonValue}>${earnings.earningsByPeriod.lastYear.toLocaleString()}</Text>
            </View>
          </View>

          {/* Recent Payouts */}
          <Text style={styles.sectionTitle}>Recent Payouts</Text>
          <View style={styles.listCard}>
            {earnings.recentPayouts.length > 0 ? (
              earnings.recentPayouts.map((payout) => (
                <View key={payout.id} style={styles.listItem}>
                  <View style={styles.listItemLeft}>
                    <Ionicons
                      name={payout.status === 'paid' ? 'checkmark-circle' : 'time'}
                      size={20}
                      color={payout.status === 'paid' ? '#10b981' : '#f59e0b'}
                    />
                    <View style={styles.listItemContent}>
                      <Text style={styles.listItemTitle}>Booking {payout.booking_code}</Text>
                      <Text style={styles.listItemSubtitle}>
                        {payout.status === 'paid'
                          ? `Paid ${payout.paid_at ? new Date(payout.paid_at).toLocaleDateString() : ''}`
                          : `Scheduled ${payout.scheduled_at ? new Date(payout.scheduled_at).toLocaleDateString() : ''}`
                        }
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.listItemAmount}>${payout.amount.toLocaleString()}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No recent payouts</Text>
            )}
          </View>

          {/* Pending Payments */}
          <Text style={styles.sectionTitle}>Pending Payments</Text>
          <View style={styles.listCard}>
            {earnings.pendingPayments.length > 0 ? (
              earnings.pendingPayments.map((payment) => (
                <View key={payment.id} style={styles.listItem}>
                  <View style={styles.listItemLeft}>
                    <Ionicons name="time" size={20} color="#f59e0b" />
                    <View style={styles.listItemContent}>
                      <Text style={styles.listItemTitle}>Booking {payment.booking_code}</Text>
                      <Text style={styles.listItemSubtitle}>
                        Check-out: {new Date(payment.check_out).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.listItemAmount}>${payment.amount.toLocaleString()}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No pending payments</Text>
            )}
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
  filterContainer: {
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 12,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.card,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.text,
  },
  filterButtonTextActive: {
    color: Colors.background,
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
    width: 60,
    fontSize: 12,
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
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text,
    minWidth: 50,
  },
  comparisonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  comparisonCard: {
    flex: 1,
    minWidth: (width - 40 - 24) / 2,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  comparisonTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  comparisonValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  listCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listItemContent: {
    marginLeft: 12,
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  listItemSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  listItemAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontStyle: 'italic',
    paddingVertical: 20,
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