export interface Criteria {
  id: number;
  name: string;
  description: string;
  weight: number;
  category: 'productividad' | 'conducta_laboral' | 'habilidades';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCriteriaDTO {
  name: string;
  description: string;
  weight: number;
  category: 'productividad' | 'conducta_laboral' | 'habilidades';
  is_active?: boolean;
}

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

export interface CreatePeriodDTO {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  due_date: string;
  is_active?: boolean;
}

export interface Template {
  id: number;
  name: string;
  description: string;
  criteria: Array<{
    criteria_id: number;
    weight: number;
    category: 'productivity' | 'work_conduct' | 'skills';
  }>;
  is_active: boolean; // Added to match ConfigurationPanel expectations
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateDTO {
  name: string;
  description: string;
  criteria: Array<{
    criteriaId: number;
    weight: number;
    category: 'productivity' | 'work_conduct' | 'skills';
  }>;
}

export interface Evaluation {
  id: number;
  template_id: number;
  employee_id: number;
  employee_name: string;
  period_id: number;
  period_name: string;
  evaluator_name: string;
  status: 'pending' | 'completed' | 'in_progress' | 'overdue';
  created_at: string;
  updated_at: string;
}

export interface CreateEvaluationsFromTemplateDTO {
  template_id: number;
  employee_ids: number[];
}

export interface Employee {
  id: number;
  name: string;
  email: string;
}