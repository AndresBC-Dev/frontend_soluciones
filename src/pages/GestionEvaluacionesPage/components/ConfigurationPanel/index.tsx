import React, { useState, useMemo } from 'react';
import { Search, Calendar, Target, FileText } from 'lucide-react';
import PeriodsSection from './PeriodsSection';
import CriteriaSection from './CriteriaSection';
import TemplatesSection from './TemplatesSection';
import type { Period, Criteria, Template } from '../../../../types/evaluation';

interface ConfigurationPanelProps {
  activeTab: 'periodos' | 'criterios' | 'plantillas';
  setActiveTab: (tab: 'periodos' | 'criterios' | 'plantillas') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: string[];
  showInactivePeriods: boolean;
  setShowInactivePeriods: (show: boolean) => void;
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
  onReactivateCriteria: (criteria: Criteria) => void;
  onViewTemplate: (template: Template) => void;
  onCloneTemplate: (template: Template) => void;
  onGenerateEval: (template: Template) => void;
  onDeleteTemplate: (template: Template) => void;
  onEditTemplate: (template: Template) => void;
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
  onReactivateCriteria,
  onViewTemplate,
  onCloneTemplate,
  onGenerateEval,
  onDeleteTemplate,
  onEditTemplate,
}) => {
  const [showInactiveCriteria, setShowInactiveCriteria] = useState(false);

  const tabs = [
    { key: 'periodos' as const, label: 'Períodos', icon: Calendar },
    { key: 'criterios' as const, label: 'Criterios', icon: Target },
    { key: 'plantillas' as const, label: 'Plantillas', icon: FileText },
  ];

  const filteredPeriods = useMemo(() => {
    let filtered = periods;
    if (!showInactivePeriods) {
      filtered = filtered.filter(p => p.is_active);
    }
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [periods, showInactivePeriods, searchTerm]);

  const filteredCriteria = useMemo(() => {
    let filtered = criteria;
    if (!showInactiveCriteria) {
      filtered = filtered.filter(c => c.is_active !== false);
    }
    if (selectedCategory !== 'todos') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [criteria, showInactiveCriteria, selectedCategory, searchTerm]);

  const filteredTemplates = useMemo(() => {
    let filtered = templates;
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [templates, searchTerm]);

  const renderContent = () => {
    switch (activeTab) {
      case 'periodos':
        return (
          <PeriodsSection
            periods={filteredPeriods}
            deletingItems={deletingItems}
            onEdit={onEditPeriod}
            onDelete={onDeletePeriod}
          />
        );
      case 'criterios':
        return (
          <CriteriaSection
            criteria={filteredCriteria}
            deletingItems={deletingItems}
            onEdit={onEditCriteria}
            onDelete={onDeleteCriteria}
            onReactivate={onReactivateCriteria}
          />
        );
      case 'plantillas':
        return (
          <TemplatesSection
            templates={filteredTemplates}
            criteria={criteria}
            deletingItems={deletingItems}
            cloningItems={cloningItems}
            onView={onViewTemplate}
            onEdit={onEditTemplate}
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Configuración</h2>
        <div className="flex gap-2">
          {activeTab === 'periodos' && (
            <button
              onClick={onCreatePeriod}
              className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              Crear Período
            </button>
          )}
          {activeTab === 'criterios' && (
            <button
              onClick={onCreateCriteria}
              className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              Crear Criterio
            </button>
          )}
          {activeTab === 'plantillas' && (
            <button
              onClick={onCreateTemplate}
              className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              Crear Plantilla
            </button>
          )}
        </div>
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
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todas las categorías</option>
            {categories.filter(cat => cat !== 'todos').map(category => (
              <option key={category} value={category}>
                {category === 'productividad' ? 'Productividad' :
                 category === 'conducta_laboral' ? 'Conducta Laboral' :
                 category === 'habilidades' ? 'Habilidades' :
                 category}
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