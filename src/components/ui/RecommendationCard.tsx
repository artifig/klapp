import React from 'react';
import { ExternalLink, CheckCircle2 } from 'lucide-react';

interface RecommendationCardProps {
  title: string;
  text: string;
  provider: string;
  offer: string;
  priority: 'high' | 'medium' | 'low';
  progress: number;
  onAction: () => void;
}

const priorityColors = {
  high: 'border-red-500/50 bg-red-500/5',
  medium: 'border-yellow-500/50 bg-yellow-500/5',
  low: 'border-green-500/50 bg-green-500/5'
};

const priorityLabels = {
  high: 'Kõrge',
  medium: 'Keskmine',
  low: 'Madal'
};

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  title,
  text,
  provider,
  offer,
  priority,
  progress,
  onAction
}) => {
  return (
    <div className={`p-6 rounded-lg border ${priorityColors[priority]} space-y-4`}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
          <div className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-800">
            {priorityLabels[priority]} prioriteet
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <CheckCircle2 className="w-4 h-4" />
          {progress}% tehtud
        </div>
      </div>

      {/* Content */}
      <p className="text-gray-300">{text}</p>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#FF6600] to-[#FFCC00] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Provider Info */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <div>
          <div className="text-sm text-gray-400">Pakkuja</div>
          <div className="font-medium text-white">{provider}</div>
          <div className="text-sm text-gray-300">{offer}</div>
        </div>
        <button
          onClick={onAction}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-md
            hover:bg-gray-700 transition-colors text-sm font-medium"
        >
          Vaata lähemalt
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}; 