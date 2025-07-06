import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { MaintenancePriority, ModificationStatus } from '@/types';

type StatusBadgeProps = {
  status: ModificationStatus | MaintenancePriority;
  small?: boolean;
};

export default function StatusBadge({ status, small = false }: StatusBadgeProps) {
  let backgroundColor;
  let textColor = theme.colors.text;
  
  switch (status) {
    case 'completed':
      backgroundColor = theme.colors.success;
      break;
    case 'in-progress':
      backgroundColor = theme.colors.warning;
      break;
    case 'planned':
      backgroundColor = theme.colors.tint;
      break;
    case 'critical':
      backgroundColor = theme.colors.error;
      break;
    case 'routine':
      backgroundColor = theme.colors.success;
      break;
    default:
      backgroundColor = theme.colors.border;
  }
  
  return (
    <View style={[styles.badge, { backgroundColor }, small ? styles.small : {}]}>
      <Text style={[styles.text, { color: textColor }, small ? styles.smallText : {}]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  smallText: {
    fontSize: 10,
  },
});