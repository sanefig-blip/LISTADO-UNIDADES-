export const RANKS = [
  'JEFE DE CUERPO DE BOMBEROS',
  'SUBJEFE DE CUERPO DE BOMBEROS',
  'COMANDANTE GENERAL',
  'COMANDANTE DIRECTOR',
  'COMANDANTE',
  'SUBCOMANDANTE',
  'CAPITAN',
  'TENIENTE',
  'SUBTENIENTE',
  'BOMBERO SUPERIOR',
  'BOMBERO CALIFICADO',
  'PRINCIPAL',
  'AUXILIAR NIVEL E',
  'AUXILIAR NIVEL F',
  'AUXILIAR NIVEL G',
  'AUXILIAR NIVEL H',
  'OTRO'
] as const;

export type Rank = typeof RANKS[number];

export interface Personnel {
    id: string;
    name: string;
    rank: Rank;
    station?: string;
    detachment?: string;
    poc?: string;
    part?: string;
}

export interface Officer {
    id: string;
    role: string;
    rank: Rank;
    name: string;
}

export interface Assignment {
    id: string;
    location: string;
    time: string;
    implementationTime?: string;
    personnel: string;
    details?: string[];
    unit?: string;
    inService?: boolean;
    serviceEnded?: boolean;
    // For grouped view
    serviceTitle?: string;
    novelty?: string;
}

export interface Service {
    id: string;
    title: string;
    description?: string;
    novelty?: string;
    isHidden: boolean;
    assignments: Assignment[];
}

export interface Schedule {
    date: string;
    commandStaff: Officer[];
    services: Service[];
    sportsEvents: Service[];
}

export interface Roster {
    [dateKey: string]: {
        jefeInspecciones?: string;
        jefeServicio?: string;
        jefeGuardia?: string;
        jefeReserva?: string;
    };
}

export type ServiceTemplate = Service & {
    templateId: string;
};

export const rankOrder: { [key in Rank | string]: number } = {
  'JEFE DE CUERPO DE BOMBEROS': 1,
  'SUBJEFE DE CUERPO DE BOMBEROS': 2,
  'COMANDANTE GENERAL': 3,
  'COMANDANTE DIRECTOR': 4,
  'COMANDANTE': 5,
  'SUBCOMANDANTE': 6,
  'CAPITAN': 7,
  'TENIENTE': 8,
  'SUBTENIENTE': 9,
  'BOMBERO SUPERIOR': 10,
  'BOMBERO CALIFICADO': 11,
  'PRINCIPAL': 12,
  'AUXILIAR NIVEL E': 13,
  'AUXILIAR NIVEL F': 14,
  'AUXILIAR NIVEL G': 15,
  'AUXILIAR NIVEL H': 16,
  'OTRO': 17
};

// New types for the Unit Report
export interface FireUnit {
  id: string;
  type: string;
  status: string;
  outOfServiceReason?: string;
  officerInCharge?: string;
  poc?: string;
  personnelCount?: number | null;
  internalId?: string;
}

export interface UnitGroup {
  name: string;
  units: FireUnit[];
  crewOfficers?: string[];
  standbyOfficers?: string[];
  totalPersonnel?: number;
}

export interface Zone {
  name: string;
  groups: UnitGroup[];
}

export interface UnitReportData {
  reportDate: string;
  zones: Zone[];
}

// New types for ERA Report
export interface EraEquipment {
  id: string;
  brand: string;
  voltage: string;
  condition: string;
  dependency: string;
}

export interface EraReportStation {
  name: string;
  hasEquipment: boolean;
  equipment: EraEquipment[];
}

export interface EraData {
  reportDate: string;
  stations: EraReportStation[];
}

// New types for Generator Report
export interface GeneratorEquipment {
  id: string;
  brand: string;
  kva: string;
  condition: string;
  dependency: string;
}

export interface GeneratorReportStation {
  name: string;
  hasEquipment: boolean;
  equipment: GeneratorEquipment[];
}

export interface GeneratorData {
  reportDate: string;
  stations: GeneratorReportStation[];
}


// SCI Forms Types
export interface SCI201Action {
    id: number;
    time: string;
    summary: string;
}

export interface SCI201Data {
    incidentName: string;
    prepDateTime: string;
    incidentLocation: string;
    evalNature: string;
    evalThreats: string;
    evalAffectedArea: string;
    evalIsolation: string;
    initialObjectives: string;
    strategies: string;
    tactics: string;
    pcLocation: string;
    eLocation: string;
    ingressRoute: string;
    egressRoute: string;
    safetyMessage: string;
    incidentCommander: string;
    mapOrSketch: string;
    orgChart: string;
    actions: SCI201Action[];
}

export interface SCI211Resource {
    id: number;
    requestedBy: string;
    requestDateTime: string;
    classType: string; // 'class' is a reserved keyword
    resourceType: string;
    arrivalDateTime: string;
    institution: string;
    matricula: string;
    personnelCount: string;
    status: 'Disponible' | 'No Disponible';
    assignedTo: string;
    demobilizedBy: string;
    demobilizedDateTime: string;
    observations: string;
}

export type TriageCategory = 'Rojo' | 'Amarillo' | 'Verde' | 'Negro' | '';

export interface SCI207Victim {
    id: number;
    patientName: string;
    sex: string;
    age: string;
    triage: TriageCategory;
    transportLocation: string;
    transportedBy: string;
    transportDateTime: string;
}

// New types for Materials Report
export interface Material {
  id: string;
  name: string;
  quantity: number;
  condition: 'Para Servicio' | 'Fuera de Servicio';
  location?: string;
}

export interface MaterialLocation {
  name: string;
  materials: Material[];
}

export interface MaterialsData {
  reportDate: string;
  locations: MaterialLocation[];
}