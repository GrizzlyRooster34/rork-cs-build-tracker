import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CrashEntry = {
  id: string;
  date: string;
  location: 'front' | 'rear' | 'side' | 'multiple';
  severity: 'minor' | 'moderate' | 'major';
  description: string;
  damageAssessment: string[];
  repairStatus: 'pending' | 'in-progress' | 'completed';
  estimatedCost: number;
  actualCost?: number;
  partsNeeded: string[];
  donorParts: string[];
  insuranceClaim: boolean;
  photos: string[];
  notes: string;
  tags: string[];
};

interface CrashState {
  entries: CrashEntry[];
  addEntry: (entry: Omit<CrashEntry, 'id'>) => void;
  updateEntry: (id: string, entry: Partial<CrashEntry>) => void;
  deleteEntry: (id: string) => void;
  updateRepairStatus: (id: string, status: CrashEntry['repairStatus']) => void;
  initializeWithSeedData: () => void;
}

// Seed data for crash recovery tracking
const seedCrashData: Omit<CrashEntry, 'id'>[] = [
  {
    date: '2024-03-20',
    location: 'rear',
    severity: 'major',
    description: 'Spinout incident resulting in rear end damage',
    damageAssessment: [
      'Rear bumper cracked',
      'Rear quarter panel dented',
      'Rear glass damaged (temp sealed)',
      'Trunk lid misaligned',
      'Rear lights damaged'
    ],
    repairStatus: 'completed',
    estimatedCost: 3500,
    actualCost: 2800,
    partsNeeded: [
      'Rear bumper',
      'Quarter panel repair',
      'Rear glass',
      'Trunk alignment',
      'Tail light assembly'
    ],
    donorParts: [],
    insuranceClaim: false,
    photos: ['rear-damage-1.jpg', 'rear-damage-2.jpg'],
    notes: 'Rear rebuilt post-spinout. Rear glass temp sealed with dimensions: 1414 x 889 x 928 mm',
    tags: ['spinout', 'rear-damage', 'bodywork', 'completed']
  },
  {
    date: '2024-07-15',
    location: 'front',
    severity: 'moderate',
    description: 'Front end collision damage',
    damageAssessment: [
      'Driver side fender damaged',
      'Hood dented',
      'Front bumper cracked',
      'Driver headlight damaged',
      'Grille damaged'
    ],
    repairStatus: 'in-progress',
    estimatedCost: 1800,
    partsNeeded: [
      'Driver fender',
      'Hood',
      'Front bumper',
      'Headlight assembly',
      'Grille'
    ],
    donorParts: [
      '2009 Passat donor fender',
      '2009 Passat hood',
      '2009 Passat bumper',
      '2009 Passat headlight'
    ],
    insuranceClaim: false,
    photos: ['front-damage-1.jpg', 'front-damage-2.jpg'],
    notes: 'Using 2009 donor parts for repair. Color match may require paint work.',
    tags: ['front-damage', 'donor-parts', 'in-progress', '2009-parts']
  }
];

export const useCrashStore = create<CrashState>()(
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
      
      updateRepairStatus: (id, status) => 
        set((state) => ({ 
          entries: state.entries.map(entry => 
            entry.id === id ? { ...entry, repairStatus: status } : entry
          ) 
        })),
      
      initializeWithSeedData: () => {
        const currentEntries = get().entries;
        if (currentEntries.length === 0) {
          const entriesWithIds = seedCrashData.map((entry, index) => ({
            ...entry,
            id: `seed-crash-${index}`
          }));
          set({ entries: entriesWithIds });
        }
      },
    }),
    {
      name: 'crash-data',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);