import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Reminder } from '@/types';

interface ReminderState {
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  updateReminder: (id: string, reminder: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  completeReminder: (id: string) => void;
  getActiveReminders: () => Reminder[];
  getDueReminders: (currentMileage: number) => Reminder[];
}

export const useReminderStore = create<ReminderState>()(
  persist(
    (set, get) => ({
      reminders: [],
      
      addReminder: (reminder) => 
        set((state) => ({ 
          reminders: [
            ...state.reminders, 
            { ...reminder, id: Date.now().toString() }
          ] 
        })),
      
      updateReminder: (id, updatedReminder) => 
        set((state) => ({ 
          reminders: state.reminders.map(reminder => 
            reminder.id === id ? { ...reminder, ...updatedReminder } : reminder
          ) 
        })),
      
      deleteReminder: (id) => 
        set((state) => ({ 
          reminders: state.reminders.filter(reminder => reminder.id !== id) 
        })),
      
      completeReminder: (id) => 
        set((state) => ({ 
          reminders: state.reminders.map(reminder => 
            reminder.id === id ? { ...reminder, completed: true } : reminder
          ) 
        })),
      
      getActiveReminders: () => {
        return get().reminders.filter(reminder => !reminder.completed);
      },
      
      getDueReminders: (currentMileage) => {
        const now = new Date();
        return get().reminders.filter(reminder => {
          if (reminder.completed) return false;
          
          if (reminder.triggerType === 'mileage') {
            return currentMileage >= Number(reminder.triggerValue);
          } else {
            const triggerDate = new Date(reminder.triggerValue);
            return now >= triggerDate;
          }
        });
      },
    }),
    {
      name: 'reminder-data',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);