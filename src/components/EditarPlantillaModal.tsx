import React, { useState, useEffect, useMemo } from 'react';
import { FileCheck, X, Loader2, Plus, Target, Trash2, Percent, Save, Filter, AlertCircle } from 'lucide-react';
import { getCriteria, updateTemplate, getTemplateById } from '../services/evaluationService';
import type { TemplateListItem, Criteria, CreateTemplateDTO, TemplateCriteriaItem, TemplateDetail, Template} from '../types/evaluation';
import {isTemplateDetail } from '../types/evaluation';
interface EditarPlantillaModalProps {
  show: boolean;
  template: TemplateListItem | null;
  onClose: () => void;
  onUpdated: (updatedTemplate: TemplateListItem) => void;
}

interface PlantillaForm {
  name: string;
  description: string;
  selectedCriteria: {
    criteriaId: number;
    weight: number;
    category: 'productividad' | 'conducta_laboral' | 'habilidades';
  }[];
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

const EditarPlantillaModal: React.FC<EditarPlantillaModalProps> = ({ show, template, onClose, onUpdated }) => {
  const [form, setForm] = useState<PlantillaForm>({
    name: '',
    description: '',
    selectedCriteria: [],
  });

  const [templateDetail, setTemplateDetail] = useState<TemplateDetail | null>(null);
  const [availableCriteria, setAvailableCriteria] = useState<Criteria[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCriteria, setLoadingCriteria] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');

  useEffect(() => {
    if (show && template) {
      console.log('📝 Opening EditarPlantillaModal with template:', template);
      loadTemplateDetails();
      loadCriteria();
      setError(null);
      setLoadError(null);
      setCategoryFilter('todos');
    } else if (!show) {
      // Reset everything when modal closes
      setTemplateDetail(null);
      setForm({
        name: '',
        description: '',
        selectedCriteria: [],
      });
      setError(null);
      setLoadError(null);
    }
  }, [show, template]);

  const loadTemplateDetails = async () => {
    if (!template?.id) {
      console.error('❌ No template ID provided');
      setLoadError('No se proporcionó un template válido');
      return;
    }

    setLoadingTemplate(true);
    setLoadError(null);
    
    try {
      console.log('🔄 Loading template details for ID:', template.id);
      const fullTemplate = await getTemplateById(template.id);
      console.log('✅ Template details loaded:', fullTemplate);
      
      setTemplateDetail(fullTemplate);
      
      // Mapear los criterios correctamente
      const selectedCriteria = [
        ...(fullTemplate.criteria?.productivity || []).map((c: TemplateCriteriaItem) => ({
          criteriaId: c.criteria?.id || 0,
          weight: c.weight,
          category: 'productividad' as const,
        })),
        ...(fullTemplate.criteria?.work_conduct || []).map((c: TemplateCriteriaItem) => ({
          criteriaId: c.criteria?.id || 0,
          weight: c.weight,
          category: 'conducta_laboral' as const,
        })),
        ...(fullTemplate.criteria?.skills || []).map((c: TemplateCriteriaItem) => ({
          criteriaId: c.criteria?.id || 0,
          weight: c.weight,
          category: 'habilidades' as const,
        })),
      ];

      console.log('📊 Mapped criteria:', selectedCriteria);

      setForm({
        name: fullTemplate.name,
        description: fullTemplate.description || '',
        selectedCriteria,
      });
    } catch (err) {
      console.error('❌ Error loading template details:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los detalles del template';
      setLoadError(errorMessage);
      
      // Si hay error, usar los datos básicos del template que ya tenemos
      setForm({
        name: template.name,
        description: template.description || '',
        selectedCriteria: [],
      });
    } finally {
      setLoadingTemplate(false);
    }
  };

  const loadCriteria = async () => {
    setLoadingCriteria(true);
    try {
      console.log('🔄 Loading criteria...');
      const criteria = await getCriteria();
      console.log('✅ Criteria loaded:', criteria);
      setAvailableCriteria(Array.isArray(criteria) ? criteria : []);
    } catch (err) {
      console.error('❌ Error loading criteria:', err);
      setError('Error al cargar criterios');
    } finally {
      setLoadingCriteria(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const addCriteria = (criteria: Criteria) => {
    if (form.selectedCriteria.some(sc => sc.criteriaId === criteria.id)) return;
    setForm(prev => ({
      ...prev,
      selectedCriteria: [
        ...prev.selectedCriteria,
        {
          criteriaId: criteria.id,
          weight: 100,
          category: criteria.category as 'productividad' | 'conducta_laboral' | 'habilidades',
        },
      ],
    }));
  };

  const removeCriteria = (criteriaId: number) => {
    setForm(prev => ({
      ...prev,
      selectedCriteria: prev.selectedCriteria.filter(sc => sc.criteriaId !== criteriaId)
    }));
  };

  const updateCriteriaWeight = (criteriaId: number, weight: number) => {
    setForm(prev => ({
      ...prev,
      selectedCriteria: prev.selectedCriteria.map(sc =>
        sc.criteriaId === criteriaId ? { ...sc, weight } : sc
      ),
    }));
  };

  const validateWeights = () => {
    const categoryWeights = {
      productividad: 0,
      conducta_laboral: 0,
      habilidades: 0,
    };

    form.selectedCriteria.forEach(sc => {
      categoryWeights[sc.category] += sc.weight;
    });

    const errors: string[] = [];
    Object.entries(categoryWeights).forEach(([category, weight]) => {
      if (weight > 0 && weight !== 100) {
        errors.push(`${mapCategory(category)}: ${weight}% (debe ser 100%)`);
      }
    });

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const weightErrors = validateWeights();
    if (weightErrors.length > 0) {
      setError(`Los pesos deben sumar 100% por categoría:\n${weightErrors.join('\n')}`);
      return;
    }

    if (!template?.id) {
      setError('No se proporcionó un template válido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dto: CreateTemplateDTO = {
        name: form.name,
        description: form.description,
        criteria: {
          productivity: criteriaByCategory.productividad.map(sc => ({
            criteria_id: sc.criteriaId,
            weight: sc.weight,
          })),
          work_conduct: criteriaByCategory.conducta_laboral.map(sc => ({
            criteria_id: sc.criteriaId,
            weight: sc.weight,
          })),
          skills: criteriaByCategory.habilidades.map(sc => ({
            criteria_id: sc.criteriaId,
            weight: sc.weight,
          })),
        },
      };

      console.log('📤 Updating template with DTO:', dto);
      const result = await updateTemplate(template.id, dto);
      console.log('✅ Template updated:', result);

      // Manejar respuesta del backend con type safety
      let criteriaCount = 0;
      let categoriesUsed = 0;

      // Verificar el tipo de respuesta usando type guard
      if (isTemplateDetail(result)) {
        // Es TemplateDetail - tiene criteria como objeto
        criteriaCount = 
          (result.criteria?.productivity?.length || 0) + 
          (result.criteria?.work_conduct?.length || 0) + 
          (result.criteria?.skills?.length || 0);
        
        categoriesUsed = [
          (result.criteria?.productivity?.length || 0) > 0,
          (result.criteria?.work_conduct?.length || 0) > 0,
          (result.criteria?.skills?.length || 0) > 0
        ].filter(Boolean).length;
      } else {
        // Es TemplateListItem - ya tiene criteria_count y categories_used
        criteriaCount = result.criteria_count || 0;
        categoriesUsed = result.categories_used || 0;
      }

      const updatedTemplate: TemplateListItem = {
        id: result.id,
        name: result.name,
        description: result.description || '',
        is_active: result.is_active,
        criteria_count: criteriaCount,
        categories_used: categoriesUsed,
        created_at: result.created_at,
        updated_at: result.updated_at,
      };
      
      onUpdated(updatedTemplate);
      onClose();
    } catch (err: any) {
      console.error('❌ Error updating template:', err);
      let errorMessage = 'Error al actualizar la plantilla.';
      const errStr = err.message || '';
      if (errStr.includes('HTTP')) {
        try {
          const status = errStr.split('HTTP ')[1].split(': ')[0];
          const bodyStr = errStr.split(`${status}: `)[1];
          const parsed = JSON.parse(bodyStr);
          if (parsed.details) {
            errorMessage = parsed.details;
          } else if (parsed.message) {
            errorMessage = parsed.message;
          } else if (parsed.error) {
            errorMessage = parsed.error;
          }
        } catch (parseErr) {
          console.error('Error parsing backend error:', parseErr);
        }
      } else if (errStr.includes('validación de pesos')) {
        errorMessage = errStr;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!show || !template) return null;

  const criteriaByCategory = {
    productividad: form.selectedCriteria.filter(sc => sc.category === 'productividad'),
    conducta_laboral: form.selectedCriteria.filter(sc => sc.category === 'conducta_laboral'),
    habilidades: form.selectedCriteria.filter(sc => sc.category === 'habilidades'),
  };

  const getFilteredAvailableCriteria = () => {
    let filtered = availableCriteria.filter(c => !form.selectedCriteria.some(sc => sc.criteriaId === c.id));

    if (categoryFilter !== 'todos') {
      filtered = filtered.filter(c => c.category === categoryFilter);
    }

    return filtered;
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl h-[85vh] flex flex-col shadow-xl">
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FileCheck className="text-purple-600" size={24} />
              Editar Plantilla
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 min-h-0">
            {/* Loading state para template details */}
            {loadingTemplate && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                <span className="ml-2 text-gray-600">Cargando detalles del template...</span>
              </div>
            )}

            {/* Mostrar error si hay problema cargando el template */}
            {!loadingTemplate && loadError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Error al cargar el template</p>
                  <p className="text-sm mt-1">{loadError}</p>
                  <p className="text-sm mt-2">Se usarán los datos básicos disponibles.</p>
                </div>
              </div>
            )}

            {/* Mostrar el formulario cuando termine de cargar o si hay error (con datos básicos) */}
            {!loadingTemplate && (
              <>
                {/* Información básica */}
                <div className="grid grid-cols-1 gap-4 flex-shrink-0">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Plantilla
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Ingrese el nombre de la plantilla"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Ingrese una descripción de la plantilla"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Sección de criterios */}
                <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
                  {/* Criterios disponibles */}
                  <div className="flex flex-col min-h-0">
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Criterios Disponibles</h4>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setCategoryFilter('todos')}
                          className={`px-3 py-1 text-xs rounded-full transition-colors ${
                            categoryFilter === 'todos'
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Todos
                        </button>
                        <button
                          type="button"
                          onClick={() => setCategoryFilter('productividad')}
                          className={`px-3 py-1 text-xs rounded-full transition-colors ${
                            categoryFilter === 'productividad'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Productividad
                        </button>
                        <button
                          type="button"
                          onClick={() => setCategoryFilter('conducta_laboral')}
                          className={`px-3 py-1 text-xs rounded-full transition-colors ${
                            categoryFilter === 'conducta_laboral'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Conducta
                        </button>
                        <button
                          type="button"
                          onClick={() => setCategoryFilter('habilidades')}
                          className={`px-3 py-1 text-xs rounded-full transition-colors ${
                            categoryFilter === 'habilidades'
                              ? 'bg-orange-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Habilidades
                        </button>
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-lg flex-1 overflow-y-auto">
                      {loadingCriteria ? (
                        <div className="flex justify-center items-center h-full">
                          <Loader2 className="animate-spin text-purple-600" size={24} />
                        </div>
                      ) : getFilteredAvailableCriteria().length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                          <Target className="w-12 h-12 mb-2 text-gray-300" />
                          <p className="text-sm text-center">No hay criterios disponibles</p>
                        </div>
                      ) : (
                        <div className="p-2 space-y-1">
                          {getFilteredAvailableCriteria().map(criteria => (
                            <div
                              key={criteria.id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{criteria.name}</p>
                                <p className="text-xs text-gray-500">{mapCategory(criteria.category)}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => addCriteria(criteria)}
                                className="ml-2 p-1 text-purple-600 hover:bg-purple-100 rounded transition-colors"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Criterios seleccionados */}
                  <div className="flex flex-col min-h-0">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Criterios Seleccionados</h4>
                    <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                      {['productividad', 'conducta_laboral', 'habilidades'].map(category => {
                        const categoryCriteria = criteriaByCategory[category as keyof typeof criteriaByCategory];
                        const totalWeight = categoryCriteria.reduce((sum, sc) => sum + sc.weight, 0);
                        const hasError = categoryCriteria.length > 0 && totalWeight !== 100;

                        return (
                          <div key={category} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-sm font-medium text-gray-700">
                                {mapCategory(category)}
                              </h5>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  hasError
                                    ? 'bg-red-100 text-red-700'
                                    : totalWeight === 100
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                <Percent size={10} className="inline mr-1" />
                                {totalWeight}%
                              </span>
                            </div>
                            {categoryCriteria.length === 0 ? (
                              <p className="text-xs text-gray-500 text-center py-2">
                                Sin criterios asignados
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {categoryCriteria.map(sc => {
                                  const criteria = availableCriteria.find(c => c.id === sc.criteriaId);
                                  return (
                                    <div
                                      key={sc.criteriaId}
                                      className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-gray-900 truncate">
                                          {criteria?.name || 'Criterio desconocido'}
                                        </p>
                                      </div>
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={sc.weight}
                                        onChange={(e) => updateCriteriaWeight(sc.criteriaId, parseInt(e.target.value) || 0)}
                                        className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeCriteria(sc.criteriaId)}
                                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="whitespace-pre-line">{error}</p>
              </div>
            )}
          </div>

          {/* Footer con botones */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || loadingTemplate}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Actualizando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Actualizar Plantilla
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarPlantillaModal;