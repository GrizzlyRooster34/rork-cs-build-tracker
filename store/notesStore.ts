import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note } from '@/types';

interface NotesState {
  notes: Note[];
  addNote: (note: Omit<Note, 'id'>) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set) => ({
      notes: [],
      
      addNote: (note) => 
        set((state) => ({ 
          notes: [
            ...state.notes, 
            { ...note, id: Date.now().toString() }
          ] 
        })),
      
      updateNote: (id, updatedNote) => 
        set((state) => ({ 
          notes: state.notes.map(note => 
            note.id === id ? { ...note, ...updatedNote } : note
          ) 
        })),
      
      deleteNote: (id) => 
        set((state) => ({ 
          notes: state.notes.filter(note => note.id !== id) 
        })),
    }),
    {
      name: 'notes-data',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);