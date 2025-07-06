import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PhotoEntry } from '@/types';

interface GalleryState {
  photos: PhotoEntry[];
  addPhoto: (photo: Omit<PhotoEntry, 'id'>) => void;
  updatePhoto: (id: string, photo: Partial<PhotoEntry>) => void;
  deletePhoto: (id: string) => void;
  initializeWithSeedData: () => void;
}

// Seed data for project photos - VW Passat B6 (BPY 2.0T FSI) project
const seedPhotoData: Omit<PhotoEntry, 'id'>[] = [
  {
    url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800',
    date: '2024-03-15',
    title: 'Front Lighting v3 - R36 Headlights',
    tags: ['r36', 'headlights', 'drl', 'front'],
    description: 'R36-style headlights with integrated DRL strips, dramatic improvement over stock',
    category: 'lighting',
    version: 'v3'
  },
  {
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    date: '2024-02-10',
    title: 'Underglow v1 - Purple RGB System',
    tags: ['underglow', 'rgb', 'purple', 'music-sync'],
    description: 'Initial underglow installation with music sync capability, boost sync planned',
    category: 'lighting',
    version: 'v1'
  },
  {
    url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
    date: '2023-09-15',
    title: 'Rear End - GTI Spoiler & Smoked Lights',
    tags: ['rear', 'spoiler', 'gti', 'smoked', 'taillights'],
    description: 'Complete rear transformation with GTI spoiler and smoked tail lights',
    category: 'aesthetic'
  },
  {
    url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800',
    date: '2024-01-20',
    title: 'Post-Crash Rear Rebuild Progress',
    tags: ['crash', 'rebuild', 'bodywork', 'rear'],
    description: 'Rear end rebuild progress after spinout incident',
    category: 'maintenance'
  },
  {
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
    date: '2024-05-10',
    title: 'Front Crash Damage Assessment',
    tags: ['crash', 'front', 'damage', 'assessment'],
    description: 'Front end damage: driver fender, hood, bumper, headlight. Using 2009 donor parts.',
    category: 'maintenance'
  },
  {
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    date: '2023-11-15',
    title: 'Cam Chain Service Documentation',
    tags: ['cam-chain', 'timing', 'service', 'engine'],
    description: 'Complete cam chain replacement with tensioner and guides',
    category: 'maintenance'
  },
  {
    url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800',
    date: '2024-02-10',
    title: 'White LED Grille Outline',
    tags: ['grille', 'led', 'white', 'accent'],
    description: 'Custom white LED strip outlining the grille opening, wired to parking lights',
    category: 'lighting'
  },
  {
    url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800',
    date: '2023-08-05',
    title: 'Audio System - Kicker Components',
    tags: ['audio', 'kicker', 'speakers', 'system'],
    description: 'Kicker CS speakers, Power Acoustik tweets, Kicker CVT sub, 2 amps',
    category: 'mod'
  },
  {
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800',
    date: '2024-06-20',
    title: 'Vehicle Dimensions Reference',
    tags: ['dimensions', 'blueprint', 'reference'],
    description: 'Rear glass dims: 1414 x 889 x 928 mm. Vehicle: 4765 x 1820 x 1472 mm (2709 mm wheelbase)',
    category: 'diagnostic'
  },
  {
    url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800',
    date: '2023-12-01',
    title: 'OBDeleven Diagnostic Session',
    tags: ['obdeleven', 'diagnostic', 'dtc', 'freeze-frame'],
    description: 'Live data: 1720 RPM, 14.3% load, 4.3° throttle, 7.5° ignition. Active DTCs: P0341, P0100, P1302',
    category: 'diagnostic'
  }
];

export const useGalleryStore = create<GalleryState>()(
  persist(
    (set, get) => ({
      photos: [],
      
      addPhoto: (photo) => 
        set((state) => ({ 
          photos: [
            ...state.photos, 
            { ...photo, id: Date.now().toString() }
          ] 
        })),
      
      updatePhoto: (id, updatedPhoto) => 
        set((state) => ({ 
          photos: state.photos.map(photo => 
            photo.id === id ? { ...photo, ...updatedPhoto } : photo
          ) 
        })),
      
      deletePhoto: (id) => 
        set((state) => ({ 
          photos: state.photos.filter(photo => photo.id !== id) 
        })),
      
      initializeWithSeedData: () => {
        const currentPhotos = get().photos;
        if (currentPhotos.length === 0) {
          const photosWithIds = seedPhotoData.map((photo, index) => ({
            ...photo,
            id: `seed-photo-${index}`
          }));
          set({ photos: photosWithIds });
        }
      },
    }),
    {
      name: 'gallery-data',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);