export interface Criteria {
  id: number;
  name: string;
  description: string;
  category: 'productividad' | 'conducta_laboral' | 'habilidades';
  weight: number;
  is_active: boolean;
  can_delete?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCriteriaDTO {
  name: string;
  description: string;
  category: 'productividad' | 'conducta_laboral' | 'habilidades';
  weight: number;
}

export interface Period {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  due_date: string;
  status?: 'draft' | 'active' | 'closed' | 'archived' | 'completed';
  is_active: boolean;
  is_expired?: boolean;
  can_modify?: boolean;
  can_delete?: boolean;
  created_at?: string;
  updated_at: string;
}

export interface Template {
  id: number;
  name: string;
  description?: string;
  criteria: {
    criteriaId: number;
    weight: number;
    category: 'productivity' | 'work_conduct' | 'skills';
    description?: string;
  }[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CriteriaScore {
  criteria_id: number;
  score: number;
}

export interface Evaluation {
  id: number;
  employee_id: number;
  employee_name: string;
  evaluator_id: number;
  evaluator_name: string;
  period_id: number;
  period_name: string;
  template_id: number;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  criteria: {
    criteriaId: number;
    description: string;
    category: 'productivity' | 'work_conduct' | 'skills';
    weight: number;
    score?: number;
  }[];
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  status: string;
  department?: string;
}

export interface Stats {
  totalPeriods: number;
  activePeriods: number;
  totalCriteria: number;
  totalTemplates: number;
  totalEvaluations: number;
  averageWeight: number;
}

export interface CreatePeriodDTO {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  due_date: string;
  is_active?: boolean;
}

export interface UpdatePeriodDTO extends Partial<CreatePeriodDTO> {
  status?: 'draft' | 'active' | 'closed' | 'archived' | 'completed';
}

export interface CreateTemplateDTO {
  name: string;
  description?: string;
  criteria: {
    criteriaId: number;
    weight: number;
    category: 'productivity' | 'work_conduct' | 'skills';
  }[];
}

export interface CreateEvaluationsFromTemplateDTO {
  template_id: number;
  employee_ids: number[];
}