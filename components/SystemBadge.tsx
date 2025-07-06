import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { MaintenanceCategory } from '@/types';

interface SystemBadgeProps {
  system: MaintenanceCategory;
  small?: boolean;
}

const systemColors: Record<MaintenanceCategory, string> = {
  engine: '#FF5252',
  suspension: '#4CAF50',
  electrical: '#FFC107',
  exterior: '#3D85C6',
  interior: '#9C27B0',
  lighting: '#00BCD4',
  performance: '#FF9800',
  other: '#777777',
};

export default function SystemBadge({ system, small = false }: SystemBadgeProps) {
  const color = systemColors[system] || systemColors.other;
  
  return (
    <View style={[
      styles.badge,
      { backgroundColor: color + '33' },
      small && styles.smallBadge
    ]}>
      <Text style={[
        styles.text,
        { color },
        small && styles.smallText
      ]}>
        {system.charAt(0).toUpperCase() + system.slice(1)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  smallBadge: {
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