import React, { useState, useEffect } from 'react';
import { FileCheck, X, Loader2, Plus, Target, Trash2, Percent, Save, Filter } from 'lucide-react';
import { getCriteria, createTemplate } from '../services/evaluationService';
import type { Template, Criteria, CreateTemplateDTO, TemplateListItem } from '../types/evaluation';

interface CrearPlantillaModalProps {
  show: boolean;
  onClose: () => void;
  onCreated: (template: TemplateListItem) => void;
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

const CrearPlantillaModal: React.FC<CrearPlantillaModalProps> = ({ show, onClose, onCreated }) => {
  const [form, setForm] = useState<PlantillaForm>({
    name: '',
    description: '',
    selectedCriteria: [],
  });

  const [availableCriteria, setAvailableCriteria] = useState<Criteria[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCriteria, setLoadingCriteria] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');

  useEffect(() => {
    if (show) {
      loadCriteria();
      setForm({ name: '', description: '', selectedCriteria: [] });
      setError(null);
      setCategoryFilter('todos');
    }
  }, [show]);

  const loadCriteria = async () => {
    setLoadingCriteria(true);
    try {
      const criteria = await getCriteria();
      setAvailableCriteria(Array.isArray(criteria) ? criteria : []);
    } catch (err) {
      console.error('Error loading criteria:', err);
      setError('Error al cargar los criterios disponibles');
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
      selectedCriteria: prev.selectedCriteria.filter(sc => sc.criteriaId !== criteriaId),
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

  const validateCategoryWeights = (): { valid: boolean; message?: string } => {
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
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!form.name.trim()) {
      setError('El nombre de la plantilla es obligatorio');
      return;
    }

    if (form.selectedCriteria.length === 0) {
      setError('Debes seleccionar al menos un criterio de evaluación');
      return;
    }

    const validation = validateCategoryWeights();
    if (!validation.valid) {
      setError(validation.message!);
      return;
    }

    const invalidWeight = form.selectedCriteria.some(sc => sc.weight <= 0);
    if (invalidWeight) {
      setError('Cada criterio debe tener un peso mayor a 0%');
      return;
    }

    const templateDTO: CreateTemplateDTO = {
      name: form.name,
      description: form.description,
      criteria: {
        productivity: form.selectedCriteria
          .filter(sc => sc.category === 'productividad')
          .map(sc => ({
            CriteriaID: sc.criteriaId,
            weight: Number(sc.weight.toFixed(2)),
          })),
        work_conduct: form.selectedCriteria
          .filter(sc => sc.category === 'conducta_laboral')
          .map(sc => ({
            CriteriaID: sc.criteriaId,
            weight: Number(sc.weight.toFixed(2)),
          })),
        skills: form.selectedCriteria
          .filter(sc => sc.category === 'habilidades')
          .map(sc => ({
            CriteriaID: sc.criteriaId,
            weight: Number(sc.weight.toFixed(2)),
          })),
      },
    };

    try {
      setLoading(true);
      console.log('🔄 Sending template to backend:', templateDTO);
      const result = await createTemplate(templateDTO);
      const templateListItem: TemplateListItem = {
        id: result.id,
        name: result.name,
        description: result.description,
        is_active: result.is_active,
        criteria_count: 'criteria' in result
          ? Object.values(result.criteria).reduce((sum, arr) => sum + arr.length, 0)
          : result.criteria_count || 0,
        categories_used: 'criteria' in result
          ? Object.values(result.criteria).filter(arr => arr.length > 0).length
          : result.categories_used || 0,
        created_at: result.created_at,
        updated_at: result.updated_at,
      };
      onCreated(templateListItem);
      onClose();
    } catch (err: any) {
      let errorMessage = 'Error al crear la plantilla.';
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

  if (!show) return null;

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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-xl">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FileCheck className="text-purple-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-900">Crear Nueva Plantilla de Evaluación</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Plantilla *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="Ej: Evaluación Trimestral Desarrolladores"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="Describe el propósito de esta plantilla..."
                  rows={2}
                />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Target size={20} className="text-purple-600" />
                Criterios Seleccionados por Categoría
              </h3>
              <div className="space-y-3 max-h-72 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {getUsedCategories().length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No hay criterios seleccionados. Agrega criterios desde la sección inferior.
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
                          {criteria.map(sc => {
                            const criteriaInfo = availableCriteria.find(c => c.id === sc.criteriaId);
                            return (
                              <div
                                key={sc.criteriaId}
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
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={sc.weight}
                                    onChange={(e) =>
                                      updateCriteriaWeight(sc.criteriaId, parseFloat(e.target.value) || 0)
                                    }
                                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-center focus:ring-1 focus:ring-purple-500"
                                    min="0.01"
                                    max="100"
                                    step="0.01"
                                  />
                                  <Percent size={14} className="text-gray-400" />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeCriteria(sc.criteriaId)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
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
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-gray-900">Criterios Disponibles</h3>
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-400" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="text-sm px-3 py-1 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="todos">Todas las categorías</option>
                    <option value="productividad">Productividad</option>
                    <option value="conducta_laboral">Conducta Laboral</option>
                    <option value="habilidades">Habilidades</option>
                  </select>
                </div>
              </div>
              {loadingCriteria ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-purple-600" size={24} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {getFilteredAvailableCriteria().length === 0 ? (
                    <p className="text-gray-500 text-sm col-span-2 text-center py-4">
                      {categoryFilter !== 'todos'
                        ? 'No hay criterios disponibles en esta categoría'
                        : 'No hay más criterios disponibles'}
                    </p>
                  ) : (
                    getFilteredAvailableCriteria().map(criteria => (
                      <div
                        key={criteria.id}
                        className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                      >
                        <div className="flex-1 min-w-0 mr-2">
                          <p className="font-medium text-sm text-gray-800 truncate">{criteria.name}</p>
                          <p className="text-xs text-gray-500">{mapCategory(criteria.category)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => addCriteria(criteria)}
                          className="p-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
          </form>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || form.selectedCriteria.length === 0}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Creando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Crear Plantilla
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearPlantillaModal;