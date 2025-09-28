import { supabase } from '@/src/services/supabase/client';
import { useAuthStore } from '@/src/stores/auth-store';
import { useQuery } from '@tanstack/react-query';

export interface EarningsData {
  totalEarnings: number;
  availableBalance: number;
  pendingPayouts: number;
  totalPaid: number;
  monthlyEarnings: Array<{
    month: string;
    amount: number;
    bookings: number;
  }>;
  recentPayouts: Array<{
    id: string;
    amount: number;
    status: 'pending' | 'paid' | 'failed';
    paid_at: string | null;
    scheduled_at: string | null;
    booking_code: string;
  }>;
  pendingPayments: Array<{
    id: string;
    amount: number;
    booking_code: string;
    check_out: string;
    status: string;
  }>;
  earningsByPeriod: {
    thisMonth: number;
    lastMonth: number;
    thisYear: number;
    lastYear: number;
  };
}

export interface EarningsFilters {
  period?: '7d' | '30d' | '90d' | '1y' | 'all';
  startDate?: string;
  endDate?: string;
}

export const useEarnings = (filters: EarningsFilters = {}) => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['earnings', user?.id, filters],
    queryFn: async (): Promise<EarningsData> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const now = new Date();
      let startDate: Date;

      // Calculate date range based on filters
      switch (filters.period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          break;
        case 'all':
        default:
          startDate = new Date(2020, 0, 1); // Far in the past
          break;
      }

      if (filters.startDate) {
        startDate = new Date(filters.startDate);
      }

      const endDate = filters.endDate ? new Date(filters.endDate) : now;

      // Fetch completed bookings for the host
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          total_amount,
          paid_amount,
          status,
          payment_status,
          check_out,
          booking_code,
          created_at,
          payments (
            host_amount,
            platform_fee,
            status
          ),
          payouts (
            amount,
            status,
            paid_at,
            scheduled_at
          )
        `)
        .eq('host_id', user.id)
        .eq('status', 'completed')
        .gte('check_out', startDate.toISOString())
        .lte('check_out', endDate.toISOString())
        .order('check_out', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Calculate earnings metrics
      let totalEarnings = 0;
      let availableBalance = 0;
      let pendingPayouts = 0;
      let totalPaid = 0;

      const monthlyEarnings: Array<{ month: string; amount: number; bookings: number }> = [];
      const recentPayouts: Array<{
        id: string;
        amount: number;
        status: 'pending' | 'paid' | 'failed';
        paid_at: string | null;
        scheduled_at: string | null;
        booking_code: string;
      }> = [];
      const pendingPayments: Array<{
        id: string;
        amount: number;
        booking_code: string;
        check_out: string;
        status: string;
      }> = [];

      // Process bookings data
      const monthlyMap = new Map<string, { amount: number; bookings: number }>();

      bookings?.forEach((booking) => {
        const payment = booking.payments?.[0];
        const payout = booking.payouts?.[0];

        if (payment && payment.status === 'succeeded') {
          const hostAmount = payment.host_amount || 0;
          totalEarnings += hostAmount;

          // Monthly aggregation
          const monthKey = new Date(booking.check_out).toISOString().slice(0, 7); // YYYY-MM
          const existing = monthlyMap.get(monthKey) || { amount: 0, bookings: 0 };
          monthlyMap.set(monthKey, {
            amount: existing.amount + hostAmount,
            bookings: existing.bookings + 1,
          });

          // Payout status
          if (payout) {
            if (payout.status === 'paid') {
              totalPaid += payout.amount;
            } else if (payout.status === 'pending') {
              pendingPayouts += payout.amount;
              availableBalance += payout.amount;
            }

            recentPayouts.push({
              id: booking.id,
              amount: payout.amount,
              status: payout.status,
              paid_at: payout.paid_at,
              scheduled_at: payout.scheduled_at,
              booking_code: booking.booking_code,
            });
          } else {
            // No payout yet, consider as pending
            pendingPayments.push({
              id: booking.id,
              amount: hostAmount,
              booking_code: booking.booking_code,
              check_out: booking.check_out,
              status: 'pending_payout',
            });
            availableBalance += hostAmount;
          }
        }
      });

      // Convert monthly map to array
      monthlyMap.forEach((data, month) => {
        monthlyEarnings.push({
          month,
          amount: data.amount,
          bookings: data.bookings,
        });
      });

      monthlyEarnings.sort((a, b) => a.month.localeCompare(b.month));

      // Calculate earnings by period
      const thisMonth = new Date().toISOString().slice(0, 7);
      const lastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().slice(0, 7);
      const thisYear = new Date().getFullYear().toString();
      const lastYear = (new Date().getFullYear() - 1).toString();

      const earningsByPeriod = {
        thisMonth: monthlyEarnings.find(m => m.month === thisMonth)?.amount || 0,
        lastMonth: monthlyEarnings.find(m => m.month === lastMonth)?.amount || 0,
        thisYear: monthlyEarnings
          .filter(m => m.month.startsWith(thisYear))
          .reduce((sum, m) => sum + m.amount, 0),
        lastYear: monthlyEarnings
          .filter(m => m.month.startsWith(lastYear))
          .reduce((sum, m) => sum + m.amount, 0),
      };

      return {
        totalEarnings,
        availableBalance,
        pendingPayouts,
        totalPaid,
        monthlyEarnings,
        recentPayouts: recentPayouts.slice(0, 10), // Last 10 payouts
        pendingPayments: pendingPayments.slice(0, 10), // Last 10 pending
        earningsByPeriod,
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};