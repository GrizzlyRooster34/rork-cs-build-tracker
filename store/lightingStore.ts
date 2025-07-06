import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightingPlan, ModificationStatus } from '@/types';

interface LightingState {
  plans: LightingPlan[];
  addPlan: (plan: Omit<LightingPlan, 'id'>) => void;
  updatePlan: (id: string, plan: Partial<LightingPlan>) => void;
  deletePlan: (id: string) => void;
  updateStatus: (id: string, status: LightingPlan['status']) => void;
  initializeData: () => void;
}

const seedLightingPlans = [
  {
    id: '1',
    title: 'Purple Underglow System',
    description: 'Music-reactive underglow with boost sync capability',
    components: ['LED strips', 'Bluetooth controller', 'Power supply', 'Wiring harness'],
    wiring: 'Connect to 12V accessory power, route under chassis with protective conduit',
    controller: 'Bluetooth RGB controller with music sync',
    status: 'completed' as ModificationStatus,
    notes: 'Currently installed and working. Syncs to music via phone app.',
    syncMode: 'music' as const,
    tags: ['underglow', 'music-sync', 'purple']
  },
  {
    id: '2', 
    title: 'White LED Grille Outline',
    description: 'Clean white LED accent around front grille',
    components: ['White LED strip', 'Inline controller', '12V tap'],
    wiring: 'Tap into DRL circuit for auto on/off',
    controller: 'Simple on/off with DRL integration',
    status: 'completed' as ModificationStatus,
    notes: 'Installed with R36-style headlights. Clean OEM+ look.',
    syncMode: 'manual' as const,
    tags: ['grille', 'white', 'drl']
  },
  {
    id: '3',
    title: 'Interior Ambient Lighting',
    description: 'Subtle interior accent lighting for doors and footwells',
    components: ['RGB LED strips', 'Dimmer controller', 'Door triggers'],
    wiring: 'Connect to door courtesy light circuits',
    controller: 'Manual dimmer with door activation',
    status: 'planned' as ModificationStatus,
    notes: 'Want to match exterior purple theme but keep it subtle',
    syncMode: 'manual' as const,
    tags: ['interior', 'ambient', 'doors']
  }
];

export const useLightingStore = create<LightingState>()(
  persist(
    (set, get) => ({
      plans: [],
      
      addPlan: (plan) => 
        set((state) => ({ 
          plans: [
            ...state.plans, 
            { ...plan, id: Date.now().toString(), syncMode: 'manual', tags: [] }
          ] 
        })),
      
      updatePlan: (id, updatedPlan) => 
        set((state) => ({ 
          plans: state.plans.map(plan => 
            plan.id === id ? { ...plan, ...updatedPlan } : plan
          ) 
        })),
      
      deletePlan: (id) => 
        set((state) => ({ 
          plans: state.plans.filter(plan => plan.id !== id) 
        })),
      
      updateStatus: (id, status) => 
        set((state) => ({ 
          plans: state.plans.map(plan => 
            plan.id === id ? { ...plan, status } : plan
          ) 
        })),
        
      // Initialize with seed data if empty
      initializeData: () => {
        const state = get();
        if (state.plans.length === 0) {
          set({ plans: seedLightingPlans });
        }
      },
    }),
    {
      name: 'lighting-data',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);