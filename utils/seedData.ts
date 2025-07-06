import { useMaintenanceStore } from '@/store/maintenanceStore';
import { useModificationsStore } from '@/store/modificationsStore';
import { useDiagnosticsStore } from '@/store/diagnosticsStore';
import { useFuelStore } from '@/store/fuelStore';
import { useGalleryStore } from '@/store/galleryStore';
import { useAudioStore } from '@/store/audioStore';
import { useCrashStore } from '@/store/crashStore';
import { useBlueprintStore } from '@/store/blueprintStore';
import { useLightingStore } from '@/store/lightingStore';

/**
 * Initialize all stores with seed data for the VW Passat B6 project
 * This should be called once when the app starts
 */
export const initializeSeedData = () => {
  // Initialize all stores with seed data
  const maintenanceStore = useMaintenanceStore.getState();
  const modificationsStore = useModificationsStore.getState();
  const diagnosticsStore = useDiagnosticsStore.getState();
  const fuelStore = useFuelStore.getState();
  const galleryStore = useGalleryStore.getState();
  const audioStore = useAudioStore.getState();
  const crashStore = useCrashStore.getState();
  const blueprintStore = useBlueprintStore.getState();
  const lightingStore = useLightingStore.getState();

  // Only initialize if the methods exist
  if (maintenanceStore.initializeWithSeedData) {
    maintenanceStore.initializeWithSeedData();
  }
  if (modificationsStore.initializeWithSeedData) {
    modificationsStore.initializeWithSeedData();
  }
  if (diagnosticsStore.initializeWithSeedData) {
    diagnosticsStore.initializeWithSeedData();
  }
  if (fuelStore.initializeWithSeedData) {
    fuelStore.initializeWithSeedData();
  }
  if (galleryStore.initializeWithSeedData) {
    galleryStore.initializeWithSeedData();
  }
  if (audioStore.initializeWithSeedData) {
    audioStore.initializeWithSeedData();
  }
  if (crashStore.initializeWithSeedData) {
    crashStore.initializeWithSeedData();
  }
  if (blueprintStore.initializeWithSeedData) {
    blueprintStore.initializeWithSeedData();
  }
  if (lightingStore.initializeData) {
    lightingStore.initializeData();
  }
};

/**
 * Check if any store has data (to determine if we should seed)
 */
export const hasExistingData = () => {
  const maintenanceStore = useMaintenanceStore.getState();
  const modificationsStore = useModificationsStore.getState();
  const diagnosticsStore = useDiagnosticsStore.getState();
  const fuelStore = useFuelStore.getState();
  const galleryStore = useGalleryStore.getState();
  const audioStore = useAudioStore.getState();
  const crashStore = useCrashStore.getState();
  const blueprintStore = useBlueprintStore.getState();
  const lightingStore = useLightingStore.getState();

  const maintenanceEntries = maintenanceStore.entries || [];
  const modifications = modificationsStore.modifications || [];
  const diagnosticCodes = diagnosticsStore.codes || [];
  const fuelEntries = fuelStore.entries || [];
  const photos = galleryStore.photos || [];
  const audioComponents = audioStore.components || [];
  const crashEntries = crashStore.entries || [];
  const blueprints = blueprintStore.blueprints || [];
  const dimensions = blueprintStore.dimensions || [];
  const lightingPlans = lightingStore.plans || [];
  
  return (
    maintenanceEntries.length > 0 ||
    modifications.length > 0 ||
    diagnosticCodes.length > 0 ||
    fuelEntries.length > 0 ||
    photos.length > 0 ||
    audioComponents.length > 0 ||
    crashEntries.length > 0 ||
    blueprints.length > 0 ||
    dimensions.length > 0 ||
    lightingPlans.length > 0
  );
};