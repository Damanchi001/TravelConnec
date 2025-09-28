import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedView } from '../../../components/themed-view';
import { Colors } from '../../../constants/colors';
import { BookingCard } from '../../../src/components/booking/booking-card';
import { BookingFilters } from '../../../src/components/booking/booking-filters';
import { CancellationModal } from '../../../src/components/booking/cancellation-modal';
import { useBookings } from '../../../src/hooks/useBookings';
import { supabase } from '../../../src/services/supabase/client';
import { useAuthStore } from '../../../src/stores/auth-store';

type BookingTab = 'upcoming' | 'past';

export default function ManageBookingsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<BookingTab>('upcoming');
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled',
    sortBy: 'check_in' as 'check_in' | 'created_at' | 'total_amount',
    sortOrder: 'desc' as 'asc' | 'desc',
  });
  const [cancellationModalVisible, setCancellationModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const { bookings, loading, error, refetch } = useBookings({
    userId: user?.id,
    userRole: 'host',
    ...filters,
  });

  const filteredBookings = useMemo(() => {
    const now = new Date();
    return bookings.filter(booking => {
      const isUpcoming = new Date(booking.check_in) >= now;
      const matchesTab = activeTab === 'upcoming' ? isUpcoming : !isUpcoming;

      if (filters.status !== 'all') {
        return matchesTab && booking.status === filters.status;
      }

      return matchesTab;
    });
  }, [bookings, activeTab, filters.status]);

  const sortedBookings = useMemo(() => {
    return [...filteredBookings].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'check_in':
          aValue = new Date(a.check_in);
          bValue = new Date(b.check_in);
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'total_amount':
          aValue = a.total_amount;
          bValue = b.total_amount;
          break;
        default:
          return 0;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredBookings, filters.sortBy, filters.sortOrder]);

  const handleBookingPress = (bookingId: string) => {
    router.push(`/booking/${bookingId}/details`);
  };

  const handleMessageGuest = (bookingId: string) => {
    router.push(`/chat/${bookingId}`);
  };

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      // Update booking status to confirmed
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);

      if (error) throw error;

      // Refresh bookings
      refetch();
      alert('Booking confirmed successfully!');
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert('Failed to confirm booking. Please try again.');
    }
  };

  const handleCheckIn = (bookingId: string) => {
    router.push(`/booking/${bookingId}/check-in`);
  };

  const handleCancelBooking = (booking: any) => {
    setSelectedBooking(booking);
    setCancellationModalVisible(true);
  };

  const handleCancellationComplete = () => {
    setCancellationModalVisible(false);
    setSelectedBooking(null);
    refetch(); // Refresh the bookings list
  };

  if (loading && !bookings.length) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your bookings...</Text>
        </View>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>Failed to load bookings</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Bookings</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {/* Open filters modal */}}
        >
          <Ionicons name="filter" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      <BookingFilters
        filters={filters}
        onFiltersChange={setFilters}
        showStatusFilter={true}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
        showsVerticalScrollIndicator={false}
      >
        {sortedBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name={activeTab === 'upcoming' ? 'calendar-outline' : 'time-outline'}
              size={64}
              color={Colors.textSecondary}
            />
            <Text style={styles.emptyTitle}>
              {activeTab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'upcoming'
                ? 'Bookings will appear here when guests make reservations.'
                : 'Your completed bookings will appear here.'
              }
            </Text>
          </View>
        ) : (
          <View style={styles.bookingsList}>
            {sortedBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                userRole="host"
                onPress={() => handleBookingPress(booking.id)}
                onMessageGuest={() => handleMessageGuest(booking.id)}
                onConfirm={() => handleConfirmBooking(booking.id)}
                onCheckIn={() => handleCheckIn(booking.id)}
                onCancel={() => handleCancelBooking(booking)}
                showCancelButton={booking.status === 'confirmed'}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Cancellation Modal */}
      <CancellationModal
        visible={cancellationModalVisible}
        onClose={() => setCancellationModalVisible(false)}
        booking={selectedBooking}
        userRole="host"
        userId={user?.id || ''}
        onCancellationComplete={handleCancellationComplete}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.card,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  bookingsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});