import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Modification } from '@/types';

interface ModificationsState {
  modifications: Modification[];
  addModification: (mod: Omit<Modification, 'id'>) => void;
  updateModification: (id: string, mod: Partial<Modification>) => void;
  deleteModification: (id: string) => void;
  updateStatus: (id: string, status: Modification['status']) => void;
  initializeWithSeedData: () => void;
}

// Seed data for VW Passat B6 (BPY 2.0T FSI) modifications
const seedModificationData: Omit<Modification, 'id'>[] = [
  // INSTALLED MODS - Stage 0
  {
    title: 'Rev D Diverter Valve',
    description: 'OEM Rev D diverter valve upgrade for better boost response',
    stage: 0,
    system: 'engine',
    status: 'completed',
    parts: [],
    cost: 85,
    installDate: '2023-03-15',
    notes: 'Eliminates boost leaks, improved throttle response',
    priority: 1,
    tags: ['boost', 'reliability', 'oem'],
    photos: []
  },
  {
    title: 'Catch Can with 034 Adapter Plate',
    description: 'Oil catch can system with 034 Motorsport adapter plate',
    stage: 0,
    system: 'engine',
    status: 'completed',
    parts: [],
    cost: 180,
    installDate: '2023-04-20',
    notes: 'Prevents carbon buildup in intake manifold',
    priority: 1,
    tags: ['pcv', 'carbon', 'reliability'],
    photos: []
  },
  {
    title: 'Dogbone Insert',
    description: 'Polyurethane dogbone mount insert for reduced wheel hop',
    stage: 0,
    system: 'suspension',
    status: 'completed',
    parts: [],
    cost: 45,
    installDate: '2023-05-10',
    notes: 'Significantly reduced wheel hop under acceleration',
    priority: 2,
    tags: ['mounts', 'handling', 'poly'],
    photos: []
  },
  {
    title: 'NGK BKR7EIX Spark Plugs',
    description: 'One step colder iridium spark plugs for forced induction',
    stage: 0,
    system: 'engine',
    status: 'completed',
    parts: [],
    cost: 60,
    installDate: '2023-10-15',
    notes: 'Better heat range for turbo applications',
    priority: 1,
    tags: ['ignition', 'plugs', 'turbo'],
    photos: []
  },
  {
    title: 'OEM Coil Packs',
    description: 'New OEM ignition coil packs to resolve misfires',
    stage: 0,
    system: 'electrical',
    status: 'completed',
    parts: [],
    cost: 280,
    installDate: '2024-01-20',
    notes: 'Resolved cylinder 2 misfire issues',
    priority: 1,
    tags: ['ignition', 'coils', 'oem'],
    photos: []
  },
  {
    title: 'R36-style DRL Headlights',
    description: 'R36 Passat style headlights with integrated DRL strips',
    stage: 0,
    system: 'lighting',
    status: 'completed',
    parts: [],
    cost: 450,
    installDate: '2023-08-05',
    notes: 'Dramatic improvement in lighting and aesthetics',
    priority: 2,
    tags: ['headlights', 'drl', 'r36', 'aesthetics'],
    photos: []
  },
  {
    title: 'GTI Rear Spoiler',
    description: 'OEM GTI rear spoiler for improved aerodynamics and looks',
    stage: 0,
    system: 'exterior',
    status: 'completed',
    parts: [],
    cost: 220,
    installDate: '2023-09-12',
    notes: 'Perfect color match, adds sporty appearance',
    priority: 3,
    tags: ['spoiler', 'aero', 'gti', 'exterior'],
    photos: []
  },
  {
    title: 'Smoked Tail Lights',
    description: 'Smoked tail light lenses for aggressive rear appearance',
    stage: 0,
    system: 'lighting',
    status: 'completed',
    parts: [],
    cost: 120,
    installDate: '2023-09-15',
    notes: 'Matches overall dark theme of build',
    priority: 3,
    tags: ['taillights', 'smoked', 'aesthetics'],
    photos: []
  },
  {
    title: 'Blacked-out Grille',
    description: 'Plastidipped grille for murdered-out front end look',
    stage: 0,
    system: 'exterior',
    status: 'completed',
    parts: [],
    cost: 25,
    installDate: '2023-07-20',
    notes: 'Easy reversible mod, dramatic visual impact',
    priority: 3,
    tags: ['grille', 'black', 'plastidip'],
    photos: []
  },
  {
    title: 'White LED Grille Outline',
    description: 'Custom white LED strip outlining the grille opening',
    stage: 0,
    system: 'lighting',
    status: 'completed',
    parts: [],
    cost: 80,
    installDate: '2024-02-10',
    notes: 'Unique accent lighting, wired to parking lights',
    priority: 3,
    tags: ['led', 'grille', 'accent', 'custom'],
    photos: []
  },
  {
    title: 'Purple Underglow System',
    description: 'RGB underglow kit with music sync capability (planned boost sync)',
    stage: 0,
    system: 'lighting',
    status: 'completed',
    parts: [],
    cost: 150,
    installDate: '2024-03-15',
    notes: 'Currently music reactive, boost sync planned for Stage 1',
    priority: 3,
    tags: ['underglow', 'rgb', 'music', 'boost-sync'],
    photos: []
  },
  // PLANNED STAGE 1
  {
    title: 'K04 Turbo Upgrade',
    description: 'K04 turbo from 2.0T GTI/GLI for significant power increase',
    stage: 1,
    system: 'engine',
    status: 'planned',
    parts: [],
    cost: 800,
    notes: 'Core of Stage 1 build, requires supporting mods',
    priority: 1,
    tags: ['turbo', 'k04', 'power'],
    photos: []
  },
  {
    title: 'Methanol Injection Kit',
    description: 'Water/methanol injection for charge cooling and knock protection',
    stage: 1,
    system: 'engine',
    status: 'planned',
    parts: [],
    cost: 650,
    notes: 'Essential for K04 reliability and power',
    priority: 1,
    tags: ['meth', 'cooling', 'knock'],
    photos: []
  },
  {
    title: 'Dual Gauge Setup',
    description: 'Boost and AFR gauges for monitoring engine parameters',
    stage: 1,
    system: 'interior',
    status: 'planned',
    parts: [],
    cost: 280,
    notes: 'Critical for tuning and monitoring',
    priority: 1,
    tags: ['gauges', 'boost', 'afr', 'monitoring'],
    photos: []
  },
  // PLANNED STAGE 2
  {
    title: 'High Pressure Fuel Pump',
    description: 'Upgraded HPFP for increased fuel flow capacity',
    stage: 2,
    system: 'engine',
    status: 'planned',
    parts: [],
    cost: 450,
    notes: 'Required for higher boost levels',
    priority: 1,
    tags: ['fuel', 'hpfp', 'flow'],
    photos: []
  },
  {
    title: 'Roller Cam Follower Conversion',
    description: 'Roller cam follower kit to prevent cam lobe wear',
    stage: 2,
    system: 'engine',
    status: 'planned',
    parts: [],
    cost: 699,
    notes: 'Prevents catastrophic cam failure on high-mileage engines',
    priority: 1,
    tags: ['cam', 'follower', 'reliability'],
    photos: []
  },
  {
    title: 'Fluidampr Crank Pulley',
    description: 'Harmonic damper for improved crank stability at high RPM',
    stage: 2,
    system: 'engine',
    status: 'planned',
    parts: [],
    cost: 380,
    notes: 'Improves harmonic balance and reduces crank stress',
    priority: 2,
    tags: ['crank', 'harmonic', 'damper'],
    photos: []
  },
  {
    title: 'High Output Alternator',
    description: 'Upgraded alternator for increased electrical capacity',
    stage: 2,
    system: 'electrical',
    status: 'planned',
    parts: [],
    cost: 320,
    notes: 'Required for meth pump and additional electrical loads',
    priority: 2,
    tags: ['alternator', 'electrical', 'capacity'],
    photos: []
  },
  // PLANNED STAGE 3
  {
    title: 'K04 Tune',
    description: 'Custom ECU tune for K04 turbo and supporting modifications',
    stage: 3,
    system: 'engine',
    status: 'planned',
    parts: [],
    cost: 600,
    notes: 'Final piece to unlock full potential',
    priority: 1,
    tags: ['tune', 'ecu', 'power'],
    photos: []
  },
  {
    title: 'Front Mount Intercooler',
    description: 'Large front-mount intercooler for improved charge cooling',
    stage: 3,
    system: 'engine',
    status: 'planned',
    parts: [],
    cost: 550,
    notes: 'Better cooling efficiency than stock side-mount',
    priority: 1,
    tags: ['intercooler', 'cooling', 'fmic'],
    photos: []
  },
  {
    title: 'Muffler Delete',
    description: 'Remove rear muffler for improved exhaust flow and sound',
    stage: 3,
    system: 'engine',
    status: 'planned',
    parts: [],
    cost: 120,
    notes: 'Aggressive sound to match performance',
    priority: 3,
    tags: ['exhaust', 'sound', 'flow'],
    photos: []
  },
  // SUSPENSION PLANS
  {
    title: 'Coilovers or Performance Dampers',
    description: 'Adjustable suspension for improved handling and stance',
    stage: 1,
    system: 'suspension',
    status: 'planned',
    parts: [],
    cost: 800,
    notes: 'Deciding between coilovers and performance shocks',
    priority: 2,
    tags: ['suspension', 'handling', 'adjustable'],
    photos: []
  },
  {
    title: 'Polyurethane Bushing Kit',
    description: 'Complete poly bushing kit for improved handling precision',
    stage: 1,
    system: 'suspension',
    status: 'planned',
    parts: [],
    cost: 350,
    notes: 'Eliminates suspension flex for better feedback',
    priority: 2,
    tags: ['bushings', 'poly', 'handling'],
    photos: []
  },
  {
    title: 'Performance Sway Bars',
    description: 'Upgraded front and rear sway bars for reduced body roll',
    stage: 1,
    system: 'suspension',
    status: 'planned',
    parts: [],
    cost: 280,
    notes: 'Improves cornering stability',
    priority: 2,
    tags: ['sway-bars', 'handling', 'cornering'],
    photos: []
  },
  // INTERIOR PLANS
  {
    title: 'B7 Passat Center Console',
    description: 'Retrofit B7 center console for modern appearance',
    stage: 0,
    system: 'interior',
    status: 'planned',
    parts: [],
    cost: 200,
    notes: 'Cleaner, more modern interior aesthetic',
    priority: 3,
    tags: ['console', 'b7', 'interior'],
    photos: []
  },
  {
    title: 'Highline J519 Module',
    description: 'Highline comfort control module for additional features',
    stage: 0,
    system: 'electrical',
    status: 'planned',
    parts: [],
    cost: 150,
    notes: 'Enables additional comfort and convenience features',
    priority: 3,
    tags: ['j519', 'comfort', 'features'],
    photos: []
  },
  {
    title: 'Ambient Lighting Kit',
    description: 'Interior ambient lighting for enhanced cabin atmosphere',
    stage: 0,
    system: 'lighting',
    status: 'planned',
    parts: [],
    cost: 120,
    notes: 'Complements exterior lighting theme',
    priority: 3,
    tags: ['ambient', 'interior', 'lighting'],
    photos: []
  }
];

export const useModificationsStore = create<ModificationsState>()(
  persist(
    (set, get) => ({
      modifications: [],
      
      addModification: (mod) => 
        set((state) => ({ 
          modifications: [
            ...state.modifications, 
            { ...mod, id: Date.now().toString() }
          ] 
        })),
      
      updateModification: (id, updatedMod) => 
        set((state) => ({ 
          modifications: state.modifications.map(mod => 
            mod.id === id ? { ...mod, ...updatedMod } : mod
          ) 
        })),
      
      deleteModification: (id) => 
        set((state) => ({ 
          modifications: state.modifications.filter(mod => mod.id !== id) 
        })),
      
      updateStatus: (id, status) => 
        set((state) => ({ 
          modifications: state.modifications.map(mod => 
            mod.id === id ? { ...mod, status } : mod
          ) 
        })),
      
      initializeWithSeedData: () => {
        const currentMods = get().modifications;
        if (currentMods.length === 0) {
          const modsWithIds = seedModificationData.map((mod, index) => ({
            ...mod,
            id: `seed-mod-${index}`
          }));
          set({ modifications: modsWithIds });
        }
      },
    }),
    {
      name: 'modifications-data',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);