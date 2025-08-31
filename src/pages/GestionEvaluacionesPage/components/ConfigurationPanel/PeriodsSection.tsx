import React, { useEffect } from 'react';
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
}

const PeriodsSection: React.FC<PeriodsSectionProps> = ({
  periods,
  searchTerm,
  showInactivePeriods,
  deletingItems,
  onEdit,
  onDelete,
}) => {
  // Debug logs
  useEffect(() => {
    console.log('🔍 PeriodsSection Debug Info:');
    console.log('- Total periods received:', periods.length);
    console.log('- Periods data:', periods);
    console.log('- showInactivePeriods:', showInactivePeriods);
    console.log('- searchTerm:', searchTerm);
    
    periods.forEach((period, index) => {
      console.log(`📊 Period ${index + 1}:`, {
        id: period.id,
        name: period.name,
        is_active: period.is_active,
        is_active_type: typeof period.is_active,
        start_date: period.start_date,
        end_date: period.end_date,
        due_date: period.due_date
      });
    });
  }, [periods, showInactivePeriods, searchTerm]);

  // First filter: active/inactive
  const statusFilteredPeriods = periods.filter(p => {
    const shouldShow = showInactivePeriods ? true : p.is_active;
    console.log(`🔄 Status filter for "${p.name}": is_active=${p.is_active}, showInactivePeriods=${showInactivePeriods}, shouldShow=${shouldShow}`);
    return shouldShow;
  });

  console.log('📈 After status filter:', statusFilteredPeriods.length, 'periods');

  // Second filter: search term
  const filteredPeriods = statusFilteredPeriods.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (searchTerm) {
      console.log(`🔍 Search filter for "${p.name}": matches="${matchesSearch}"`);
    }
    return matchesSearch;
  });

  console.log('📊 Final filtered periods:', filteredPeriods.length);

  return (
    <div className="space-y-3">
      {/* Debug info panel - remove in production */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs">
        <p><strong>Debug Info:</strong></p>
        <p>Total periods: {periods.length}</p>
        <p>Active periods: {periods.filter(p => p.is_active).length}</p>
        <p>Inactive periods: {periods.filter(p => !p.is_active).length}</p>
        <p>Show inactive: {showInactivePeriods ? 'Yes' : 'No'}</p>
        <p>Search term: "{searchTerm}"</p>
        <p>Filtered result: {filteredPeriods.length} periods</p>
        {periods.length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer">Raw period data</summary>
            <pre className="mt-1 text-xs bg-white p-2 rounded overflow-auto max-h-32">
              {JSON.stringify(periods, null, 2)}
            </pre>
          </details>
        )}
      </div>

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
                  : 'No hay períodos activos disponibles'
            }
          </p>
          {periods.length > 0 && !showInactivePeriods && (
            <p className="text-sm text-gray-400 mt-1">
              Hay {periods.filter(p => !p.is_active).length} período(s) inactivo(s). 
              Activa "Mostrar inactivos" para verlos.
            </p>
          )}
        </div>
      ) : (
        filteredPeriods.map(period => {
          const isDeleting = deletingItems.has(period.id);
          return (
            <div
              key={period.id}
              className="bg-gray-50 rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <h4 className="font-semibold text-gray-900">
                  {period.name}
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      period.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {period.is_active ? 'Activo' : 'Inactivo'}
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
                {/* Debug info for each period */}
                <p className="text-xs text-purple-600 mt-1">
                  ID: {period.id} | is_active: {String(period.is_active)} ({typeof period.is_active})
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(period)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Editar período"
                >
                  <Edit className="w-4 h-4 text-blue-500" />
                </button>
                <button
                  onClick={() => onDelete(period)}
                  disabled={isDeleting}
                  className="p-2 hover:bg-red-50 rounded-lg"
                  title="Desactivar período"
                >
                  <Trash2
                    className={`w-4 h-4 ${isDeleting ? 'text-gray-400' : 'text-red-500'}`}
                  />
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