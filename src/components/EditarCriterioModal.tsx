import React, { useState, useEffect } from 'react';
import { Target, X, Loader2, Save, Percent } from 'lucide-react';
import { updateCriteria } from '../services/evaluationService';
import type { Criteria, CreateCriteriaDTO } from '../types/evaluation';

interface EditarCriterioModalProps {
  show: boolean;
  criteria: Criteria | null;
  onClose: () => void;
  onUpdated: (updatedCriteria: Criteria) => void;
}

type Category = 'productividad' | 'conducta_laboral' | 'habilidades';

const commonCategories: Category[] = [
  'productividad',
  'conducta_laboral',
  'habilidades'
];

const EditarCriterioModal: React.FC<EditarCriterioModalProps> = ({
  show,
  criteria,
  onClose,
  onUpdated
}) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    weight: '',
    category: '' as Category | ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form with criteria data when modal opens
  useEffect(() => {
    if (criteria) {
      setForm({
        name: criteria.name,
        description: criteria.description,
        weight: criteria.weight.toString(),
        category: criteria.category as Category
      });
    }
  }, [criteria]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const validateForm = (): string | null => {
    if (!form.name.trim()) return 'El nombre es obligatorio.';
    if (!form.description.trim()) return 'La descripción es obligatoria.';
    if (!form.weight.trim()) return 'El peso es obligatorio.';
    if (!form.category.trim()) return 'La categoría es obligatoria.';

    if (!commonCategories.includes(form.category as Category)) {
      return 'La categoría debe ser productividad, conducta_laboral o habilidades.';
    }

    const weightNum = parseFloat(form.weight);
    if (isNaN(weightNum) || weightNum <= 0 || weightNum > 1) {
      return 'El peso debe ser un número entre 0.01 y 1.0';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!criteria) return;

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updateData: CreateCriteriaDTO = {
        name: form.name.trim(),
        description: form.description.trim(),
        weight: parseFloat(form.weight),
        category: form.category as Category
      };

      const updatedCriteria = await updateCriteria(criteria.id, updateData);
      onUpdated(updatedCriteria);
      handleClose();
    } catch (err: any) {
      let errorMessage = 'Error al actualizar el criterio. Por favor, intenta de nuevo.';
      if (err.message.includes('duplicate') || err.message.includes('already exists') || err.message.includes('ya existe')) {
        errorMessage = 'El nombre ya existe';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setError(null);
    onClose();
  };

  if (!show || !criteria) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-green-500" />
            Editar Criterio
          </h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Criterio *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              type="text"
              placeholder="Ej: Comunicación efectiva, Trabajo en equipo..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción del Criterio *
            </label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              type="text"
              placeholder="Descripción detallada del criterio de evaluación..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Percent className="inline w-4 h-4 mr-1" />
              Peso (entre 0.01 y 1.0) *
            </label>
            <input
              name="weight"
              value={form.weight}
              onChange={handleChange}
              type="number"
              step="0.01"
              min="0.01"
              max="1"
              placeholder="Ej: 0.3 para 30%"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              disabled={loading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              El peso representa la importancia del criterio. Ej: 0.3 = 30%
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              disabled={loading}
              required
            >
              <option value="">Seleccionar categoría</option>
              {commonCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default EditarCriterioModal;