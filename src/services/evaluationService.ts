import { API_BASE_URL } from "../constants/api";

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
  UpdateTemplateDTO,
  CreateEvaluationsFromTemplateDTO,
  UpdatePeriodDTO,
  UpdateCriteriaDTO,
  EvaluacionParaCalificarDTO,
  ResumenEvaluacionDTO,
  MisEvaluacionesRespuestaDTO,
  PuntuacionCriterioDTO,
  FiltrosEvaluacionParams,
  RespuestaAPI,
} from "../types/evaluation";

import type {
  Criteria,
  Period,
  Template,
  Evaluation,
  Employee,
  CreateCriteriaDTO,
  UpdateCriteriaDTO,
  CreatePeriodDTO,
  CreateTemplateDTO,
  UpdateTemplateDTO,
  CreateEvaluationsFromTemplateDTO,
  UpdatePeriodDTO,
  EvaluacionParaCalificarDTO,
  ResumenEvaluacionDTO,
  MisEvaluacionesRespuestaDTO,
  PuntuacionCriterioDTO,
  FiltrosEvaluacionParams,
} from "../types/evaluation";

// Headers de autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
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
    throw new Error(result.message || "Error en la operación");
  }

  return result.data || result;
};

// ==================== CRITERIA ====================
export const getCriteria = async (): Promise<Criteria[]> => {
  try {
    console.log("🔍 Fetching criteria...");
    const response = await fetch(`${API_BASE_URL}/criteria`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await handleResponse<Criteria[]>(response);
    console.log("✅ Criteria loaded:", data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("❌ Error fetching criteria:", error);
    throw error;
  }
};

export const createCriteria = async (
  criteriaData: CreateCriteriaDTO
): Promise<Criteria> => {
  try {
    console.log("🔄 Creating criteria...", criteriaData);
    const response = await fetch(`${API_BASE_URL}/criteria`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(criteriaData),
    });

    const data = await handleResponse<Criteria>(response);
    console.log("✅ Criteria created:", data);
    return data;
  } catch (error) {
    console.error("❌ Error creating criteria:", error);
    throw error;
  }
};

export const updateCriteria = async (
  id: number,
  criteriaData: UpdateCriteriaDTO
): Promise<Criteria> => {
  try {
    console.log("🔄 Updating criteria...", id, criteriaData);
    const response = await fetch(`${API_BASE_URL}/criteria/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(criteriaData),
    });

    const data = await handleResponse<Criteria>(response);
    console.log("✅ Criteria updated:", data);
    return data;
  } catch (error) {
    console.error("❌ Error updating criteria:", error);
    throw error;
  }
};

export const deleteCriteria = async (id: number): Promise<void> => {
  try {
    console.log("🗑️ Deleting criteria:", id);
    const response = await fetch(`${API_BASE_URL}/criteria/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    await handleResponse<void>(response);
    console.log("✅ Criteria deleted successfully");
  } catch (error) {
    console.error("❌ Error deleting criteria:", error);
    throw error;
  }
};

// ==================== PERIODS ====================
export const getPeriods = async (): Promise<Period[]> => {
  try {
    console.log("🔍 Fetching periods...");
    const response = await fetch(`${API_BASE_URL}/periods`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await handleResponse<Period[]>(response);
    console.log("✅ Periods loaded:", data);

    if (data && data.length > 0) {
      console.log("📊 First period structure:", JSON.stringify(data[0], null, 2));
      console.log("📊 Period fields:", Object.keys(data[0]));
    }

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("❌ Error fetching periods:", error);
    throw error;
  }
};

export const getPeriodById = async (id: number): Promise<Period> => {
  try {
    console.log("🔍 Fetching period by ID:", id);
    const response = await fetch(`${API_BASE_URL}/periods/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await handleResponse<Period>(response);
    console.log("✅ Period loaded:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching period:", error);
    throw error;
  }
};

export const createPeriod = async (
  periodData: CreatePeriodDTO
): Promise<Period> => {
  try {
    console.log("🔄 Creating period...", periodData);
    const response = await fetch(`${API_BASE_URL}/periods`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(periodData),
    });

    const data = await handleResponse<Period>(response);
    console.log("✅ Period created:", data);
    console.log("📊 Created period structure:", JSON.stringify(data, null, 2));

    return data;
  } catch (error) {
    console.error("❌ Error creating period:", error);
    throw error;
  }
};

export const updatePeriod = async (
  id: number,
  periodData: UpdatePeriodDTO
): Promise<Period> => {
  try {
    console.log("🔄 Updating period...", id, periodData);
    const response = await fetch(`${API_BASE_URL}/periods/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(periodData),
    });

    const data = await handleResponse<Period>(response);
    console.log("✅ Period updated:", data);
    return data;
  } catch (error) {
    console.error("❌ Error updating period:", error);
    throw error;
  }
};

export const togglePeriodStatus = async (id: number): Promise<Period> => {
  try {
    console.log("🔄 Toggling period status:", id);
    console.warn("⚠️ Simulando toggle de período - implementar en backend");

    const mockPeriod: Period = {
      id,
      name: "Período simulado",
      description: "Descripción simulada",
      start_date: new Date().toISOString(),
      end_date: new Date().toISOString(),
      due_date: new Date().toISOString(),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("✅ Period status toggled (simulated):", mockPeriod);
    return mockPeriod;
  } catch (error) {
    console.error("❌ Error toggling period status:", error);
    throw error;
  }
};

export const deletePeriod = async (id: number): Promise<void> => {
  try {
    console.log("🗑️ Deleting period:", id);
    const response = await fetch(`${API_BASE_URL}/periods/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    await handleResponse<void>(response);
    console.log("✅ Period deleted successfully");
  } catch (error) {
    console.error("❌ Error deleting period:", error);
    throw error;
  }
};

// ==================== TEMPLATES ====================
export const getTemplates = async (): Promise<Template[]> => {
  try {
    console.log("🔍 Fetching templates...");
    const response = await fetch(`${API_BASE_URL}/templates`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await handleResponse<Template[]>(response);
    console.log("✅ Templates loaded:", data);
    data.forEach((template, index) => {
      console.log(`📋 Template ${index + 1} criteria:`, template.criteria);
    });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("❌ Error fetching templates:", error);
    throw error;
  }
};

export const getTemplateById = async (id: number): Promise<Template> => {
  try {
    console.log("🔍 Fetching template by ID:", id);
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await handleResponse<Template>(response);
    console.log("✅ Template loaded:", data);
    console.log("📋 Template criteria:", data.criteria);
    return data;
  } catch (error) {
    console.error("❌ Error fetching template:", error);
    throw error;
  }
};

export const createTemplate = async (
  templateData: CreateTemplateDTO
): Promise<Template> => {
  try {
    console.log("🔄 Creating template...", templateData);
    const response = await fetch(`${API_BASE_URL}/templates`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(templateData),
    });

    const data = await handleResponse<Template>(response);
    console.log("✅ Template created:", data);
    return data;
  } catch (error) {
    console.error("❌ Error creating template:", error);
    throw error;
  }
};

export const updateTemplate = async (
  id: number,
  templateData: UpdateTemplateDTO
): Promise<Template> => {
  try {
    console.log("🔄 Updating template:", id, templateData);
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(templateData),
    });

    const data = await handleResponse<Template>(response);
    console.log("✅ Template updated:", data);
    return data;
  } catch (error) {
    console.error("❌ Error updating template:", error);
    throw error;
  }
};

export const deleteTemplate = async (id: number): Promise<void> => {
  try {
    console.log("🗑️ Deleting template:", id);
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    await handleResponse<void>(response);
    console.log("✅ Template deleted successfully");
  } catch (error) {
    console.error("❌ Error deleting template:", error);
    throw error;
  }
};

export const cloneTemplate = async (
  id: number,
  newName?: string
): Promise<Template> => {
  try {
    console.log("📋 Cloning template:", id, newName);
    const body = newName ? JSON.stringify({ name: newName }) : undefined;

    const response = await fetch(`${API_BASE_URL}/templates/${id}/clone`, {
      method: "POST",
      headers: getAuthHeaders(),
      body,
    });

    const data = await handleResponse<Template>(response);
    console.log("✅ Template cloned:", data);
    return data;
  } catch (error) {
    console.error("❌ Error cloning template:", error);
    throw error;
  }
};

// ==================== EVALUATIONS ====================
export const getEvaluations = async (): Promise<Evaluation[]> => {
  try {
    console.log("🔍 Fetching evaluations...");
    const response = await fetch(`${API_BASE_URL}/evaluations`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await handleResponse<Evaluation[]>(response);
    console.log("✅ Evaluations loaded:", data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("❌ Error fetching evaluations:", error);
    throw error;
  }
};

export const createEvaluationsFromTemplate = async (
  evaluationsData: CreateEvaluationsFromTemplateDTO
): Promise<{ evaluatedEmployeeIds: number[]; count: number }> => {
  try {
    console.log("🔄 Creating evaluations from template...", evaluationsData);

    const backendPayload = {
      template_id: evaluationsData.template_id,
      user_ids: evaluationsData.employee_ids,
    };

    const response = await fetch(`${API_BASE_URL}/evaluations/from-template`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(backendPayload),
    });

    const data = await handleResponse<{
      evaluatedEmployeeIds: number[];
      count: number;
    }>(response);
    console.log("✅ Evaluations created:", data);
    return data;
  } catch (error) {
    console.error("❌ Error creating evaluations:", error);
    throw error;
  }
};

export const deleteEvaluation = async (id: number): Promise<void> => {
  try {
    console.log("🗑️ Deleting evaluation:", id);
    const response = await fetch(`${API_BASE_URL}/evaluations/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    await handleResponse<void>(response);
    console.log("✅ Evaluation deleted successfully");
  } catch (error) {
    console.error("❌ Error deleting evaluation:", error);
    throw error;
  }
};

// ==================== EMPLOYEES ====================
export const getEmployees = async (): Promise<Employee[]> => {
  try {
    console.log("🔍 Fetching employees...");
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await handleResponse<Employee[]>(response);
    console.log("✅ Employees loaded:", data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("❌ Error fetching employees:", error);
    throw error;
  }
};

export const getMyEvaluations = async (): Promise<Evaluation[]> => {
  try {
    console.log("🔍 Fetching my evaluations...");
    const response = await fetch(`${API_BASE_URL}/me/evaluations`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await handleResponse<Evaluation[]>(response);
    console.log("✅ My evaluations loaded:", data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("❌ Error fetching my evaluations:", error);
    throw error;
  }
};

export const deactivateItem = async (
  type: "criteria" | "template",
  id: number
): Promise<void> => {
  try {
    console.log(`📴 Deactivating ${type}:`, id);
    console.warn(`⚠️ Simulando desactivación de ${type} - implementar en backend`);

    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log(`✅ ${type} deactivated successfully (simulated)`);
  } catch (error) {
    console.error(`❌ Error deactivating ${type}:`, error);
    throw error;
  }
};

// ==================== SERVICIOS PARA CALIFICACIÓN ====================
export class ErrorEvaluacion extends Error {
  public readonly status: number;

  constructor(mensaje: string, status: number) {
    super(mensaje);
    this.status = status;
    this.name = 'ErrorEvaluacion';
  }
}

class ServicioEvaluaciones {
  private readonly baseUrl: string = API_BASE_URL;

  private obtenerHeadersAuth(): HeadersInit {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new ErrorEvaluacion('Token de autenticación no encontrado', 401);
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  private async manejarRespuesta<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let mensajeError = `HTTP ${response.status}: ${response.statusText}`;

      try {
        const errorData = await response.json();
        mensajeError = errorData.message || errorData.error || mensajeError;
      } catch {
        // Usar mensaje por defecto
      }

      throw new ErrorEvaluacion(mensajeError, response.status);
    }

    const data = await response.json();
    console.log('📡 Respuesta del backend:', data);

    if (data.success === false) {
      throw new ErrorEvaluacion(data.message || 'Error en la operación', 400);
    }

    if (data.data === null || data.data === undefined) {
      console.log('⚠️ Backend retornó data: null, usando estructura por defecto');
      return this.obtenerEstructuraPorDefecto() as T;
    }

    return data.data || (data as unknown as T);
  }

  private obtenerEstructuraPorDefecto(): MisEvaluacionesRespuestaDTO {
    return {
      as_employee: {
        evaluations: [],
        summary: { total: 0, completed: 0, pending: 0 }
      },
      as_evaluator: {
        evaluations: [],
        summary: { total: 0, completed: 0, pending_to_evaluate: 0 }
      }
    };
  }

  async obtenerMisEvaluaciones(filtros?: FiltrosEvaluacionParams): Promise<MisEvaluacionesRespuestaDTO> {
    try {
      console.log('🔍 Obteniendo mis evaluaciones...', filtros);

      const queryParams = new URLSearchParams();
      if (filtros?.period_id) queryParams.append('period_id', filtros.period_id.toString());
      if (filtros?.status) queryParams.append('status', filtros.status);

      const url = `${this.baseUrl}/me/evaluations${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      console.log('📡 URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.obtenerHeadersAuth()
      });

      const data = await this.manejarRespuesta<MisEvaluacionesRespuestaDTO>(response);
      console.log('✅ Mis evaluaciones procesadas:', data);

      const estructuraCompleta: MisEvaluacionesRespuestaDTO = {
        as_employee: {
          evaluations: data.as_employee?.evaluations || [],
          summary: {
            total: data.as_employee?.summary?.total || 0,
            completed: data.as_employee?.summary?.completed || 0,
            pending: data.as_employee?.summary?.pending || 0
          }
        },
        as_evaluator: {
          evaluations: data.as_evaluator?.evaluations || [],
          summary: {
            total: data.as_evaluator?.summary?.total || 0,
            completed: data.as_evaluator?.summary?.completed || 0,
            pending_to_evaluate: data.as_evaluator?.summary?.pending_to_evaluate || 0
          }
        }
      };

      return estructuraCompleta;

    } catch (error) {
      console.error('❌ Error obteniendo mis evaluaciones:', error);

      if (error instanceof ErrorEvaluacion && error.status >= 500) {
        console.log('⚠️ Error del servidor, retornando estructura vacía');
        return this.obtenerEstructuraPorDefecto();
      }

      throw error;
    }
  }

  async obtenerEvaluacionParaCalificar(evaluacionId: number): Promise<EvaluacionParaCalificarDTO> {
    try {
      console.log('🔍 Obteniendo evaluación para calificar:', evaluacionId);

      const response = await fetch(`${this.baseUrl}/evaluations/${evaluacionId}/for-scoring`, {
        method: 'GET',
        headers: this.obtenerHeadersAuth()
      });

      const data = await this.manejarRespuesta<EvaluacionParaCalificarDTO>(response);
      console.log('✅ Evaluación para calificar obtenida:', data);
      return data;

    } catch (error) {
      console.error('❌ Error obteniendo evaluación para calificar:', error);
      throw error;
    }
  }

  async enviarPuntuaciones(evaluacionId: number, puntuaciones: PuntuacionCriterioDTO[]): Promise<void> {
    try {
      console.log('📤 Enviando puntuaciones para evaluación:', evaluacionId, puntuaciones);

      for (const puntuacion of puntuaciones) {
        if (puntuacion.score < 1 || puntuacion.score > 5) {
          throw new ErrorEvaluacion(`Puntuación fuera del rango (1-5): ${puntuacion.score}`, 400);
        }
      }

      const response = await fetch(`${this.baseUrl}/evaluations/${evaluacionId}/score`, {
        method: 'PUT',
        headers: this.obtenerHeadersAuth(),
        body: JSON.stringify(puntuaciones)
      });

      await this.manejarRespuesta<void>(response);
      console.log('✅ Puntuaciones enviadas correctamente');

    } catch (error) {
      console.error('❌ Error enviando puntuaciones:', error);
      throw error;
    }
  }

  async listarTodasLasEvaluaciones(filtros?: FiltrosEvaluacionParams): Promise<ResumenEvaluacionDTO[]> {
    try {
      console.log('🔍 Listando todas las evaluaciones...', filtros);

      const queryParams = new URLSearchParams();
      if (filtros?.evaluator_id) queryParams.append('evaluator_id', filtros.evaluator_id.toString());
      if (filtros?.employee_id) queryParams.append('employee_id', filtros.employee_id.toString());
      if (filtros?.period_id) queryParams.append('period_id', filtros.period_id.toString());
      if (filtros?.status) queryParams.append('status', filtros.status);

      const url = `${this.baseUrl}/evaluations${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.obtenerHeadersAuth()
      });

      const data = await this.manejarRespuesta<ResumenEvaluacionDTO[]>(response);
      console.log('✅ Todas las evaluaciones obtenidas:', data);
      return Array.isArray(data) ? data : [];

    } catch (error) {
      console.error('❌ Error listando todas las evaluaciones:', error);
      throw error;
    }
  }

  obtenerTextoEstado(status: string): string {
    const mapaEstados: Record<string, string> = {
      'pending': 'Pendiente',
      'in_progress': 'En Progreso',
      'completed': 'Completada',
      'overdue': 'Vencida'
    };
    return mapaEstados[status] || 'Desconocido';
  }

  obtenerColorEstado(status: string): string {
    const mapaColores: Record<string, string> = {
      'pending': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'in_progress': 'text-blue-600 bg-blue-50 border-blue-200',
      'completed': 'text-green-600 bg-green-50 border-green-200',
      'overdue': 'text-red-600 bg-red-50 border-red-200'
    };
    return mapaColores[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  }

  obtenerInfoPeso(peso: number) {
    if (peso >= 30) {
      return {
        nivel: 'alto' as const,
        color: 'bg-red-500',
        texto: 'Peso alto en la evaluación'
      };
    }
    if (peso >= 20) {
      return {
        nivel: 'medio' as const,
        color: 'bg-yellow-500',
        texto: 'Peso medio en la evaluación'
      };
    }
    return {
      nivel: 'bajo' as const,
      color: 'bg-green-500',
      texto: 'Peso bajo en la evaluación'
    };
  }

  obtenerColorCategoria(categoria: string): string {
    const mapaColores: Record<string, string> = {
      'productividad': 'bg-blue-100 text-blue-800',
      'conducta_laboral': 'bg-green-100 text-green-800',
      'habilidades': 'bg-purple-100 text-purple-800'
    };
    return mapaColores[categoria] || 'bg-gray-100 text-gray-800';
  }

  validarPuntuaciones(
    puntuaciones: Record<number, number>,
    criteriosRequeridos: number[]
  ): boolean {
    return criteriosRequeridos.every(criterioId =>
      puntuaciones[criterioId] !== undefined &&
      puntuaciones[criterioId] >= 1 &&
      puntuaciones[criterioId] <= 5
    );
  }

  formatearPuntuacionesParaEnvio(
    puntuaciones: Record<number, number>,
    mapaAsignacion: Record<number, number>
  ): PuntuacionCriterioDTO[] {
    return Object.entries(puntuaciones).map(([criterioId, puntuacion]) => ({
      assigned_criteria_id: mapaAsignacion[parseInt(criterioId)],
      score: puntuacion
    }));
  }
}

export const servicioEvaluaciones = new ServicioEvaluaciones();
export default servicioEvaluaciones;