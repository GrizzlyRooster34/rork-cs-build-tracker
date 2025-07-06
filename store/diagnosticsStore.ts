import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DiagnosticCode } from '@/types';

interface DiagnosticsState {
  codes: DiagnosticCode[];
  addCode: (code: Omit<DiagnosticCode, 'id'>) => void;
  updateCode: (id: string, code: Partial<DiagnosticCode>) => void;
  deleteCode: (id: string) => void;
  toggleResolved: (id: string) => void;
  toggleActive: (id: string) => void;
  initializeWithSeedData: () => void;
}

// Seed data for known DTCs on the VW Passat B6 (BPY 2.0T FSI)
const seedDiagnosticData: Omit<DiagnosticCode, 'id'>[] = [
  {
    code: 'P0341',
    description: 'Camshaft Position Sensor (Bank 1) - Range/Performance Problem',
    date: '2023-12-01',
    mileage: 274272,
    active: true,
    freezeFrameData: 'RPM: 1720, Load: 14.3%, Throttle: 4.3°, Ignition: 7.5°, Coolant: 89°C',
    notes: 'Appeared after cam chain service. Possible timing issue or sensor failure. Using OBDeleven for monitoring.',
    resolved: false,
    severity: 'high',
    system: 'engine',
    tags: ['cps', 'timing', 'cam-chain', 'obdeleven']
  },
  {
    code: 'P0100',
    description: 'Mass Air Flow Circuit Malfunction',
    date: '2023-12-01',
    mileage: 274272,
    active: true,
    freezeFrameData: 'RPM: 1720, Load: 14.3%, MAF: 0.00 g/s, Throttle: 4.3°',
    notes: 'MAF sensor showing no signal. Possible wiring issue or sensor failure. Needs circuit trace.',
    resolved: false,
    severity: 'high',
    system: 'engine',
    tags: ['maf', 'airflow', 'sensor', 'circuit']
  },
  {
    code: 'P1302',
    description: 'Cylinder 2 - Ignition Circuit Open',
    date: '2023-12-01',
    mileage: 274272,
    active: true,
    freezeFrameData: 'RPM: 1720, Load: 14.3%, Cyl 2 Misfire Count: 15',
    notes: 'Open circuit in cylinder 2 ignition. New coil pack installed but issue persists. Wiring harness suspect.',
    resolved: false,
    severity: 'high',
    system: 'electrical',
    tags: ['cylinder-2', 'ignition', 'open-circuit', 'harness']
  },
  {
    code: 'P0300',
    description: 'Random/Multiple Cylinder Misfire Detected',
    date: '2023-12-01',
    mileage: 274272,
    active: true,
    freezeFrameData: 'RPM: 1720, Load: 14.3%, Total Misfire Count: 45',
    notes: 'Random misfires across multiple cylinders. Related to P0341, P0100, and P1302. All appeared post cam chain service.',
    resolved: false,
    severity: 'critical',
    system: 'engine',
    tags: ['misfire', 'random', 'multiple', 'post-service']
  },
  {
    code: 'P0016',
    description: 'Crankshaft Position - Camshaft Position Correlation (Bank 1)',
    date: '2024-01-15',
    mileage: 275500,
    active: false,
    freezeFrameData: 'RPM: 850, Load: 0%, Cam Advance: -5.5°',
    notes: 'Timing correlation error. Resolved after cam chain tensioner adjustment.',
    resolved: true,
    resolvedDate: '2024-01-20',
    severity: 'high',
    system: 'engine',
    tags: ['timing', 'correlation', 'resolved', 'tensioner']
  },
  {
    code: 'P0299',
    description: 'Turbocharger/Supercharger A Underboost Condition',
    date: '2023-03-10',
    mileage: 270500,
    active: false,
    freezeFrameData: 'Boost Pressure: 0.8 bar, Requested: 1.2 bar, RPM: 3000',
    notes: 'Resolved with Rev D diverter valve installation. Boost leak eliminated.',
    resolved: true,
    resolvedDate: '2023-03-15',
    severity: 'high',
    system: 'engine',
    tags: ['boost', 'turbo', 'resolved', 'dv']
  }
];

export const useDiagnosticsStore = create<DiagnosticsState>()(
  persist(
    (set, get) => ({
      codes: [],
      
      addCode: (code) => 
        set((state) => ({ 
          codes: [
            ...state.codes, 
            { ...code, id: Date.now().toString() }
          ] 
        })),
      
      updateCode: (id, updatedCode) => 
        set((state) => ({ 
          codes: state.codes.map(code => 
            code.id === id ? { ...code, ...updatedCode } : code
          ) 
        })),
      
      deleteCode: (id) => 
        set((state) => ({ 
          codes: state.codes.filter(code => code.id !== id) 
        })),
      
      toggleResolved: (id) => 
        set((state) => ({ 
          codes: state.codes.map(code => 
            code.id === id ? 
              { 
                ...code, 
                resolved: !code.resolved,
                resolvedDate: !code.resolved ? new Date().toISOString() : undefined
              } : code
          ) 
        })),
      
      toggleActive: (id) => 
        set((state) => ({ 
          codes: state.codes.map(code => 
            code.id === id ? { ...code, active: !code.active } : code
          ) 
        })),
      
      initializeWithSeedData: () => {
        const currentCodes = get().codes;
        if (currentCodes.length === 0) {
          const codesWithIds = seedDiagnosticData.map((code, index) => ({
            ...code,
            id: `seed-dtc-${index}`
          }));
          set({ codes: codesWithIds });
        }
      },
    }),
    {
      name: 'diagnostics-data',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);