import React, { useState } from 'react';
import { Copy, X, Loader2 } from 'lucide-react';
import { cloneTemplate } from '../services/evaluationService';
import type { Template } from '../types/evaluation';

interface ClonarPlantillaModalProps {
  show: boolean;
  onClose: () => void;
  onCloned: (clonedTemplate: Template) => void;
  template: Template | null;
}

const ClonarPlantillaModal: React.FC<ClonarPlantillaModalProps> = ({ show, onClose, onCloned, template }) => {
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!template?.id) {
      setError('No se proporcionó una plantilla válida');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Cloning template:', template.id, newName || undefined);
      const result = await cloneTemplate(template.id, newName || undefined);
      onCloned(result);
    } catch (err: any) {
      let errorMessage = 'Error al clonar la plantilla. Por favor, intenta de nuevo.';
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
    setNewName('');
    setError(null);
    onClose();
  };

  if (!show || !template) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Copy className="w-5 h-5 text-purple-500" />
            Clonar Plantilla: {template.name}
          </h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nuevo Nombre (Opcional)
            </label>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              type="text"
              placeholder={`Copia de ${template.name}`}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Clonando...
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Clonar
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClonarPlantillaModal;