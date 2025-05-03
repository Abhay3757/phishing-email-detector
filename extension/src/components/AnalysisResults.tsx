import React, { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Link, ExternalLink } from 'lucide-react';
import RiskIndicator from './RiskIndicator';
import SuspiciousElementsList from './SuspiciousElementsList';
import UrlAnalysisCard from './UrlAnalysisCard';

interface AnalysisResultsProps {
  results: any;
  emailBody: string;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ results, emailBody }) => {
  const [contentAnalysis, setContentAnalysis] = useState<any>(null);
  const [urlAnalysis, setUrlAnalysis] = useState<any>({});
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    if (results) {
      try {
        // Parse content analysis if it's a string (JSON)
        if (typeof results.content_analysis === 'string') {
          const parsedContent = JSON.parse(results.content_analysis);
          setContentAnalysis(parsedContent);
        } else {
          setContentAnalysis(results.content_analysis);
        }

        // Parse URL analysis results if they're strings (JSON)
        const parsedUrlAnalysis: Record<string, any> = {};
        
        if (results.url_analysis) {
          Object.entries(results.url_analysis).forEach(([url, analysis]) => {
            if (typeof analysis === 'string') {
              try {
                parsedUrlAnalysis[url] = JSON.parse(analysis);
              } catch (e) {
                parsedUrlAnalysis[url] = { error: 'Failed to parse analysis' };
              }
            } else {
              parsedUrlAnalysis[url] = analysis;
            }
          });
        }
        
        setUrlAnalysis(parsedUrlAnalysis);
      } catch (error) {
        console.error('Error parsing analysis results:', error);
      }
    }
  }, [results]);

  if (!contentAnalysis) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6 mb-2"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6"></div>
      </div>
    );
  }

  const getPhishingLikelihood = () => {
    return contentAnalysis.phishing_likelihood || 'Unknown';
  };

  const getLikelihoodColor = (likelihood: string) => {
    switch (likelihood.toLowerCase()) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-amber-600 dark:text-amber-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getLikelihoodIcon = (likelihood: string) => {
    switch (likelihood.toLowerCase()) {
      case 'high':
        return <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />;
      case 'medium':
        return <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />;
      case 'low':
        return <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-slate-600 dark:text-slate-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden transition-all">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            {getLikelihoodIcon(getPhishingLikelihood())}
            <h2 className="ml-2 text-lg font-semibold text-slate-900 dark:text-white">
              Analysis Results
            </h2>
          </div>
          <RiskIndicator level={getPhishingLikelihood().toLowerCase()} />
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          The email has been analyzed for potential phishing indicators
        </p>

        <div className="flex items-center mb-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mr-2">
            Phishing Likelihood:
          </span>
          <span className={`font-semibold ${getLikelihoodColor(getPhishingLikelihood())}`}>
            {getPhishingLikelihood()}
          </span>
        </div>
      </div>

      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex">
          <button
            className={`px-4 py-2 text-sm font-medium flex-1 ${
              activeTab === 'content'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            onClick={() => setActiveTab('content')}
          >
            Content Analysis
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium flex-1 ${
              activeTab === 'urls'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            onClick={() => setActiveTab('urls')}
          >
            URL Analysis {Object.keys(urlAnalysis).length > 0 && `(${Object.keys(urlAnalysis).length})`}
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'content' && (
          <>
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Suspicious Elements
              </h3>
              <SuspiciousElementsList elements={contentAnalysis.suspicious_elements || []} />
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Explanation
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {contentAnalysis.explanation || 'No detailed explanation provided.'}
              </p>
            </div>
          </>
        )}

        {activeTab === 'urls' && (
          <div>
            {Object.keys(urlAnalysis).length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center">
                  <Link className="h-4 w-4 mr-1" />
                  Detected URLs
                </h3>
                
                {Object.entries(urlAnalysis).map(([url, analysis]: [string, any], index) => (
                  <UrlAnalysisCard key={index} url={url} analysis={analysis} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Link className="h-10 w-10 mx-auto text-slate-400" />
                <p className="mt-2 text-slate-600 dark:text-slate-400">No URLs detected in this email</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResults;