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

// Template del listado (resumen)
export interface TemplateListItem {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  criteria_count: number;
  categories_used: number;
  created_at: string;
  updated_at: string;
}

// Criterio dentro de una plantilla
export interface TemplateCriteriaItem {
  id?: number;
  CriteriaId: number;
  weight: number;
  category?: string;
  criteria?: {
    id: number;
    name: string;
    description: string;
    category: string;
  };
}

// Template con detalles completos (del endpoint /{id})
export interface TemplateDetail {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  criteria: {
    productivity: TemplateCriteriaItem[];
    work_conduct: TemplateCriteriaItem[];
    skills: TemplateCriteriaItem[];
  };
  summary?: {
    total_criteria: number;
    categories_used: number;
    weights_summary: {
      productivity: number;
      work_conduct: number;
      skills: number;
    };
    is_valid_weights: boolean;
  };
  created_at: string;
  updated_at: string;
}

// Template tipo unificado (para compatibilidad)
export type Template = TemplateListItem | TemplateDetail;

// Helper para verificar si es TemplateDetail
export function isTemplateDetail(template: Template): template is TemplateDetail {
  return 'criteria' in template && typeof template.criteria === 'object';
}

// Helper para verificar si es TemplateListItem
export function isTemplateListItem(template: Template): template is TemplateListItem {
  return 'criteria_count' in template;
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
  position: string;
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
    productivity: { criteria_id: number; weight: number }[];
    work_conduct: { criteria_id: number; weight: number }[];
    skills: { criteria_id: number; weight: number }[];
  };
}

export interface CreateEvaluationsFromTemplateDTO {
  template_id: number;
  employee_ids: number[];
  period_id: number;
}