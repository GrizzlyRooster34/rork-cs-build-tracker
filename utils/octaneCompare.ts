// Utility functions for fuel octane analysis and comparison

import { FuelEntry } from '@/types';

export interface OctaneStats {
  octane: number;
  count: number;
  totalGallons: number;
  avgMPG: number;
  avgCost: number;
  totalCost: number;
  performanceRating: number;
}

export const analyzeOctanePerformance = (fuelEntries: FuelEntry[]): OctaneStats[] => {
  const octaneGroups = fuelEntries.reduce((groups, entry) => {
    if (!groups[entry.octane]) {
      groups[entry.octane] = [];
    }
    groups[entry.octane].push(entry);
    return groups;
  }, {} as Record<number, FuelEntry[]>);

  return Object.entries(octaneGroups).map(([octane, entries]) => {
    const validMPGEntries = entries.filter(entry => entry.mpg !== undefined);
    const avgMPG = validMPGEntries.length > 0
      ? validMPGEntries.reduce((sum, entry) => sum + (entry.mpg || 0), 0) / validMPGEntries.length
      : 0;

    const totalGallons = entries.reduce((sum, entry) => sum + entry.gallons, 0);
    const totalCost = entries.reduce((sum, entry) => sum + (entry.gallons * entry.cost), 0);
    const avgCost = totalGallons > 0 ? totalCost / totalGallons : 0;

    // Simple performance rating based on MPG and subjective performance notes
    const performanceNotes = entries.filter(entry => entry.performanceNotes.length > 0);
    const performanceRating = calculatePerformanceRating(avgMPG, performanceNotes);

    return {
      octane: Number(octane),
      count: entries.length,
      totalGallons,
      avgMPG,
      avgCost,
      totalCost,
      performanceRating,
    };
  }).sort((a, b) => a.octane - b.octane);
};

export const calculatePerformanceRating = (avgMPG: number, performanceNotes: FuelEntry[]): number => {
  // Base rating from MPG (0-5 scale)
  let rating = Math.min(5, Math.max(0, (avgMPG - 20) / 5));

  // Adjust based on performance notes sentiment
  performanceNotes.forEach(entry => {
    const notes = entry.performanceNotes.toLowerCase();
    if (notes.includes('smooth') || notes.includes('responsive') || notes.includes('good')) {
      rating += 0.5;
    }
    if (notes.includes('rough') || notes.includes('knock') || notes.includes('poor')) {
      rating -= 0.5;
    }
  });

  return Math.min(5, Math.max(0, rating));
};

export const getOptimalOctane = (octaneStats: OctaneStats[]): number => {
  if (octaneStats.length === 0) return 91;

  // Find the octane with the best balance of MPG and performance rating
  const scored = octaneStats.map(stat => ({
    octane: stat.octane,
    score: (stat.avgMPG * 0.6) + (stat.performanceRating * 0.4),
  }));

  return scored.reduce((best, current) => 
    current.score > best.score ? current : best
  ).octane;
};

export const calculateCostEfficiency = (octaneStats: OctaneStats[]): OctaneStats[] => {
  return octaneStats.map(stat => ({
    ...stat,
    costPerMile: stat.avgMPG > 0 ? stat.avgCost / stat.avgMPG : 0,
  }));
};

export const getFuelRecommendation = (octaneStats: OctaneStats[]): string => {
  if (octaneStats.length === 0) return "Add more fuel entries for recommendations";

  const optimal = getOptimalOctane(octaneStats);
  const optimalStats = octaneStats.find(stat => stat.octane === optimal);

  if (!optimalStats) return "Unable to determine recommendation";

  return `Based on ${optimalStats.count} fill-ups, ${optimal} octane provides the best balance of efficiency (${optimalStats.avgMPG.toFixed(1)} MPG) and performance (${optimalStats.performanceRating.toFixed(1)}/5).`;
};