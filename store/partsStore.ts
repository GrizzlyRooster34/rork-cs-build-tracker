import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Part } from '@/types';

interface PartsState {
  parts: Part[];
  addPart: (part: Omit<Part, 'id'>) => void;
  updatePart: (id: string, part: Partial<Part>) => void;
  deletePart: (id: string) => void;
  toggleInstalled: (id: string) => void;
}

export const usePartsStore = create<PartsState>()(
  persist(
    (set) => ({
      parts: [],
      
      addPart: (part) => 
        set((state) => ({ 
          parts: [
            ...state.parts, 
            { ...part, id: Date.now().toString() }
          ] 
        })),
      
      updatePart: (id, updatedPart) => 
        set((state) => ({ 
          parts: state.parts.map(part => 
            part.id === id ? { ...part, ...updatedPart } : part
          ) 
        })),
      
      deletePart: (id) => 
        set((state) => ({ 
          parts: state.parts.filter(part => part.id !== id) 
        })),
      
      toggleInstalled: (id) => 
        set((state) => ({ 
          parts: state.parts.map(part => 
            part.id === id ? { ...part, installed: !part.installed } : part
          ) 
        })),
    }),
    {
      name: 'parts-data',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);