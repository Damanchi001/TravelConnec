import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '../../../constants/colors';

// const { width } = Dimensions.get('window'); // Not used in current implementation

interface BookingCalendarProps {
  availableDates: Date[];
  blockedDates: Date[];
  selectedDates: { checkIn?: Date; checkOut?: Date };
  onDatesChange: (dates: { checkIn?: Date; checkOut?: Date }) => void;
  minNights?: number;
  maxNights?: number;
}

interface CalendarDay {
  date: Date;
  isAvailable: boolean;
  isBlocked: boolean;
  isSelected: boolean;
  isCheckIn: boolean;
  isCheckOut: boolean;
  isInRange: boolean;
  isToday: boolean;
  isPast: boolean;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  availableDates,
  blockedDates,
  selectedDates,
  onDatesChange,
  minNights = 1,
  maxNights = 30,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const availableDatesSet = useMemo(() =>
    new Set(availableDates.map(d => d.toDateString())), [availableDates]
  );

  const blockedDatesSet = useMemo(() =>
    new Set(blockedDates.map(d => d.toDateString())), [blockedDates]
  );

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
      const isAvailable = availableDatesSet.has(dateString);
      const isBlocked = blockedDatesSet.has(dateString);
      const isToday = currentDate.toDateString() === today.toDateString();
      const isPast = currentDate < today;

      let isSelected = false;
      let isCheckIn = false;
      let isCheckOut = false;
      let isInRange = false;

      if (selectedDates.checkIn && selectedDates.checkOut) {
        const checkIn = new Date(selectedDates.checkIn);
        const checkOut = new Date(selectedDates.checkOut);
        checkIn.setHours(0, 0, 0, 0);
        checkOut.setHours(0, 0, 0, 0);

        isCheckIn = currentDate.toDateString() === checkIn.toDateString();
        isCheckOut = currentDate.toDateString() === checkOut.toDateString();
        isSelected = isCheckIn || isCheckOut;
        isInRange = currentDate > checkIn && currentDate < checkOut;
      } else if (selectedDates.checkIn) {
        const checkIn = new Date(selectedDates.checkIn);
        checkIn.setHours(0, 0, 0, 0);
        isCheckIn = currentDate.toDateString() === checkIn.toDateString();
        isSelected = isCheckIn;
      }

      days.push({
        date: currentDate,
        isAvailable,
        isBlocked,
        isSelected,
        isCheckIn,
        isCheckOut,
        isInRange,
        isToday,
        isPast,
      });
    }

    return days;
  };

  const handleDatePress = (day: CalendarDay) => {
    if (day.isPast || day.isBlocked || !day.isAvailable) return;

    const { checkIn, checkOut } = selectedDates;

    if (!checkIn) {
      // First selection - set check-in
      onDatesChange({ checkIn: day.date });
    } else if (!checkOut) {
      // Second selection - set check-out
      const checkInDate = new Date(checkIn);
      const selectedDate = new Date(day.date);

      if (selectedDate <= checkInDate) {
        // If selected date is before or same as check-in, replace check-in
        onDatesChange({ checkIn: day.date });
      } else {
        // Set check-out
        const nights = Math.ceil((selectedDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
        if (nights >= minNights && nights <= maxNights) {
          onDatesChange({ checkIn, checkOut: day.date });
        }
      }
    } else {
      // Both dates selected - reset and start new selection
      onDatesChange({ checkIn: day.date });
    }
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

    if (day.isPast || day.isBlocked) {
      dayStyle.push(styles.dayDisabled);
      textStyle.push(styles.dayTextDisabled);
    } else if (!day.isAvailable) {
      dayStyle.push(styles.dayUnavailable);
      textStyle.push(styles.dayTextUnavailable);
    } else if (day.isSelected) {
      dayStyle.push(styles.daySelected);
      textStyle.push(styles.dayTextSelected);
    } else if (day.isInRange) {
      dayStyle.push(styles.dayInRange);
      textStyle.push(styles.dayTextInRange);
    } else if (day.isToday) {
      dayStyle.push(styles.dayToday);
      textStyle.push(styles.dayTextToday);
    }

    return (
      <TouchableOpacity
        key={index}
        style={dayStyle}
        onPress={() => handleDatePress(day)}
        disabled={day.isPast || day.isBlocked || !day.isAvailable}
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
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

      {/* Selected dates info */}
      {(selectedDates.checkIn || selectedDates.checkOut) && (
        <View style={styles.selectedDatesInfo}>
          {selectedDates.checkIn && (
            <Text style={styles.selectedDateText}>
              Check-in: {selectedDates.checkIn.toLocaleDateString()}
            </Text>
          )}
          {selectedDates.checkOut && (
            <Text style={styles.selectedDateText}>
              Check-out: {selectedDates.checkOut.toLocaleDateString()}
            </Text>
          )}
          {selectedDates.checkIn && selectedDates.checkOut && (
            <Text style={styles.nightsText}>
              {Math.ceil((selectedDates.checkOut.getTime() - selectedDates.checkIn.getTime()) / (1000 * 60 * 60 * 24))} nights
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  header: {
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
  dayUnavailable: {
    backgroundColor: '#fef2f2',
  },
  dayTextUnavailable: {
    color: '#ef4444',
  },
  daySelected: {
    backgroundColor: Colors.primary,
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  dayInRange: {
    backgroundColor: '#eff6ff',
  },
  dayTextInRange: {
    color: Colors.primary,
  },
  dayToday: {
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  dayTextToday: {
    color: Colors.primary,
    fontWeight: '600',
  },
  selectedDatesInfo: {
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    paddingTop: 16,
  },
  selectedDateText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  nightsText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});