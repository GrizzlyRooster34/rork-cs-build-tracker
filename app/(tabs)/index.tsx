import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, Pressable, Alert, Modal } from 'react-native';
import { Stack } from 'expo-router';
import { theme, globalStyles } from '@/constants/theme';
import { useCarStore } from '@/store/carStore';
import { useMaintenanceStore } from '@/store/maintenanceStore';
import { useModificationsStore } from '@/store/modificationsStore';
import { useDiagnosticsStore } from '@/store/diagnosticsStore';
import { useFuelStore } from '@/store/fuelStore';
import { useReminderStore } from '@/store/reminderStore';
import { useEventStore } from '@/store/eventStore';
import MileageDisplay from '@/components/MileageDisplay';
import ModeToggle from '@/components/ModeToggle';
import StatusBadge from '@/components/StatusBadge';
import SystemBadge from '@/components/SystemBadge';
import TimelineGraph from '@/components/TimelineGraph';
import QuickEntry from '@/components/QuickEntry';
import { formatDate } from '@/utils/dateFormatter';
import { initializeSeedData, hasExistingData } from '@/utils/seedData';
import { Zap, AlertTriangle, Clock, TrendingUp, Plus, Settings } from 'lucide-react-native';

export default function DashboardScreen() {
  const { profile, updateMileage, toggleMode } = useCarStore();
  const { entries: maintenanceEntries } = useMaintenanceStore();
  const { modifications } = useModificationsStore();
  const { codes } = useDiagnosticsStore();
  const { entries: fuelEntries } = useFuelStore();
  const { getDueReminders } = useReminderStore();
  const { getRecentEvents } = useEventStore();
  
  const [newMileage, setNewMileage] = useState('');
  const [quickEntryVisible, setQuickEntryVisible] = useState(false);
  const [mileageModalVisible, setMileageModalVisible] = useState(false);
  
  // Initialize seed data on first load
  useEffect(() => {
    if (!hasExistingData()) {
      initializeSeedData();
    }
  }, []);
  
  // Get dashboard stats
  const dueReminders = getDueReminders(profile.actualMileage);
  const recentEvents = getRecentEvents(5);
  const activeCodes = codes.filter(code => code.active && !code.resolved);
  const criticalMaintenance = maintenanceEntries.filter(entry => 
    !entry.completed && entry.priority === 'critical'
  );
  const inProgressMods = modifications.filter(mod => mod.status === 'in-progress');
  
  // Fuel efficiency stats
  const recentFuelEntries = fuelEntries
    .filter(entry => entry.mpg !== undefined)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  const avgMPG = recentFuelEntries.length > 0
    ? recentFuelEntries.reduce((sum, entry) => sum + (entry.mpg || 0), 0) / recentFuelEntries.length
    : 0;
  
  const handleUpdateMileage = () => {
    const mileageValue = parseInt(newMileage);
    if (isNaN(mileageValue) || mileageValue < 0) {
      Alert.alert('Invalid Mileage', 'Please enter a valid mileage value.');
      return;
    }
    
    if (mileageValue < profile.clusterMileage) {
      Alert.alert('Invalid Mileage', 'New mileage cannot be less than current cluster mileage.');
      return;
    }
    
    updateMileage(mileageValue);
    setNewMileage('');
    setMileageModalVisible(false);
    Alert.alert('Mileage Updated', `Cluster mileage updated to ${mileageValue.toLocaleString()} miles.`);
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: `CS Build Tracker`,
        headerTitleStyle: {
          fontWeight: 'bold',
          color: profile.currentMode === 'daily' ? theme.colors.tint : theme.colors.accent,
        },
        headerRight: () => (
          <View style={styles.headerButtons}>
            <Pressable 
              onPress={() => setMileageModalVisible(true)}
              style={({ pressed }) => [
                styles.headerButton,
                { opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <Settings size={20} color={theme.colors.text} />
            </Pressable>
            <Pressable 
              onPress={() => setQuickEntryVisible(true)}
              style={({ pressed }) => [
                styles.headerButton,
                { opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <Zap size={24} color={theme.colors.text} />
            </Pressable>
          </View>
        )
      }} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.carName}>{profile.year} {profile.make} {profile.model} {profile.trim}</Text>
          <Text style={styles.nickname}>{profile.nickname}</Text>
          <ModeToggle currentMode={profile.currentMode} onToggle={toggleMode} />
        </View>
        
        <MileageDisplay 
          clusterMileage={profile.clusterMileage} 
          actualMileage={profile.actualMileage}
          offset={profile.mileageOffset}
        />
        
        {/* Critical Alerts */}
        {(dueReminders.length > 0 || activeCodes.length > 0 || criticalMaintenance.length > 0) && (
          <View style={styles.alertsSection}>
            <View style={styles.sectionHeader}>
              <AlertTriangle size={20} color={theme.colors.error} />
              <Text style={styles.sectionTitle}>Critical Alerts</Text>
            </View>
            
            {dueReminders.map(reminder => (
              <View key={reminder.id} style={[styles.alertItem, styles.reminderAlert]}>
                <Clock size={16} color={theme.colors.warning} />
                <Text style={styles.alertText}>{reminder.title}</Text>
              </View>
            ))}
            
            {activeCodes.map(code => (
              <View key={code.id} style={[styles.alertItem, styles.dtcAlert]}>
                <AlertTriangle size={16} color={theme.colors.error} />
                <Text style={styles.alertText}>{code.code}: {code.description}</Text>
              </View>
            ))}
            
            {criticalMaintenance.map(item => (
              <View key={item.id} style={[styles.alertItem, styles.maintenanceAlert]}>
                <AlertTriangle size={16} color={theme.colors.error} />
                <Text style={styles.alertText}>{item.title}</Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <TrendingUp size={20} color={theme.colors.success} />
            <Text style={styles.statValue}>{avgMPG.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Avg MPG</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{inProgressMods.length}</Text>
            <Text style={styles.statLabel}>Active Mods</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{activeCodes.length}</Text>
            <Text style={styles.statLabel}>Active DTCs</Text>
          </View>
        </View>
        
        {/* Recent Activity Timeline */}
        <View style={styles.timelineSection}>
          <TimelineGraph limit={10} />
        </View>
        
        {/* In-Progress Modifications */}
        {inProgressMods.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>In-Progress Modifications</Text>
            {inProgressMods.slice(0, 3).map(mod => (
              <View key={mod.id} style={styles.item}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{mod.title}</Text>
                  <SystemBadge system={mod.system} small />
                </View>
                <Text style={styles.itemDescription} numberOfLines={2}>
                  {mod.description}
                </Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Recent Fuel Efficiency */}
        {recentFuelEntries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Fuel Efficiency</Text>
            {recentFuelEntries.slice(0, 3).map(entry => (
              <View key={entry.id} style={styles.item}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>
                    {entry.gallons.toFixed(1)} gal @ {entry.octane} octane
                  </Text>
                  <Text style={styles.mpgText}>
                    {entry.mpg?.toFixed(1)} MPG
                  </Text>
                </View>
                <Text style={styles.itemDate}>{formatDate(entry.date)}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      
      {/* Mileage Update Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={mileageModalVisible}
        onRequestClose={() => setMileageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Cluster Mileage</Text>
              <Pressable onPress={() => setMileageModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            </View>
            
            <Text style={styles.currentMileageText}>
              Current: {profile.clusterMileage.toLocaleString()} mi
            </Text>
            
            <TextInput
              style={styles.mileageInput}
              placeholder="Enter new cluster mileage..."
              placeholderTextColor={theme.colors.subtext}
              keyboardType="numeric"
              value={newMileage}
              onChangeText={setNewMileage}
            />
            
            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setMileageModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.modalButton, styles.updateButton]}
                onPress={handleUpdateMileage}
              >
                <Text style={styles.updateButtonText}>Update</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Quick Entry Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={quickEntryVisible}
        onRequestClose={() => setQuickEntryVisible(false)}
      >
        <QuickEntry onClose={() => setQuickEntryVisible(false)} />
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  carName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  nickname: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.tint,
    marginBottom: 8,
  },
  alertsSection: {
    backgroundColor: theme.colors.error + '11',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: 8,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderAlert: {
    backgroundColor: theme.colors.warning + '22',
    padding: 8,
    borderRadius: 8,
  },
  dtcAlert: {
    backgroundColor: theme.colors.error + '22',
    padding: 8,
    borderRadius: 8,
  },
  maintenanceAlert: {
    backgroundColor: theme.colors.error + '22',
    padding: 8,
    borderRadius: 8,
  },
  alertText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 8,
    flex: 1,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '30%',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.tint,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.subtext,
    marginTop: 4,
  },
  timelineSection: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    maxHeight: 400,
  },
  section: {
    marginBottom: 24,
  },
  item: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  itemDescription: {
    fontSize: 14,
    color: theme.colors.subtext,
  },
  itemDate: {
    fontSize: 12,
    color: theme.colors.subtext,
  },
  mpgText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.success,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    fontSize: 20,
    color: theme.colors.text,
  },
  currentMileageText: {
    fontSize: 16,
    color: theme.colors.subtext,
    marginBottom: 16,
    textAlign: 'center',
  },
  mileageInput: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: 12,
    color: theme.colors.text,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.card,
    marginRight: 8,
  },
  updateButton: {
    backgroundColor: theme.colors.tint,
    marginLeft: 8,
  },
  cancelButtonText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  updateButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});