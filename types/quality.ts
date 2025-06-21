export interface EquipmentCleaningRecord {
  id: string;
  date: string;
  employeeName: string;
  equipmentType: 'Filter' | 'Tank' | 'Nozzle' | 'Machine' | 'Other';
  equipmentName: string;
  beforeProduction: boolean;
  afterProduction: boolean;
  supervisorName: string;
  remarks?: string;
  cleaningStatus?: 'Completed' | 'Pending' | 'Overdue';
}

export interface QAParametersRecord {
  id: string;
  date: string;
  batchNumber: string;
  temperature: number;
  moisture: number;
  ph: {
    value: number;
    result: 'Pass' | 'Fail';
  };
  tds: {
    value: number;
    result: 'Pass' | 'Fail';
  };
  appearance: 'Clear' | 'Cloudy';
  taste: 'Tasteless' | 'Bad Taste';
  odour: 'None' | 'Unpleasant';
  labeling: 'Good' | 'Poor';
  volume: number;
  visualInspection: boolean;
  mfdBatch: string;
  overallResult: 'Pass' | 'Fail';
  remarks?: string;
  parameters?: Array<{
    name: string;
    value: number;
    result: 'Pass' | 'Fail';
  }>;
}

export interface InProcessCheckRecord {
  id: string;
  date: string;
  qcOfficer: string;
  batchNumber: string;
  particles: boolean;
  volume: number;
  leakages: number;
  labelClarity: 'Good' | 'Poor';
  ph: number;
  tds: number;
  qualityCheck: boolean;
  weightCheck: boolean;
  sealCheck: boolean;
  remarks?: string;
  checks?: Array<{
    name: string;
    result: boolean;
  }>;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  employeeName: string;
  appearance: 'Neat' | 'Untidy';
  timeIn: string;
  timeOut?: string;
  supervisor: string;
  hygieneStatus: 'Passed' | 'Failed';
  healthStatus: 'Healthy' | 'Minor Issues' | 'Sick (Not Working)';
  hygieneCheck: boolean;
  supervisorName: string;
  remarks?: string;
}

export interface QualityState {
  equipmentCleaning: EquipmentCleaningRecord[];
  qaParameters: QAParametersRecord[];
  inProcessChecks: InProcessCheckRecord[];
  attendance: AttendanceRecord[];
  isLoading: boolean;
  error: string | null;
}

export interface FDAComplianceAnalytics {
  complianceScore: number;
  checksCompleted: number;
  issuesFound: number;
  issuesResolved: number;
  analysisText: string;
  parameterRecommendation: string;
  parameters: Array<{
    name: string;
    compliance: number;
    details: string;
  }>;
  // Additional fields
  overallCompliance: number;
  qaComplianceRate: number;
  ipcComplianceRate: number;
  cleaningComplianceRate: number;
  complianceStatus: string;
  statusColor: string;
  recommendations: string[];
  recordCounts: {
    qa: number;
    ipc: number;
    cleaning: number;
  };
}

export interface EquipmentCleaningAnalytics {
  complianceRate: number;
  totalCleanings: number;
  missedCleanings: number;
  recommendation: string;
  equipmentStatus: Array<{
    name: string;
    status: 'clean' | 'due' | 'overdue';
    lastCleaned: string;
    nextDue: string;
  }>;
}

export interface QualityTrends {
  dailyChecks: Array<{
    day: string;
    checks: number;
    issues: number;
    compliance: number;
  }>;
}