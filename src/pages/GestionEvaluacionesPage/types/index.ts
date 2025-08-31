export interface Period {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  due_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Criteria {
  id: number;
  name: string;
  description: string;
  weight: number;
  category: string;
  is_active: boolean;
}

export interface Template {
  id: number;
  name: string;
  description?: string;
  position?: string;
  is_active: boolean;
  criteria: TemplateCriteria[];
  created_at: string;
  updated_at: string;
}

export interface TemplateCriteria {
  id: number;
  criteria_id: number;
  weight: number;
  criteria: Criteria;
}

export interface Evaluation {
  id: number;
  employee_name: string;
  evaluator_name: string;
  period_name: string;
  status: 'pending' | 'completed' | 'overdue';
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Stats {
  totalPeriods: number;
  activePeriods: number;
  totalCriteria: number;
  totalTemplates: number;
  totalEvaluations: number;
  averageWeight: number;
}

export interface ConfirmationState {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  type: 'danger' | 'warning' | 'info' | 'success';
  loading: boolean;
}