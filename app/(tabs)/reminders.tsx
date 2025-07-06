import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Pressable, 
  TextInput,
  Modal,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Stack } from 'expo-router';
import { theme, globalStyles } from '@/constants/theme';
import { useReminderStore } from '@/store/reminderStore';
import { useCarStore } from '@/store/carStore';
import StatusBadge from '@/components/StatusBadge';
import SystemBadge from '@/components/SystemBadge';
import EmptyState from '@/components/EmptyState';
import { formatDate, getCurrentDate } from '@/utils/dateFormatter';
import { MaintenanceCategory, MaintenancePriority } from '@/types';
import { Plus, X, Clock, Calendar, Gauge, Check } from 'lucide-react-native';

export default function RemindersScreen() {
  const { reminders, addReminder, updateReminder, deleteReminder, completeReminder, getDueReminders } = useReminderStore();
  const { profile } = useCarStore();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState<'all' | 'due' | 'upcoming' | 'completed'>('all');
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MaintenanceCategory>('engine');
  const [priority, setPriority] = useState<MaintenancePriority>('routine');
  const [triggerType, setTriggerType] = useState<'mileage' | 'date'>('mileage');
  const [triggerValue, setTriggerValue] = useState('');
  const [tags, setTags] = useState('');
  
  const dueReminders = getDueReminders(profile.actualMileage);
  
  const filteredReminders = reminders.filter(reminder => {
    switch (filter) {
      case 'due':
        return dueReminders.some(due => due.id === reminder.id);
      case 'upcoming':
        return !reminder.completed && !dueReminders.some(due => due.id === reminder.id);
      case 'completed':
        return reminder.completed;
      default:
        return true;
    }
  }).sort((a, b) => {
    // Sort by completion status, then by due status, then by priority
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    
    const aDue = dueReminders.some(due => due.id === a.id);
    const bDue = dueReminders.some(due => due.id === b.id);
    if (aDue !== bDue) return aDue ? -1 : 1;
    
    const priorityOrder = { critical: 0, routine: 1, planned: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  const categories: MaintenanceCategory[] = [
    'engine', 'suspension', 'electrical', 'exterior', 'interior', 'lighting', 'performance', 'other'
  ];
  
  const priorities: MaintenancePriority[] = ['critical', 'routine', 'planned'];
  
  const handleAddReminder = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    
    if (!triggerValue.trim()) {
      Alert.alert('Error', 'Trigger value is required');
      return;
    }
    
    let parsedTriggerValue: number | string;
    
    if (triggerType === 'mileage') {
      parsedTriggerValue = parseInt(triggerValue);
      if (isNaN(parsedTriggerValue) || parsedTriggerValue <= 0) {
        Alert.alert('Error', 'Please enter a valid mileage');
        return;
      }
    } else {
      // For date, we'll store as ISO string
      const date = new Date(triggerValue);
      if (isNaN(date.getTime())) {
        Alert.alert('Error', 'Please enter a valid date');
        return;
      }
      parsedTriggerValue = date.toISOString();
    }
    
    const tagsList = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    
    addReminder({
      title,
      description,
      category,
      priority,
      triggerType,
      triggerValue: parsedTriggerValue,
      completed: false,
      tags: tagsList,
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setCategory('engine');
    setPriority('routine');
    setTriggerType('mileage');
    setTriggerValue('');
    setTags('');
    setModalVisible(false);
  };
  
  const formatTriggerValue = (type: 'mileage' | 'date', value: number | string) => {
    if (type === 'mileage') {
      return `${Number(value).toLocaleString()} mi`;
    } else {
      return formatDate(value.toString());
    }
  };
  
  const isDue = (reminder: any) => {
    return dueReminders.some(due => due.id === reminder.id);
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Reminders',
        headerRight: () => (
          <Pressable 
            onPress={() => setModalVisible(true)}
            style={({ pressed }) => [
              styles.addButton,
              { opacity: pressed ? 0.7 : 1 }
            ]}
          >
            <Plus size={24} color={theme.colors.text} />
          </Pressable>
        )
      }} />
      
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && styles.activeFilter
          ]}
          onPress={() => setFilter('all')}
        >
          <Text style={[
            styles.filterText,
            filter === 'all' && styles.activeFilterText
          ]}>All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'due' && styles.activeFilter
          ]}
          onPress={() => setFilter('due')}
        >
          <Text style={[
            styles.filterText,
            filter === 'due' && styles.activeFilterText
          ]}>Due ({dueReminders.length})</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'upcoming' && styles.activeFilter
          ]}
          onPress={() => setFilter('upcoming')}
        >
          <Text style={[
            styles.filterText,
            filter === 'upcoming' && styles.activeFilterText
          ]}>Upcoming</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'completed' && styles.activeFilter
          ]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[
            styles.filterText,
            filter === 'completed' && styles.activeFilterText
          ]}>Completed</Text>
        </TouchableOpacity>
      </View>
      
      {filteredReminders.length > 0 ? (
        <ScrollView style={styles.list}>
          {filteredReminders.map(reminder => (
            <View key={reminder.id} style={[
              styles.item,
              reminder.completed && styles.completedItem,
              isDue(reminder) && !reminder.completed && styles.dueItem,
            ]}>
              <View style={styles.itemHeader}>
                <View style={styles.titleContainer}>
                  {reminder.triggerType === 'mileage' ? (
                    <Gauge size={16} color={theme.colors.tint} style={styles.icon} />
                  ) : (
                    <Calendar size={16} color={theme.colors.tint} style={styles.icon} />
                  )}
                  <Text style={styles.itemTitle}>{reminder.title}</Text>
                </View>
                <View style={styles.badgeContainer}>
                  <SystemBadge system={reminder.category} small />
                  <StatusBadge status={reminder.priority} small />
                </View>
              </View>
              
              <Text style={styles.itemDescription}>
                {reminder.description}
              </Text>
              
              <View style={styles.itemDetails}>
                <Text style={styles.triggerText}>
                  {formatTriggerValue(reminder.triggerType, reminder.triggerValue)}
                </Text>
                {isDue(reminder) && !reminder.completed && (
                  <View style={styles.dueIndicator}>
                    <Clock size={12} color={theme.colors.error} />
                    <Text style={styles.dueText}>DUE</Text>
                  </View>
                )}
              </View>
              
              {reminder.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {reminder.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              <View style={styles.itemActions}>
                {!reminder.completed && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.completeButton]}
                    onPress={() => completeReminder(reminder.id)}
                  >
                    <Check size={16} color={theme.colors.success} />
                    <Text style={styles.actionText}>Complete</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => {
                    Alert.alert(
                      'Delete Reminder',
                      'Are you sure you want to delete this reminder?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Delete', 
                          style: 'destructive',
                          onPress: () => deleteReminder(reminder.id)
                        }
                      ]
                    );
                  }}
                >
                  <X size={16} color={theme.colors.error} />
                  <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <EmptyState 
          title="No Reminders"
          message={filter !== 'all' 
            ? `No ${filter} reminders found. Add one by tapping the + button.`
            : "Your reminders list is empty. Add your first reminder by tapping the + button."}
        />
      )}
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Reminder</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
              >
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalForm}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Check cam chain tension, Oil change, etc."
                placeholderTextColor={theme.colors.subtext}
                value={title}
                onChangeText={setTitle}
              />
              
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Details about the reminder..."
                placeholderTextColor={theme.colors.subtext}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
              
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.optionsContainer}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.optionButton,
                      category === cat && styles.activeOption
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[
                      styles.optionText,
                      category === cat && styles.activeOptionText
                    ]}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.optionsContainer}>
                {priorities.map(pri => (
                  <TouchableOpacity
                    key={pri}
                    style={[
                      styles.optionButton,
                      priority === pri && styles.activeOption
                    ]}
                    onPress={() => setPriority(pri)}
                  >
                    <Text style={[
                      styles.optionText,
                      priority === pri && styles.activeOptionText
                    ]}>
                      {pri.charAt(0).toUpperCase() + pri.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.inputLabel}>Trigger Type</Text>
              <View style={styles.triggerTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.triggerTypeButton,
                    triggerType === 'mileage' && styles.activeTriggerType
                  ]}
                  onPress={() => setTriggerType('mileage')}
                >
                  <Gauge size={20} color={triggerType === 'mileage' ? 'white' : theme.colors.text} />
                  <Text style={[
                    styles.triggerTypeText,
                    triggerType === 'mileage' && styles.activeTriggerTypeText
                  ]}>
                    Mileage
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.triggerTypeButton,
                    triggerType === 'date' && styles.activeTriggerType
                  ]}
                  onPress={() => setTriggerType('date')}
                >
                  <Calendar size={20} color={triggerType === 'date' ? 'white' : theme.colors.text} />
                  <Text style={[
                    styles.triggerTypeText,
                    triggerType === 'date' && styles.activeTriggerTypeText
                  ]}>
                    Date
                  </Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.inputLabel}>
                {triggerType === 'mileage' ? 'Target Mileage' : 'Target Date'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={triggerType === 'mileage' ? '277000' : '2024-12-31'}
                placeholderTextColor={theme.colors.subtext}
                value={triggerValue}
                onChangeText={setTriggerValue}
                keyboardType={triggerType === 'mileage' ? 'numeric' : 'default'}
              />
              
              <Text style={styles.inputLabel}>Tags (comma separated)</Text>
              <TextInput
                style={styles.input}
                placeholder="maintenance, critical, etc."
                placeholderTextColor={theme.colors.subtext}
                value={tags}
                onChangeText={setTags}
              />
              
              <View style={styles.mileageInfo}>
                <Text style={styles.mileageLabel}>Current Mileage:</Text>
                <Text style={styles.mileageValue}>
                  {profile.actualMileage.toLocaleString()} mi
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddReminder}
              >
                <Text style={styles.submitButtonText}>Add Reminder</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  addButton: {
    marginRight: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 2,
    backgroundColor: theme.colors.card,
  },
  activeFilter: {
    backgroundColor: theme.colors.tint,
  },
  filterText: {
    color: theme.colors.text,
    fontWeight: '500',
    fontSize: 11,
  },
  activeFilterText: {
    color: 'white',
  },
  list: {
    flex: 1,
    padding: 16,
  },
  item: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.border,
  },
  completedItem: {
    borderLeftColor: theme.colors.success,
    opacity: 0.7,
  },
  dueItem: {
    borderLeftColor: theme.colors.error,
    backgroundColor: theme.colors.error + '11',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: theme.colors.subtext,
    marginBottom: 12,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  triggerText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  dueIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.error + '22',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dueText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.error,
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: theme.colors.text,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
  },
  completeButton: {
    backgroundColor: theme.colors.success + '33',
  },
  deleteButton: {
    backgroundColor: theme.colors.error + '22',
  },
  actionText: {
    fontSize: 12,
    color: theme.colors.text,
    marginLeft: 4,
  },
  deleteText: {
    color: theme.colors.error,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  modalForm: {
    maxHeight: '80%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: 12,
    color: theme.colors.text,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: theme.colors.card,
    marginRight: 8,
    marginBottom: 8,
  },
  activeOption: {
    backgroundColor: theme.colors.tint,
  },
  optionText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  activeOptionText: {
    color: 'white',
    fontWeight: '600',
  },
  triggerTypeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  triggerTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.card,
  },
  activeTriggerType: {
    backgroundColor: theme.colors.tint,
  },
  triggerTypeText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 8,
  },
  activeTriggerTypeText: {
    color: 'white',
    fontWeight: '600',
  },
  mileageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: theme.colors.card,
    padding: 12,
    borderRadius: 8,
  },
  mileageLabel: {
    fontSize: 14,
    color: theme.colors.subtext,
    marginRight: 8,
  },
  mileageValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  submitButton: {
    backgroundColor: theme.colors.tint,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});