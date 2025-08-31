import React from 'react';
import { Plus } from 'lucide-react';
import EvaluationsSection from './EvaluationsSection';
import type { Evaluation } from '../../../types/evaluation';

interface EvaluationsPanelProps {
  evaluations: Evaluation[];
  deletingItems: Set<number>;
  onCreateEvaluation: () => void;
  onViewEvaluation: (evaluation: Evaluation) => void;
  onPerformEvaluation: (evaluation: Evaluation) => void;
  onDeleteEvaluation: (evaluation: Evaluation) => void;
  onExportEvaluation: (evaluation: Evaluation) => void;
}

const EvaluationsPanel: React.FC<EvaluationsPanelProps> = ({
  evaluations,
  deletingItems,
  onCreateEvaluation,
  onViewEvaluation,
  onPerformEvaluation,
  onDeleteEvaluation,
  onExportEvaluation,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex-1 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Evaluaciones</h2>
        <button
          onClick={onCreateEvaluation}
          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <EvaluationsSection
          evaluations={evaluations}
          searchTerm=""
          deletingItems={deletingItems}
          onViewEvaluation={onViewEvaluation}
          onPerformEvaluation={onPerformEvaluation}
          onDeleteEvaluation={onDeleteEvaluation}
          onExportEvaluation={onExportEvaluation}
        />
      </div>
    </div>
  );
};

export default EvaluationsPanel;