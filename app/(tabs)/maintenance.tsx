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
import { useMaintenanceStore } from '@/store/maintenanceStore';
import { useCarStore } from '@/store/carStore';
import StatusBadge from '@/components/StatusBadge';
import SystemBadge from '@/components/SystemBadge';
import EmptyState from '@/components/EmptyState';
import { formatDate, getCurrentDate } from '@/utils/dateFormatter';
import { copyMaintenanceRecord } from '@/utils/copyToClipboard';
import { MaintenanceCategory, MaintenancePriority } from '@/types';
import { Check, Plus, X, Copy, Share, Edit } from 'lucide-react-native';

export default function MaintenanceScreen() {
  const { entries, addEntry, updateEntry, deleteEntry, toggleCompleted } = useMaintenanceStore();
  const { profile } = useCarStore();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [filter, setFilter] = useState<MaintenanceCategory | 'all'>('all');
  const [showCompleted, setShowCompleted] = useState(true);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MaintenanceCategory>('engine');
  const [priority, setPriority] = useState<MaintenancePriority>('routine');
  const [cost, setCost] = useState('');
  const [parts, setParts] = useState('');
  
  const filteredEntries = entries
    .filter(entry => filter === 'all' || entry.category === filter)
    .filter(entry => showCompleted || !entry.completed)
    .sort((a, b) => {
      // Sort by completion status, then by priority, then by date
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      
      const priorityOrder = { critical: 0, routine: 1, planned: 2 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) return aPriority - bPriority;
      
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  
  const categories: MaintenanceCategory[] = [
    'engine', 'suspension', 'electrical', 'exterior', 'interior', 'lighting', 'performance', 'other'
  ];
  
  const priorities: MaintenancePriority[] = ['critical', 'routine', 'planned'];
  
  const handleAddEntry = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    
    const costValue = parseFloat(cost);
    if (isNaN(costValue) || costValue < 0) {
      Alert.alert('Error', 'Please enter a valid cost');
      return;
    }
    
    const partsList = parts.split(',').map(part => part.trim()).filter(Boolean);
    
    const entryData = {
      title,
      description,
      category,
      priority,
      cost: costValue,
      parts: partsList,
      date: getCurrentDate(),
      mileage: profile.actualMileage,
      completed: false,
      tags: [],
      photos: [],
    };

    if (editMode && selectedEntry) {
      updateEntry(selectedEntry, entryData);
    } else {
      addEntry(entryData);
    }
    
    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('engine');
    setPriority('routine');
    setCost('');
    setParts('');
    setEditMode(false);
    setSelectedEntry(null);
    setModalVisible(false);
  };

  const handleEditEntry = (id: string) => {
    const entry = entries.find(e => e.id === id);
    if (entry) {
      setTitle(entry.title);
      setDescription(entry.description);
      setCategory(entry.category);
      setPriority(entry.priority);
      setCost(entry.cost.toString());
      setParts(entry.parts.join(', '));
      setEditMode(true);
      setSelectedEntry(id);
      setModalVisible(true);
    }
  };
  
  const handleCopyEntry = async (entry: any) => {
    const success = await copyMaintenanceRecord(
      entry.title,
      entry.date,
      entry.mileage,
      entry.parts,
      entry.cost
    );
    
    if (success) {
      Alert.alert('Copied', 'Maintenance record copied to clipboard');
    } else {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Maintenance Log',
        headerRight: () => (
          <Pressable 
            onPress={() => {
              resetForm();
              setModalVisible(true);
            }}
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
          
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterButton,
                filter === cat && styles.activeFilter
              ]}
              onPress={() => setFilter(cat)}
            >
              <Text style={[
                styles.filterText,
                filter === cat && styles.activeFilterText
              ]}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowCompleted(!showCompleted)}
        >
          <Text style={styles.toggleText}>
            {showCompleted ? 'Hide Completed' : 'Show Completed'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {filteredEntries.length > 0 ? (
        <ScrollView style={styles.list}>
          {filteredEntries.map(entry => (
            <View key={entry.id} style={[
              styles.item,
              entry.completed && styles.completedItem
            ]}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{entry.title}</Text>
                <View style={styles.badgeContainer}>
                  <SystemBadge system={entry.category} small />
                  <StatusBadge status={entry.priority} small />
                </View>
              </View>
              
              <Text style={styles.itemDescription} numberOfLines={2}>
                {entry.description}
              </Text>
              
              <View style={styles.itemDetails}>
                <Text style={styles.itemDate}>{formatDate(entry.date)}</Text>
                <Text style={styles.itemMileage}>{entry.mileage.toLocaleString()} mi</Text>
                <Text style={styles.itemCost}>${entry.cost.toFixed(2)}</Text>
              </View>
              
              {entry.parts.length > 0 && (
                <Text style={styles.itemParts}>
                  Parts: {entry.parts.join(', ')}
                </Text>
              )}
              
              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.completeButton]}
                  onPress={() => toggleCompleted(entry.id)}
                >
                  <Check size={16} color={theme.colors.text} />
                  <Text style={styles.actionText}>
                    {entry.completed ? 'Mark Incomplete' : 'Mark Complete'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEditEntry(entry.id)}
                >
                  <Edit size={16} color={theme.colors.text} />
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.copyButton]}
                  onPress={() => handleCopyEntry(entry)}
                >
                  <Copy size={16} color={theme.colors.text} />
                  <Text style={styles.actionText}>Copy</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => {
                    Alert.alert(
                      'Delete Entry',
                      'Are you sure you want to delete this maintenance entry?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Delete', 
                          style: 'destructive',
                          onPress: () => deleteEntry(entry.id)
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
          title="No Maintenance Entries"
          message={filter !== 'all' 
            ? `No ${filter} maintenance entries found. Add one by tapping the + button.`
            : "Your maintenance log is empty. Add your first entry by tapping the + button."}
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
              <Text style={styles.modalTitle}>
                {editMode ? 'Edit Maintenance Entry' : 'Add Maintenance Entry'}
              </Text>
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
                placeholder="Oil Change, Brake Replacement, etc."
                placeholderTextColor={theme.colors.subtext}
                value={title}
                onChangeText={setTitle}
              />
              
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Details about the maintenance..."
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
              
              <Text style={styles.inputLabel}>Cost ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={theme.colors.subtext}
                value={cost}
                onChangeText={setCost}
                keyboardType="numeric"
              />
              
              <Text style={styles.inputLabel}>Parts (comma separated)</Text>
              <TextInput
                style={styles.input}
                placeholder="Oil filter, Air filter, etc."
                placeholderTextColor={theme.colors.subtext}
                value={parts}
                onChangeText={setParts}
              />
              
              <View style={styles.mileageInfo}>
                <Text style={styles.mileageLabel}>Current Mileage:</Text>
                <Text style={styles.mileageValue}>
                  {profile.actualMileage.toLocaleString()} mi
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddEntry}
              >
                <Text style={styles.submitButtonText}>
                  {editMode ? 'Update Entry' : 'Add Entry'}
                </Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: theme.colors.card,
  },
  activeFilter: {
    backgroundColor: theme.colors.tint,
  },
  filterText: {
    color: theme.colors.text,
    fontWeight: '500',
  },
  activeFilterText: {
    color: 'white',
  },
  toggleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'flex-end',
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.card,
  },
  toggleText: {
    color: theme.colors.text,
    fontSize: 12,
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
    borderLeftColor: theme.colors.tint,
  },
  completedItem: {
    opacity: 0.7,
    borderLeftColor: theme.colors.success,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
    marginRight: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: theme.colors.subtext,
    marginBottom: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemDate: {
    fontSize: 12,
    color: theme.colors.subtext,
  },
  itemMileage: {
    fontSize: 12,
    color: theme.colors.subtext,
  },
  itemCost: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },
  itemParts: {
    fontSize: 12,
    color: theme.colors.subtext,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 8,
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
    backgroundColor: theme.colors.tint + '33',
  },
  editButton: {
    backgroundColor: theme.colors.warning + '33',
  },
  copyButton: {
    backgroundColor: theme.colors.warning + '33',
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
    minHeight: 100,
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