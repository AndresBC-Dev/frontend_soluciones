import React, { useState, useEffect, useMemo } from 'react';
import { FileCheck, X, Loader2, Plus, Target, Trash2, Percent, Save, Filter } from 'lucide-react';
import { getCriteria, updateTemplate, getTemplateById } from '../services/evaluationService';
import type { TemplateListItem, Criteria, CreateTemplateDTO, TemplateCriteriaItem, TemplateDetail } from '../types/evaluation';

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
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');

  useEffect(() => {
    if (show && template) {
      loadTemplateDetails();
      loadCriteria();
      setError(null);
      setCategoryFilter('todos');
    } else if (!show) {
      setTemplateDetail(null);
      setForm({
        name: '',
        description: '',
        selectedCriteria: [],
      });
    }
  }, [show, template]);

  // Cargar detalles completos del template (igual que VerPlantillaModal)
  const loadTemplateDetails = async () => {
    if (!template?.id) return;

    setLoadingTemplate(true);
    try {
      const fullTemplate = await getTemplateById(template.id);
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

      setForm({
        name: fullTemplate.name,
        description: fullTemplate.description || '',
        selectedCriteria,
      });
    } catch (err) {
      console.error('Error loading template details:', err);
      setError('Error al cargar los detalles del template');
    } finally {
      setLoadingTemplate(false);
    }
  };

  const loadCriteria = async () => {
    setLoadingCriteria(true);
    try {
      const criteria = await getCriteria();
      setAvailableCriteria(Array.isArray(criteria) ? criteria : []);
    } catch (err) {
      console.error('Error loading criteria:', err);
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

  const getTotalWeightByCategory = (category: string): number => {
    return form.selectedCriteria
      .filter(sc => sc.category === category)
      .reduce((sum, sc) => sum + sc.weight, 0);
  };

  const getUsedCategories = (): string[] => {
    const categories = new Set(form.selectedCriteria.map(sc => sc.category));
    return Array.from(categories);
  };

  const normalizeWeightsByCategory = (category: string) => {
    const categoryItems = form.selectedCriteria.filter(sc => sc.category === category);
    const count = categoryItems.length;
    
    if (count === 0) return;

    const baseWeight = 100 / count;
    
    const updatedCriteria = form.selectedCriteria.map((criteria) => {
      if (criteria.category !== category) return criteria;
      return { ...criteria, weight: baseWeight };
    });

    setForm(prev => ({
      ...prev,
      selectedCriteria: updatedCriteria,
    }));
  };

  // AQUÍ ESTÁ LA VALIDACIÓN CON USEMEMO - ESTA ES LA LÍNEA IMPORTANTE
  const validationResult = useMemo(() => {
    const usedCategories = getUsedCategories();
    const tolerance = 0.01;

    for (const category of usedCategories) {
      const total = getTotalWeightByCategory(category);
      
      if (Math.abs(total - 100) > tolerance) {
        return {
          valid: false,
          message: `Los criterios de ${mapCategory(category)} deben sumar 100% (actual: ${total.toFixed(2)}%)`,
        };
      }
    }

    return { valid: true };
  }, [form.selectedCriteria]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;

    // Validación por categoría (cada categoría debe sumar 100%)
    const validation = validationResult;
    if (!validation.valid) {
      setError(validation.message!);
      return;
    }

    if (form.selectedCriteria.length === 0) {
      setError('Debes seleccionar al menos un criterio de evaluación');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updateData: CreateTemplateDTO = {
        name: form.name,
        description: form.description,
        criteria: {
          productivity: form.selectedCriteria
            .filter(sc => sc.category === 'productividad')
            .map(sc => ({ criteria_id: sc.criteriaId, weight: sc.weight })),
          work_conduct: form.selectedCriteria
            .filter(sc => sc.category === 'conducta_laboral')
            .map(sc => ({ criteria_id: sc.criteriaId, weight: sc.weight })),
          skills: form.selectedCriteria
            .filter(sc => sc.category === 'habilidades')
            .map(sc => ({ criteria_id: sc.criteriaId, weight: sc.weight })),
        },
      };

      console.log('🔧 FULL UPDATE DATA TO BACKEND:');
      console.log('📋 Name:', updateData.name);
      console.log('📋 Description:', updateData.description);
      console.log('📋 Productivity criteria:', updateData.criteria.productivity);
      console.log('📋 Work conduct criteria:', updateData.criteria.work_conduct);
      console.log('📋 Skills criteria:', updateData.criteria.skills);
      console.log('📋 Total criteria count:', 
        updateData.criteria.productivity.length + 
        updateData.criteria.work_conduct.length + 
        updateData.criteria.skills.length
      );

      const result = await updateTemplate(template.id, updateData);
      const updatedTemplate: TemplateListItem = {
        id: result.id,
        name: result.name,
        description: result.description || '',
        is_active: result.is_active,
        criteria_count: 'criteria' in result
          ? Object.values(result.criteria).reduce((sum, arr: TemplateCriteriaItem[]) => sum + arr.length, 0)
          : (result.criteria_count as number) || 0,
        categories_used: 'criteria' in result
          ? Object.values(result.criteria).filter((arr: TemplateCriteriaItem[]) => arr.length > 0).length
          : (result.categories_used as number) || 0,
        created_at: result.created_at,
        updated_at: result.updated_at,
      };
      onUpdated(updatedTemplate);
      onClose();
    } catch (err: any) {
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

            {/* Solo mostrar el formulario cuando los detalles estén cargados */}
            {!loadingTemplate && templateDetail && (
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
                      placeholder="Descripción opcional de la plantilla"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex-shrink-0">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {/* Resumen de pesos por categoría */}
                <div className="bg-gray-50 rounded-lg p-4 flex-shrink-0">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Resumen de Pesos por Categoría:</h4>
                  <div className="space-y-2">
                    {(['productividad', 'conducta_laboral', 'habilidades'] as const).map(category => {
                      const categoryWeight = getTotalWeightByCategory(category);
                      const categoryCount = criteriaByCategory[category].length;
                      const isValid = Math.abs(categoryWeight - 100) < 0.01;
                      
                      if (categoryCount === 0) return null;
                      
                      return (
                        <div key={category} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{mapCategory(category)}:</span>
                          <span className={`text-sm font-semibold ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                            {categoryWeight.toFixed(2)}% / 100%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {!validationResult.valid && (
                    <p className="text-xs text-red-600 mt-2">
                      Cada categoría debe sumar exactamente 100%
                    </p>
                  )}
                </div>

                {/* Layout en dos columnas para aprovechar mejor el espacio */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                  
                  {/* Columna izquierda: Criterios seleccionados */}
                  <div className="flex flex-col min-h-0">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                      <Target className="text-purple-600" />
                      Criterios Seleccionados
                    </h3>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
                      {form.selectedCriteria.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                          No hay criterios seleccionados. Agrega criterios desde la columna derecha.
                        </p>
                      ) : (
                        Object.entries(criteriaByCategory).map(([category, criteria]) => {
                          if (criteria.length === 0) return null;

                          const categoryTotal = getTotalWeightByCategory(category);
                          const isValid = Math.abs(categoryTotal - 100) < 0.01;

                          return (
                            <div key={category} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium text-gray-700">
                                  {mapCategory(category)}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-sm font-medium px-2 py-1 rounded ${
                                      isValid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                    }`}
                                  >
                                    Total: {categoryTotal.toFixed(2)}%
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => normalizeWeightsByCategory(category)}
                                    className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                                  >
                                    Normalizar
                                  </button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                {criteria.map((sc, index) => {
                                  const criteriaInfo = availableCriteria.find(c => c.id === sc.criteriaId);
                                  return (
                                    <div
                                      key={`selected-${sc.criteriaId}-${category}-${index}`}
                                      className="flex items-center gap-3 bg-white p-2 rounded border border-gray-200"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm text-gray-800 truncate">
                                          {criteriaInfo?.name}
                                        </p>
                                        {criteriaInfo?.description && (
                                          <p className="text-xs text-gray-500 truncate">
                                            {criteriaInfo.description}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="number"
                                          value={sc.weight}
                                          onChange={(e) => updateCriteriaWeight(sc.criteriaId, parseFloat(e.target.value) || 0)}
                                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                                          min="0"
                                          max="100"
                                          step="0.1"
                                        />
                                        <Percent size={14} className="text-gray-400" />
                                        <button
                                          type="button"
                                          onClick={() => removeCriteria(sc.criteriaId)}
                                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Columna derecha: Criterios disponibles */}
                  <div className="flex flex-col min-h-0">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Plus className="text-purple-600" />
                        Criterios Disponibles
                      </h3>
                      <div className="flex items-center gap-2">
                        <Filter size={16} className="text-gray-400" />
                        <select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="text-sm border border-gray-300 rounded px-3 py-1 focus:ring-1 focus:ring-purple-500"
                        >
                          <option value="todos">Todas las categorías</option>
                          <option value="productividad">Productividad</option>
                          <option value="conducta_laboral">Conducta Laboral</option>
                          <option value="habilidades">Habilidades</option>
                        </select>
                      </div>
                    </div>

                    {loadingCriteria ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                        <span className="ml-2 text-gray-600">Cargando criterios disponibles...</span>
                      </div>
                    ) : (
                      <div className="bg-white border border-gray-200 rounded-lg flex-1 overflow-y-auto min-h-0">
                        {getFilteredAvailableCriteria().length === 0 ? (
                          <div className="p-4 text-center">
                            <p className="text-gray-500">
                              {categoryFilter === 'todos' 
                                ? 'Todos los criterios disponibles ya están seleccionados'
                                : `No hay criterios de ${mapCategory(categoryFilter)} disponibles`
                              }
                            </p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {getFilteredAvailableCriteria().map((criteria) => (
                              <div
                                key={`available-${criteria.id}`}
                                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex-1 pr-4">
                                  <p className="font-medium text-sm text-gray-800">{criteria.name}</p>
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{criteria.description}</p>
                                  <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                    {mapCategory(criteria.category)}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => addCriteria(criteria)}
                                  className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex-shrink-0"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || loadingTemplate || !validationResult.valid || form.selectedCriteria.length === 0}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Actualizar Plantilla
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarPlantillaModal;