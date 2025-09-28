import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../constants/colors';

interface BookingFiltersProps {
  filters: {
    status: 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
    sortBy: 'check_in' | 'created_at' | 'total_amount';
    sortOrder: 'asc' | 'desc';
  };
  onFiltersChange: (filters: BookingFiltersProps['filters']) => void;
  showStatusFilter?: boolean;
}

export const BookingFilters: React.FC<BookingFiltersProps> = ({
  filters,
  onFiltersChange,
  showStatusFilter = true,
}) => {
  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ] as const;

  const sortOptions = [
    { value: 'check_in', label: 'Date' },
    { value: 'created_at', label: 'Booked' },
    { value: 'total_amount', label: 'Amount' },
  ] as const;

  const handleStatusChange = (status: typeof filters.status) => {
    onFiltersChange({ ...filters, status });
  };

  const handleSortChange = (sortBy: typeof filters.sortBy) => {
    onFiltersChange({ ...filters, sortBy });
  };

  const toggleSortOrder = () => {
    onFiltersChange({
      ...filters,
      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
    });
  };

  return (
    <View style={styles.container}>
      {showStatusFilter && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.statusFilters}>
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterChip,
                  filters.status === option.value && styles.activeFilterChip,
                ]}
                onPress={() => handleStatusChange(option.value)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filters.status === option.value && styles.activeFilterChipText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sort by</Text>
        <View style={styles.sortContainer}>
          <View style={styles.sortOptions}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortChip,
                  filters.sortBy === option.value && styles.activeSortChip,
                ]}
                onPress={() => handleSortChange(option.value)}
              >
                <Text
                  style={[
                    styles.sortChipText,
                    filters.sortBy === option.value && styles.activeSortChipText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.sortOrderButton} onPress={toggleSortOrder}>
            <Ionicons
              name={filters.sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
              size={16}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  statusFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  activeFilterChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: Colors.background,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortOptions: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  activeSortChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sortChipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activeSortChipText: {
    color: Colors.background,
  },
  sortOrderButton: {
    padding: 8,
    marginLeft: 8,
  },
});