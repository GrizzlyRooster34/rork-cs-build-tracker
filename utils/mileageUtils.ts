// Utility functions for mileage calculations and formatting

export const MILEAGE_OFFSET = 67200;

export const calculateActualMileage = (clusterMileage: number): number => {
  return clusterMileage + MILEAGE_OFFSET;
};

export const calculateClusterMileage = (actualMileage: number): number => {
  return actualMileage - MILEAGE_OFFSET;
};

export const formatMileage = (mileage: number): string => {
  return mileage.toLocaleString();
};

export const validateMileage = (mileage: number): boolean => {
  return !isNaN(mileage) && mileage >= 0 && mileage <= 999999;
};

export const getMileageDifference = (currentMileage: number, previousMileage: number): number => {
  return Math.max(0, currentMileage - previousMileage);
};

export const estimateNextService = (
  currentMileage: number, 
  serviceInterval: number, 
  lastServiceMileage: number
): number => {
  const mileageSinceService = currentMileage - lastServiceMileage;
  const remainingMiles = serviceInterval - (mileageSinceService % serviceInterval);
  return currentMileage + remainingMiles;
};

export const isServiceDue = (
  currentMileage: number,
  serviceInterval: number,
  lastServiceMileage: number,
  tolerance: number = 500
): boolean => {
  const mileageSinceService = currentMileage - lastServiceMileage;
  return mileageSinceService >= (serviceInterval - tolerance);
};