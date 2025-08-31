import  type { Dispatch, SetStateAction } from 'react';
import { Plus, Search, Clock, Target, FileText } from 'lucide-react';
import type { Period, Criteria, Template } from '../../../../types/evaluation';
import CriteriaSection from './CriteriaSection';
import PeriodsSection from './PeriodsSection';
import TemplatesSection from './TemplatesSection';

interface ConfigurationPanelProps {
  activeTab: 'periodos' | 'criterios' | 'plantillas';
  setActiveTab: Dispatch<SetStateAction<'periodos' | 'criterios' | 'plantillas'>>;
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  selectedCategory: string;
  setSelectedCategory: Dispatch<SetStateAction<string>>;
  categories: string[];
  periods: Period[];
  criteria: Criteria[];
  templates: Template[];
  deletingItems: Set<number>;
  cloningItems: Set<number>;
  onCreatePeriod: () => void;
  onCreateCriteria: () => void;
  onCreateTemplate: () => void;
  onEditPeriod: (period: Period) => void;
  onDeletePeriod: (period: Period) => void;
  onEditCriteria: (criteria: Criteria) => void;
  onDeleteCriteria: (criteria: Criteria) => void;
  onViewTemplate: (template: Template) => void;
  onCloneTemplate: (template: Template) => void;
  onGenerateEval: (template: Template) => void;
  onDeleteTemplate: (template: Template) => void;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  periods,
  criteria,
  templates,
  deletingItems,
  cloningItems,
  onCreatePeriod,
  onCreateCriteria,
  onCreateTemplate,
  onEditPeriod,
  onDeletePeriod,
  onEditCriteria,
  onDeleteCriteria,
  onViewTemplate,
  onCloneTemplate,
  onGenerateEval,
  onDeleteTemplate,
}) => {
  const tabs = [
    { key: 'periodos' as const, label: 'Períodos', icon: Clock, action: onCreatePeriod },
    { key: 'criterios' as const, label: 'Criterios', icon: Target, action: onCreateCriteria },
    { key: 'plantillas' as const, label: 'Plantillas', icon: FileText, action: onCreateTemplate },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'periodos':
        return (
          <PeriodsSection
            periods={periods}
            searchTerm={searchTerm}
            deletingItems={deletingItems}
            onEdit={onEditPeriod}
            onDelete={onDeletePeriod}
          />
        );
      case 'criterios':
        return (
          <CriteriaSection
            criteria={criteria}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            deletingItems={deletingItems}
            onEdit={onEditCriteria}
            onDelete={onDeleteCriteria}
          />
        );
      case 'plantillas':
        return (
          <TemplatesSection
            templates={templates}
            searchTerm={searchTerm}
            deletingItems={deletingItems}
            cloningItems={cloningItems}
            onView={onViewTemplate}
            onClone={onCloneTemplate}
            onGenerateEval={onGenerateEval}
            onDelete={onDeleteTemplate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex-1 flex flex-col">
      {/* Header con pestañas */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Configuración</h2>
        <button
          onClick={tabs.find(tab => tab.key === activeTab)?.action}
          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Pestañas */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
        {tabs.map((tab) => {
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

      {/* Barra de búsqueda */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder={`Buscar ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filtro de categorías - Solo para criterios */}
      {activeTab === 'criterios' && (
        <div className="mb-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todas las categorías</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default ConfigurationPanel;