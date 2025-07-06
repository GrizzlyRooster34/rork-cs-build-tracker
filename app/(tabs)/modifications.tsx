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
import { useModificationsStore } from '@/store/modificationsStore';
import { useCarStore } from '@/store/carStore';
import StatusBadge from '@/components/StatusBadge';
import SystemBadge from '@/components/SystemBadge';
import StageBadge from '@/components/StageBadge';
import EmptyState from '@/components/EmptyState';
import { formatDate, getCurrentDate } from '@/utils/dateFormatter';
import { MaintenanceCategory, ModificationStage, ModificationStatus } from '@/types';
import { Plus, X, ChevronRight, Copy, Share, Edit } from 'lucide-react-native';
import { copyToClipboard } from '@/utils/copyToClipboard';

export default function ModificationsScreen() {
  const { modifications, addModification, updateModification, deleteModification, updateStatus } = useModificationsStore();
  const { profile } = useCarStore();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedMod, setSelectedMod] = useState<string | null>(null);
  const [filter, setFilter] = useState<ModificationStatus | 'all'>('all');
  const [stageFilter, setStageFilter] = useState<ModificationStage | 'all'>('all');
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [system, setSystem] = useState<MaintenanceCategory>('engine');
  const [stage, setStage] = useState<ModificationStage>(1);
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');

  
  const filteredMods = modifications
    .filter(mod => filter === 'all' || mod.status === filter)
    .filter(mod => stageFilter === 'all' || mod.stage === stageFilter)
    .sort((a, b) => {
      // Sort by stage first, then by status
      if (a.stage !== b.stage) return b.stage - a.stage;
      
      const statusOrder: Record<ModificationStatus, number> = { 
        'in-progress': 0, 
        'planned': 1, 
        'completed': 2, 
        'ordered': 1.5 
      };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  
  const systems: MaintenanceCategory[] = [
    'engine', 'suspension', 'electrical', 'exterior', 'interior', 'lighting', 'performance', 'other'
  ];
  
  const stages: ModificationStage[] = [0, 1, 2, 3];
  
  const handleAddModification = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    
    const costValue = parseFloat(cost);
    if (isNaN(costValue) || costValue < 0) {
      Alert.alert('Error', 'Please enter a valid cost');
      return;
    }
    
    const modData = {
      title,
      description,
      system,
      stage,
      status: 'planned' as ModificationStatus,
      parts: [],
      cost: costValue,
      notes,
      priority: 1,
      tags: [],
      photos: [],
    };

    if (editMode && selectedMod) {
      updateModification(selectedMod, modData);
    } else {
      addModification(modData);
    }
    
    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSystem('engine');
    setStage(1);
    setCost('');
    setNotes('');
    setEditMode(false);
    setSelectedMod(null);
    setModalVisible(false);
  };

  const handleEditMod = (id: string) => {
    const mod = modifications.find(m => m.id === id);
    if (mod) {
      setTitle(mod.title);
      setDescription(mod.description);
      setSystem(mod.system);
      setStage(mod.stage);
      setCost(mod.cost.toString());
      setNotes(mod.notes);
      setEditMode(true);
      setSelectedMod(id);
      setModalVisible(true);
    }
  };
  
  const handleStatusChange = (id: string, newStatus: ModificationStatus) => {
    updateStatus(id, newStatus);
    
    if (newStatus === 'completed') {
      const mod = modifications.find(m => m.id === id);
      if (mod) {
        updateModification(id, { 
          installDate: getCurrentDate() 
        });
      }
    }
  };
  
  const handleCopyMod = async (mod: any) => {
    const data = [
      `Modification: ${mod.title}`,
      `Stage: ${mod.stage}`,
      `System: ${mod.system}`,
      `Status: ${mod.status}`,
      `Cost: $${mod.cost.toFixed(2)}`,
      mod.description ? `Description: ${mod.description}` : '',
      mod.notes ? `Notes: ${mod.notes}` : '',
      mod.installDate ? `Installed: ${formatDate(mod.installDate)}` : '',
      `Exported from CS Build Tracker - ${new Date().toLocaleDateString()}`
    ].filter(Boolean).join('\n');

    try {
      await copyToClipboard(data);
      Alert.alert('Copied', 'Modification details copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Modifications',
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
        </ScrollView>
      </View>
      
      <View style={styles.stageFilterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.stageButton,
              stageFilter === 'all' && styles.activeStageFilter
            ]}
            onPress={() => setStageFilter('all')}
          >
            <Text style={[
              styles.stageText,
              stageFilter === 'all' && styles.activeStageText
            ]}>All Stages</Text>
          </TouchableOpacity>
          
          {stages.map(s => (
            <TouchableOpacity
              key={s}
              style={[
                styles.stageButton,
                stageFilter === s && styles.activeStageFilter
              ]}
              onPress={() => setStageFilter(s)}
            >
              <Text style={[
                styles.stageText,
                stageFilter === s && styles.activeStageText
              ]}>Stage {s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {filteredMods.length > 0 ? (
        <ScrollView style={styles.list}>
          {filteredMods.map(mod => (
            <View key={mod.id} style={[
              styles.item,
              mod.status === 'completed' && styles.completedItem,
              mod.status === 'in-progress' && styles.inProgressItem,
            ]}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{mod.title}</Text>
                <View style={styles.badgeContainer}>
                  <StageBadge stage={mod.stage} small />
                  <SystemBadge system={mod.system} small />
                </View>
              </View>
              
              <Text style={styles.itemDescription} numberOfLines={2}>
                {mod.description}
              </Text>
              
              <View style={styles.itemDetails}>
                <StatusBadge status={mod.status} />
                <Text style={styles.itemCost}>${mod.cost.toFixed(2)}</Text>
              </View>
              
              {mod.notes && (
                <Text style={styles.itemNotes}>
                  Notes: {mod.notes}
                </Text>
              )}
              
              {mod.installDate && (
                <Text style={styles.installDate}>
                  Installed: {formatDate(mod.installDate)}
                </Text>
              )}
              
              <View style={styles.itemActions}>
                {mod.status === 'planned' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.startButton]}
                    onPress={() => handleStatusChange(mod.id, 'in-progress')}
                  >
                    <Text style={styles.actionText}>Start</Text>
                  </TouchableOpacity>
                )}
                
                {mod.status === 'in-progress' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.completeButton]}
                    onPress={() => handleStatusChange(mod.id, 'completed')}
                  >
                    <Text style={styles.actionText}>Complete</Text>
                  </TouchableOpacity>
                )}
                
                {mod.status === 'completed' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.reopenButton]}
                    onPress={() => handleStatusChange(mod.id, 'in-progress')}
                  >
                    <Text style={styles.actionText}>Reopen</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEditMod(mod.id)}
                >
                  <Edit size={16} color={theme.colors.text} />
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.copyButton]}
                  onPress={() => handleCopyMod(mod)}
                >
                  <Copy size={16} color={theme.colors.text} />
                  <Text style={styles.actionText}>Copy</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => {
                    Alert.alert(
                      'Delete Modification',
                      'Are you sure you want to delete this modification?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Delete', 
                          style: 'destructive',
                          onPress: () => deleteModification(mod.id)
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
          title="No Modifications"
          message={filter !== 'all' 
            ? `No ${filter} modifications found. Add one by tapping the + button.`
            : "Your modifications list is empty. Add your first mod by tapping the + button."}
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
                {editMode ? 'Edit Modification' : 'Add Modification'}
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
                placeholder="Turbo Upgrade, Coilover Install, etc."
                placeholderTextColor={theme.colors.subtext}
                value={title}
                onChangeText={setTitle}
              />
              
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Details about the modification..."
                placeholderTextColor={theme.colors.subtext}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
              
              <Text style={styles.inputLabel}>System</Text>
              <View style={styles.optionsContainer}>
                {systems.map(sys => (
                  <TouchableOpacity
                    key={sys}
                    style={[
                      styles.optionButton,
                      system === sys && styles.activeOption
                    ]}
                    onPress={() => setSystem(sys)}
                  >
                    <Text style={[
                      styles.optionText,
                      system === sys && styles.activeOptionText
                    ]}>
                      {sys.charAt(0).toUpperCase() + sys.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.inputLabel}>Stage</Text>
              <View style={styles.optionsContainer}>
                {stages.map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.optionButton,
                      stage === s && styles.activeOption
                    ]}
                    onPress={() => setStage(s)}
                  >
                    <Text style={[
                      styles.optionText,
                      stage === s && styles.activeOptionText
                    ]}>
                      Stage {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.inputLabel}>Estimated Cost ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={theme.colors.subtext}
                value={cost}
                onChangeText={setCost}
                keyboardType="numeric"
              />
              
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Additional notes, links to parts, etc."
                placeholderTextColor={theme.colors.subtext}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
              />
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddModification}
              >
                <Text style={styles.submitButtonText}>
                  {editMode ? 'Update Modification' : 'Add Modification'}
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
  stageFilterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  stageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: theme.colors.card,
  },
  activeStageFilter: {
    backgroundColor: theme.colors.warning,
  },
  stageText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '500',
  },
  activeStageText: {
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
    borderLeftColor: theme.colors.tint,
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
    marginBottom: 12,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemCost: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  itemNotes: {
    fontSize: 12,
    color: theme.colors.subtext,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  installDate: {
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
  startButton: {
    backgroundColor: theme.colors.tint + '33',
  },
  completeButton: {
    backgroundColor: theme.colors.success + '33',
  },
  reopenButton: {
    backgroundColor: theme.colors.warning + '33',
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