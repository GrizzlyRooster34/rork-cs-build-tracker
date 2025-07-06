import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaintenanceEntry } from '@/types';

interface MaintenanceState {
  entries: MaintenanceEntry[];
  addEntry: (entry: Omit<MaintenanceEntry, 'id'>) => void;
  updateEntry: (id: string, entry: Partial<MaintenanceEntry>) => void;
  deleteEntry: (id: string) => void;
  toggleCompleted: (id: string) => void;
  initializeWithSeedData: () => void;
}

// Seed data for VW Passat B6 (BPY 2.0T FSI) project
const seedMaintenanceData: Omit<MaintenanceEntry, 'id'>[] = [
  {
    date: '2024-07-01',
    mileage: 277043,
    category: 'engine',
    title: 'Coolant Top-off + Tire Swap',
    description: 'Coolant top-off and rear left tire replacement due to blowout. Cluster: 209,843 mi',
    parts: ['Coolant', 'Rear Tire (temp oversized)'],
    cost: 120,
    priority: 'routine',
    completed: true,
    tags: ['coolant', 'tire', 'emergency'],
    photos: []
  },
  {
    date: '2023-11-15',
    mileage: 275000,
    category: 'engine',
    title: 'Cam Chain Service',
    description: 'Complete cam chain replacement with tensioner and guides. Post-service DTCs appeared.',
    parts: ['Cam Chain', 'Chain Tensioner', 'Chain Guides', 'Timing Cover Gasket'],
    cost: 1250,
    priority: 'critical',
    completed: true,
    tags: ['timing', 'cam-chain', 'engine'],
    photos: []
  },
  {
    date: '2022-11-20',
    mileage: 268000,
    category: 'engine',
    title: 'Timing Belt Service',
    description: 'Complete timing belt kit with water pump and tensioner replacement.',
    parts: ['Timing Belt', 'Water Pump', 'Tensioner', 'Idler Pulley'],
    cost: 850,
    priority: 'critical',
    completed: true,
    tags: ['timing', 'belt', 'water-pump'],
    photos: []
  },
  {
    date: '2023-08-15',
    mileage: 272000,
    category: 'engine',
    title: 'Cooling System Refresh',
    description: 'Complete cooling system overhaul: flange, heater core, pump, fan, tank',
    parts: ['Coolant Flange', 'Heater Core', 'Water Pump', 'Cooling Fan', 'Expansion Tank'],
    cost: 680,
    priority: 'critical',
    completed: true,
    tags: ['cooling', 'overhaul', 'reliability'],
    photos: []
  },
  {
    date: '2023-06-10',
    mileage: 271500,
    category: 'suspension',
    title: 'Full Brake Service',
    description: 'Complete brake overhaul: pads, rotors front and rear',
    parts: ['Front Brake Pads', 'Rear Brake Pads', 'Front Rotors', 'Rear Rotors'],
    cost: 420,
    priority: 'critical',
    completed: true,
    tags: ['brakes', 'pads', 'rotors', 'safety'],
    photos: []
  },
  {
    date: '2024-05-20',
    mileage: 276800,
    category: 'engine',
    title: 'Partial Intake Cleaning',
    description: 'Intake manifold and throttle body cleaning for carbon buildup',
    parts: ['Intake Cleaner', 'Throttle Body Cleaner', 'Gaskets'],
    cost: 180,
    priority: 'routine',
    completed: true,
    tags: ['intake', 'carbon', 'cleaning'],
    photos: []
  },
  {
    date: '2024-01-20',
    mileage: 275500,
    category: 'electrical',
    title: 'Coil Pack Replacement',
    description: 'New OEM ignition coil packs to resolve cylinder 2 misfire issues',
    parts: ['OEM Coil Packs (x4)', 'NGK BKR7EIX Spark Plugs'],
    cost: 280,
    priority: 'critical',
    completed: true,
    tags: ['ignition', 'coils', 'oem'],
    photos: []
  },
  {
    date: '2024-06-15',
    mileage: 277200,
    category: 'exterior',
    title: 'Rear Crash Rebuild',
    description: 'Rear end rebuilt post-spinout with bodywork and glass replacement',
    parts: ['Rear Quarter Panel', 'Rear Glass (temp sealed)', 'Body Filler', 'Paint'],
    cost: 2800,
    priority: 'critical',
    completed: true,
    tags: ['crash', 'bodywork', 'rebuild'],
    photos: []
  },
  {
    date: '2024-08-10',
    mileage: 277500,
    category: 'exterior',
    title: 'Front Crash Assessment',
    description: 'Front crash damage: driver fender, hood, bumper, headlight. Using 2009 donor parts.',
    parts: ['2009 Donor Fender', '2009 Hood', '2009 Bumper', '2009 Headlight'],
    cost: 1200,
    priority: 'critical',
    completed: false,
    tags: ['crash', 'front', 'donor-parts'],
    photos: []
  }
];

export const useMaintenanceStore = create<MaintenanceState>()(
  persist(
    (set, get) => ({
      entries: [],
      
      addEntry: (entry) => 
        set((state) => ({ 
          entries: [
            ...state.entries, 
            { ...entry, id: Date.now().toString() }
          ] 
        })),
      
      updateEntry: (id, updatedEntry) => 
        set((state) => ({ 
          entries: state.entries.map(entry => 
            entry.id === id ? { ...entry, ...updatedEntry } : entry
          ) 
        })),
      
      deleteEntry: (id) => 
        set((state) => ({ 
          entries: state.entries.filter(entry => entry.id !== id) 
        })),
      
      toggleCompleted: (id) => 
        set((state) => ({ 
          entries: state.entries.map(entry => 
            entry.id === id ? { ...entry, completed: !entry.completed } : entry
          ) 
        })),
      
      initializeWithSeedData: () => {
        const currentEntries = get().entries;
        if (currentEntries.length === 0) {
          const entriesWithIds = seedMaintenanceData.map((entry, index) => ({
            ...entry,
            id: `seed-maintenance-${index}`
          }));
          set({ entries: entriesWithIds });
        }
      },
    }),
    {
      name: 'maintenance-data',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);