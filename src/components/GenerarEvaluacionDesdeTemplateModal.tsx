import React, { useState, useEffect } from 'react';
import { FileCheck, X, Loader2, UserCheck, Users, Calendar, Target, AlertCircle, ChevronDown, ChevronUp, Search, Check } from 'lucide-react';
import { getEmployees, getPeriods, getTemplateById, createEvaluationsFromTemplate } from '../services/evaluationService';
import type { 
  Employee, 
  Period, 
  TemplateListItem, 
  TemplateDetail, 
  CreateEvaluationsFromTemplateDTO 
} from '../types/evaluation';

interface GenerarEvaluacionDesdeTemplateModalProps {
  show: boolean;
  template: TemplateListItem | null;
  onClose: () => void;
  onCreated: (result: any) => void;
}

const GenerarEvaluacionDesdeTemplateModal: React.FC<GenerarEvaluacionDesdeTemplateModalProps> = ({
  show,
  template,
  onClose,
  onCreated,
}) => {
  // ============= ESTADOS PRINCIPALES =============
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [templateDetail, setTemplateDetail] = useState<TemplateDetail | null>(null);
  
  // ============= SELECCIONES DEL USUARIO =============
  const [selectedEvaluatorId, setSelectedEvaluatorId] = useState<number | null>(null);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);
  
  // ============= ESTADOS DE UI =============
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCriteria, setShowCriteria] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [evaluatorSearch, setEvaluatorSearch] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showEvaluatorList, setShowEvaluatorList] = useState(true);

  // ============= EFFECT: CARGAR DATOS AL ABRIR =============
  useEffect(() => {
    if (show && template) {
      loadData();
      resetForm();
    }
  }, [show, template]);

  // ============= FUNCIONES DE CARGA DE DATOS =============
  const loadData = async () => {
    if (!template) return;
    
    setLoadingData(true);
    setError(null);
    
    try {
      console.log('🔄 Loading data for template:', template.name);
      
      const [employeesData, periodsData, templateData] = await Promise.all([
        getEmployees().catch((err) => {
          console.error('Error loading employees:', err);
          return [];
        }),
        getPeriods().catch((err) => {
          console.error('Error loading periods:', err);
          return [];
        }),
        getTemplateById(template.id).catch((err) => {
          console.error('Error loading template details:', err);
          return null;
        }),
      ]);
      
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
      const activePeriods = Array.isArray(periodsData) 
        ? periodsData.filter(p => p.is_active) 
        : [];
      setPeriods(activePeriods);
      
      if (activePeriods.length > 0 && !selectedPeriodId) {
        setSelectedPeriodId(activePeriods[0].id);
      }
      
      if (templateData) {
        setTemplateDetail(templateData);
        console.log('✅ Template details loaded:', templateData);
      } else {
        console.warn('⚠️ Could not load template details');
      }
      
    } catch (err) {
      console.error('❌ Error loading data:', err);
      setError('Error al cargar los datos necesarios. Por favor, intente nuevamente.');
    } finally {
      setLoadingData(false);
    }
  };

  // ============= FUNCIÓN DE RESET =============
  const resetForm = () => {
    setSelectedEvaluatorId(null);
    setSelectedEmployeeIds([]);
    setSelectedPeriodId(null);
    setShowCriteria(false);
    setEmployeeSearch('');
    setEvaluatorSearch('');
    setSelectAll(false);
    setError(null);
    setSuccessMessage(null);
    setShowEvaluatorList(true);
  };

  // ============= FILTRADO DE EMPLEADOS =============
  const filteredEmployees = employees.filter(employee => {
    if (employee.id === selectedEvaluatorId) return false;
    if (!employeeSearch) return true;
    
    const searchLower = employeeSearch.toLowerCase();
    return (
      employee.first_name.toLowerCase().includes(searchLower) ||
      employee.last_name.toLowerCase().includes(searchLower) ||
      employee.email.toLowerCase().includes(searchLower) ||
      (employee.position?.toLowerCase()?.includes(searchLower) || false)
    );
  });

  // ============= FILTRADO DE EVALUADORES =============
  const filteredEvaluators = employees.filter(employee => {
    if (!evaluatorSearch) return true;
    
    const searchLower = evaluatorSearch.toLowerCase();
    return (
      employee.first_name.toLowerCase().includes(searchLower) ||
      employee.last_name.toLowerCase().includes(searchLower) ||
      employee.email.toLowerCase().includes(searchLower) ||
      (employee.position?.toLowerCase()?.includes(searchLower) || false)
    );
  });

  // ============= HANDLERS DE SELECCIÓN =============
  const handleToggleEmployee = (employeeId: number) => {
    setSelectedEmployeeIds(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
    setError(null);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployeeIds([]);
    } else {
      setSelectedEmployeeIds(filteredEmployees.map(e => e.id));
    }
    setSelectAll(!selectAll);
  };

  const handleEvaluatorSelect = (evaluatorId: number | null) => {
    if (selectedEvaluatorId === evaluatorId) {
      setSelectedEvaluatorId(null);
      setShowEvaluatorList(true);
      setEvaluatorSearch('');
    } else {
      setSelectedEvaluatorId(evaluatorId);
      setShowEvaluatorList(false);
      setEvaluatorSearch('');
      if (evaluatorId) {
        setSelectedEmployeeIds(prev => prev.filter(id => id !== evaluatorId));
      }
    }
    setError(null);
  };

  const handleChangeEvaluator = () => {
    setShowEvaluatorList(true);
  };

  // ============= UTILIDADES DE UI =============
  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'productivity':
      case 'productividad':
        return 'Productividad';
      case 'work_conduct':
      case 'conducta_laboral':
        return 'Conducta Laboral';
      case 'skills':
      case 'habilidades':
        return 'Habilidades';
      default:
        return category;
    }
  };

  const getTotalCriteria = (): number => {
    if (!templateDetail) return 0;
    return (
      (templateDetail.criteria.productivity?.length || 0) +
      (templateDetail.criteria.work_conduct?.length || 0) +
      (templateDetail.criteria.skills?.length || 0)
    );
  };

  // ============= VALIDACIÓN =============
  const validateForm = (): string | null => {
    if (!selectedEvaluatorId) {
      return 'Debe seleccionar un evaluador responsable';
    }
    
    if (selectedEmployeeIds.length === 0) {
      return 'Debe seleccionar al menos un empleado a evaluar';
    }
    
    if (!selectedPeriodId) {
      return 'Debe seleccionar un período de evaluación';
    }
    
    return null;
  };

  // ============= SUBMIT HANDLER =============
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    if (!template) {
      setError('No se ha seleccionado una plantilla válida');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('📤 Creating evaluations with:', {
        template_id: template.id,
        evaluator_id: selectedEvaluatorId,
        employee_ids: selectedEmployeeIds,
        period_id: selectedPeriodId,
      });
      
      const evaluationDTO: CreateEvaluationsFromTemplateDTO = {
        template_id: template.id,
        evaluator_id: selectedEvaluatorId!,
        employee_ids: selectedEmployeeIds,
        period_id: selectedPeriodId!,
      };
      
      const result = await createEvaluationsFromTemplate(evaluationDTO);
      
      console.log('✅ Evaluations created successfully:', result);
      
      setSuccessMessage(`Se han creado ${selectedEmployeeIds.length} evaluaciones exitosamente`);
      
      setTimeout(() => {
        onCreated({
          ...result,
          template_name: template.name,
          evaluator_id: selectedEvaluatorId,
          period_id: selectedPeriodId,
        });
        handleClose();
      }, 1500);
      
    } catch (err: any) {
      console.error('❌ Error creating evaluations:', err);
      
      let errorMessage = 'Error al crear las evaluaciones. Por favor, intente nuevamente.';
      
      if (err.message) {
        if (err.message.includes('ya tienen evaluaciones')) {
          errorMessage = 'Algunos empleados ya tienen evaluaciones para este período.';
        } else if (err.message.includes('período no está activo')) {
          errorMessage = 'El período seleccionado no está activo.';
        } else if (err.message.includes('plantilla no está activa')) {
          errorMessage = 'La plantilla seleccionada no está activa.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ============= CLOSE HANDLER =============
  const handleClose = () => {
    if (loading) return;
    resetForm();
    onClose();
  };

  // ============= GET SELECTED EVALUATOR =============
  const selectedEvaluator = employees.find(e => e.id === selectedEvaluatorId);

  if (!show || !template) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-xl">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FileCheck className="text-purple-600" size={24} />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Generar Evaluaciones desde Plantilla
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {template.name}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loadingData ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-purple-600 mr-3" size={32} />
              <span className="text-gray-600">Cargando información...</span>
            </div>
          ) : successMessage ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">¡Éxito!</h4>
              <p className="text-gray-600">{successMessage}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* TEMPLATE INFO & CRITERIA PREVIEW */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-purple-900">
                    Información de la Plantilla
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowCriteria(!showCriteria)}
                    className="text-purple-600 hover:text-purple-700 flex items-center gap-1 text-sm"
                  >
                    {showCriteria ? (
                      <>
                        <ChevronUp size={16} />
                        Ocultar criterios
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} />
                        Ver criterios ({getTotalCriteria()})
                      </>
                    )}
                  </button>
                </div>
                
                {template.description && (
                  <p className="text-sm text-purple-700 mb-2">{template.description}</p>
                )}
                
                {showCriteria && templateDetail && (
                  <div className="mt-4 space-y-3">
                    {templateDetail.criteria.productivity && templateDetail.criteria.productivity.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-purple-900 mb-2">
                          {getCategoryLabel('productividad')}
                        </h5>
                        <div className="space-y-1">
                          {templateDetail.criteria.productivity.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm bg-white/50 rounded px-2 py-1">
                              <span className="text-purple-700">{item.criteria?.name || 'Criterio sin nombre'}</span>
                              <span className="text-purple-600 font-medium">{item.weight}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {templateDetail.criteria.work_conduct && templateDetail.criteria.work_conduct.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-purple-900 mb-2">
                          {getCategoryLabel('conducta_laboral')}
                        </h5>
                        <div className="space-y-1">
                          {templateDetail.criteria.work_conduct.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm bg-white/50 rounded px-2 py-1">
                              <span className="text-purple-700">{item.criteria?.name || 'Criterio sin nombre'}</span>
                              <span className="text-purple-600 font-medium">{item.weight}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {templateDetail.criteria.skills && templateDetail.criteria.skills.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-purple-900 mb-2">
                          {getCategoryLabel('habilidades')}
                        </h5>
                        <div className="space-y-1">
                          {templateDetail.criteria.skills.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm bg-white/50 rounded px-2 py-1">
                              <span className="text-purple-700">{item.criteria?.name || 'Criterio sin nombre'}</span>
                              <span className="text-purple-600 font-medium">{item.weight}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* PERIOD SELECTION */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline-block w-4 h-4 mr-1" />
                  Período de Evaluación
                </label>
                <select
                  value={selectedPeriodId || ''}
                  onChange={(e) => setSelectedPeriodId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  disabled={loading}
                >
                  <option value="">Seleccione un período</option>
                  {periods.map(period => (
                    <option key={period.id} value={period.id}>
                      {period.name} - {period.description}
                      {period.due_date && ` (Vence: ${new Date(period.due_date).toLocaleDateString()})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* EVALUATOR SELECTION */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <UserCheck className="inline-block w-4 h-4 mr-1" />
                  Evaluador Responsable
                </label>
                <div className="transition-all duration-300">
                  {showEvaluatorList ? (
                    <>
                      <div className="mb-3 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          placeholder="Buscar evaluador por nombre, email o cargo..."
                          value={evaluatorSearch}
                          onChange={(e) => setEvaluatorSearch(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          disabled={loading}
                        />
                      </div>
                      <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                        {filteredEvaluators.length === 0 ? (
                          <p className="text-center py-8 text-gray-500">
                            {evaluatorSearch 
                              ? 'No se encontraron evaluadores con ese criterio' 
                              : 'No hay evaluadores disponibles'}
                          </p>
                        ) : (
                          <div className="divide-y divide-gray-200">
                            {filteredEvaluators.map(evaluator => (
                              <label
                                key={evaluator.id}
                                className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                                  selectedEvaluatorId === evaluator.id ? 'bg-purple-50' : ''
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="evaluator"
                                  checked={selectedEvaluatorId === evaluator.id}
                                  onChange={() => handleEvaluatorSelect(evaluator.id)}
                                  className="mr-3 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                  disabled={loading}
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {evaluator.first_name} {evaluator.last_name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {evaluator.position || 'Sin cargo'} • {evaluator.email}
                                    {evaluator.department && ` • ${evaluator.department}`}
                                  </p>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    selectedEvaluator && (
                      <div className="border border-gray-200 rounded-lg p-3 bg-purple-50 flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {selectedEvaluator.first_name} {selectedEvaluator.last_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {selectedEvaluator.position || 'Sin cargo'} • {selectedEvaluator.email}
                            {selectedEvaluator.department && ` • ${selectedEvaluator.department}`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleChangeEvaluator}
                            className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                            disabled={loading}
                          >
                            Cambiar Evaluador
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* EMPLOYEES SELECTION */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline-block w-4 h-4 mr-1" />
                  Empleados a Evaluar ({selectedEmployeeIds.length} seleccionados)
                </label>
                
                <div className="mb-3 flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, email o cargo..."
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={loading}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                    disabled={loading}
                  >
                    {selectAll ? 'Deseleccionar todos' : `Seleccionar todos (${filteredEmployees.length})`}
                  </button>
                </div>
                
                <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                  {filteredEmployees.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">
                      {employeeSearch 
                        ? 'No se encontraron empleados con ese criterio' 
                        : 'No hay empleados disponibles para evaluar'}
                    </p>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {filteredEmployees.map(employee => (
                        <label
                          key={employee.id}
                          className="flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedEmployeeIds.includes(employee.id)}
                            onChange={() => handleToggleEmployee(employee.id)}
                            className="mr-3 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                            disabled={loading}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {employee.first_name} {employee.last_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {employee.position || 'Sin cargo'} • {employee.email}
                              {employee.department && ` • ${employee.department}`}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ERROR MESSAGE */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center flex-shrink-0">
          <div className="text-sm text-gray-500">
            {selectedEmployeeIds.length > 0 && !successMessage && (
              <span>
                Se crearán <span className="font-semibold">{selectedEmployeeIds.length}</span> evaluaciones
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {successMessage ? 'Cerrar' : 'Cancelar'}
            </button>
            {!successMessage && (
              <button
                onClick={handleSubmit}
                disabled={loading || loadingData || !selectedEvaluatorId || selectedEmployeeIds.length === 0 || !selectedPeriodId}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Generando...
                  </>
                ) : (
                  <>
                    <FileCheck size={16} />
                    Generar Evaluaciones
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerarEvaluacionDesdeTemplateModal;