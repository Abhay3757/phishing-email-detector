import React, { useState } from 'react';
import { Link2, ChevronDown, ChevronUp, AlertCircle, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import RiskIndicator from './RiskIndicator';

interface UrlAnalysisCardProps {
  url: string;
  analysis: any;
}

const UrlAnalysisCard: React.FC<UrlAnalysisCardProps> = ({ url, analysis }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!analysis || analysis.error) {
    return (
      <div className="border border-slate-200 dark:border-slate-700 rounded-md p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link2 className="h-4 w-4 text-slate-400 mr-2" />
            <span className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-xs">
              {url}
            </span>
          </div>
          <span className="text-xs text-red-500 dark:text-red-400">Analysis failed</span>
        </div>
      </div>
    );
  }

  const getLikelihood = () => {
    return analysis.suspicious_likelihood || 'Unknown';
  };

  const getIcon = (likelihood: string) => {
    switch (likelihood.toLowerCase()) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mr-2" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />;
      default:
        return <Link2 className="h-4 w-4 text-slate-400 mr-2" />;
    }
  };

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden">
      <div 
        className="p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center overflow-hidden">
            {getIcon(getLikelihood())}
            <span className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-xs">
              {url}
            </span>
          </div>
          <div className="flex items-center">
            <RiskIndicator level={getLikelihood()} />
            <button className="ml-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/50">
          {analysis.suspicious_elements && analysis.suspicious_elements.length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">
                Suspicious Elements
              </h4>
              <ul className="space-y-1">
                {analysis.suspicious_elements.map((element: string, index: number) => (
                  <li key={index} className="text-sm text-slate-700 dark:text-slate-300 flex">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 mt-0.5 mr-1.5 flex-shrink-0" />
                    {element}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.explanation && (
            <div>
              <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">
                Explanation
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {analysis.explanation}
              </p>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <a 
              href={url.startsWith('http') ? url : `https://${url}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs flex items-center text-blue-600 dark:text-blue-400 hover:underline"
            >
              Open URL (use caution)
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlAnalysisCard;