
export interface Company {
  id: string;
  name: string;
  rank: number;
  phone: string;
  industry: string;
  website: string;
  headquarters: string;
  description: string;
}

export interface DevPlan {
  hrContact: string;
  contactInfo: string;
  hasLine: boolean;
  lineId: string;
  notes: string;
}

export interface JobPosition {
  id: string;
  title: string;
  salary: string;
  experience: string;
  description: string;
  url: string;
  source: '104' | 'Internal';
}

export interface DevLog {
  id: string;
  date: string;
  content: string;
  type: 'Note' | 'Meeting' | 'Call' | 'Insight';
  author: string;
}

export interface OrgNode {
  name: string;
  title: string;
  children?: OrgNode[];
}

export enum AppSection {
  Dashboard = 'dashboard',
  Companies = 'companies',
  Analytics = 'analytics',
  Settings = 'settings'
}

export interface KpiMetric {
  label: string;
  target: number;
  current: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
}

export interface DashboardStats {
  year: KpiMetric;
  quarter: KpiMetric;
  month: KpiMetric;
  day: KpiMetric;
}
