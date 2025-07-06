import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CarProfile } from '@/types';

interface CarState {
  profile: CarProfile;
  setProfile: (profile: Partial<CarProfile>) => void;
  updateMileage: (clusterMileage: number) => void;
  toggleMode: () => void;
}

// Default profile for the VW Passat B6 project car "CS"
const defaultProfile: CarProfile = {
  vin: 'WVWZZZ3CZ8P123456', // Placeholder VIN
  year: 2008,
  make: 'Volkswagen',
  model: 'Passat',
  trim: 'B6',
  engine: 'BPY 2.0T FSI',
  transmission: '6MT',
  color: 'Black',
  purchaseDate: '2023-01-15',
  purchaseMileage: 142643, // Original cluster when purchased
  clusterMileage: 209843, // Current cluster reading
  actualMileage: 277043, // Current actual mileage
  mileageOffset: 67200, // +67,200 mile offset
  currentMode: 'daily',
  nickname: 'CS',
};

export const useCarStore = create<CarState>()(
  persist(
    (set) => ({
      profile: defaultProfile,
      
      setProfile: (updatedProfile) => 
        set((state) => ({ 
          profile: { ...state.profile, ...updatedProfile } 
        })),
      
      updateMileage: (clusterMileage) => 
        set((state) => ({ 
          profile: { 
            ...state.profile, 
            clusterMileage,
            actualMileage: clusterMileage + state.profile.mileageOffset 
          } 
        })),
      
      toggleMode: () => 
        set((state) => ({ 
          profile: { 
            ...state.profile, 
            currentMode: state.profile.currentMode === 'daily' ? 'show' : 'daily' 
          } 
        })),
    }),
    {
      name: 'car-profile',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);