import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { theme } from '@/constants/theme';
import { useBlueprintStore } from '@/store/blueprintStore';
import { Ruler, FileText, CheckCircle, Clock, AlertTriangle, Wrench } from 'lucide-react-native';

export default function BlueprintScreen() {
  const { dimensions, blueprints, initializeWithSeedData } = useBlueprintStore();
  const [activeTab, setActiveTab] = useState<'dimensions' | 'blueprints'>('dimensions');

  useEffect(() => {
    initializeWithSeedData();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return theme.colors.success;
      case 'medium': return theme.colors.warning;
      case 'hard': return theme.colors.error;
      case 'expert': return '#8B5CF6';
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} color={theme.colors.success} />;
      case 'in-progress': return <Clock size={16} color={theme.colors.warning} />;
      case 'planned': return <AlertTriangle size={16} color={theme.colors.textSecondary} />;
      default: return null;
    }
  };

  const safeDimensions = dimensions || [];
  const safeBlueprints = blueprints || [];
  
  const groupedDimensions = safeDimensions.reduce((acc, dimension) => {
    if (!acc[dimension.category]) {
      acc[dimension.category] = [];
    }
    acc[dimension.category].push(dimension);
    return acc;
  }, {} as Record<string, typeof safeDimensions>);

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'vehicle': return 'Vehicle Dimensions';
      case 'glass': return 'Glass Specifications';
      case 'interior': return 'Interior Measurements';
      case 'engine': return 'Engine Bay';
      case 'suspension': return 'Suspension';
      case 'custom': return 'Custom Measurements';
      default: return category;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Blueprint & Dimensions',
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
        }} 
      />
      
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'dimensions' && styles.activeTab]}
          onPress={() => setActiveTab('dimensions')}
        >
          <Ruler size={20} color={activeTab === 'dimensions' ? theme.colors.background : theme.colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'dimensions' && styles.activeTabText]}>
            Dimensions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'blueprints' && styles.activeTab]}
          onPress={() => setActiveTab('blueprints')}
        >
          <FileText size={20} color={activeTab === 'blueprints' ? theme.colors.background : theme.colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'blueprints' && styles.activeTabText]}>
            Blueprints
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'dimensions' ? (
          <>
            {/* Dimensions View */}
            {Object.entries(groupedDimensions).length > 0 ? (
              Object.entries(groupedDimensions).map(([category, categoryDimensions]) => (
                <View key={category} style={styles.section}>
                  <Text style={styles.sectionTitle}>{getCategoryTitle(category)}</Text>
                  
                  {categoryDimensions.map((dimension) => (
                    <View key={dimension.id} style={styles.dimensionCard}>
                      <View style={styles.dimensionHeader}>
                        <Text style={styles.dimensionName}>{dimension.name}</Text>
                        <View style={styles.dimensionValue}>
                          <Text style={styles.dimensionMeasurement}>
                            {dimension.measurement} {dimension.unit}
                          </Text>
                          {dimension.verified && (
                            <CheckCircle size={16} color={theme.colors.success} />
                          )}
                        </View>
                      </View>
                      
                      <Text style={styles.dimensionDescription}>{dimension.description}</Text>
                      
                      <View style={styles.dimensionMeta}>
                        <Text style={styles.dimensionReference}>
                          Reference: {dimension.reference}
                        </Text>
                      </View>
                      
                      {dimension.notes && (
                        <Text style={styles.dimensionNotes}>{dimension.notes}</Text>
                      )}
                      
                      <View style={styles.dimensionTags}>
                        {dimension.tags.map((tag, index) => (
                          <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ruler size={48} color={theme.colors.textSecondary} />
                <Text style={styles.emptyStateText}>No dimensions recorded yet</Text>
              </View>
            )}
          </>
        ) : (
          <>
            {/* Blueprints View */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Project Blueprints</Text>
              
              {safeBlueprints.length > 0 ? (
                safeBlueprints.map((blueprint) => (
                  <View key={blueprint.id} style={styles.blueprintCard}>
                    <View style={styles.blueprintHeader}>
                      <View style={styles.blueprintInfo}>
                        <Text style={styles.blueprintTitle}>{blueprint.title}</Text>
                        <Text style={styles.blueprintCategory}>{blueprint.category.toUpperCase()}</Text>
                      </View>
                      <View style={styles.blueprintBadges}>
                        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(blueprint.difficulty) + '20' }]}>
                          <Text style={[styles.difficultyText, { color: getDifficultyColor(blueprint.difficulty) }]}>
                            {blueprint.difficulty.toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.statusBadge}>
                          {getStatusIcon(blueprint.status)}
                          <Text style={[styles.statusText, { color: getStatusIcon(blueprint.status)?.props.color }]}>
                            {blueprint.status.replace('-', ' ').toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <Text style={styles.blueprintDescription}>{blueprint.description}</Text>

                    <View style={styles.blueprintMeta}>
                      <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>Time:</Text>
                        <Text style={styles.metaValue}>{blueprint.estimatedTime}</Text>
                      </View>
                      <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>Cost:</Text>
                        <Text style={styles.metaValue}>${blueprint.cost}</Text>
                      </View>
                    </View>

                    {/* Steps */}
                    <View style={styles.stepsSection}>
                      <Text style={styles.stepsTitle}>Steps:</Text>
                      {blueprint.steps.map((step, index) => (
                        <Text key={index} style={styles.stepItem}>
                          {index + 1}. {step}
                        </Text>
                      ))}
                    </View>

                    {/* Materials */}
                    <View style={styles.materialsSection}>
                      <Text style={styles.materialsTitle}>Materials:</Text>
                      {blueprint.materials.map((material, index) => (
                        <Text key={index} style={styles.materialItem}>• {material}</Text>
                      ))}
                    </View>

                    {/* Tools */}
                    <View style={styles.toolsSection}>
                      <Text style={styles.toolsTitle}>Tools:</Text>
                      {blueprint.tools.map((tool, index) => (
                        <Text key={index} style={styles.toolItem}>• {tool}</Text>
                      ))}
                    </View>

                    {blueprint.notes && (
                      <Text style={styles.blueprintNotes}>{blueprint.notes}</Text>
                    )}

                    <View style={styles.blueprintTags}>
                      {blueprint.tags.map((tag, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <FileText size={48} color={theme.colors.textSecondary} />
                  <Text style={styles.emptyStateText}>No blueprints created yet</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    margin: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: theme.colors.tint,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    padding: 16,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 16,
  },
  dimensionCard: {
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  dimensionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  dimensionName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  dimensionValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dimensionMeasurement: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.tint,
  },
  dimensionDescription: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 8,
  },
  dimensionMeta: {
    marginBottom: 8,
  },
  dimensionReference: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  dimensionNotes: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  dimensionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  blueprintCard: {
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  blueprintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  blueprintInfo: {
    flex: 1,
  },
  blueprintTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  blueprintCategory: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  blueprintBadges: {
    alignItems: 'flex-end',
    gap: 6,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
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
  blueprintDescription: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 12,
  },
  blueprintMeta: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },
  stepsSection: {
    marginBottom: 12,
  },
  stepsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 6,
  },
  stepItem: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  materialsSection: {
    marginBottom: 12,
  },
  materialsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 6,
  },
  materialItem: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  toolsSection: {
    marginBottom: 12,
  },
  toolsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 6,
  },
  toolItem: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  blueprintNotes: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  blueprintTags: {
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
});