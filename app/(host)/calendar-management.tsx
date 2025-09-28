import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { ThemedView } from '../../components/themed-view';
import { Colors } from '../../constants/colors';
import { useHostListings } from '../../src/hooks/queries/use-listings';
import { useBookings } from '../../src/hooks/useBookings';
import { supabase } from '../../src/services/supabase/client';
import { useAuthStore } from '../../src/stores/auth-store';
import { Database } from '../../src/types/database';

type Listing = Database['public']['Tables']['listings']['Row'];

interface CalendarDay {
  date: Date;
  isAvailable: boolean;
  isBlocked: boolean;
  isBooked: boolean;
  isToday: boolean;
  isPast: boolean;
}

interface ManagementCalendarProps {
  listingId: string;
  blockedDates: string[];
  bookings: any[];
  onDateToggle: (date: Date) => void;
}

const ManagementCalendar: React.FC<ManagementCalendarProps> = ({
  listingId,
  blockedDates,
  bookings,
  onDateToggle,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const blockedDatesSet = useMemo(() =>
    new Set(blockedDates), [blockedDates]
  );

  const bookedDatesSet = useMemo(() => {
    const set = new Set<string>();
    bookings.forEach(booking => {
      if (booking.listing_id === listingId && (booking.status === 'confirmed' || booking.status === 'completed')) {
        const checkIn = new Date(booking.check_in);
        const checkOut = new Date(booking.check_out);
        for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
          set.add(d.toDateString());
        }
      }
    });
    return set;
  }, [bookings, listingId]);

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const dateString = currentDate.toDateString();
      const isBlocked = blockedDatesSet.has(currentDate.toISOString().split('T')[0]);
      const isBooked = bookedDatesSet.has(dateString);
      const isToday = currentDate.toDateString() === today.toDateString();
      const isPast = currentDate < today;

      days.push({
        date: currentDate,
        isAvailable: !isBlocked && !isBooked,
        isBlocked,
        isBooked,
        isToday,
        isPast,
      });
    }

    return days;
  };

  const handleDatePress = (day: CalendarDay) => {
    if (day.isPast || day.isBooked) return;
    onDateToggle(day.date);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  };

  const renderDay = (day: CalendarDay, index: number) => {
    const isCurrentMonth = day.date.getMonth() === currentMonth.getMonth();

    let dayStyle: any[] = [styles.day];
    let textStyle: any[] = [styles.dayText];

    if (!isCurrentMonth) {
      dayStyle.push(styles.dayOtherMonth);
      textStyle.push(styles.dayTextOtherMonth);
    }

    if (day.isPast) {
      dayStyle.push(styles.dayDisabled);
      textStyle.push(styles.dayTextDisabled);
    } else if (day.isBooked) {
      dayStyle.push(styles.dayBooked);
      textStyle.push(styles.dayTextBooked);
    } else if (day.isBlocked) {
      dayStyle.push(styles.dayBlocked);
      textStyle.push(styles.dayTextBlocked);
    } else if (day.isToday) {
      dayStyle.push(styles.dayToday);
      textStyle.push(styles.dayTextToday);
    }

    return (
      <TouchableOpacity
        key={index}
        style={dayStyle}
        onPress={() => handleDatePress(day)}
        disabled={day.isPast || day.isBooked}
      >
        <Text style={textStyle}>{day.date.getDate()}</Text>
      </TouchableOpacity>
    );
  };

  const days = getDaysInMonth(currentMonth);
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.calendarContainer}>
      {/* Header */}
      <View style={styles.calendarHeader}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth('prev')}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        <Text style={styles.monthTitle}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth('next')}
        >
          <Ionicons name="chevron-forward" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Day names */}
      <View style={styles.dayNames}>
        {dayNames.map(day => (
          <Text key={day} style={styles.dayName}>{day}</Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.week}>
            {week.map((day, dayIndex) => renderDay(day, weekIndex * 7 + dayIndex))}
          </View>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: Colors.primary }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#f59e0b' }]} />
          <Text style={styles.legendText}>Blocked</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#ef4444' }]} />
          <Text style={styles.legendText}>Booked</Text>
        </View>
      </View>
    </View>
  );
};

export default function CalendarManagementScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { data: listings, isLoading: listingsLoading } = useHostListings(user?.id || '');
  const { bookings, loading: bookingsLoading } = useBookings({
    userId: user?.id || '',
    userRole: 'host',
    status: 'all'
  });

  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

  const selectedListing = listings?.find(l => l.id === selectedListingId) as Listing | undefined;

  const updateBlockedDatesMutation = useMutation({
    mutationFn: async ({ listingId, blockedDates }: { listingId: string; blockedDates: string[] }) => {
      const { error } = await supabase
        .from('listings')
        .update({ blocked_dates: blockedDates })
        .eq('id', listingId);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate and refetch listings
      queryClient.invalidateQueries({ queryKey: ['host-listings', user?.id] });
    },
  });

  const handleDateToggle = async (date: Date) => {
    if (!selectedListing || !selectedListingId) return;

    const dateString = date.toISOString().split('T')[0];
    const currentBlocked = selectedListing.blocked_dates || [];
    const isCurrentlyBlocked = currentBlocked.includes(dateString);

    const newBlockedDates = isCurrentlyBlocked
      ? currentBlocked.filter((d: string) => d !== dateString)
      : [...currentBlocked, dateString];

    try {
      await updateBlockedDatesMutation.mutateAsync({
        listingId: selectedListingId,
        blockedDates: newBlockedDates,
      });
    } catch (error) {
      console.error('Failed to update blocked dates:', error);
      // TODO: Show error message to user
    }
  };

  if (listingsLoading || bookingsLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading calendar...</Text>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Calendar Management</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Listings selector */}
          <Text style={styles.sectionTitle}>Select Listing</Text>
          <View style={styles.listingsGrid}>
            {listings?.map((listing) => (
              <TouchableOpacity
                key={listing.id}
                style={[
                  styles.listingCard,
                  selectedListingId === listing.id && styles.listingCardSelected
                ]}
                onPress={() => setSelectedListingId(listing.id)}
              >
                <Text style={styles.listingTitle} numberOfLines={2}>
                  {listing.title}
                </Text>
                <Text style={styles.listingLocation}>
                  {listing.address?.city}, {listing.address?.country}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Calendar view for selected listing */}
          {selectedListingId && selectedListing && (
            <View style={styles.calendarSection}>
              <Text style={styles.sectionTitle}>Calendar for {selectedListing.title}</Text>
              <ManagementCalendar
                listingId={selectedListingId}
                blockedDates={selectedListing.blocked_dates || []}
                bookings={bookings}
                onDateToggle={handleDateToggle}
              />
            </View>
          )}
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
    marginBottom: 16,
  },
  listingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  listingCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  listingCardSelected: {
    borderColor: Colors.primary,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  listingLocation: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  calendarSection: {
    marginTop: 20,
  },
  placeholderText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontStyle: 'italic',
    paddingVertical: 40,
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
  calendarContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  dayNames: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  calendarGrid: {
    marginBottom: 16,
  },
  week: {
    flexDirection: 'row',
  },
  day: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 8,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dayOtherMonth: {
    opacity: 0.3,
  },
  dayTextOtherMonth: {
    color: Colors.textSecondary,
  },
  dayDisabled: {
    backgroundColor: '#f5f5f5',
  },
  dayTextDisabled: {
    color: '#ccc',
  },
  dayBooked: {
    backgroundColor: '#fef2f2',
  },
  dayTextBooked: {
    color: '#ef4444',
  },
  dayBlocked: {
    backgroundColor: '#fef3c7',
  },
  dayTextBlocked: {
    color: '#f59e0b',
  },
  dayToday: {
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  dayTextToday: {
    color: Colors.primary,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});