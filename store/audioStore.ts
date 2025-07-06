import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AudioComponent = {
  id: string;
  name: string;
  type: 'speakers' | 'subwoofer' | 'amplifier' | 'head-unit' | 'tweeter' | 'processor';
  location: string;
  brand: string;
  model: string;
  powerRating?: string;
  impedance?: string;
  installed: boolean;
  installDate?: string;
  cost: number;
  notes: string;
  tags: string[];
};

interface AudioState {
  components: AudioComponent[];
  addComponent: (component: Omit<AudioComponent, 'id'>) => void;
  updateComponent: (id: string, component: Partial<AudioComponent>) => void;
  deleteComponent: (id: string) => void;
  toggleInstalled: (id: string) => void;
  initializeWithSeedData: () => void;
}

// Seed data for audio system components
const seedAudioData: Omit<AudioComponent, 'id'>[] = [
  {
    name: 'Kicker CS 6.5" Speakers',
    type: 'speakers',
    location: 'Front Doors',
    brand: 'Kicker',
    model: 'CS Series 6.5"',
    powerRating: '100W RMS',
    impedance: '4 ohm',
    installed: true,
    installDate: '2023-06-15',
    cost: 120,
    notes: 'Significant improvement over stock speakers, clear mids and highs',
    tags: ['front', 'upgrade', 'kicker']
  },
  {
    name: 'Power Acoustik Tweeters',
    type: 'tweeter',
    location: 'Front Doors',
    brand: 'Power Acoustik',
    model: 'NB-1',
    powerRating: '50W RMS',
    impedance: '4 ohm',
    installed: true,
    installDate: '2023-06-15',
    cost: 45,
    notes: 'Crisp high frequency response, good imaging',
    tags: ['front', 'tweeters', 'highs']
  },
  {
    name: 'Kicker CVT Subwoofer',
    type: 'subwoofer',
    location: 'Trunk',
    brand: 'Kicker',
    model: 'CVT 12"',
    powerRating: '400W RMS',
    impedance: '2 ohm',
    installed: true,
    installDate: '2023-07-20',
    cost: 180,
    notes: 'Compact design fits well in trunk, good bass response',
    tags: ['bass', 'trunk', 'compact']
  },
  {
    name: 'BAMF 1200.4 Amplifier',
    type: 'amplifier',
    location: 'Under Seat',
    brand: 'BAMF',
    model: '1200.4',
    powerRating: '300W x 4 @ 2 ohm',
    installed: true,
    installDate: '2023-07-25',
    cost: 220,
    notes: 'Powers front speakers and tweeters, clean power delivery',
    tags: ['4-channel', 'front-amp', 'clean']
  },
  {
    name: 'BAMF Mono Amplifier',
    type: 'amplifier',
    location: 'Trunk',
    brand: 'BAMF',
    model: 'Mono 1000',
    powerRating: '1000W @ 1 ohm',
    installed: true,
    installDate: '2023-07-25',
    cost: 180,
    notes: 'Powers subwoofer, plenty of headroom for bass',
    tags: ['mono', 'sub-amp', 'power']
  },
  {
    name: 'Stock Head Unit',
    type: 'head-unit',
    location: 'Dashboard',
    brand: 'Volkswagen',
    model: 'RCD 310',
    installed: true,
    cost: 0,
    notes: 'Stock head unit, planning upgrade to RCD 330 or aftermarket',
    tags: ['stock', 'upgrade-planned']
  }
];

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      components: [],
      
      addComponent: (component) => 
        set((state) => ({ 
          components: [
            ...state.components, 
            { ...component, id: Date.now().toString() }
          ] 
        })),
      
      updateComponent: (id, updatedComponent) => 
        set((state) => ({ 
          components: state.components.map(component => 
            component.id === id ? { ...component, ...updatedComponent } : component
          ) 
        })),
      
      deleteComponent: (id) => 
        set((state) => ({ 
          components: state.components.filter(component => component.id !== id) 
        })),
      
      toggleInstalled: (id) => 
        set((state) => ({ 
          components: state.components.map(component => 
            component.id === id ? 
              { 
                ...component, 
                installed: !component.installed,
                installDate: !component.installed ? new Date().toISOString().split('T')[0] : undefined
              } : component
          ) 
        })),
      
      initializeWithSeedData: () => {
        const currentComponents = get().components;
        if (currentComponents.length === 0) {
          const componentsWithIds = seedAudioData.map((component, index) => ({
            ...component,
            id: `seed-audio-${index}`
          }));
          set({ components: componentsWithIds });
        }
      },
    }),
    {
      name: 'audio-data',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);