import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FuelEntry } from '@/types';

interface FuelState {
  entries: FuelEntry[];
  addEntry: (entry: Omit<FuelEntry, 'id' | 'mpg'>) => void;
  updateEntry: (id: string, entry: Partial<FuelEntry>) => void;
  deleteEntry: (id: string) => void;
  calculateMPG: (id: string, previousMileage: number) => void;
  initializeWithSeedData: () => void;
}

// Seed data for fuel entries - VW Passat B6 (BPY 2.0T FSI)
const seedFuelData: Omit<FuelEntry, 'id'>[] = [
  {
    date: '2024-07-01',
    mileage: 209843, // Cluster mileage
    gallons: 10.5,
    octane: 93,
    cost: 4.55,
    fullTank: false,
    notes: 'Post tire swap fill-up, Boostane-safe to 98-104 octane',
    performanceNotes: 'Testing Boostane additive for knock protection',
    tags: ['boostane', 'octane-booster', 'testing']
  },
  {
    date: '2024-06-15',
    mileage: 208486, // Cluster mileage
    gallons: 7.0,
    octane: 93,
    cost: 4.35,
    fullTank: false,
    mpg: 26.7,
    notes: '187 miles on this tank, mixed driving',
    performanceNotes: 'Good power delivery with 93 octane, smooth acceleration',
    tags: ['mixed-driving', 'premium']
  },
  {
    date: '2024-05-20',
    mileage: 207800, // Cluster mileage
    gallons: 18.5,
    octane: 91,
    cost: 4.15,
    fullTank: true,
    mpg: 29.73,
    notes: 'Best tank ever! 550 miles total, mostly highway',
    performanceNotes: 'Excellent efficiency on highway cruise, minimal city driving',
    tags: ['highway', 'best-mpg', 'full-tank']
  },
  {
    date: '2024-04-10',
    mileage: 207200, // Cluster mileage
    gallons: 15.2,
    octane: 93,
    cost: 4.42,
    fullTank: true,
    mpg: 27.8,
    notes: 'Mixed city/highway, dash showed 33.1 MPG at one point',
    performanceNotes: 'Dash computer optimistic but good real-world efficiency',
    tags: ['mixed', 'dash-reading', 'premium']
  },
  {
    date: '2024-03-25',
    mileage: 206800, // Cluster mileage
    gallons: 12.8,
    octane: 91,
    cost: 4.28,
    fullTank: false,
    mpg: 25.2,
    notes: 'City driving with some spirited runs',
    performanceNotes: 'Lower efficiency due to aggressive driving, but good power',
    tags: ['city', 'spirited', 'partial-fill']
  },
  {
    date: '2024-02-15',
    mileage: 206200, // Cluster mileage
    gallons: 14.1,
    octane: 93,
    cost: 4.38,
    fullTank: true,
    mpg: 28.1,
    notes: 'Winter driving, cold weather impact',
    performanceNotes: 'Cold weather reduces efficiency, longer warm-up times',
    tags: ['winter', 'cold', 'full-tank']
  }
];

export const useFuelStore = create<FuelState>()(
  persist(
    (set, get) => ({
      entries: [],
      
      addEntry: (entry) => 
        set((state) => {
          let mpg: number | undefined = undefined;
          
          // Calculate MPG if there's a previous entry
          if (state.entries.length > 0 && entry.fullTank) {
            const sortedEntries = [...state.entries].sort((a, b) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            
            const previousEntry = sortedEntries.find(e => e.fullTank);
            
            if (previousEntry) {
              const mileageDifference = entry.mileage - previousEntry.mileage;
              if (mileageDifference > 0) {
                mpg = parseFloat((mileageDifference / entry.gallons).toFixed(2));
              }
            }
          }
          
          const newEntry: FuelEntry = { 
            ...entry, 
            id: Date.now().toString(),
            mpg
          };
          
          return { 
            entries: [...state.entries, newEntry]
          };
        }),
      
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
      
      calculateMPG: (id, previousMileage) => 
        set((state) => {
          const entry = state.entries.find(e => e.id === id);
          if (!entry) return state;
          
          const mileageDifference = entry.mileage - previousMileage;
          const mpg = mileageDifference > 0 ? 
            parseFloat((mileageDifference / entry.gallons).toFixed(2)) : 
            undefined;
          
          return { 
            entries: state.entries.map(e => 
              e.id === id ? { ...e, mpg } : e
            ) 
          };
        }),
      
      initializeWithSeedData: () => {
        const currentEntries = get().entries;
        if (currentEntries.length === 0) {
          const entriesWithIds = seedFuelData.map((entry, index) => ({
            ...entry,
            id: `seed-fuel-${index}`
          }));
          set({ entries: entriesWithIds });
        }
      },
    }),
    {
      name: 'fuel-data',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);