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
import { useLightingStore } from '@/store/lightingStore';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import { Plus, X, Lightbulb } from 'lucide-react-native';
import { ModificationStatus } from '@/types';

export default function LightingScreen() {
  const { plans, addPlan, updatePlan, deletePlan, updateStatus } = useLightingStore();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState<ModificationStatus | 'all'>('all');
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [components, setComponents] = useState('');
  const [wiring, setWiring] = useState('');
  const [controller, setController] = useState('');
  const [notes, setNotes] = useState('');
  
  const filteredPlans = plans
    .filter(plan => filter === 'all' || plan.status === filter)
    .sort((a, b) => {
      // Sort by status
      const statusOrder = { 'in-progress': 0, 'planned': 1, 'completed': 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  
  const handleAddPlan = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    
    const componentsList = components.split(',').map(c => c.trim()).filter(Boolean);
    
    addPlan({
      title,
      description,
      components: componentsList,
      wiring,
      controller,
      notes,
      status: 'planned',
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setComponents('');
    setWiring('');
    setController('');
    setNotes('');
    setModalVisible(false);
  };
  
  const handleStatusChange = (id: string, newStatus: ModificationStatus) => {
    updateStatus(id, newStatus);
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Lighting Plans',
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
            filter === 'planned' && styles.activeFilter
          ]}
          onPress={() => setFilter('planned')}
        >
          <Text style={[
            styles.filterText,
            filter === 'planned' && styles.activeFilterText
          ]}>Planned</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'in-progress' && styles.activeFilter
          ]}
          onPress={() => setFilter('in-progress')}
        >
          <Text style={[
            styles.filterText,
            filter === 'in-progress' && styles.activeFilterText
          ]}>In Progress</Text>
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
      
      {filteredPlans.length > 0 ? (
        <ScrollView style={styles.list}>
          {filteredPlans.map(plan => (
            <View key={plan.id} style={[
              styles.item,
              plan.status === 'completed' && styles.completedItem,
              plan.status === 'in-progress' && styles.inProgressItem,
            ]}>
              <View style={styles.itemHeader}>
                <View style={styles.titleContainer}>
                  <Lightbulb size={20} color={theme.systems.lighting} style={styles.icon} />
                  <Text style={styles.itemTitle}>{plan.title}</Text>
                </View>
                <StatusBadge status={plan.status} small />
              </View>
              
              <Text style={styles.itemDescription}>
                {plan.description}
              </Text>
              
              {plan.components.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Components:</Text>
                  <View style={styles.componentsList}>
                    {plan.components.map((component, index) => (
                      <View key={index} style={styles.componentItem}>
                        <Text style={styles.componentText}>{component}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              {plan.controller && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Controller:</Text>
                  <Text style={styles.sectionText}>{plan.controller}</Text>
                </View>
              )}
              
              {plan.wiring && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Wiring:</Text>
                  <Text style={styles.sectionText}>{plan.wiring}</Text>
                </View>
              )}
              
              {plan.notes && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Notes:</Text>
                  <Text style={styles.sectionText}>{plan.notes}</Text>
                </View>
              )}
              
              <View style={styles.itemActions}>
                {plan.status === 'planned' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.startButton]}
                    onPress={() => handleStatusChange(plan.id, 'in-progress')}
                  >
                    <Text style={styles.actionText}>Start</Text>
                  </TouchableOpacity>
                )}
                
                {plan.status === 'in-progress' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.completeButton]}
                    onPress={() => handleStatusChange(plan.id, 'completed')}
                  >
                    <Text style={styles.actionText}>Complete</Text>
                  </TouchableOpacity>
                )}
                
                {plan.status === 'completed' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.reopenButton]}
                    onPress={() => handleStatusChange(plan.id, 'in-progress')}
                  >
                    <Text style={styles.actionText}>Reopen</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => {
                    Alert.alert(
                      'Delete Plan',
                      'Are you sure you want to delete this lighting plan?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Delete', 
                          style: 'destructive',
                          onPress: () => deletePlan(plan.id)
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
          title="No Lighting Plans"
          message={filter !== 'all' 
            ? `No ${filter} lighting plans found. Add one by tapping the + button.`
            : "Your lighting plans list is empty. Add your first plan by tapping the + button."}
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
              <Text style={styles.modalTitle}>Add Lighting Plan</Text>
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
                placeholder="Underglow, Interior Ambient, etc."
                placeholderTextColor={theme.colors.subtext}
                value={title}
                onChangeText={setTitle}
              />
              
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Details about the lighting plan..."
                placeholderTextColor={theme.colors.subtext}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
              
              <Text style={styles.inputLabel}>Components (comma separated)</Text>
              <TextInput
                style={styles.input}
                placeholder="LED strips, controllers, power supplies, etc."
                placeholderTextColor={theme.colors.subtext}
                value={components}
                onChangeText={setComponents}
              />
              
              <Text style={styles.inputLabel}>Controller</Text>
              <TextInput
                style={styles.input}
                placeholder="Bluetooth controller, Arduino, etc."
                placeholderTextColor={theme.colors.subtext}
                value={controller}
                onChangeText={setController}
              />
              
              <Text style={styles.inputLabel}>Wiring Plan</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="How the components will be wired..."
                placeholderTextColor={theme.colors.subtext}
                value={wiring}
                onChangeText={setWiring}
                multiline
                numberOfLines={4}
              />
              
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Additional notes, ideas, etc."
                placeholderTextColor={theme.colors.subtext}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
              />
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddPlan}
              >
                <Text style={styles.submitButtonText}>Add Plan</Text>
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
    marginHorizontal: 4,
    backgroundColor: theme.colors.card,
  },
  activeFilter: {
    backgroundColor: theme.colors.tint,
  },
  filterText: {
    color: theme.colors.text,
    fontWeight: '500',
    fontSize: 12,
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
    borderLeftColor: theme.systems.lighting,
  },
  completedItem: {
    borderLeftColor: theme.colors.success,
  },
  inProgressItem: {
    borderLeftColor: theme.colors.warning,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  itemDescription: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 16,
  },
  sectionContainer: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 14,
    color: theme.colors.subtext,
  },
  componentsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  componentItem: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  componentText: {
    fontSize: 12,
    color: theme.colors.text,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
  },
  startButton: {
    backgroundColor: theme.colors.tint + '33',
  },
  completeButton: {
    backgroundColor: theme.colors.success + '33',
  },
  reopenButton: {
    backgroundColor: theme.colors.warning + '33',
  },
  deleteButton: {
    backgroundColor: theme.colors.error + '22',
  },
  actionText: {
    fontSize: 12,
    color: theme.colors.text,
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