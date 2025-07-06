import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { theme } from '@/constants/theme';
import { useCarStore } from '@/store/carStore';
import { useMaintenanceStore } from '@/store/maintenanceStore';
import { useFuelStore } from '@/store/fuelStore';
import { useDiagnosticsStore } from '@/store/diagnosticsStore';
import { useNotesStore } from '@/store/notesStore';
import { useEventStore } from '@/store/eventStore';
import { getCurrentDate } from '@/utils/dateFormatter';
import { MaintenanceCategory, MaintenancePriority } from '@/types';
import { Zap, Wrench, Fuel, AlertTriangle, FileText } from 'lucide-react-native';

type QuickEntryType = 'maintenance' | 'fuel' | 'diagnostic' | 'note';

interface QuickEntryProps {
  onClose: () => void;
}

export default function QuickEntry({ onClose }: QuickEntryProps) {
  const { profile } = useCarStore();
  const { addEntry: addMaintenance } = useMaintenanceStore();
  const { addEntry: addFuel } = useFuelStore();
  const { addCode } = useDiagnosticsStore();
  const { addNote } = useNotesStore();
  const { addEvent } = useEventStore();
  
  const [entryType, setEntryType] = useState<QuickEntryType>('maintenance');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MaintenanceCategory>('engine');
  const [priority, setPriority] = useState<MaintenancePriority>('routine');
  const [cost, setCost] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  
  // Fuel specific
  const [gallons, setGallons] = useState('');
  const [octane, setOctane] = useState<87 | 89 | 91 | 93>(91);
  
  // Diagnostic specific
  const [code, setCode] = useState('');
  
  const quickTags = [
    'Stage 1', 'Stage 2', 'Stage 3',
    'Powertrain', 'Suspension', 'Electrical',
    'Critical', 'Routine', 'Planned',
    'MAF', 'CPS', 'Boost', 'Fuel',
    'Test Drive', 'Garage Work', 'Road Test'
  ];
  
  const categories: MaintenanceCategory[] = [
    'engine', 'suspension', 'electrical', 'exterior', 'interior', 'lighting', 'performance', 'other'
  ];
  
  const toggleTag = (tag: string) => {
    setTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  
  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    
    const currentDate = getCurrentDate();
    const currentMileage = profile.actualMileage;
    
    try {
      switch (entryType) {
        case 'maintenance':
          const costValue = parseFloat(cost) || 0;
          const maintenanceId = Date.now().toString();
          
          addMaintenance({
            title,
            description,
            category,
            priority,
            cost: costValue,
            parts: [],
            date: currentDate,
            mileage: currentMileage,
            completed: false,
            tags,
            photos: [],
          });
          
          addEvent({
            type: 'maintenance',
            title,
            date: currentDate,
            mileage: currentMileage,
            category,
            priority,
            tags,
            relatedId: maintenanceId,
          });
          break;
          
        case 'fuel':
          const gallonsValue = parseFloat(gallons);
          const costPerGallon = parseFloat(cost);
          
          if (isNaN(gallonsValue) || isNaN(costPerGallon)) {
            Alert.alert('Error', 'Please enter valid fuel data');
            return;
          }
          
          const fuelId = Date.now().toString();
          
          addFuel({
            gallons: gallonsValue,
            cost: costPerGallon,
            octane,
            fullTank: true,
            date: currentDate,
            mileage: currentMileage,
            notes: description,
            performanceNotes: '',
            tags,
          });
          
          addEvent({
            type: 'fuel',
            title: `${gallonsValue.toFixed(1)}gal ${octane} octane`,
            date: currentDate,
            mileage: currentMileage,
            tags,
            relatedId: fuelId,
          });
          break;
          
        case 'diagnostic':
          if (!code.trim()) {
            Alert.alert('Error', 'DTC code is required');
            return;
          }
          
          const diagnosticId = Date.now().toString();
          
          addCode({
            code: code.toUpperCase(),
            description: title,
            date: currentDate,
            mileage: currentMileage,
            active: true,
            notes: description,
            resolved: false,
            severity: 'medium',
            system: category,
            tags,
          });
          
          addEvent({
            type: 'diagnostic',
            title: `${code.toUpperCase()}: ${title}`,
            date: currentDate,
            mileage: currentMileage,
            category,
            priority: 'critical',
            tags,
            relatedId: diagnosticId,
          });
          break;
          
        case 'note':
          const noteId = Date.now().toString();
          
          addNote({
            title,
            content: description,
            date: currentDate,
            tags,
            mileage: currentMileage,
            category: 'journal',
          });
          
          addEvent({
            type: 'note',
            title,
            date: currentDate,
            mileage: currentMileage,
            tags,
            relatedId: noteId,
          });
          break;
      }
      
      Alert.alert('Success', 'Entry added successfully');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to add entry');
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quick Entry</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeButton, entryType === 'maintenance' && styles.activeType]}
          onPress={() => setEntryType('maintenance')}
        >
          <Wrench size={20} color={entryType === 'maintenance' ? 'white' : theme.colors.text} />
          <Text style={[styles.typeText, entryType === 'maintenance' && styles.activeTypeText]}>
            Maintenance
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.typeButton, entryType === 'fuel' && styles.activeType]}
          onPress={() => setEntryType('fuel')}
        >
          <Fuel size={20} color={entryType === 'fuel' ? 'white' : theme.colors.text} />
          <Text style={[styles.typeText, entryType === 'fuel' && styles.activeTypeText]}>
            Fuel
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.typeButton, entryType === 'diagnostic' && styles.activeType]}
          onPress={() => setEntryType('diagnostic')}
        >
          <AlertTriangle size={20} color={entryType === 'diagnostic' ? 'white' : theme.colors.text} />
          <Text style={[styles.typeText, entryType === 'diagnostic' && styles.activeTypeText]}>
            DTC
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.typeButton, entryType === 'note' && styles.activeType]}
          onPress={() => setEntryType('note')}
        >
          <FileText size={20} color={entryType === 'note' ? 'white' : theme.colors.text} />
          <Text style={[styles.typeText, entryType === 'note' && styles.activeTypeText]}>
            Note
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.form}>
        {entryType === 'diagnostic' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>DTC Code</Text>
            <TextInput
              style={styles.input}
              placeholder="P0300, B1234, etc."
              placeholderTextColor={theme.colors.subtext}
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
            />
          </View>
        )}
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder={entryType === 'diagnostic' ? 'Random Misfire Detected' : 'Quick description...'}
            placeholderTextColor={theme.colors.subtext}
            value={title}
            onChangeText={setTitle}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Additional details..."
            placeholderTextColor={theme.colors.subtext}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>
        
        {(entryType === 'maintenance' || entryType === 'diagnostic') && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryRow}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      category === cat && styles.activeCategoryButton
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[
                      styles.categoryText,
                      category === cat && styles.activeCategoryText
                    ]}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
        
        {entryType === 'fuel' && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gallons</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={theme.colors.subtext}
                value={gallons}
                onChangeText={setGallons}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Octane</Text>
              <View style={styles.octaneRow}>
                {[87, 89, 91, 93].map(oct => (
                  <TouchableOpacity
                    key={oct}
                    style={[
                      styles.octaneButton,
                      octane === oct && styles.activeOctaneButton
                    ]}
                    onPress={() => setOctane(oct as 87 | 89 | 91 | 93)}
                  >
                    <Text style={[
                      styles.octaneText,
                      octane === oct && styles.activeOctaneText
                    ]}>
                      {oct}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
        
        {(entryType === 'maintenance' || entryType === 'fuel') && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cost ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={theme.colors.subtext}
              value={cost}
              onChangeText={setCost}
              keyboardType="numeric"
            />
          </View>
        )}
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Quick Tags</Text>
          <View style={styles.tagsContainer}>
            {quickTags.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagButton,
                  tags.includes(tag) && styles.activeTagButton
                ]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[
                  styles.tagText,
                  tags.includes(tag) && styles.activeTagText
                ]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.mileageInfo}>
          <Text style={styles.mileageLabel}>Current Mileage:</Text>
          <Text style={styles.mileageValue}>
            {profile.actualMileage.toLocaleString()} mi
          </Text>
        </View>
        
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Zap size={20} color="white" />
          <Text style={styles.submitText}>Quick Add</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 18,
    color: theme.colors.text,
  },
  typeSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.card,
  },
  activeType: {
    backgroundColor: theme.colors.tint,
  },
  typeText: {
    fontSize: 12,
    color: theme.colors.text,
    marginTop: 4,
  },
  activeTypeText: {
    color: 'white',
  },
  form: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
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
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: theme.colors.card,
  },
  activeCategoryButton: {
    backgroundColor: theme.colors.tint,
  },
  categoryText: {
    fontSize: 12,
    color: theme.colors.text,
  },
  activeCategoryText: {
    color: 'white',
  },
  octaneRow: {
    flexDirection: 'row',
    gap: 8,
  },
  octaneButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
  },
  activeOctaneButton: {
    backgroundColor: theme.colors.tint,
  },
  octaneText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  activeOctaneText: {
    color: 'white',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: theme.colors.card,
  },
  activeTagButton: {
    backgroundColor: theme.colors.tint,
  },
  tagText: {
    fontSize: 12,
    color: theme.colors.text,
  },
  activeTagText: {
    color: 'white',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.tint,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  submitText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});