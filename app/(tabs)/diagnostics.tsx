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
  Alert,
  Platform
} from 'react-native';
import { Stack } from 'expo-router';
import { theme, globalStyles } from '@/constants/theme';
import { useDiagnosticsStore } from '@/store/diagnosticsStore';
import { useCarStore } from '@/store/carStore';
import EmptyState from '@/components/EmptyState';
import { formatDate, getCurrentDate } from '@/utils/dateFormatter';
import { copyDiagnosticData } from '@/utils/copyToClipboard';
import { AlertTriangle, Check, Plus, X, Copy, Edit } from 'lucide-react-native';

export default function DiagnosticsScreen() {
  const { codes, addCode, updateCode, deleteCode, toggleResolved, toggleActive } = useDiagnosticsStore();
  const { profile } = useCarStore();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');
  
  // Form state
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [freezeFrameData, setFreezeFrameData] = useState('');
  const [notes, setNotes] = useState('');
  const [active, setActive] = useState(true);
  
  const filteredCodes = codes
    .filter(c => {
      if (filter === 'all') return true;
      if (filter === 'active') return c.active && !c.resolved;
      if (filter === 'resolved') return c.resolved;
      return true;
    })
    .sort((a, b) => {
      // Sort by active status, then by resolved status, then by date
      if (a.active !== b.active) return a.active ? -1 : 1;
      if (a.resolved !== b.resolved) return a.resolved ? 1 : -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  
  const handleAddCode = () => {
    if (!code.trim()) {
      Alert.alert('Error', 'DTC code is required');
      return;
    }
    
    // Format code to uppercase
    const formattedCode = code.toUpperCase().trim();
    
    const codeData = {
      code: formattedCode,
      description,
      date: getCurrentDate(),
      mileage: profile.actualMileage,
      active,
      freezeFrameData: freezeFrameData.trim(),
      notes: notes.trim(),
      resolved: false,
      system: 'engine' as const,
      tags: [],
      severity: 'medium' as const,
    };

    if (editMode && selectedCode) {
      updateCode(selectedCode, codeData);
    } else {
      addCode(codeData);
    }
    
    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setCode('');
    setDescription('');
    setFreezeFrameData('');
    setNotes('');
    setActive(true);
    setEditMode(false);
    setSelectedCode(null);
    setModalVisible(false);
  };

  const handleEditCode = (id: string) => {
    const dtc = codes.find(c => c.id === id);
    if (dtc) {
      setCode(dtc.code);
      setDescription(dtc.description);
      setFreezeFrameData(dtc.freezeFrameData || '');
      setNotes(dtc.notes || '');
      setActive(dtc.active);
      setEditMode(true);
      setSelectedCode(id);
      setModalVisible(true);
    }
  };
  
  const handleCopyCode = async (dtc: any) => {
    const success = await copyDiagnosticData(
      dtc.code,
      dtc.description,
      dtc.freezeFrameData
    );
    
    if (success) {
      Alert.alert('Copied', 'Diagnostic code copied to clipboard');
    } else {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Diagnostic Codes',
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
          ]}>All Codes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'active' && styles.activeFilter
          ]}
          onPress={() => setFilter('active')}
        >
          <Text style={[
            styles.filterText,
            filter === 'active' && styles.activeFilterText
          ]}>Active</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'resolved' && styles.activeFilter
          ]}
          onPress={() => setFilter('resolved')}
        >
          <Text style={[
            styles.filterText,
            filter === 'resolved' && styles.activeFilterText
          ]}>Resolved</Text>
        </TouchableOpacity>
      </View>
      
      {filteredCodes.length > 0 ? (
        <ScrollView style={styles.list}>
          {filteredCodes.map(dtc => (
            <View key={dtc.id} style={[
              styles.item,
              dtc.resolved && styles.resolvedItem,
              dtc.active && !dtc.resolved && styles.activeItem,
            ]}>
              <View style={styles.itemHeader}>
                <View style={styles.codeContainer}>
                  {dtc.active && !dtc.resolved && (
                    <AlertTriangle size={16} color={theme.colors.error} style={styles.icon} />
                  )}
                  <Text style={styles.codeText}>{dtc.code}</Text>
                </View>
                <Text style={styles.itemDate}>{formatDate(dtc.date)}</Text>
              </View>
              
              <Text style={styles.itemDescription}>
                {dtc.description}
              </Text>
              
              <View style={styles.itemDetails}>
                <Text style={styles.mileageText}>
                  {dtc.mileage.toLocaleString()} mi
                </Text>
                <View style={styles.statusContainer}>
                  {dtc.active ? (
                    <Text style={styles.activeText}>Active</Text>
                  ) : (
                    <Text style={styles.inactiveText}>Inactive</Text>
                  )}
                  {dtc.resolved && (
                    <Text style={styles.resolvedText}>Resolved</Text>
                  )}
                </View>
              </View>
              
              {dtc.freezeFrameData && (
                <View style={styles.freezeFrameContainer}>
                  <Text style={styles.freezeFrameTitle}>Freeze Frame Data:</Text>
                  <Text style={styles.freezeFrameText}>{dtc.freezeFrameData}</Text>
                </View>
              )}
              
              {dtc.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesTitle}>Notes:</Text>
                  <Text style={styles.notesText}>{dtc.notes}</Text>
                </View>
              )}
              
              {dtc.resolved && dtc.resolvedDate && (
                <Text style={styles.resolvedDate}>
                  Resolved on: {formatDate(dtc.resolvedDate)}
                </Text>
              )}
              
              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={[styles.actionButton, dtc.active ? styles.inactiveButton : styles.activeButton]}
                  onPress={() => toggleActive(dtc.id)}
                >
                  <Text style={styles.actionText}>
                    {dtc.active ? 'Mark Inactive' : 'Mark Active'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, dtc.resolved ? styles.unresolveButton : styles.resolveButton]}
                  onPress={() => toggleResolved(dtc.id)}
                >
                  <Text style={styles.actionText}>
                    {dtc.resolved ? 'Mark Unresolved' : 'Mark Resolved'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEditCode(dtc.id)}
                >
                  <Edit size={16} color={theme.colors.text} />
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.copyButton]}
                  onPress={() => handleCopyCode(dtc)}
                >
                  <Copy size={16} color={theme.colors.text} />
                  <Text style={styles.actionText}>Copy</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => {
                    Alert.alert(
                      'Delete Code',
                      'Are you sure you want to delete this diagnostic code?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Delete', 
                          style: 'destructive',
                          onPress: () => deleteCode(dtc.id)
                        }
                      ]
                    );
                  }}
                >
                  <X size={16} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <EmptyState 
          title="No Diagnostic Codes"
          message={filter !== 'all' 
            ? `No ${filter} diagnostic codes found. Add one by tapping the + button.`
            : "Your diagnostic log is empty. Add your first code by tapping the + button."}
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
                {editMode ? 'Edit Diagnostic Code' : 'Add Diagnostic Code'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
              >
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalForm}>
              <Text style={styles.inputLabel}>DTC Code *</Text>
              <TextInput
                style={styles.input}
                placeholder="P0300, B1234, etc."
                placeholderTextColor={theme.colors.subtext}
                value={code}
                onChangeText={setCode}
                autoCapitalize="characters"
              />
              
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Random Misfire Detected, etc."
                placeholderTextColor={theme.colors.subtext}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={2}
              />
              
              <Text style={styles.inputLabel}>Freeze Frame Data</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="RPM: 2500, MAP: 45 kPa, etc."
                placeholderTextColor={theme.colors.subtext}
                value={freezeFrameData}
                onChangeText={setFreezeFrameData}
                multiline
                numberOfLines={4}
              />
              
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Additional notes, troubleshooting steps, etc."
                placeholderTextColor={theme.colors.subtext}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
              />
              
              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    active && styles.checkboxChecked
                  ]}
                  onPress={() => setActive(!active)}
                >
                  {active && <Check size={16} color="white" />}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>Code is currently active</Text>
              </View>
              
              <View style={styles.mileageInfo}>
                <Text style={styles.mileageLabel}>Current Mileage:</Text>
                <Text style={styles.mileageValue}>
                  {profile.actualMileage.toLocaleString()} mi
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddCode}
              >
                <Text style={styles.submitButtonText}>
                  {editMode ? 'Update Code' : 'Add Code'}
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
  activeItem: {
    borderLeftColor: theme.colors.error,
  },
  resolvedItem: {
    borderLeftColor: theme.colors.success,
    opacity: 0.8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 6,
  },
  codeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  itemDate: {
    fontSize: 12,
    color: theme.colors.subtext,
  },
  itemDescription: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 12,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mileageText: {
    fontSize: 12,
    color: theme.colors.subtext,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  activeText: {
    fontSize: 12,
    color: theme.colors.error,
    fontWeight: '600',
  },
  inactiveText: {
    fontSize: 12,
    color: theme.colors.subtext,
  },
  resolvedText: {
    fontSize: 12,
    color: theme.colors.success,
    fontWeight: '600',
  },
  freezeFrameContainer: {
    backgroundColor: theme.colors.background + '80',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  freezeFrameTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  freezeFrameText: {
    fontSize: 12,
    color: theme.colors.subtext,
    fontFamily: 'monospace',
  },
  notesContainer: {
    marginBottom: 8,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    color: theme.colors.subtext,
  },
  resolvedDate: {
    fontSize: 12,
    color: theme.colors.success,
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
  activeButton: {
    backgroundColor: theme.colors.error + '33',
  },
  inactiveButton: {
    backgroundColor: theme.colors.border + '33',
  },
  resolveButton: {
    backgroundColor: theme.colors.success + '33',
  },
  unresolveButton: {
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.tint,
    borderColor: theme.colors.tint,
  },
  checkboxLabel: {
    fontSize: 14,
    color: theme.colors.text,
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