import React, { useState } from 'react';
import { Calendar, X, Loader2, Save, Plus } from 'lucide-react';
import { createPeriod } from '../services/evaluationService';
import { formatDateForBackend } from '../utils/dateHelpers';
import type { Period } from '../types/evaluation';

interface CrearPeriodoModalProps {
  show: boolean;
  onClose: () => void;
  onCreated: (period: Period) => void;
}

interface PeriodForm {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  dueDate: string;
  shouldActivate: boolean; // Cambio: usar shouldActivate en lugar de isActive
}

const CrearPeriodoModal: React.FC<CrearPeriodoModalProps> = ({ show, onClose, onCreated }) => {
  const [form, setForm] = useState<PeriodForm>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    dueDate: '',
    shouldActivate: true, // Por defecto queremos activar
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    if (error) setError(null);
  };

  // ✅ Validaciones
  const validateForm = (): string | null => {
    if (!form.name.trim()) return 'El nombre del período es obligatorio.';
    if (!form.description.trim()) return 'La descripción es obligatoria.';
    if (!form.startDate) return 'La fecha de inicio es obligatoria.';
    if (!form.endDate) return 'La fecha de fin es obligatoria.';
    if (!form.dueDate) return 'La fecha límite es obligatoria.';

    const startDate = new Date(form.startDate);
    const endDate = new Date(form.endDate);
    const dueDate = new Date(form.dueDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || isNaN(dueDate.getTime())) {
      return 'Las fechas deben ser válidas.';
    }

    if (endDate <= startDate) {
      return 'La fecha de fin debe ser posterior a la fecha de inicio.';
    }

    if (dueDate < startDate) {
      return 'La fecha límite no puede ser anterior a la fecha de inicio.';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Crear el período (siempre se crea en draft)
      const createData = {
        name: form.name.trim(),
        description: form.description.trim(),
        start_date: formatDateForBackend(form.startDate),
        end_date: formatDateForBackend(form.endDate),
        due_date: formatDateForBackend(form.dueDate),
      };

      console.log('📤 Creating period in draft mode:', createData);
      let newPeriod = await createPeriod(createData);
      
      // 2. Si el usuario quiere activarlo, hacer llamada adicional para activar
      if (form.shouldActivate) {
        console.log('📤 Activating period:', newPeriod.id);
        try {
          // Llamada para activar el período
          const activateResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/periods/${newPeriod.id}/activate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });

          if (activateResponse.ok) {
            const activatedData = await activateResponse.json();
            newPeriod = activatedData.data || activatedData;
            console.log('✅ Period activated:', newPeriod);
          } else {
            console.warn('⚠️ Could not activate period, but it was created successfully');
          }
        } catch (activateError) {
          console.warn('⚠️ Activation failed, but period was created:', activateError);
          // No fallar completamente si la activación falla
        }
      }

      onCreated(newPeriod);
      handleClose();
    } catch (err: any) {
      console.error('❌ Error creating period:', err);
      setError(err.message || 'Error al crear el período');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setForm({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      dueDate: '',
      shouldActivate: true,
    });
    setError(null);
    onClose();
  };

  // ✅ Sugerencias de nombres
  const generateSuggestedNames = () => {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const currentMonth = new Date().getMonth() + 1;

    return [
      `Q${Math.ceil(currentMonth / 3)} ${currentYear}`,
      `Semestre ${currentMonth <= 6 ? 'I' : 'II'} ${currentYear}`,
      `Anual ${currentYear}`,
      `Anual ${nextYear}`,
      `Mensual ${new Date().toLocaleDateString('es-ES', { month: 'long' })} ${currentYear}`,
      `Evaluación ${currentYear}-${(currentYear + 1).toString().slice(-2)}`
    ];
  };

  // ✅ Formato de fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatDateRange = () => {
    if (!form.startDate || !form.endDate) return '';
    return `${formatDate(form.startDate)} - ${formatDate(form.endDate)}`;
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-500" />
            Crear Nuevo Período
          </h3>
          <button onClick={handleClose} disabled={loading} className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre + Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Período *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                type="text"
                placeholder="Ej: Q1 2025, Semestre I 2025..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  name="shouldActivate"
                  type="checkbox"
                  checked={form.shouldActivate}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <span className="text-sm">
                  {form.shouldActivate ? 'Activar período después de crear' : 'Crear como borrador'}
                </span>
              </label>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe el propósito y objetivos..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              disabled={loading}
            />
          </div>

          {/* Sugerencias */}
          <div>
            <p className="text-sm text-gray-700 mb-2">Sugerencias de nombres:</p>
            <div className="flex flex-wrap gap-2">
              {generateSuggestedNames().map(suggestion => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, name: suggestion }))}
                  className="text-xs px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full border border-blue-200"
                  disabled={loading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Inicio *</label>
              <input
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                type="date"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Fin *</label>
              <input
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                type="date"
                min={form.startDate}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Límite *</label>
              <input
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                type="date"
                min={form.startDate}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">Fecha límite para completar evaluaciones</p>
            </div>
          </div>

          {/* Preview */}
          {form.name && form.startDate && form.endDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Vista previa:</h4>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-blue-900">{form.name}</p>
                  <p className="text-sm text-blue-700 mb-2">{formatDateRange()}</p>
                  {form.description && (
                    <p className="text-xs text-blue-600 mb-2">"{form.description}"</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-blue-600">
                    <span>Estado inicial: {form.shouldActivate ? 'Activo' : 'Borrador'}</span>
                    {form.dueDate && <span>Límite: {formatDate(form.dueDate)}</span>}
                  </div>
                </div>
                <Calendar className="w-8 h-8 text-blue-500 ml-4" />
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {form.shouldActivate ? 'Creando y Activando...' : 'Creando...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {form.shouldActivate ? 'Crear y Activar' : 'Crear Borrador'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearPeriodoModal;