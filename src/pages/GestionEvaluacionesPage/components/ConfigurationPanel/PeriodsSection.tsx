import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { formatDateFromBackend } from '../../../../utils/dateHelpers';
import type { Period } from '../../../../types/evaluation';

interface PeriodsSectionProps {
  periods: Period[];
  searchTerm: string;
  showInactivePeriods: boolean;
  deletingItems: Set<number>;
  onEdit: (period: Period) => void;
  onDelete: (period: Period) => void;
  onToggleShowExpired?: () => void; // Nuevo prop para toggle de períodos finalizados
}

const PeriodsSection: React.FC<PeriodsSectionProps> = ({
  periods,
  searchTerm,
  showInactivePeriods,
  deletingItems,
  onEdit,
  onDelete,
  onToggleShowExpired,
}) => {
  // Filtrar períodos según estado y búsqueda
  const filteredPeriods = periods
    .filter(p => showInactivePeriods || p.is_active)
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Contar períodos finalizados (completed o expired)
  const expiredPeriodsCount = periods.filter(p => p.is_expired || p.status === 'completed').length;

  return (
    <div className="space-y-3">
      {onToggleShowExpired && (
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">
            {expiredPeriodsCount > 0
              ? `${expiredPeriodsCount} período(s) finalizado(s) disponibles`
              : 'No hay períodos finalizados'}
          </p>
          <button
            onClick={onToggleShowExpired}
            className="text-sm text-blue-500 hover:underline"
          >
            {showInactivePeriods ? 'Ocultar períodos finalizados' : 'Mostrar períodos finalizados'}
          </button>
        </div>
      )}
      {filteredPeriods.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {periods.length === 0
              ? 'No hay períodos disponibles en el sistema'
              : showInactivePeriods
                ? searchTerm
                  ? `No hay períodos que coincidan con "${searchTerm}"`
                  : 'No hay períodos disponibles'
                : searchTerm
                  ? `No hay períodos activos que coincidan con "${searchTerm}"`
                  : 'No hay períodos activos disponibles'}
          </p>
          {periods.length > 0 && !showInactivePeriods && (
            <p className="text-sm text-gray-400 mt-1">
              Hay {periods.filter(p => !p.is_active).length} período(s) inactivo(s).
              Activa "Mostrar inactivos" para verlos.
              {expiredPeriodsCount > 0 && (
                <>
                  {' '}
                  y {expiredPeriodsCount} período(s) finalizado(s).
                </>
              )}
            </p>
          )}
        </div>
      ) : (
        filteredPeriods.map(period => {
          const isDeleting = deletingItems.has(period.id);
          const isCompletedOrExpired = period.status === 'completed' || period.is_expired;

          return (
            <div
              key={period.id}
              className={`rounded-lg p-4 flex justify-between items-center ${
                period.is_active ? 'bg-green-50' : isCompletedOrExpired ? 'bg-gray-200' : 'bg-gray-50'
              }`}
            >
              <div>
                <h4 className="font-semibold text-gray-900">
                  {period.name}
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      period.is_active
                        ? 'bg-green-100 text-green-700'
                        : isCompletedOrExpired
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {period.is_active
                      ? 'Activo'
                      : isCompletedOrExpired
                        ? 'Finalizado'
                        : 'Inactivo'}
                  </span>
                </h4>
                <p className="text-sm text-gray-600">{period.description}</p>
                <p className="text-sm text-gray-600">
                  {formatDateFromBackend(period.start_date)} -{' '}
                  {formatDateFromBackend(period.end_date)}
                </p>
                <p className="text-sm text-gray-500">
                  Fecha límite: {formatDateFromBackend(period.due_date)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(period)}
                  disabled={!period.can_modify}
                  className={`p-2 rounded-lg ${
                    period.can_modify
                      ? 'hover:bg-gray-100 text-blue-500'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                  title={period.can_modify ? 'Editar período' : 'No se puede editar este período'}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(period)}
                  disabled={isDeleting || !period.can_delete}
                  className={`p-2 rounded-lg ${
                    isDeleting || !period.can_delete
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'hover:bg-red-50 text-red-500'
                  }`}
                  title={period.can_delete ? 'Desactivar período' : 'No se puede desactivar este período'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default PeriodsSection;