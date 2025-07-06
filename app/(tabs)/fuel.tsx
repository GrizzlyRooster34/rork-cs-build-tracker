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
import { useFuelStore } from '@/store/fuelStore';
import { useCarStore } from '@/store/carStore';
import EmptyState from '@/components/EmptyState';
import { formatDate, getCurrentDate } from '@/utils/dateFormatter';
import { copyFuelData } from '@/utils/copyToClipboard';
import { Plus, X, Check, Copy, Share, Edit } from 'lucide-react-native';

export default function FuelScreen() {
  const { entries, addEntry, updateEntry, deleteEntry } = useFuelStore();
  const { profile } = useCarStore();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  
  // Form state
  const [gallons, setGallons] = useState('');
  const [cost, setCost] = useState('');
  const [octane, setOctane] = useState<87 | 89 | 91 | 93>(91);
  const [fullTank, setFullTank] = useState(true);
  const [notes, setNotes] = useState('');
  
  // Stats
  const totalEntries = entries.length;
  const totalGallons = entries.reduce((sum, entry) => sum + entry.gallons, 0);
  const totalCost = entries.reduce((sum, entry) => sum + (entry.gallons * entry.cost), 0);
  
  const avgMPG = entries
    .filter(entry => entry.mpg !== undefined)
    .reduce((sum, entry) => sum + (entry.mpg || 0), 0) / 
    entries.filter(entry => entry.mpg !== undefined).length || 0;
  
  const avgCostPerGallon = totalGallons > 0 ? totalCost / totalGallons : 0;
  
  // Group by octane
  const octaneStats = [87, 89, 91, 93].map(oct => {
    const octaneEntries = entries.filter(entry => entry.octane === oct);
    const octaneCount = octaneEntries.length;
    const octaneAvgMPG = octaneEntries
      .filter(entry => entry.mpg !== undefined)
      .reduce((sum, entry) => sum + (entry.mpg || 0), 0) / 
      octaneEntries.filter(entry => entry.mpg !== undefined).length || 0;
    
    return {
      octane: oct,
      count: octaneCount,
      avgMPG: octaneAvgMPG,
    };
  }).filter(stat => stat.count > 0);
  
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const handleAddEntry = () => {
    const gallonsValue = parseFloat(gallons);
    if (isNaN(gallonsValue) || gallonsValue <= 0) {
      Alert.alert('Error', 'Please enter a valid number of gallons');
      return;
    }
    
    const costValue = parseFloat(cost);
    if (isNaN(costValue) || costValue <= 0) {
      Alert.alert('Error', 'Please enter a valid cost per gallon');
      return;
    }
    
    const entryData = {
      gallons: gallonsValue,
      cost: costValue,
      octane,
      fullTank,
      date: getCurrentDate(),
      mileage: profile.actualMileage,
      notes,
      tags: [],
      performanceNotes: '',
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
    setGallons('');
    setCost('');
    setOctane(91);
    setFullTank(true);
    setNotes('');
    setEditMode(false);
    setSelectedEntry(null);
    setModalVisible(false);
  };

  const handleEditEntry = (id: string) => {
    const entry = entries.find(e => e.id === id);
    if (entry) {
      setGallons(entry.gallons.toString());
      setCost(entry.cost.toString());
      setOctane(entry.octane);
      setFullTank(entry.fullTank);
      setNotes(entry.notes);
      setEditMode(true);
      setSelectedEntry(id);
      setModalVisible(true);
    }
  };
  
  const handleExportData = async () => {
    if (entries.length === 0) {
      Alert.alert('No Data', 'No fuel entries to export');
      return;
    }
    
    const success = await copyFuelData(entries);
    
    if (success) {
      Alert.alert('Exported', 'Fuel data copied to clipboard');
    } else {
      Alert.alert('Error', 'Failed to export fuel data');
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Fuel Tracker',
        headerRight: () => (
          <View style={styles.headerButtons}>
            {entries.length > 0 && (
              <Pressable 
                onPress={handleExportData}
                style={({ pressed }) => [
                  styles.headerButton,
                  { opacity: pressed ? 0.7 : 1 }
                ]}
              >
                <Share size={20} color={theme.colors.text} />
              </Pressable>
            )}
            <Pressable 
              onPress={() => {
                resetForm();
                setModalVisible(true);
              }}
              style={({ pressed }) => [
                styles.headerButton,
                { opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <Plus size={24} color={theme.colors.text} />
            </Pressable>
          </View>
        )
      }} />
      
      {totalEntries > 0 ? (
        <>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{avgMPG.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Avg MPG</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>${avgCostPerGallon.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Avg $/gal</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalGallons.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Total Gallons</Text>
            </View>
          </View>
          
          {octaneStats.length > 0 && (
            <View style={styles.octaneStatsContainer}>
              <Text style={styles.octaneStatsTitle}>MPG by Octane</Text>
              <View style={styles.octaneStatsRow}>
                {octaneStats.map(stat => (
                  <View key={stat.octane} style={styles.octaneStat}>
                    <Text style={styles.octaneValue}>{stat.avgMPG.toFixed(1)}</Text>
                    <Text style={styles.octaneLabel}>{stat.octane} Octane</Text>
                    <Text style={styles.octaneCount}>({stat.count} fills)</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          <Text style={styles.sectionTitle}>Fuel Entries</Text>
          
          <ScrollView style={styles.list}>
            {sortedEntries.map(entry => (
              <View key={entry.id} style={styles.item}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemHeaderLeft}>
                    <Text style={styles.itemDate}>{formatDate(entry.date)}</Text>
                    <Text style={styles.itemMileage}>{entry.mileage.toLocaleString()} mi</Text>
                  </View>
                  {entry.mpg && (
                    <View style={styles.mpgBadge}>
                      <Text style={styles.mpgText}>{entry.mpg.toFixed(1)} MPG</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.itemDetails}>
                  <View style={styles.detailColumn}>
                    <Text style={styles.detailLabel}>Gallons</Text>
                    <Text style={styles.detailValue}>{entry.gallons.toFixed(2)}</Text>
                  </View>
                  
                  <View style={styles.detailColumn}>
                    <Text style={styles.detailLabel}>Price</Text>
                    <Text style={styles.detailValue}>${entry.cost.toFixed(2)}/gal</Text>
                  </View>
                  
                  <View style={styles.detailColumn}>
                    <Text style={styles.detailLabel}>Total</Text>
                    <Text style={styles.detailValue}>
                      ${(entry.gallons * entry.cost).toFixed(2)}
                    </Text>
                  </View>
                  
                  <View style={styles.detailColumn}>
                    <Text style={styles.detailLabel}>Octane</Text>
                    <Text style={styles.detailValue}>{entry.octane}</Text>
                  </View>
                </View>
                
                {entry.notes && (
                  <Text style={styles.itemNotes}>{entry.notes}</Text>
                )}
                
                <View style={styles.itemFooter}>
                  {entry.fullTank ? (
                    <View style={styles.fullTankBadge}>
                      <Text style={styles.fullTankText}>Full Tank</Text>
                    </View>
                  ) : (
                    <View style={styles.partialTankBadge}>
                      <Text style={styles.partialTankText}>Partial Fill</Text>
                    </View>
                  )}
                  
                  <View style={styles.entryActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEditEntry(entry.id)}
                    >
                      <Edit size={16} color={theme.colors.text} />
                      <Text style={styles.editText}>Edit</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => {
                        Alert.alert(
                          'Delete Entry',
                          'Are you sure you want to delete this fuel entry?',
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
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </>
      ) : (
        <EmptyState 
          title="No Fuel Entries"
          message="Your fuel log is empty. Add your first fuel-up by tapping the + button."
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
                {editMode ? 'Edit Fuel Entry' : 'Add Fuel Entry'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
              >
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalForm}>
              <Text style={styles.inputLabel}>Gallons *</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={theme.colors.subtext}
                value={gallons}
                onChangeText={setGallons}
                keyboardType="numeric"
              />
              
              <Text style={styles.inputLabel}>Price per Gallon ($) *</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={theme.colors.subtext}
                value={cost}
                onChangeText={setCost}
                keyboardType="numeric"
              />
              
              <Text style={styles.inputLabel}>Octane Rating</Text>
              <View style={styles.octaneContainer}>
                {[87, 89, 91, 93].map(oct => (
                  <TouchableOpacity
                    key={oct}
                    style={[
                      styles.octaneButton,
                      octane === oct && styles.activeOctane
                    ]}
                    onPress={() => setOctane(oct as 87 | 89 | 91 | 93)}
                  >
                    <Text style={[
                      styles.octaneButtonText,
                      octane === oct && styles.activeOctaneText
                    ]}>
                      {oct}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    fullTank && styles.checkboxChecked
                  ]}
                  onPress={() => setFullTank(!fullTank)}
                >
                  {fullTank && <Check size={16} color="white" />}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>Full tank fill-up</Text>
              </View>
              
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Additional notes, driving conditions, etc."
                placeholderTextColor={theme.colors.subtext}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
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
                  {editMode ? 'Update Fuel Entry' : 'Add Fuel Entry'}
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginRight: 16,
    padding: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  statCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: '30%',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.tint,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.subtext,
  },
  octaneStatsContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  octaneStatsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  octaneStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  octaneStat: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: '23%',
  },
  octaneValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.tint,
    marginBottom: 4,
  },
  octaneLabel: {
    fontSize: 10,
    color: theme.colors.text,
    marginBottom: 2,
  },
  octaneCount: {
    fontSize: 9,
    color: theme.colors.subtext,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    padding: 16,
    paddingBottom: 8,
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
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemDate: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginRight: 8,
  },
  itemMileage: {
    fontSize: 12,
    color: theme.colors.subtext,
  },
  mpgBadge: {
    backgroundColor: theme.colors.tint + '33',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mpgText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.tint,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailColumn: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 10,
    color: theme.colors.subtext,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  itemNotes: {
    fontSize: 12,
    color: theme.colors.subtext,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fullTankBadge: {
    backgroundColor: theme.colors.success + '33',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  fullTankText: {
    fontSize: 12,
    color: theme.colors.success,
  },
  partialTankBadge: {
    backgroundColor: theme.colors.warning + '33',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  partialTankText: {
    fontSize: 12,
    color: theme.colors.warning,
  },
  entryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warning + '33',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  editText: {
    fontSize: 12,
    color: theme.colors.text,
    marginLeft: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.error + '22',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  deleteText: {
    fontSize: 12,
    color: theme.colors.error,
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
  octaneContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  octaneButton: {
    width: '22%',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
  },
  activeOctane: {
    backgroundColor: theme.colors.tint,
  },
  octaneButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  activeOctaneText: {
    color: 'white',
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