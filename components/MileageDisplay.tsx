import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

type MileageDisplayProps = {
  clusterMileage: number;
  actualMileage: number;
  offset: number;
  compact?: boolean;
};

export default function MileageDisplay({ 
  clusterMileage, 
  actualMileage, 
  offset,
  compact = false 
}: MileageDisplayProps) {
  return (
    <View style={styles.container}>
      {!compact && (
        <Text style={styles.title}>Mileage</Text>
      )}
      <View style={styles.row}>
        <View style={styles.mileageContainer}>
          <Text style={styles.label}>Cluster</Text>
          <Text style={styles.mileage}>{clusterMileage.toLocaleString()}</Text>
        </View>
        
        {!compact && (
          <View style={styles.offsetContainer}>
            <Text style={styles.offsetLabel}>+</Text>
            <Text style={styles.offset}>{offset.toLocaleString()}</Text>
          </View>
        )}
        
        <View style={styles.mileageContainer}>
          <Text style={styles.label}>Actual</Text>
          <Text style={[styles.mileage, styles.actualMileage]}>
            {actualMileage.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mileageContainer: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: theme.colors.subtext,
    marginBottom: 4,
  },
  mileage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  actualMileage: {
    color: theme.colors.tint,
  },
  offsetContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  offsetLabel: {
    fontSize: 12,
    color: theme.colors.subtext,
    marginBottom: 4,
  },
  offset: {
    fontSize: 16,
    color: theme.colors.subtext,
  },
});