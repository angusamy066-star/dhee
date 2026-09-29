import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errors';

export interface Animal {
  id: string;
  ownerId: string;
  tagNumber: string;
  species: 'cattle' | 'swine' | 'poultry' | 'sheep' | 'goat' | 'other';
  breed: string;
  ageMonths: number;
  penOrPasture: string;
  healthStatus: 'healthy' | 'monitoring' | 'quarantine' | 'critical';
  lastCheckup: string;
  temperature: number;
  ruminationMinutes: number;
  feedIntakePercent: number;
  activityIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface HealthReport {
  id: string;
  ownerId: string;
  animalTag: string;
  species: string;
  category: string;
  symptoms: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  suspectedDiseases: string;
  differentialDiagnosis: string;
  biosecurityAdvice: string;
  treatmentGuidance: string;
  zoonoticRisk: string;
  imageUrl?: string;
  createdAt: string;
}

export interface SensorAlert {
  id: string;
  ownerId: string;
  animalTag: string;
  sensorType: string;
  metric: string;
  currentValue: number;
  baselineValue: number;
  deviationPercent: number;
  flaggedIssue: string;
  leadTimeHours: number;
  status: 'new' | 'acknowledged' | 'resolved';
  createdAt: string;
}

export interface OutbreakWatch {
  id: string;
  ownerId: string;
  diseaseName: string;
  region: string;
  alertLevel: 'advisory' | 'warning' | 'quarantine' | 'emergency';
  summary: string;
  preventativeProtocol: string;
  createdAt: string;
}

// Initial realistic default data for instant exploration before sign in
export const DEFAULT_ANIMALS: Animal[] = [
  {
    id: 'cow-104',
    ownerId: 'default',
    tagNumber: 'USA-HOL-1042',
    species: 'cattle',
    breed: 'Holstein Dairy',
    ageMonths: 34,
    penOrPasture: 'Lactation Barn 2 - Bunk A',
    healthStatus: 'monitoring',
    lastCheckup: '2026-09-27',
    temperature: 39.4,
    ruminationMinutes: 380,
    feedIntakePercent: 78,
    activityIndex: 62,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'steer-209',
    ownerId: 'default',
    tagNumber: 'USA-ANG-2091',
    species: 'cattle',
    breed: 'Black Angus',
    ageMonths: 18,
    penOrPasture: 'North Feedlot Pen 4',
    healthStatus: 'quarantine',
    lastCheckup: '2026-09-28',
    temperature: 40.8,
    ruminationMinutes: 290,
    feedIntakePercent: 61,
    activityIndex: 44,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pig-331',
    ownerId: 'default',
    tagNumber: 'SWN-DRC-3310',
    species: 'swine',
    breed: 'Duroc Finisher',
    ageMonths: 7,
    penOrPasture: 'Grower Barn 3',
    healthStatus: 'healthy',
    lastCheckup: '2026-09-25',
    temperature: 39.1,
    ruminationMinutes: 0,
    feedIntakePercent: 96,
    activityIndex: 88,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sheep-402',
    ownerId: 'default',
    tagNumber: 'OVI-KAT-4028',
    species: 'sheep',
    breed: 'Katahdin Hair Sheep',
    ageMonths: 22,
    penOrPasture: 'South Hill Pasture',
    healthStatus: 'monitoring',
    lastCheckup: '2026-09-26',
    temperature: 39.8,
    ruminationMinutes: 440,
    feedIntakePercent: 82,
    activityIndex: 71,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'flock-512',
    ownerId: 'default',
    tagNumber: 'AVN-ROSS-512',
    species: 'poultry',
    breed: 'Ross 308 Broiler (House 2)',
    ageMonths: 1,
    penOrPasture: 'Poultry House 2',
    healthStatus: 'healthy',
    lastCheckup: '2026-09-28',
    temperature: 41.5,
    ruminationMinutes: 0,
    feedIntakePercent: 98,
    activityIndex: 92,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const DEFAULT_SENSOR_ALERTS: SensorAlert[] = [
  {
    id: 'alert-01',
    ownerId: 'default',
    animalTag: 'USA-HOL-1042',
    sensorType: 'Rumen Bolus & Neck Collar',
    metric: 'Rumination & Feed Bunk Time',
    currentValue: 380,
    baselineValue: 510,
    deviationPercent: -25.5,
    flaggedIssue: 'Rumination dropped 25.5% below baseline with sub-clinical temperature elevation (39.4°C). Indicative of early stage mastitis or subacute ruminal acidosis (SARA).',
    leadTimeHours: 32,
    status: 'new',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'alert-02',
    ownerId: 'default',
    animalTag: 'USA-ANG-2091',
    sensorType: 'Ear Tag Temp & Accelerometer',
    metric: 'Body Temp & Step Count',
    currentValue: 40.8,
    baselineValue: 38.6,
    deviationPercent: 5.7,
    flaggedIssue: 'High febrile spike (40.8°C) paired with 40% reduction in locomotion. High suspicion of Bovine Respiratory Disease Complex (BRDC / Shipping Fever).',
    leadTimeHours: 24,
    status: 'acknowledged',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'alert-03',
    ownerId: 'default',
    animalTag: 'OVI-KAT-4028',
    sensorType: 'Pasture Collar GPS & Thermal Cam',
    metric: 'Grazing Velocity & Ocular Temp',
    currentValue: 18,
    baselineValue: 35,
    deviationPercent: -48.6,
    flaggedIssue: 'Lethargy and pale ocular conjunctiva heat signature detected via automated waterer vision. Suspected Haemonchus contortus (Barber pole worm) parasitic burden.',
    leadTimeHours: 48,
    status: 'new',
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_OUTBREAK_WATCHES: OutbreakWatch[] = [
  {
    id: 'watch-01',
    ownerId: 'default',
    diseaseName: 'Foot-and-Mouth Disease (FMD) Serotype O',
    region: 'North Africa & Mediterranean Basin Border Corridors',
    alertLevel: 'warning',
    summary: 'High contagiousness affecting cloven-hoofed ruminants. Vesicular lesions on tongue, coronary bands, and teats causing severe salivation and sudden lameness.',
    preventativeProtocol: 'Strict quarantine on imported feed and live animals; 3% sodium hydroxide or 4% sodium carbonate disinfection of all transport vehicles.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'watch-02',
    ownerId: 'default',
    diseaseName: 'Highly Pathogenic Avian Influenza (HPAI H5N1 Clade 2.3.4.4b)',
    region: 'North America & Europe Wild Waterfowl Flyways & Dairy Herds',
    alertLevel: 'quarantine',
    summary: 'Cross-species transmission confirmed in commercial poultry and lactating dairy cattle with sudden drop in milk yield, thickened colostrum-like secretions, and lethargy.',
    preventativeProtocol: 'Mandatory PPE (respirators, goggles) for milk parlor workers. Pasteurization controls; wild bird exclusion netting over feed and water sources.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'watch-03',
    ownerId: 'default',
    diseaseName: 'African Swine Fever (ASF)',
    region: 'Central & Eastern Europe, Southeast Asia',
    alertLevel: 'emergency',
    summary: 'Viral hemorrhagic disease in domestic and wild pigs with mortality rates approaching 100%. No commercial vaccine widely approved. High fever, cyanotic ear tips, and splenic enlargement.',
    preventativeProtocol: 'Absolute prohibition of swill/waste feeding; perimeter double fencing to prevent wild boar contact; 30-day quarantine for all new breeding stock.',
    createdAt: new Date().toISOString(),
  },
];

// Helper to save Animal
export async function saveAnimal(animal: Animal): Promise<void> {
  const path = `animals/${animal.id}`;
  try {
    await setDoc(doc(db, 'animals', animal.id), animal);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Helper to delete Animal
export async function removeAnimal(animalId: string): Promise<void> {
  const path = `animals/${animalId}`;
  try {
    await deleteDoc(doc(db, 'animals', animalId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Helper to save HealthReport
export async function saveHealthReport(report: HealthReport): Promise<void> {
  const path = `healthReports/${report.id}`;
  try {
    await setDoc(doc(db, 'healthReports', report.id), report);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Helper to save SensorAlert
export async function saveSensorAlert(alert: SensorAlert): Promise<void> {
  const path = `sensorAlerts/${alert.id}`;
  try {
    await setDoc(doc(db, 'sensorAlerts', alert.id), alert);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Helper to save OutbreakWatch
export async function saveOutbreakWatch(watch: OutbreakWatch): Promise<void> {
  const path = `outbreakWatches/${watch.id}`;
  try {
    await setDoc(doc(db, 'outbreakWatches', watch.id), watch);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Subscribe to animals for a specific user
export function subscribeUserAnimals(
  userId: string,
  onUpdate: (animals: Animal[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, 'animals'), where('ownerId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Animal[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Animal);
      });
      onUpdate(list);
    },
    (error) => {
      if (onError) {
        try {
          handleFirestoreError(error, OperationType.LIST, 'animals');
        } catch (e) {
          onError(e as Error);
        }
      }
    }
  );
}

// Subscribe to sensor alerts for a specific user
export function subscribeUserAlerts(
  userId: string,
  onUpdate: (alerts: SensorAlert[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, 'sensorAlerts'), where('ownerId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: SensorAlert[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as SensorAlert);
      });
      onUpdate(list);
    },
    (error) => {
      if (onError) {
        try {
          handleFirestoreError(error, OperationType.LIST, 'sensorAlerts');
        } catch (e) {
          onError(e as Error);
        }
      }
    }
  );
}

// Subscribe to health reports for a user
export function subscribeUserReports(
  userId: string,
  onUpdate: (reports: HealthReport[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, 'healthReports'), where('ownerId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: HealthReport[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as HealthReport);
      });
      onUpdate(list);
    },
    (error) => {
      if (onError) {
        try {
          handleFirestoreError(error, OperationType.LIST, 'healthReports');
        } catch (e) {
          onError(e as Error);
        }
      }
    }
  );
}
