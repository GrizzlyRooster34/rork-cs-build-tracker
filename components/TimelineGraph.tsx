import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '@/constants/theme';
import { useEventStore } from '@/store/eventStore';
import { formatDate } from '@/utils/dateFormatter';
import { Event } from '@/types';
import { Wrench, Fuel, AlertTriangle, FileText, Car, Image } from 'lucide-react-native';

interface TimelineGraphProps {
  limit?: number;
  onEventPress?: (event: Event) => void;
}

export default function TimelineGraph({ limit = 20, onEventPress }: TimelineGraphProps) {
  const { getRecentEvents } = useEventStore();
  
  const recentEvents = getRecentEvents(limit);
  
  const getEventIcon = (type: Event['type']) => {
    const iconProps = { size: 16, color: theme.colors.text };
    
    switch (type) {
      case 'maintenance':
        return <Wrench {...iconProps} />;
      case 'fuel':
        return <Fuel {...iconProps} />;
      case 'diagnostic':
        return <AlertTriangle {...iconProps} />;
      case 'note':
        return <FileText {...iconProps} />;
      case 'modification':
        return <Car {...iconProps} />;
      case 'photo':
        return <Image {...iconProps} />;
      default:
        return <FileText {...iconProps} />;
    }
  };
  
  const getEventColor = (type: Event['type'], priority?: Event['priority']) => {
    if (priority === 'critical') return theme.colors.error;
    
    switch (type) {
      case 'maintenance':
        return theme.colors.warning;
      case 'fuel':
        return theme.colors.success;
      case 'diagnostic':
        return theme.colors.error;
      case 'modification':
        return theme.colors.tint;
      default:
        return theme.colors.border;
    }
  };
  
  if (recentEvents.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No events yet</Text>
        <Text style={styles.emptySubtext}>Start adding maintenance, fuel, or diagnostic entries</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Recent Activity</Text>
      
      <View style={styles.timeline}>
        {recentEvents.map((event, index) => (
          <TouchableOpacity
            key={event.id}
            style={styles.eventContainer}
            onPress={() => onEventPress?.(event)}
            activeOpacity={0.7}
          >
            <View style={styles.eventLine}>
              <View style={[
                styles.eventDot,
                { backgroundColor: getEventColor(event.type, event.priority) }
              ]}>
                {getEventIcon(event.type)}
              </View>
              {index < recentEvents.length - 1 && <View style={styles.connector} />}
            </View>
            
            <View style={styles.eventContent}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle} numberOfLines={1}>
                  {event.title}
                </Text>
                <Text style={styles.eventDate}>
                  {formatDate(event.date)}
                </Text>
              </View>
              
              <View style={styles.eventMeta}>
                <Text style={styles.eventMileage}>
                  {event.mileage.toLocaleString()} mi
                </Text>
                <Text style={styles.eventType}>
                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                </Text>
              </View>
              
              {event.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {event.tags.slice(0, 3).map((tag, tagIndex) => (
                    <View key={tagIndex} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                  {event.tags.length > 3 && (
                    <Text style={styles.moreTagsText}>+{event.tags.length - 3}</Text>
                  )}
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  timeline: {
    paddingHorizontal: 16,
  },
  eventContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  eventLine: {
    alignItems: 'center',
    marginRight: 12,
  },
  eventDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  connector: {
    width: 2,
    flex: 1,
    backgroundColor: theme.colors.border,
    marginTop: 4,
  },
  eventContent: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
    marginRight: 8,
  },
  eventDate: {
    fontSize: 12,
    color: theme.colors.subtext,
  },
  eventMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventMileage: {
    fontSize: 12,
    color: theme.colors.subtext,
  },
  eventType: {
    fontSize: 12,
    color: theme.colors.tint,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
    color: theme.colors.text,
  },
  moreTagsText: {
    fontSize: 10,
    color: theme.colors.subtext,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.subtext,
    textAlign: 'center',
  },
});