import React, { useState } from 'react';
import { Trash2, X, Loader2 } from 'lucide-react';
import { deleteTemplate } from '../services/evaluationService';
import type { Template } from '../types/evaluation';

interface ConfirmarEliminarPlantillaModalProps {
  show: boolean;
  onClose: () => void;
  onDeleted: (templateId: number) => void;
  template: Template | null;
}

const ConfirmarEliminarPlantillaModal: React.FC<ConfirmarEliminarPlantillaModalProps> = ({
  show,
  onClose,
  onDeleted,
  template,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!template?.id) {
      setError('No se proporcionó una plantilla válida');
      return;
    }

    try {
      setLoading(true);
      console.log('🗑️ Deleting template:', template.id);
      await deleteTemplate(template.id);
      onDeleted(template.id);
    } catch (err: any) {
      let errorMessage = 'Error al eliminar la plantilla. Por favor, intenta de nuevo.';
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
    setError(null);
    onClose();
  };

  if (!show || !template) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            Eliminar Plantilla
          </h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            ¿Estás seguro de que deseas eliminar la plantilla <span className="font-medium">{template.name}</span>? Esta acción no se puede deshacer.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </>
              )}
            </button>
            <button
              onClick={handleClose}
              disabled={loading}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmarEliminarPlantillaModal;