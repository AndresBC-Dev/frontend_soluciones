import type { Dispatch, SetStateAction } from 'react';
import { Search, Clock, Target } from 'lucide-react';
import type { Period, Criteria } from '../../../../types/evaluation';
import PeriodsSection from './PeriodsSection';
import CriteriaSection from './CriteriaSection';

interface ConfigurationPanelProps {
  activeTab: 'periodos' | 'criterios';
  setActiveTab: Dispatch<SetStateAction<'periodos' | 'criterios'>>;
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  selectedCategory: 'todos' | 'productivity' | 'work_conduct' | 'skills';
  setSelectedCategory: Dispatch<SetStateAction<'todos' | 'productivity' | 'work_conduct' | 'skills'>>;
  categories: readonly ('todos' | 'productivity' | 'work_conduct' | 'skills')[];
  showInactivePeriods: boolean;
  setShowInactivePeriods: Dispatch<SetStateAction<boolean>>;
  showInactiveCriteria: boolean;
  setShowInactiveCriteria: Dispatch<SetStateAction<boolean>>;
  periods: Period[];
  criteria: Criteria[];
  deletingItems: Set<number>;
  onEditPeriod: (period: Period) => void;
  onDeletePeriod: (period: Period) => void;
  onEditCriteria: (criteria: Criteria) => void;
  onDeleteCriteria: (criteria: Criteria) => void;
  onReactivateCriteria: (criteria: Criteria) => void;
  onCreateCriteria: () => void;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  showInactivePeriods,
  setShowInactivePeriods,
  showInactiveCriteria,
  setShowInactiveCriteria,
  periods,
  criteria,
  deletingItems,
  onEditPeriod,
  onDeletePeriod,
  onEditCriteria,
  onDeleteCriteria,
  onReactivateCriteria,
  onCreateCriteria,
}) => {
  const tabs = [
    { key: 'periodos' as const, label: 'Períodos', icon: Clock },
    { key: 'criterios' as const, label: 'Criterios', icon: Target, action: onCreateCriteria },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'periodos':
        return (
          <PeriodsSection
            periods={periods}
            searchTerm={searchTerm}
            showInactivePeriods={showInactivePeriods}
            deletingItems={deletingItems}
            onEdit={onEditPeriod}
            onDelete={onDeletePeriod}
            onToggleShowExpired={() => setShowInactivePeriods(!showInactivePeriods)}
          />
        );
      case 'criterios':
        return (
          <CriteriaSection
            criteria={criteria}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            showInactiveCriteria={showInactiveCriteria}
            deletingItems={deletingItems}
            onEdit={onEditCriteria}
            onDelete={onDeleteCriteria}
            onReactivate={onReactivateCriteria}
            onToggleShowInactive={() => setShowInactiveCriteria(!showInactiveCriteria)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Configuración</h2>
        {activeTab === 'criterios' && (
          <button
            onClick={onCreateCriteria}
            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <span className="text-sm font-medium">Crear Criterio</span>
          </button>
        )}
      </div>

      <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder={`Buscar ${activeTab}...`}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {activeTab === 'criterios' && (
        <div className="mb-4 space-y-4">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value as 'todos' | 'productivity' | 'work_conduct' | 'skills')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todas las categorías</option>
            {categories.filter(cat => cat !== 'todos').map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showInactiveCriteria}
              onChange={() => setShowInactiveCriteria(!showInactiveCriteria)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Mostrar criterios inactivos
          </label>
        </div>
      )}

      {activeTab === 'periodos' && (
        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showInactivePeriods}
              onChange={() => setShowInactivePeriods(!showInactivePeriods)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Mostrar períodos inactivos y finalizados
          </label>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default ConfigurationPanel;