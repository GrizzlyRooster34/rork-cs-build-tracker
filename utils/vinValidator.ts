export const validateVIN = (vin: string): boolean => {
  // Basic VIN validation - 17 characters, alphanumeric except I, O, Q
  if (!vin || vin.length !== 17) {
    return false;
  }
  
  // VINs should not contain I, O, or Q
  if (/[IOQ]/.test(vin)) {
    return false;
  }
  
  // Check for valid characters (A-Z, 0-9 except I, O, Q)
  const validVINPattern = /^[A-HJ-NPR-Z0-9]{17}$/;
  return validVINPattern.test(vin);
};

export const formatVIN = (vin: string): string => {
  // Format VIN to uppercase and remove any spaces
  return vin.toUpperCase().replace(/\s/g, '');
};

export const getVINInfo = (vin: string): { year?: number; make?: string; model?: string } => {
  // This is a simplified version - in a real app, you would call an API
  // For now, we'll just check if it's a VW Passat B6
  if (validateVIN(vin) && vin.substring(0, 3) === 'WVW') {
    return {
      year: 2008,
      make: 'Volkswagen',
      model: 'Passat',
    };
  }
  
  return {};
};