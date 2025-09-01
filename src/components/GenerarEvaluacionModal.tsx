import React, { useState, useEffect } from 'react';
import { FileCheck, X, Loader2, Plus } from 'lucide-react';
import { getEmployees, getPeriods, getCriteria, createEvaluationsFromTemplate } from '../services/evaluationService';
import type { Template, Employee, Period, Criteria, CreateEvaluationsFromTemplateDTO } from '../types/evaluation';

interface GenerarEvaluacionModalProps {
  show: boolean;
  onClose: () => void;
  onCreated: (result: { evaluatedEmployeeIds: number[]; count: number }) => void;
  template: Template | null;
}

interface EvaluacionForm {
  employee_ids: number[];
  period_id: number | null;
}

const mapCategory = (cat: string): string => {
  switch (cat) {
    case 'productividad':
      return 'Productividad';
    case 'conducta_laboral':
      return 'Conducta Laboral';
    case 'habilidades':
      return 'Habilidades';
    default:
      return cat;
  }
};

const GenerarEvaluacionModal: React.FC<GenerarEvaluacionModalProps> = ({ show, onClose, onCreated, template }) => {
  const [form, setForm] = useState<EvaluacionForm>({
    employee_ids: [],
    period_id: null,
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show && template) {
      loadData();
      setForm({ employee_ids: [], period_id: null });
      setError(null);
    }
  }, [show, template]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [employeesData, periodsData, criteriaData] = await Promise.all([
        getEmployees(),
        getPeriods(),
        getCriteria(),
      ]);
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
      setPeriods(Array.isArray(periodsData) ? periodsData.filter(p => p.is_active) : []);
      setCriteria(Array.isArray(criteriaData) ? criteriaData : []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar empleados, períodos o criterios');
    } finally {
      setLoadingData(false);
    }
  };

  const handleEmployeeToggle = (employeeId: number) => {
    setForm(prev => ({
      ...prev,
      employee_ids: prev.employee_ids.includes(employeeId)
        ? prev.employee_ids.filter(id => id !== employeeId)
        : [...prev.employee_ids, employeeId],
    }));
    if (error) setError(null);
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, period_id: parseInt(e.target.value) || null }));
    if (error) setError(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!template?.id) {
      setError('No se proporcionó una plantilla válida');
      return;
    }

    if (form.employee_ids.length === 0) {
      setError('Debes seleccionar al menos un empleado');
      return;
    }

    if (!form.period_id) {
      setError('Debes seleccionar un período');
      return;
    }

    const evaluationDTO: CreateEvaluationsFromTemplateDTO = {
      template_id: template.id,
      employee_ids: form.employee_ids,
      period_id: form.period_id,
    };

    try {
      setLoading(true);
      console.log('🔄 Creating evaluations from template:', evaluationDTO);
      const result = await createEvaluationsFromTemplate(evaluationDTO);
      onCreated(result);
    } catch (err: any) {
      let errorMessage = 'Error al generar las evaluaciones. Por favor, intenta de nuevo.';
      if (typeof err.message === 'string') {
        const match = err.message.match(/HTTP \d+:\s*(.*)/);
        if (match && match[1]) {
          try {
            const responseJson = JSON.parse(match[1]);
            errorMessage = responseJson.error || responseJson.details || errorMessage;
          } catch (parseErr) {
            // No hacer nada si no se puede parsear
          }
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setForm({ employee_ids: [], period_id: null });
    setError(null);
    onClose();
  };

  if (!show || !template) return null;

  const getCriteriaById = (id: number) => {
    return criteria.find(c => c.id === id);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-purple-500" />
            Generar Evaluaciones: {template.name}
          </h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Criterios de la Plantilla</h4>
            <div className="border border-gray-200 rounded-lg p-4">
              {loadingData ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <p className="text-gray-500">Cargando criterios...</p>
                </div>
              ) : template.criteria.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay criterios asignados</p>
              ) : (
                template.criteria.map((c, idx) => {
                  const criterion = getCriteriaById(c.criteriaId);
                  return (
                    <div key={idx} className="p-2 mb-2 bg-gray-50 rounded-lg">
                      <p className="font-medium text-sm">{criterion?.name || 'Criterio desconocido'}</p>
                      <p className="text-xs text-gray-500">
                        {(c.weight * 100).toFixed(0)}% - {mapCategory(c.category)}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Seleccionar Período</h4>
            {loadingData ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-gray-500">Cargando períodos...</p>
              </div>
            ) : (
              <select
                value={form.period_id || ''}
                onChange={handlePeriodChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                disabled={loading}
              >
                <option value="">Selecciona un período</option>
                {periods.map(period => (
                  <option key={period.id} value={period.id}>
                    {period.name} ({period.is_active ? 'Activo' : 'Inactivo'})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Seleccionar Empleados</h4>
            {loadingData ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-gray-500">Cargando empleados...</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                {employees.length === 0 ? (
                  <p className="text-gray-500 text-sm">No hay empleados disponibles</p>
                ) : (
                  employees.map(employee => (
                    <div
                      key={employee.id}
                      className="flex items-center p-2 hover:bg-gray-50 rounded-lg mb-2"
                    >
                      <input
                        type="checkbox"
                        checked={form.employee_ids.includes(employee.id)}
                        onChange={() => handleEmployeeToggle(employee.id)}
                        className="w-4 h-4 text-purple-500 border-gray-300 rounded focus:ring-purple-500"
                        disabled={loading}
                      />
                      <span className="ml-2 text-sm">{`${employee.first_name} ${employee.last_name}`}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || form.employee_ids.length === 0 || !form.period_id}
              className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Generar Evaluaciones
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenerarEvaluacionModal;