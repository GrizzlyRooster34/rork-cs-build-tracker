// Common types for the CS Build Tracker app

export type MaintenanceCategory = 
  | 'engine'
  | 'suspension'
  | 'electrical'
  | 'exterior'
  | 'interior'
  | 'lighting'
  | 'performance'
  | 'other';

export type MaintenancePriority = 'critical' | 'routine' | 'planned';

export type MaintenanceEntry = {
  id: string;
  date: string;
  mileage: number;
  category: MaintenanceCategory;
  title: string;
  description: string;
  parts: string[];
  cost: number;
  priority: MaintenancePriority;
  completed: boolean;
  tags: string[];
  photos: string[];
};

export type ModificationStage = 0 | 1 | 2 | 3;

export type ModificationStatus = 'planned' | 'ordered' | 'in-progress' | 'completed';

export type PartSource = 'oem' | 'aftermarket' | 'junkyard' | 'custom' | 'ecs' | 'amazon' | 'ebay';

export type Modification = {
  id: string;
  title: string;
  description: string;
  stage: ModificationStage;
  system: MaintenanceCategory;
  status: ModificationStatus;
  parts: Part[];
  cost: number;
  installDate?: string;
  notes: string;
  priority: number;
  tags: string[];
  photos: string[];
};

export type Part = {
  id: string;
  name: string;
  partNumber: string;
  source: PartSource;
  compatibility: string[];
  location: string;
  condition: 'new' | 'used' | 'refurbished';
  installed: boolean;
  cost: number;
  purchaseDate?: string;
  notes: string;
  url?: string;
  tags: string[];
};

export type DiagnosticCode = {
  id: string;
  code: string;
  description: string;
  date: string;
  mileage: number;
  active: boolean;
  freezeFrameData?: string;
  notes: string;
  resolved: boolean;
  resolvedDate?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  system: MaintenanceCategory;
  tags: string[];
};

export type DiagnosticTrace = {
  id: string;
  title: string;
  system: MaintenanceCategory;
  date: string;
  mileage: number;
  steps: DiagnosticStep[];
  completed: boolean;
  notes: string;
  tags: string[];
};

export type DiagnosticStep = {
  id: string;
  description: string;
  expected: string;
  actual: string;
  passed: boolean;
  notes: string;
};

export type FuelEntry = {
  id: string;
  date: string;
  mileage: number;
  gallons: number;
  octane: 87 | 89 | 91 | 93;
  cost: number;
  fullTank: boolean;
  mpg?: number;
  notes: string;
  performanceNotes: string;
  tags: string[];
};

export type PhotoEntry = {
  id: string;
  url: string;
  date: string;
  title: string;
  tags: string[];
  description: string;
  category: 'mod' | 'lighting' | 'aesthetic' | 'diagnostic' | 'maintenance';
  version?: string;
};

export type LightingPlan = {
  id: string;
  title: string;
  description: string;
  components: string[];
  wiring: string;
  controller: string;
  status: ModificationStatus;
  notes: string;
  syncMode: 'music' | 'boost' | 'manual' | 'off';
  tags: string[];
};

export type Note = {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  mileage?: number;
  category: 'journal' | 'tuning' | 'route-test' | 'idea' | 'reminder';
};

export type Reminder = {
  id: string;
  title: string;
  description: string;
  triggerType: 'mileage' | 'date';
  triggerValue: number | string;
  completed: boolean;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  tags: string[];
};

export type CarMode = 'daily' | 'show';

export type CarProfile = {
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  engine: string;
  transmission: string;
  color: string;
  purchaseDate: string;
  purchaseMileage: number;
  clusterMileage: number;
  actualMileage: number;
  mileageOffset: number;
  currentMode: CarMode;
  nickname: string;
};

export type Event = {
  id: string;
  type: 'maintenance' | 'fuel' | 'diagnostic' | 'modification' | 'note' | 'photo';
  title: string;
  date: string;
  mileage: number;
  category?: MaintenanceCategory;
  priority?: MaintenancePriority;
  tags: string[];
  relatedId: string; // ID of the related entry
};