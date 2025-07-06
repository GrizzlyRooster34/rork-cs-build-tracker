import { Platform } from 'react-native';

// Web-compatible clipboard functions
const webCopyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      textArea.remove();
      return result;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

const webGetFromClipboard = async (): Promise<string> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      return await navigator.clipboard.readText();
    }
    return '';
  } catch (error) {
    console.error('Failed to read from clipboard:', error);
    return '';
  }
};

// Native clipboard functions
const nativeCopyToClipboard = async (text: string): Promise<boolean> => {
  try {
    const { setStringAsync } = await import('expo-clipboard');
    await setStringAsync(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

const nativeGetFromClipboard = async (): Promise<string> => {
  try {
    const { getStringAsync } = await import('expo-clipboard');
    return await getStringAsync();
  } catch (error) {
    console.error('Failed to read from clipboard:', error);
    return '';
  }
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return await webCopyToClipboard(text);
  } else {
    return await nativeCopyToClipboard(text);
  }
};

export const getFromClipboard = async (): Promise<string> => {
  if (Platform.OS === 'web') {
    return await webGetFromClipboard();
  } else {
    return await nativeGetFromClipboard();
  }
};

export const copyDiagnosticData = async (code: string, description: string, freezeFrame?: string): Promise<boolean> => {
  const data = [
    `DTC: ${code}`,
    `Description: ${description}`,
    freezeFrame ? `Freeze Frame: ${freezeFrame}` : '',
    `Exported from CS Build Tracker - ${new Date().toLocaleDateString()}`
  ].filter(Boolean).join('\n');

  return await copyToClipboard(data);
};

export const copyMaintenanceRecord = async (title: string, date: string, mileage: number, parts: string[], cost: number): Promise<boolean> => {
  const data = [
    `Maintenance: ${title}`,
    `Date: ${date}`,
    `Mileage: ${mileage.toLocaleString()} mi`,
    parts.length > 0 ? `Parts: ${parts.join(', ')}` : '',
    `Cost: $${cost.toFixed(2)}`,
    `Exported from CS Build Tracker - ${new Date().toLocaleDateString()}`
  ].filter(Boolean).join('\n');

  return await copyToClipboard(data);
};

export const copyFuelData = async (entries: any[]): Promise<boolean> => {
  const data = [
    'Fuel Log Export',
    '==================',
    ...entries.map(entry => 
      `${entry.date} | ${entry.gallons.toFixed(2)}gal | ${entry.octane} octane | $${entry.cost.toFixed(2)}/gal | ${entry.mpg?.toFixed(1) || 'N/A'} MPG`
    ),
    '',
    `Exported from CS Build Tracker - ${new Date().toLocaleDateString()}`
  ].join('\n');

  return await copyToClipboard(data);
};