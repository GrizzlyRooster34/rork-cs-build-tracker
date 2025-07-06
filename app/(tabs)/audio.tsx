import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { theme } from '@/constants/theme';
import { useAudioStore } from '@/store/audioStore';
import { Volume2, Speaker, Zap, CheckCircle, Circle } from 'lucide-react-native';

export default function AudioScreen() {
  const { components, initializeWithSeedData } = useAudioStore();

  useEffect(() => {
    initializeWithSeedData();
  }, []);

  const groupedComponents = components.reduce((acc, component) => {
    if (!acc[component.type]) {
      acc[component.type] = [];
    }
    acc[component.type].push(component);
    return acc;
  }, {} as Record<string, typeof components>);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'speakers':
      case 'tweeter':
        return <Speaker size={20} color={theme.colors.tint} />;
      case 'amplifier':
        return <Zap size={20} color={theme.colors.tint} />;
      default:
        return <Volume2 size={20} color={theme.colors.tint} />;
    }
  };

  const getTypeTitle = (type: string) => {
    switch (type) {
      case 'speakers': return 'Speakers';
      case 'subwoofer': return 'Subwoofers';
      case 'amplifier': return 'Amplifiers';
      case 'head-unit': return 'Head Units';
      case 'tweeter': return 'Tweeters';
      case 'processor': return 'Processors';
      default: return type;
    }
  };

  const totalCost = components.reduce((sum, component) => sum + component.cost, 0);
  const installedCount = components.filter(c => c.installed).length;

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Audio System Tracker',
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Summary Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{installedCount}/{components.length}</Text>
            <Text style={styles.statLabel}>Installed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>${totalCost}</Text>
            <Text style={styles.statLabel}>Total Cost</Text>
          </View>
        </View>

        {/* System Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Overview</Text>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewText}>
              • Front: Kicker CS 6.5" + Power Acoustik Tweeters{'\n'}
              • Rear: Stock (upgrade planned){'\n'}
              • Sub: Kicker CVT 12" in trunk{'\n'}
              • Amps: BAMF 1200.4 (front) + BAMF Mono (sub){'\n'}
              • Head Unit: Stock RCD 310 (upgrade planned)
            </Text>
          </View>
        </View>

        {/* Components by Type */}
        {Object.entries(groupedComponents).map(([type, typeComponents]) => (
          <View key={type} style={styles.section}>
            <View style={styles.sectionHeader}>
              {getTypeIcon(type)}
              <Text style={styles.sectionTitle}>{getTypeTitle(type)}</Text>
            </View>
            
            {typeComponents.map((component) => (
              <View key={component.id} style={styles.componentCard}>
                <View style={styles.componentHeader}>
                  <View style={styles.componentInfo}>
                    <Text style={styles.componentName}>{component.name}</Text>
                    <Text style={styles.componentLocation}>{component.location}</Text>
                  </View>
                  <View style={styles.componentStatus}>
                    {component.installed ? (
                      <CheckCircle size={20} color={theme.colors.success} />
                    ) : (
                      <Circle size={20} color={theme.colors.subtext} />
                    )}
                  </View>
                </View>
                
                <View style={styles.componentDetails}>
                  <Text style={styles.componentBrand}>{component.brand} {component.model}</Text>
                  {component.powerRating && (
                    <Text style={styles.componentSpec}>Power: {component.powerRating}</Text>
                  )}
                  {component.impedance && (
                    <Text style={styles.componentSpec}>Impedance: {component.impedance}</Text>
                  )}
                  <Text style={styles.componentCost}>${component.cost}</Text>
                </View>
                
                {component.notes && (
                  <Text style={styles.componentNotes}>{component.notes}</Text>
                )}
                
                <View style={styles.componentTags}>
                  {component.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        ))}

        {/* Planned Upgrades */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Planned Upgrades</Text>
          <View style={styles.plannedCard}>
            <Text style={styles.plannedTitle}>RCD 330 Head Unit</Text>
            <Text style={styles.plannedDescription}>
              Android Auto/CarPlay capable head unit with better sound processing
            </Text>
            <Text style={styles.plannedCost}>Est. Cost: $200</Text>
          </View>
          
          <View style={styles.plannedCard}>
            <Text style={styles.plannedTitle}>Rear Speaker Upgrade</Text>
            <Text style={styles.plannedDescription}>
              Matching Kicker CS speakers for rear doors
            </Text>
            <Text style={styles.plannedCost}>Est. Cost: $120</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.tint,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.subtext,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  overviewCard: {
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: 12,
  },
  overviewText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  componentCard: {
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  componentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  componentInfo: {
    flex: 1,
  },
  componentName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  componentLocation: {
    fontSize: 14,
    color: theme.colors.subtext,
  },
  componentStatus: {
    marginLeft: 12,
  },
  componentDetails: {
    marginBottom: 8,
  },
  componentBrand: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 4,
  },
  componentSpec: {
    fontSize: 12,
    color: theme.colors.subtext,
    marginBottom: 2,
  },
  componentCost: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.tint,
    marginTop: 4,
  },
  componentNotes: {
    fontSize: 12,
    color: theme.colors.subtext,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  componentTags: {
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
  plannedCard: {
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
  },
  plannedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  plannedDescription: {
    fontSize: 14,
    color: theme.colors.subtext,
    marginBottom: 8,
  },
  plannedCost: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.warning,
  },
});