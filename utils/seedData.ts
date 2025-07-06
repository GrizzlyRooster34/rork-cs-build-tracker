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
  useMaintenanceStore.getState().initializeWithSeedData();
  useModificationsStore.getState().initializeWithSeedData();
  useDiagnosticsStore.getState().initializeWithSeedData();
  useFuelStore.getState().initializeWithSeedData();
  useGalleryStore.getState().initializeWithSeedData();
  useAudioStore.getState().initializeWithSeedData();
  useCrashStore.getState().initializeWithSeedData();
  useBlueprintStore.getState().initializeWithSeedData();
  useLightingStore.getState().initializeData();
};

/**
 * Check if any store has data (to determine if we should seed)
 */
export const hasExistingData = () => {
  const maintenanceEntries = useMaintenanceStore.getState().entries || [];
  const modifications = useModificationsStore.getState().modifications || [];
  const diagnosticCodes = useDiagnosticsStore.getState().codes || [];
  const fuelEntries = useFuelStore.getState().entries || [];
  const photos = useGalleryStore.getState().photos || [];
  const audioComponents = useAudioStore.getState().components || [];
  const crashEntries = useCrashStore.getState().entries || [];
  const blueprints = useBlueprintStore.getState().blueprints || [];
  const blueprintStore = useBlueprintStore.getState();
  const dimensions = blueprintStore.dimensions || [];
  const lightingPlans = useLightingStore.getState().plans || [];
  
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