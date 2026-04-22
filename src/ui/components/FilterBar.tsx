import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { FilterType } from '../../domain/entities';
import { useTaskStore } from '../../store/taskStore';

interface FilterOption {
  label: string;
  value: FilterType;
}

const FILTERS: FilterOption[] = [
  { label: 'Todas', value: FilterType.ALL },
  { label: 'Completadas', value: FilterType.COMPLETED },
  { label: 'Pendientes', value: FilterType.PENDING },
];

/**
 * FilterBar renders three tabs that set the active filter in the Zustand store.
 * The active tab is visually highlighted with a filled background.
 */
export function FilterBar(): React.JSX.Element {
  const { filter, setFilter } = useTaskStore();

  return (
    <View style={styles.container}>
      {FILTERS.map((option) => {
        const isActive = filter === option.value;
        const buttonStyle: ViewStyle[] = [
          styles.button,
          isActive ? styles.buttonActive : styles.buttonInactive,
        ];
        return (
          <TouchableOpacity
            key={option.value}
            style={buttonStyle}
            onPress={() => setFilter(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            testID={`filter-${option.value}`}
          >
            <Text
              style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1E1E2E',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#7C3AED',
  },
  buttonInactive: {
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  labelActive: {
    color: '#FFFFFF',
  },
  labelInactive: {
    color: '#9CA3AF',
  },
});
