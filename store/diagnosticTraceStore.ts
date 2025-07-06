import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DiagnosticTrace } from '@/types';

interface DiagnosticTraceState {
  traces: DiagnosticTrace[];
  addTrace: (trace: Omit<DiagnosticTrace, 'id'>) => void;
  updateTrace: (id: string, trace: Partial<DiagnosticTrace>) => void;
  deleteTrace: (id: string) => void;
  completeTrace: (id: string) => void;
}

export const useDiagnosticTraceStore = create<DiagnosticTraceState>()(
  persist(
    (set) => ({
      traces: [],
      
      addTrace: (trace) => 
        set((state) => ({ 
          traces: [
            ...state.traces, 
            { ...trace, id: Date.now().toString() }
          ] 
        })),
      
      updateTrace: (id, updatedTrace) => 
        set((state) => ({ 
          traces: state.traces.map(trace => 
            trace.id === id ? { ...trace, ...updatedTrace } : trace
          ) 
        })),
      
      deleteTrace: (id) => 
        set((state) => ({ 
          traces: state.traces.filter(trace => trace.id !== id) 
        })),
      
      completeTrace: (id) => 
        set((state) => ({ 
          traces: state.traces.map(trace => 
            trace.id === id ? { ...trace, completed: true } : trace
          ) 
        })),
    }),
    {
      name: 'diagnostic-trace-data',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);