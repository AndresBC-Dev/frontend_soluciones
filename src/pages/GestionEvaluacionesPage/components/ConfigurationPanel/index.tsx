import React from 'react';
import { Calendar, Target, FileCheck, Plus, Search } from 'lucide-react';
import PeriodsSection from './PeriodsSection';
import CriteriaSection from './CriteriaSection';
import TemplatesSection from './TemplateSection';
import type { Period, Criteria, Template } from '../../types';

interface ConfigurationPanelProps {
  activeTab: 'periodos' | 'criterios' | 'plantillas';
  setActiveTab: (tab: 'periodos' | 'criterios' | 'plantillas') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
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
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Configuración</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('periodos')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'periodos'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Períodos
        </button>
        <button
          onClick={() => setActiveTab('criterios')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'criterios'
              ? 'bg-green-100 text-green-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Target className="w-4 h-4 inline mr-2" />
          Criterios
        </button>
        <button
          onClick={() => setActiveTab('plantillas')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'plantillas'
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FileCheck className="w-4 h-4 inline mr-2" />
          Plantillas
        </button>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {activeTab === 'criterios' && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        )}
      </div>

      {/* Add Button */}
      <button
        onClick={() => {
          if (activeTab === 'periodos') onCreatePeriod();
          else if (activeTab === 'criterios') onCreateCriteria();
          else onCreateTemplate();
        }}
        className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 mb-4 transition-all ${
          activeTab === 'periodos'
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
            : activeTab === 'criterios'
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
            : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
        }`}
      >
        <Plus className="w-5 h-5" />
        Agregar {activeTab === 'periodos' ? 'Período' : activeTab === 'criterios' ? 'Criterio' : 'Plantilla'}
      </button>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'periodos' && (
          <PeriodsSection
            periods={periods}
            searchTerm={searchTerm}
            deletingItems={deletingItems}
            onEdit={onEditPeriod}
            onDelete={onDeletePeriod}
          />
        )}
        {activeTab === 'criterios' && (
          <CriteriaSection
            criteria={criteria}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            deletingItems={deletingItems}
            onEdit={onEditCriteria}
            onDelete={onDeleteCriteria}
          />
        )}
        {activeTab === 'plantillas' && (
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
        )}
      </div>
    </div>
  );
};

export default ConfigurationPanel;