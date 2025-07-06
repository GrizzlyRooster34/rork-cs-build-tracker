import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Event } from '@/types';

interface EventState {
  events: Event[];
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  getEventsByType: (type: Event['type']) => Event[];
  getEventsByTag: (tag: string) => Event[];
  getRecentEvents: (limit?: number) => Event[];
}

export const useEventStore = create<EventState>()(
  persist(
    (set, get) => ({
      events: [],
      
      addEvent: (event) => 
        set((state) => ({ 
          events: [
            ...state.events, 
            { ...event, id: Date.now().toString() }
          ] 
        })),
      
      updateEvent: (id, updatedEvent) => 
        set((state) => ({ 
          events: state.events.map(event => 
            event.id === id ? { ...event, ...updatedEvent } : event
          ) 
        })),
      
      deleteEvent: (id) => 
        set((state) => ({ 
          events: state.events.filter(event => event.id !== id) 
        })),
      
      getEventsByType: (type) => {
        return get().events.filter(event => event.type === type);
      },
      
      getEventsByTag: (tag) => {
        return get().events.filter(event => event.tags.includes(tag));
      },
      
      getRecentEvents: (limit = 10) => {
        return get().events
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, limit);
      },
    }),
    {
      name: 'event-data',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);