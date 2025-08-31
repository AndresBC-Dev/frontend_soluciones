import React, { useState, useEffect } from 'react';
import { FileCheck, X, Loader2, Plus, Target, Trash2, Percent, Save } from 'lucide-react';
import { getCriteria, updateTemplate } from '../services/evaluationService';
import type { Template, Criteria } from '../services/evaluationService';
import type { CreateTemplateDTO } from '../types/evaluation';

interface EditarPlantillaModalProps {
  show: boolean;
  onClose: () => void;
  onUpdated: (updatedTemplate: Template) => void;
  template: Template | null;
}

interface PlantillaForm {
  name: string;
  description: string;
  selectedCriteria: {
    criteriaId: number;
    weight: number;
    category: 'productivity' | 'work_conduct' | 'skills';
  }[];
}

const mapCategory = (cat: string): 'productivity' | 'work_conduct' | 'skills' => {
  switch (cat) {
    case 'productividad': return 'productivity';
    case 'conducta_laboral': return 'work_conduct';
    case 'habilidades': return 'skills';
    default: return 'skills';
  }
};

const EditarPlantillaModal: React.FC<EditarPlantillaModalProps> = ({ show, onClose, onUpdated, template }) => {
  const [form, setForm] = useState<PlantillaForm>({
    name: '',
    description: '',
    selectedCriteria: [],
  });

  const [availableCriteria, setAvailableCriteria] = useState<Criteria[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCriteria, setLoadingCriteria] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show && template) {
      loadCriteria();
      setForm({
        name: template.name,
        description: template.description || '',
        selectedCriteria: template.criteria.map(c => ({
          criteriaId: c.criteriaId,
          weight: Math.round(c.weight * 100), // Convert to percentage
          category: mapCategory(c.category),
        })),
      });
      setError(null);
    }
  }, [show, template]);

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
          weight: criteria.weight ? Math.round(criteria.weight * 100) : 0,
          category: mapCategory(criteria.category),
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

  const getTotalWeightByCategory = () => {
    const categories: { [key in 'productivity' | 'work_conduct' | 'skills']?: number } = {};
    form.selectedCriteria.forEach(sc => {
      categories[sc.category] = (categories[sc.category] || 0) + sc.weight;
    });
    return categories;
  };

  const normalizeWeights = () => {
    const categories: { [key in 'productivity' | 'work_conduct' | 'skills']?: { criteriaId: number; weight: number; category: string }[] } = {
      productivity: [],
      work_conduct: [],
      skills: [],
    };

    form.selectedCriteria.forEach(sc => {
      categories[sc.category]?.push(sc);
    });

    Object.keys(categories).forEach((category) => {
      const criteriaList = categories[category as keyof typeof categories];
      if (!criteriaList || criteriaList.length === 0) return;

      const count = criteriaList.length;
      const baseWeight = Math.floor(100 / count);
      criteriaList.forEach((sc, index) => {
        sc.weight = baseWeight;
        if (index === count - 1) {
          const total = criteriaList.reduce((sum, c) => sum + c.weight, 0);
          sc.weight += 100 - total;
        }
      });
    });

    setForm(prev => ({
      ...prev,
      selectedCriteria: Object.values(categories).flat() as PlantillaForm['selectedCriteria'],
    }));
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

    const weightsByCategory = getTotalWeightByCategory();
    const categoryErrors: string[] = [];
    ['productivity', 'work_conduct', 'skills'].forEach(category => {
      if (weightsByCategory[category as keyof typeof weightsByCategory]) {
        const total = weightsByCategory[category as keyof typeof weightsByCategory] || 0;
        if (total !== 100) {
          const categoryName = {
            productivity: 'Productividad',
            work_conduct: 'Conducta Laboral',
            skills: 'Habilidades',
          }[category];
          categoryErrors.push(`${categoryName} suma ${total}% en lugar de 100%`);
        }
      }
    });

    if (categoryErrors.length > 0) {
      setError(`Verifica los pesos en los criterios: ${categoryErrors.join('; ')}`);
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
      criteria: form.selectedCriteria,
    };

    try {
      setLoading(true);
      if (!template?.id) throw new Error('No template ID provided');
      const result = await updateTemplate(template.id, templateDTO);
      if (!result) {
        setError('Nombre existente');
        return;
      }
      onUpdated(result);
    } catch (err: any) {
      let errorMessage = 'Error al actualizar la plantilla. Por favor, intenta de nuevo.';
      if (typeof err.message === 'string') {
        const match = err.message.match(/HTTP \d+:\s*(.*)/);
        if (match && match[1]) {
          try {
            const responseJson = JSON.parse(match[1]);
            if (responseJson.details && responseJson.details.includes('validación de pesos fallida')) {
              errorMessage = 'Verifica los pesos en los criterios';
            } else if (responseJson.details && (responseJson.details.includes('duplicate') || responseJson.details.includes('ya existe') || responseJson.details.includes('nombre existente'))) {
              errorMessage = 'Nombre existente';
            } else if (responseJson.error) {
              errorMessage = responseJson.error;
            }
          } catch (parseErr) {
            // No hacer nada si no se puede parsear
          }
        } else if (err.message.includes('duplicate') || err.message.includes('already exists') || err.message.includes('ya existe')) {
          errorMessage = 'Nombre existente';
        } else if (err.message.includes('pesos') || err.message.includes('weight')) {
          errorMessage = 'Verifica los pesos en los criterios';
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setForm({ name: '', description: '', selectedCriteria: [] });
    setError(null);
    onClose();
  };

  if (!show || !template) return null;

  const getCriteriaById = (id: number) => {
    return availableCriteria.find(c => c.id === id);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-purple-500" />
            Editar Plantilla
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Plantilla *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                type="text"
                placeholder="Ej: Evaluación Anual, Evaluación Trimestral..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción (Opcional)
              </label>
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                type="text"
                placeholder="Descripción breve de la plantilla..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              Criterios de Evaluación
            </h4>

            {loadingCriteria ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-gray-500">Cargando criterios...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-700 mb-3">Criterios Disponibles</h5>
                  <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {availableCriteria.length === 0 ? (
                      <p className="text-gray-500 text-sm">No hay criterios disponibles</p>
                    ) : (
                      availableCriteria
                        .filter(c => !form.selectedCriteria.some(sc => sc.criteriaId === c.id))
                        .map(criteria => (
                          <div
                            key={criteria.id}
                            className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg mb-2"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-sm">{criteria.description}</p>
                              <p className="text-xs text-gray-500">{criteria.category}</p>
                              <p className="text-xs text-purple-600">
                                Peso sugerido: {criteria.weight ? Math.round(criteria.weight * 100) : 0}%
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => addCriteria(criteria)}
                              className="p-1 hover:bg-purple-100 rounded"
                              disabled={loading}
                            >
                              <Plus className="w-4 h-4 text-purple-600" />
                            </button>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-medium text-gray-700">Criterios Seleccionados</h5>
                    {form.selectedCriteria.length > 0 && (
                      <div className="text-sm">
                        <span className={`font-medium ${Object.values(getTotalWeightByCategory()).every(w => w === 100 || w === undefined) ? 'text-green-600' : 'text-red-600'}`}>
                          Total por categoría: {Object.entries(getTotalWeightByCategory()).map(([cat, total]) => `${cat}: ${total || 0}%`).join(', ')}
                        </span>
                        <button
                          type="button"
                          onClick={normalizeWeights}
                          className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition-colors"
                          disabled={loading}
                        >
                          Normalizar
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {form.selectedCriteria.length === 0 ? (
                      <p className="text-gray-500 text-sm">No hay criterios seleccionados</p>
                    ) : (
                      form.selectedCriteria.map(sc => {
                        const criteria = getCriteriaById(sc.criteriaId);
                        return (
                          <div key={sc.criteriaId} className="p-3 bg-gray-50 rounded-lg mb-2">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{criteria?.description}</p>
                                <p className="text-xs text-gray-500">{criteria?.category}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeCriteria(sc.criteriaId)}
                                className="p-1 hover:bg-red-100 rounded"
                                disabled={loading}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <Percent className="w-3 h-3 text-gray-400" />
                              <input
                                type="number"
                                step="1"
                                min="0"
                                max="100"
                                value={sc.weight}
                                onChange={(e) => updateCriteriaWeight(sc.criteriaId, parseInt(e.target.value) || 0)}
                                className="flex-1 text-sm p-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                                placeholder="0"
                                disabled={loading}
                              />
                              <span className="text-xs text-gray-500 min-w-[40px]">
                                {sc.weight}%
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {form.name && form.selectedCriteria.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-purple-800 mb-2">Vista previa:</h4>
              <div>
                <p className="font-medium text-purple-900">{form.name}</p>
                {form.description && (
                  <p className="text-sm text-purple-700 mb-2">{form.description}</p>
                )}
                <p className="text-sm text-purple-700">
                  {form.selectedCriteria.length} criterios configurados
                </p>
                <p className="text-xs text-purple-600">
                  Pesos: {form.selectedCriteria.map(sc => `${sc.weight}% (${sc.category})`).join(', ')}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || form.selectedCriteria.length === 0 || !form.name.trim()}
              className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Cambios
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

export default EditarPlantillaModal;