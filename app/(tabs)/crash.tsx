import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { theme } from '@/constants/theme';
import { useCrashStore } from '@/store/crashStore';
import { Shield, AlertTriangle, CheckCircle, Clock, DollarSign } from 'lucide-react-native';

export default function CrashScreen() {
  const { entries, initializeWithSeedData } = useCrashStore();

  useEffect(() => {
    initializeWithSeedData();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return theme.colors.success;
      case 'moderate': return theme.colors.warning;
      case 'major': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.colors.success;
      case 'in-progress': return theme.colors.warning;
      case 'pending': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} color={theme.colors.success} />;
      case 'in-progress': return <Clock size={16} color={theme.colors.warning} />;
      case 'pending': return <AlertTriangle size={16} color={theme.colors.error} />;
      default: return null;
    }
  };

  const totalEstimatedCost = entries.reduce((sum, entry) => sum + entry.estimatedCost, 0);
  const totalActualCost = entries.reduce((sum, entry) => sum + (entry.actualCost || 0), 0);
  const completedEntries = entries.filter(e => e.repairStatus === 'completed').length;

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Crash Recovery Tracker',
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Summary Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedEntries}/{entries.length}</Text>
            <Text style={styles.statLabel}>Repairs Done</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>${totalActualCost}</Text>
            <Text style={styles.statLabel}>Actual Cost</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>${totalEstimatedCost}</Text>
            <Text style={styles.statLabel}>Estimated</Text>
          </View>
        </View>

        {/* Vehicle Dimensions Reference */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Dimensions</Text>
          <View style={styles.dimensionsCard}>
            <Text style={styles.dimensionsText}>
              Vehicle: 4765 x 1820 x 1472 mm (L x W x H){'\n'}
              Wheelbase: 2709 mm{'\n'}
              Rear Glass: 1414 x 889 x 928 mm
            </Text>
          </View>
        </View>

        {/* Crash Entries */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Crash History</Text>
          
          {entries.map((entry) => (
            <View key={entry.id} style={styles.crashCard}>
              <View style={styles.crashHeader}>
                <View style={styles.crashInfo}>
                  <Text style={styles.crashDate}>{entry.date}</Text>
                  <Text style={styles.crashLocation}>{entry.location.toUpperCase()} END</Text>
                </View>
                <View style={styles.crashBadges}>
                  <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(entry.severity) + '20' }]}>
                    <Text style={[styles.severityText, { color: getSeverityColor(entry.severity) }]}>
                      {entry.severity.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.statusBadge}>
                    {getStatusIcon(entry.repairStatus)}
                    <Text style={[styles.statusText, { color: getStatusColor(entry.repairStatus) }]}>
                      {entry.repairStatus.replace('-', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.crashDescription}>{entry.description}</Text>

              {/* Damage Assessment */}
              <View style={styles.damageSection}>
                <Text style={styles.damageTitle}>Damage Assessment:</Text>
                {entry.damageAssessment.map((damage, index) => (
                  <Text key={index} style={styles.damageItem}>• {damage}</Text>
                ))}
              </View>

              {/* Parts Needed */}
              {entry.partsNeeded.length > 0 && (
                <View style={styles.partsSection}>
                  <Text style={styles.partsTitle}>Parts Needed:</Text>
                  {entry.partsNeeded.map((part, index) => (
                    <Text key={index} style={styles.partItem}>• {part}</Text>
                  ))}
                </View>
              )}

              {/* Donor Parts */}
              {entry.donorParts.length > 0 && (
                <View style={styles.donorSection}>
                  <Text style={styles.donorTitle}>Donor Parts:</Text>
                  {entry.donorParts.map((part, index) => (
                    <Text key={index} style={styles.donorItem}>• {part}</Text>
                  ))}
                </View>
              )}

              {/* Cost Information */}
              <View style={styles.costSection}>
                <View style={styles.costRow}>
                  <Text style={styles.costLabel}>Estimated Cost:</Text>
                  <Text style={styles.costValue}>${entry.estimatedCost}</Text>
                </View>
                {entry.actualCost && (
                  <View style={styles.costRow}>
                    <Text style={styles.costLabel}>Actual Cost:</Text>
                    <Text style={[styles.costValue, { color: theme.colors.success }]}>
                      ${entry.actualCost}
                    </Text>
                  </View>
                )}
              </View>

              {/* Notes */}
              {entry.notes && (
                <Text style={styles.crashNotes}>{entry.notes}</Text>
              )}

              {/* Tags */}
              <View style={styles.crashTags}>
                {entry.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Recovery Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recovery Summary</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>
              Total incidents: {entries.length}{'\n'}
              Completed repairs: {completedEntries}{'\n'}
              In progress: {entries.filter(e => e.repairStatus === 'in-progress').length}{'\n'}
              Insurance claims: {entries.filter(e => e.insuranceClaim).length}{'\n'}
              Self-funded repairs: {entries.filter(e => !e.insuranceClaim).length}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.tint,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  dimensionsCard: {
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: 12,
  },
  dimensionsText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  crashCard: {
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  crashHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  crashInfo: {
    flex: 1,
  },
  crashDate: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  crashLocation: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  crashBadges: {
    alignItems: 'flex-end',
    gap: 6,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  crashDescription: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 12,
  },
  damageSection: {
    marginBottom: 12,
  },
  damageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 6,
  },
  damageItem: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  partsSection: {
    marginBottom: 12,
  },
  partsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 6,
  },
  partItem: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  donorSection: {
    marginBottom: 12,
  },
  donorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.tint,
    marginBottom: 6,
  },
  donorItem: {
    fontSize: 12,
    color: theme.colors.tint,
    marginBottom: 2,
  },
  costSection: {
    marginBottom: 12,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  costLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  costValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  crashNotes: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  crashTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: theme.colors.tint + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    color: theme.colors.tint,
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: 12,
  },
  summaryText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
});