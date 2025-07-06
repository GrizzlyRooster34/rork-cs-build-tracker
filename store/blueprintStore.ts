import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Blueprint {
  id: string;
  title: string;
  category: 'modification' | 'repair' | 'wiring' | 'fabrication';
  description: string;
  steps: string[];
  materials: string[];
  tools: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  estimatedTime: string;
  cost: number;
  status: 'planned' | 'in-progress' | 'completed';
  notes: string;
  tags: string[];
  dimensions?: string;
}

export interface Dimension {
  id: string;
  name: string;
  category: 'vehicle' | 'glass' | 'interior' | 'engine' | 'suspension' | 'custom';
  measurement: number;
  unit: string;
  description: string;
  reference: string;
  verified: boolean;
  notes?: string;
  tags: string[];
}

interface BlueprintStore {
  blueprints: Blueprint[];
  dimensions: Dimension[];
  addBlueprint: (blueprint: Omit<Blueprint, 'id'>) => void;
  updateBlueprint: (id: string, updates: Partial<Blueprint>) => void;
  deleteBlueprint: (id: string) => void;
  addDimension: (dimension: Omit<Dimension, 'id'>) => void;
  updateDimension: (id: string, updates: Partial<Dimension>) => void;
  deleteDimension: (id: string) => void;
  initializeWithSeedData: () => void;
}

export const useBlueprintStore = create<BlueprintStore>()(
  persist(
    (set, get) => ({
      blueprints: [],
      dimensions: [],
      
      addBlueprint: (blueprint) => {
        const newBlueprint: Blueprint = {
          ...blueprint,
          id: Date.now().toString(),
        };
        set((state) => ({
          blueprints: [...state.blueprints, newBlueprint],
        }));
      },
      
      updateBlueprint: (id, updates) => {
        set((state) => ({
          blueprints: state.blueprints.map((blueprint) =>
            blueprint.id === id ? { ...blueprint, ...updates } : blueprint
          ),
        }));
      },
      
      deleteBlueprint: (id) => {
        set((state) => ({
          blueprints: state.blueprints.filter((blueprint) => blueprint.id !== id),
        }));
      },

      addDimension: (dimension) => {
        const newDimension: Dimension = {
          ...dimension,
          id: Date.now().toString(),
        };
        set((state) => ({
          dimensions: [...state.dimensions, newDimension],
        }));
      },
      
      updateDimension: (id, updates) => {
        set((state) => ({
          dimensions: state.dimensions.map((dimension) =>
            dimension.id === id ? { ...dimension, ...updates } : dimension
          ),
        }));
      },
      
      deleteDimension: (id) => {
        set((state) => ({
          dimensions: state.dimensions.filter((dimension) => dimension.id !== id),
        }));
      },
      
      initializeWithSeedData: () => {
        const currentBlueprints = get().blueprints;
        const currentDimensions = get().dimensions;
        
        if (currentBlueprints.length === 0) {
          const seedBlueprints: Blueprint[] = [
            {
              id: '1',
              title: 'K04 Turbo Installation',
              category: 'modification',
              description: 'Complete K04 turbo upgrade with supporting modifications',
              steps: [
                'Remove stock K03 turbo',
                'Install K04 turbo with new gaskets',
                'Upgrade intercooler piping',
                'Install boost gauge and wastegate',
                'Flash ECU with K04 tune',
                'Test boost levels and AFR'
              ],
              materials: [
                'K04 Turbo',
                'Intercooler upgrade',
                'Boost gauge',
                'Wastegate actuator',
                'Gasket set',
                'Coolant lines'
              ],
              tools: [
                'Socket set',
                'Torque wrench',
                'Jack and stands',
                'Coolant drain pan',
                'VCDS/OBDeleven'
              ],
              difficulty: 'expert',
              estimatedTime: '8-12 hours',
              cost: 2500,
              status: 'planned',
              notes: 'Requires ECU tune and supporting mods for reliability',
              tags: ['turbo', 'stage2', 'performance']
            },
            {
              id: '2',
              title: 'Custom Wiring Harness Repair',
              category: 'wiring',
              description: 'Repair damaged engine harness sections',
              steps: [
                'Identify damaged wire sections',
                'Remove old connectors',
                'Splice in new wire sections',
                'Apply heat shrink protection',
                'Test continuity',
                'Secure with proper routing'
              ],
              materials: [
                '18AWG automotive wire',
                'Heat shrink tubing',
                'Electrical tape',
                'Wire connectors',
                'Dielectric grease'
              ],
              tools: [
                'Wire strippers',
                'Soldering iron',
                'Heat gun',
                'Multimeter',
                'Crimping tool'
              ],
              difficulty: 'hard',
              estimatedTime: '4-6 hours',
              cost: 150,
              status: 'planned',
              notes: 'Focus on CPS and MAF sensor circuits first',
              tags: ['electrical', 'repair', 'harness'],
              dimensions: 'Wire gauge: 18AWG, Length: 2m'
            },
            {
              id: '3',
              title: 'Rear Glass Replacement',
              category: 'repair',
              description: 'Replace damaged rear windshield with proper sealing',
              steps: [
                'Remove interior trim panels',
                'Cut out old glass and sealant',
                'Clean frame thoroughly',
                'Apply new urethane sealant',
                'Install new glass',
                'Reinstall trim and test'
              ],
              materials: [
                'Rear windshield glass',
                'Urethane sealant',
                'Primer',
                'Trim clips',
                'Weather stripping'
              ],
              tools: [
                'Glass cutting wire',
                'Sealant gun',
                'Trim removal tools',
                'Vacuum cups',
                'Safety glasses'
              ],
              difficulty: 'hard',
              estimatedTime: '6-8 hours',
              cost: 400,
              status: 'completed',
              notes: 'Glass dimensions: 1414 x 889 x 928 mm. Used temporary seal initially.',
              tags: ['glass', 'bodywork', 'repair'],
              dimensions: 'Glass: 1414 x 889 x 928 mm'
            }
          ];
          
          set({ blueprints: seedBlueprints });
        }

        if (currentDimensions.length === 0) {
          const seedDimensions: Dimension[] = [
            {
              id: '1',
              name: 'Overall Length',
              category: 'vehicle',
              measurement: 4765,
              unit: 'mm',
              description: 'Total vehicle length from front bumper to rear bumper',
              reference: 'VW Official Specs',
              verified: true,
              tags: ['exterior', 'body']
            },
            {
              id: '2',
              name: 'Overall Width',
              category: 'vehicle',
              measurement: 1820,
              unit: 'mm',
              description: 'Total vehicle width including mirrors',
              reference: 'VW Official Specs',
              verified: true,
              tags: ['exterior', 'body']
            },
            {
              id: '3',
              name: 'Overall Height',
              category: 'vehicle',
              measurement: 1472,
              unit: 'mm',
              description: 'Total vehicle height from ground to roof',
              reference: 'VW Official Specs',
              verified: true,
              tags: ['exterior', 'body']
            },
            {
              id: '4',
              name: 'Wheelbase',
              category: 'vehicle',
              measurement: 2709,
              unit: 'mm',
              description: 'Distance between front and rear axle centers',
              reference: 'VW Official Specs',
              verified: true,
              tags: ['chassis', 'suspension']
            },
            {
              id: '5',
              name: 'Rear Glass Width',
              category: 'glass',
              measurement: 1414,
              unit: 'mm',
              description: 'Width of rear windshield glass',
              reference: 'Measured during replacement',
              verified: true,
              notes: 'Measured during glass replacement project',
              tags: ['glass', 'bodywork']
            },
            {
              id: '6',
              name: 'Rear Glass Height',
              category: 'glass',
              measurement: 889,
              unit: 'mm',
              description: 'Height of rear windshield glass',
              reference: 'Measured during replacement',
              verified: true,
              notes: 'Measured during glass replacement project',
              tags: ['glass', 'bodywork']
            },
            {
              id: '7',
              name: 'Rear Glass Depth',
              category: 'glass',
              measurement: 928,
              unit: 'mm',
              description: 'Depth/curve of rear windshield glass',
              reference: 'Measured during replacement',
              verified: true,
              notes: 'Critical for proper fitment',
              tags: ['glass', 'bodywork']
            },
            {
              id: '8',
              name: 'Engine Bay Width',
              category: 'engine',
              measurement: 1200,
              unit: 'mm',
              description: 'Available width in engine bay for modifications',
              reference: 'Manual measurement',
              verified: false,
              notes: 'Approximate measurement for turbo clearance',
              tags: ['engine', 'modification']
            },
            {
              id: '9',
              name: 'Turbo Clearance Height',
              category: 'engine',
              measurement: 180,
              unit: 'mm',
              description: 'Available height clearance for turbo installation',
              reference: 'K04 installation planning',
              verified: false,
              notes: 'Need to verify during K04 install',
              tags: ['turbo', 'modification']
            },
            {
              id: '10',
              name: 'Interior Headroom',
              category: 'interior',
              measurement: 990,
              unit: 'mm',
              description: 'Front seat headroom measurement',
              reference: 'VW Official Specs',
              verified: true,
              tags: ['interior', 'comfort']
            }
          ];

          set({ dimensions: seedDimensions });
        }
      },
    }),
    {
      name: 'blueprint-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);