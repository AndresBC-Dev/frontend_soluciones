import { API_BASE_URL } from '../constants/api';

// Re-exportar tipos para compatibilidad
export type {
  Criteria,
  Period,
  Template,
  Evaluation,
  Employee,
  CreateCriteriaDTO,
  CreatePeriodDTO,
  CreateTemplateDTO,
  CreateEvaluationsFromTemplateDTO,
} from '../../src/types/evaluation';

import type {
  Criteria,
  Period,
  Template,
  Evaluation,
  Employee,
  CreateCriteriaDTO,
  CreatePeriodDTO,
  CreateTemplateDTO,
  CreateEvaluationsFromTemplateDTO,
  UpdatePeriodDTO,
  TemplateListItem,
  TemplateDetail,
  UpdateTemplateDTO,

} from '../types/evaluation';

import { isTemplateDetail } from '../types/evaluation';

// Headers de autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// Helper para manejar respuestas del backend
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const result = await response.json();

  // El backend puede devolver { success: boolean, data: T } o directamente T
  if (result.success === false) {
    throw new Error(result.message || 'Error en la operación');
  }

  return result.data || result;
};

// ==================== CRITERIA ====================
export const getCriteria = async (): Promise<Criteria[]> => {
  try {
    console.log('🔍 Fetching criteria...');
    const response = await fetch(`${API_BASE_URL}/criteria`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await handleResponse<Criteria[]>(response);
    console.log('✅ Criteria loaded:', data);
    return Array.isArray(data)
      ? data.map(C => ({
        ...C,
        is_active: C.is_active ?? true,
        can_delete: C.can_delete ?? true,
        category: C.category as 'productividad' | 'conducta_laboral' | 'habilidades',
      }))
      : [];
  } catch (error) {
    console.error('❌ Error fetching criteria:', error);
    throw error;
  }
};

export const createCriteria = async (criteriaData: CreateCriteriaDTO): Promise<Criteria> => {
  try {
    console.log('🔄 Creating criteria...', criteriaData);
    const response = await fetch(`${API_BASE_URL}/criteria`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(criteriaData),
    });

    const data = await handleResponse<Criteria>(response);
    console.log('✅ Criteria created:', data);
    return {
      ...data,
      is_active: data.is_active ?? true,
      can_delete: data.can_delete ?? true,
      category: data.category as 'productividad' | 'conducta_laboral' | 'habilidades',
    };
  } catch (error) {
    console.error('❌ Error creating criteria:', error);
    throw error;
  }
};

export const updateCriteria = async (
  id: number,
  criteriaData: CreateCriteriaDTO
): Promise<Criteria> => {
  try {
    console.log('🔄 Updating criteria...', id, criteriaData);
    const response = await fetch(`${API_BASE_URL}/criteria/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(criteriaData),
    });

    const data = await handleResponse<Criteria>(response);
    console.log('✅ Criteria updated:', data);
    return {
      ...data,
      is_active: data.is_active ?? true,
      can_delete: data.can_delete ?? true,
      category: data.category as 'productividad' | 'conducta_laboral' | 'habilidades',
    };
  } catch (error) {
    console.error('❌ Error updating criteria:', error);
    throw error;
  }
};

export const deactivateCriteria = async (id: number): Promise<Criteria> => {
  try {
    console.log('🔄 Deactivating criteria...', id);
    const response = await fetch(`${API_BASE_URL}/criteria/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_active: false }),
    });

    const data = await handleResponse<Criteria>(response);
    console.log('✅ Criteria deactivated:', data);
    return {
      ...data,
      is_active: false,
      can_delete: data.can_delete ?? true,
      category: data.category as 'productividad' | 'conducta_laboral' | 'habilidades',
    };
  } catch (error) {
    console.error('❌ Error deactivating criteria:', error);
    throw error;
  }
};

export const reactivateCriteria = async (id: number): Promise<Criteria> => {
  try {
    console.log('🔄 Reactivating criteria...', id);
    const response = await fetch(`${API_BASE_URL}/criteria/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_active: true }),
    });

    const data = await handleResponse<Criteria>(response);
    console.log('✅ Criteria reactivated:', data);
    return {
      ...data,
      is_active: true,
      can_delete: data.can_delete ?? true,
      category: data.category as 'productividad' | 'conducta_laboral' | 'habilidades',
    };
  } catch (error) {
    console.error('❌ Error reactivating criteria:', error);
    throw error;
  }
};

// ==================== PERIODS ====================
export const getPeriods = async (): Promise<Period[]> => {
  try {
    console.log('🔍 Fetching periods...');
    const response = await fetch(`${API_BASE_URL}/periods`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await handleResponse<Period[]>(response);
    console.log('✅ Periods loaded:', data);

    if (Array.isArray(data) && data.length > 0) {
      console.log('📅 Sample period data:', {
        id: data[0].id,
        name: data[0].name,
        is_active: data[0].is_active,
        status: data[0].status,
        typeof_is_active: typeof data[0].is_active,
        start_date: data[0].start_date,
        end_date: data[0].end_date,
        due_date: data[0].due_date,
      });
    }

    // Normalizar is_active basado en status si no viene definido
    return Array.isArray(data) ? data.map(p => ({
      ...p,
      is_active: p.is_active ?? (p.status === 'active')
    })) : [];
  } catch (error) {
    console.error('❌ Error fetching periods:', error);
    throw error;
  }
};

export const createPeriod = async (periodData: Omit<CreatePeriodDTO, 'is_active'>): Promise<Period> => {
  try {
    console.log('🔄 Creating period...', periodData);
    const response = await fetch(`${API_BASE_URL}/periods`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(periodData),
    });

    const data = await handleResponse<Period>(response);
    console.log('✅ Period created:', data, 'status:', data.status, 'is_active:', data.is_active);

    // Normalizar is_active basado en status
    return {
      ...data,
      is_active: data.is_active ?? (data.status === 'active')
    };
  } catch (error) {
    console.error('❌ Error creating period:', error);
    throw error;
  }
};

export const updatePeriod = async (id: number, periodData: Partial<UpdatePeriodDTO>): Promise<Period> => {
  try {
    console.log('🔄 Updating period...', id, periodData);
    const response = await fetch(`${API_BASE_URL}/periods/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(periodData),
    });

    const data = await handleResponse<Period>(response);
    console.log('✅ Period updated:', data, 'status:', data.status, 'is_active:', data.is_active);

    return {
      ...data,
      is_active: data.is_active ?? (data.status === 'active')
    };
  } catch (error) {
    console.error('❌ Error updating period:', error);
    throw error;
  }
};

export const deactivatePeriod = async (id: number): Promise<Period> => {
  try {
    console.log('🔄 Deactivating period via PUT:', id);
    // Primero cambiar el status a 'draft' y luego is_active a false
    const response = await fetch(`${API_BASE_URL}/periods/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        is_active: false,
        status: 'draft'  // IMPORTANTE: Cambiar a draft para poder reactivar después
      }),
    });

    const data = await handleResponse<Period>(response);
    console.log('✅ Period deactivated:', data);

    // Asegurar valores correctos
    return {
      ...data,
      is_active: false,
      status: 'draft'
    };
  } catch (error) {
    console.error('❌ Error deactivating period:', error);
    throw error;
  }
};

export const activatePeriod = async (id: number): Promise<Period> => {
  try {
    console.log('🔄 Activating period via PATCH:', id);
    const response = await fetch(`${API_BASE_URL}/periods/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ action: "activate" }),
    });

    const data = await handleResponse<Period>(response);
    console.log('✅ RAW Period activated:', data); // Ver datos crudos
    console.log('🔍 Status field:', data.status);
    console.log('🔍 is_active field:', data.is_active);

    const normalizedPeriod = {
      ...data,
      is_active: data.is_active ?? (data.status === 'active')
    };
    console.log('✅ NORMALIZED Period:', normalizedPeriod);

    return normalizedPeriod;
  } catch (error) {
    console.error('❌ Error activating period:', error);
    throw error;
  }
};

// ==================== TEMPLATES ====================
export const getTemplates = async (): Promise<TemplateListItem[]> => {
  try {
    console.log('🔍 Fetching templates...');
    const response = await fetch(`${API_BASE_URL}/templates`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await handleResponse<TemplateListItem[]>(response);
    console.log('✅ Templates loaded:', data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('❌ Error fetching templates:', error);
    throw error;
  }
};

// En getTemplateById(), actualizar el tipo de retorno:
export const getTemplateById = async (id: number): Promise<TemplateDetail> => {
  try {
    console.log('🔍 Fetching template details:', id);
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await handleResponse<TemplateDetail>(response);
    console.log('✅ Template details loaded:', data);

    // Asegurar que criteria esté estructurado correctamente
    return {
      ...data,
      is_active: data.is_active ?? true,
      criteria: data.criteria || {
        productivity: [],
        work_conduct: [],
        skills: []
      }
    };
  } catch (error) {
    console.error('❌ Error fetching template details:', error);
    throw error;
  }
};

export const createTemplate = async (templateData: CreateTemplateDTO): Promise<Template> => {
  try {
    console.log('🔄 Creating template...', templateData);
    const response = await fetch(`${API_BASE_URL}/templates`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(templateData),
    });

    const data = await handleResponse<Template>(response);
    console.log('✅ Template created:', data);
    return data;
  } catch (error) {
    console.error('❌ Error creating template:', error);
    throw error;
  }
};

export const updateTemplate = async (
  id: number,
  templateData: UpdateTemplateDTO
): Promise<Template> => {
  try {
    console.log('🔄 Updating template...', id, templateData);
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(templateData),
    });

    const data = await handleResponse<Template>(response);
    console.log('✅ Template updated:', data);

    // Si la respuesta es TemplateDetail, normalizar los arrays null
    if (isTemplateDetail(data)) {
      const normalizedData: TemplateDetail = {
        ...data,
        is_active: data.is_active ?? true,
        criteria: {
          productivity: data.criteria?.productivity || [],
          work_conduct: data.criteria?.work_conduct || [],
          skills: data.criteria?.skills || []
        }
      };
      return normalizedData;
    }

    // Si es TemplateListItem, devolver tal cual (ya viene normalizado del backend)
    return data;
  } catch (error) {
    console.error('❌ Error updating template:', error);
    throw error;
  }
};

export const deleteTemplate = async (id: number): Promise<void> => {
  try {
    console.log('🗑️ Deleting template:', id);
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    await handleResponse<void>(response);
    console.log('✅ Template deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting template:', error);
    throw error;
  }
};

export const cloneTemplate = async (id: number, newName?: string): Promise<TemplateDetail> => {
  try {
    console.log('🔄 Cloning template...', id, newName);
    const body = newName ? JSON.stringify({ name: newName }) : undefined;
    const response = await fetch(`${API_BASE_URL}/templates/${id}/clone`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body,
    });

    const data = await handleResponse<TemplateDetail>(response);
    console.log('✅ Template cloned:', data);
    return {
      ...data,
      is_active: data.is_active ?? true,
      criteria: data.criteria || {
        productivity: [],
        work_conduct: [],
        skills: [],
      },
    };
  } catch (error) {
    console.error('❌ Error cloning template:', error);
    throw error;
  }
};

// ==================== EVALUATIONS ====================
export const getEvaluations = async (): Promise<Evaluation[]> => {
  try {
    console.log('🔍 Fetching evaluations...');
    const response = await fetch(`${API_BASE_URL}/evaluations`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await handleResponse<Evaluation[]>(response);
    console.log('✅ Evaluations loaded:', data);
    return Array.isArray(data) ? data.map(e => ({ ...e, evaluator_name: e.evaluator_name ?? 'Unknown' })) : [];
  } catch (error) {
    console.error('❌ Error fetching evaluations:', error);
    throw error;
  }
};

export const createEvaluationsFromTemplate = async (
  evaluationsData: CreateEvaluationsFromTemplateDTO
): Promise<{ evaluatedEmployeeIds: number[]; count: number }> => {
  try {
    console.log('🔄 Creating evaluations from template...', evaluationsData);

    // ✅ CORRECCIÓN: Enviar todos los campos requeridos con los nombres correctos
    const backendPayload = {
      template_id: evaluationsData.template_id,
      period_id: evaluationsData.period_id,        // ✅ Agregado
      evaluator_id: evaluationsData.evaluator_id,  // ✅ Agregado
      employee_ids: evaluationsData.employee_ids,  // ✅ Corregido de "user_ids" a "employee_ids"
    };

    const response = await fetch(`${API_BASE_URL}/evaluations/from-template`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(backendPayload),
    });

    const data = await handleResponse<{ evaluatedEmployeeIds: number[]; count: number }>(response);
    console.log('✅ Evaluations created:', data);
    return data;
  } catch (error) {
    console.error('❌ Error creating evaluations:', error);
    throw error;
  }
};

export const submitEvaluationScores = async (
  evaluationId: number,
  payload: { scores: { criteria_id: number; score: number }[]; status: string }
): Promise<Evaluation> => {
  try {
    console.log('🔄 Submitting evaluation scores...', evaluationId, payload);
    const backendPayload = {
      scores: payload.scores.map(s => ({ criteria_id: s.criteria_id, score: s.score })),
      status: payload.status,
    };

    const response = await fetch(`${API_BASE_URL}/evaluations/${evaluationId}/scores`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(backendPayload),
    });

    const data = await handleResponse<Evaluation>(response);
    console.log('✅ Evaluation scores submitted:', data);
    return data;
  } catch (error) {
    console.error('❌ Error submitting evaluation scores:', error);
    throw error;
  }
};

export const deleteEvaluation = async (id: number): Promise<void> => {
  try {
    console.log('🗑️ Deleting evaluation:', id);
    const response = await fetch(`${API_BASE_URL}/evaluations/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    await handleResponse<void>(response);
    console.log('✅ Evaluation deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting evaluation:', error);
    throw error;
  }
};

// ==================== EMPLOYEES ====================
export const getEmployees = async (): Promise<Employee[]> => {
  try {
    console.log('🔍 Fetching employees...');
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await handleResponse<Employee[]>(response);
    console.log('✅ Employees loaded:', data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('❌ Error fetching employees:', error);
    throw error;
  }
};

export const getMyEvaluations = async (): Promise<Evaluation[]> => {
  try {
    console.log('🔍 Fetching my evaluations...');
    const response = await fetch(`${API_BASE_URL}/me/evaluations`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await handleResponse<Evaluation[]>(response);
    console.log('✅ My evaluations loaded:', data);
    return Array.isArray(data) ? data.map(e => ({ ...e, evaluator_name: e.evaluator_name ?? 'Unknown' })) : [];
  } catch (error) {
    console.error('❌ Error fetching my evaluations:', error);
    throw error;
  }
};

export const getUsersByRole = async (role: string): Promise<Employee[]> => {
  try {
    console.log('🔍 Fetching users by role:', role);
    const response = await fetch(`${API_BASE_URL}/references/users/${role}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await handleResponse<Employee[]>(response);
    console.log('✅ Users loaded:', data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('❌ Error fetching users by role:', error);
    throw error;
  }
};

// Mapeo de categorías del backend al frontend
const mapCategory = (backendCategory: string): 'productividad' | 'conducta_laboral' | 'habilidades' => {
  switch (backendCategory) {
    case 'productividad':
    case 'productivity':
      return 'productividad';
    case 'conducta_laboral':
    case 'work_conduct':
      return 'conducta_laboral';
    case 'habilidades':
    case 'skills':
      return 'habilidades';
    default:
      console.warn('Categoría desconocida:', backendCategory);
      return 'productividad'; // Fallback solo en casos extremos
  }
};

// Mapeo de estados del backend (inglés) al frontend (español)
const mapStatus = (backendStatus: string): 'pending' | 'in_progress' | 'completed' | 'overdue' => {
  switch (backendStatus.toLowerCase()) {
    case 'pendiente':
    case 'pending':
      return 'pending';
    case 'en_progreso':
    case 'in_progress':
      return 'in_progress';
    case 'completada':
    case 'completed':
      return 'completed';
    case 'vencida':
    case 'overdue':
      return 'overdue';
    default:
      console.warn('Estado desconocido:', backendStatus);
      return 'pending';
  }
};

export const getEvaluationForScoring = async (evaluationId: number): Promise<any> => {
  try {
    console.log('🔍 Fetching evaluation details for scoring...', evaluationId);
    const response = await fetch(`${API_BASE_URL}/evaluations/${evaluationId}/for-scoring`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await handleResponse<any>(response);
    console.log('✅ Evaluation details loaded:', data);
    console.log('🔍 Raw backend data:', JSON.stringify(data, null, 2));
    
    // 🔧 CORRECCIÓN: Transformar correctamente la respuesta del backend
    return {
      id: data.id,
      employee_id: data.employee.id,
      employee_name: `${data.employee.first_name} ${data.employee.last_name}`,
      evaluator_id: data.evaluator.id,
      evaluator_name: `${data.evaluator.first_name} ${data.evaluator.last_name}`,
      period_id: data.period.id,
      period_name: data.period.name,
      
      // 🔧 CORRECCIÓN 1: Mapear estados correctamente
      status: mapStatus(data.status),
      
      // 🔧 CORRECCIÓN 2 & 3: Mapear criterios con categorías y pesos correctos
      criteria: data.scores?.map((score: any) => {
        console.log('🔍 Processing score:', score);
        console.log('🔍 Score details - criteria:', score.criteria);
        console.log('🔍 Score details - weight:', score.weight);
        console.log('🔍 Score details - criteria.weight:', score.criteria?.weight);
        
        return {
          criteriaId: score.criteria_id,
          description: score.criteria?.name || score.criteria?.description || '',
          
          // 🔧 CORRECCIÓN 2: Mapear categorías correctamente
          category: mapCategory(score.criteria?.category || 'productividad'),
          
          // 🔧 CORRECCIÓN 3: Usar el peso del AssignedCriteria (no del Criteria base)
          // El backend envía el peso específico de esta evaluación en score.weight
          // Este peso ya debe estar normalizado como decimal (ej: 0.3 para 30%)
          weight: score.weight || 0,
          
          score: score.score || undefined,
        };
      }) || [],
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    console.error('❌ Error fetching evaluation for scoring:', error);
    throw error;
  }
};
