import React, { useState, useEffect } from 'react';
import { Calendar, X, Loader2, Save } from 'lucide-react';
import { updatePeriod, activatePeriod, deactivatePeriod } from '../services/evaluationService';
import { formatDateForBackend, formatDateFromBackend } from '../utils/dateHelpers';
import type { Period } from '../../src/types/evaluation';

interface EditarPeriodoModalProps {
    show: boolean;
    period: Period | null;
    onClose: () => void;
    onUpdated: (updatedPeriod: Period) => void;
}

const EditarPeriodoModal: React.FC<EditarPeriodoModalProps> = ({
    show,
    period,
    onClose,
    onUpdated
}) => {
    const [form, setForm] = useState({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        dueDate: '',
        isActive: true,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (period) {
            setForm({
                name: period.name,
                description: period.description,
                startDate: formatDateFromBackend(period.start_date),
                endDate: formatDateFromBackend(period.end_date),
                dueDate: formatDateFromBackend(period.due_date),
                isActive: period.is_active,
            });
        }
    }, [period]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setForm(prev => ({ ...prev, [name]: checked }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
        if (error) setError(null);
    };

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

        if (!period) return;

        setLoading(true);
        setError(null);

        try {
            const statusChanged = form.isActive !== period.is_active;
            console.log('🔄 Status changed?', statusChanged, 'from', period.is_active, 'to', form.isActive);

            // 1. Actualizar datos básicos del período
            const updateData = {
                name: form.name.trim(),
                description: form.description.trim(),
                start_date: formatDateForBackend(form.startDate),
                end_date: formatDateForBackend(form.endDate),
                due_date: formatDateForBackend(form.dueDate),
            };

            let updatedPeriod = await updatePeriod(period.id, updateData);
            console.log('📊 After basic update:', updatedPeriod);

            // 2. Si cambió el estado, hacer llamada adicional
            if (statusChanged) {
                if (form.isActive) {
                    console.log('🔄 Activating period...');
                    updatedPeriod = await activatePeriod(period.id);
                } else {
                    console.log('🔄 Deactivating period...');
                    updatedPeriod = await deactivatePeriod(period.id);
                }
                console.log('📊 After status change:', updatedPeriod);
            }

            onUpdated(updatedPeriod);
            handleClose();
        } catch (err: any) {
            setError(err.message || 'Error al actualizar el período');
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
            isActive: true,
        });
        setError(null);
        onClose();
    };

    if (!show || !period) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-blue-500" />
                        Editar Período
                    </h3>
                    <button onClick={handleClose} disabled={loading} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre del Período *
                        </label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descripción *
                        </label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha de Inicio *
                            </label>
                            <input
                                name="startDate"
                                type="date"
                                value={form.startDate}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                disabled={loading}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha de Fin *
                            </label>
                            <input
                                name="endDate"
                                type="date"
                                value={form.endDate}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                disabled={loading}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha Límite *
                            </label>
                            <input
                                name="dueDate"
                                type="date"
                                value={form.dueDate}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                disabled={loading}
                                required
                            />
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="flex items-center cursor-pointer">
                            <input
                                name="isActive"
                                type="checkbox"
                                checked={form.isActive}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                disabled={loading}
                            />
                            <div className="ml-3">
                                <span className="text-sm font-medium text-gray-700">
                                    Período activo
                                </span>
                                <p className="text-xs text-gray-500">
                                    {form.isActive
                                        ? 'El período está activo y visible para crear evaluaciones'
                                        : 'El período está inactivo y no se puede usar para nuevas evaluaciones'}
                                </p>
                            </div>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
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

export default EditarPeriodoModal;