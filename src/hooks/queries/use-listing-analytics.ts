import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../services/supabase/client';

export interface ListingAnalytics {
  views: number;
  bookings: {
    total: number;
    confirmed: number;
    completed: number;
    pending: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
  };
  ratings: {
    average: number;
    count: number;
  };
  timeSeries: {
    bookings: Array<{
      date: string;
      count: number;
    }>;
    revenue: Array<{
      date: string;
      amount: number;
    }>;
  };
}

export const useListingAnalytics = (listingId: string) => {
  return useQuery({
    queryKey: ['listing-analytics', listingId],
    queryFn: async (): Promise<ListingAnalytics> => {
      // Fetch basic listing stats
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select('views, average_rating, review_count')
        .eq('id', listingId)
        .single();

      if (listingError) throw listingError;

      // Fetch bookings data
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('status, total_amount, created_at')
        .eq('listing_id', listingId);

      if (bookingsError) throw bookingsError;

      // Calculate booking stats
      const bookingStats = {
        total: bookings.length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        pending: bookings.filter(b => b.status === 'pending').length,
      };

      // Calculate revenue
      const completedBookings = bookings.filter(b => b.status === 'completed');
      const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);

      // Revenue for current month
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonthRevenue = completedBookings
        .filter(b => new Date(b.created_at) >= thisMonth)
        .reduce((sum, b) => sum + (b.total_amount || 0), 0);

      // Revenue for last month
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      const lastMonthRevenue = completedBookings
        .filter(b => {
          const date = new Date(b.created_at);
          return date >= lastMonth && date <= lastMonthEnd;
        })
        .reduce((sum, b) => sum + (b.total_amount || 0), 0);

      // Time series data for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const bookingsTimeSeries = bookings
        .filter(b => new Date(b.created_at) >= thirtyDaysAgo)
        .reduce((acc, booking) => {
          const date = new Date(booking.created_at).toISOString().split('T')[0];
          const existing = acc.find(item => item.date === date);
          if (existing) {
            existing.count += 1;
          } else {
            acc.push({ date, count: 1 });
          }
          return acc;
        }, [] as Array<{ date: string; count: number }>)
        .sort((a, b) => a.date.localeCompare(b.date));

      const revenueTimeSeries = completedBookings
        .filter(b => new Date(b.created_at) >= thirtyDaysAgo)
        .reduce((acc, booking) => {
          const date = new Date(booking.created_at).toISOString().split('T')[0];
          const existing = acc.find(item => item.date === date);
          if (existing) {
            existing.amount += booking.total_amount || 0;
          } else {
            acc.push({ date, amount: booking.total_amount || 0 });
          }
          return acc;
        }, [] as Array<{ date: string; amount: number }>)
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        views: listing.views || 0,
        bookings: bookingStats,
        revenue: {
          total: totalRevenue,
          thisMonth: thisMonthRevenue,
          lastMonth: lastMonthRevenue,
        },
        ratings: {
          average: listing.average_rating || 0,
          count: listing.review_count || 0,
        },
        timeSeries: {
          bookings: bookingsTimeSeries,
          revenue: revenueTimeSeries,
        },
      };
    },
    enabled: !!listingId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};