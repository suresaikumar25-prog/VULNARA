'use client';

import { useState, useEffect } from 'react';

interface ComparisonReport {
  url: string;
  comparisonPeriod: {
    from: string;
    to: string;
    totalScans: number;
  };
  scans: Array<{
    id: string;
    timestamp: string;
    securityScore: any;
    vulnerabilityCount: number;
    summary: any;
  }>;
  vulnerabilityChanges: {
    fixed: number;
    introduced: number;
    persistent: number;
    totalOld: number;
    totalNew: number;
    netChange: number;
    details: {
      fixed: string[];
      introduced: string[];
      persistent: string[];
    };
  };
  scoreChanges: {
    oldScore: number;
    newScore: number;
    change: number;
    changePercentage: number;
    oldGrade: string;
    newGrade: string;
  };
  summary: {
    averageScore: number;
    minScore: number;
    maxScore: number;
    averageVulnerabilities: number;
    minVulnerabilities: number;
    maxVulnerabilities: number;
    totalScans: number;
  };
  trends: {
    scoreTrend: {
      direction: string;
      strength: number;
      description: string;
    };
    vulnerabilityTrend: {
      direction: string;
      strength: number;
      description: string;
    };
  };
  recommendations: Array<{
    type: 'success' | 'warning' | 'info' | 'error';
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
  }>;
}

interface ComparisonReportProps {
  url: string;
  scanIds: string[];
  userId: string;
  onClose: () => void;
}

export default function ComparisonReport({ url, scanIds, userId, onClose }: ComparisonReportProps) {
  const [report, setReport] = useState<ComparisonReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateComparisonReport();
  }, [url, scanIds]);

  const generateComparisonReport = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Generating comparison report for:', { url, scanIds, userId });

      const response = await fetch('/api/scan-comparison', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url, scanIds, userId })
      });

      console.log('Comparison API response status:', response.status);

      const result = await response.json();
      console.log('Comparison API result:', result);

      if (result.success) {
        setReport(result.data);
      } else {
        console.error('Comparison API error:', result);
        if (result.setupRequired) {
          setError('Database setup required. Please configure Supabase to use the comparison feature. Check the DATABASE_SETUP.md file in the project root for detailed instructions.');
        } else {
          setError(result.error || 'Failed to generate comparison report');
        }
      }
    } catch (error) {
      console.error('Error generating comparison report:', error);
      setError('Failed to generate comparison report. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeColor = (grade: string) => {
    if (['A', 'B'].includes(grade)) return 'text-green-600';
    if (['C', 'D'].includes(grade)) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-green-500 bg-green-50';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-lg">Generating comparison report...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 w-full max-w-2xl">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={generateComparisonReport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Security Comparison Report</h2>
            <p className="text-gray-600 mt-1">{report.url}</p>
            <p className="text-sm text-gray-500">
              {new Date(report.comparisonPeriod.from).toLocaleDateString()} - {new Date(report.comparisonPeriod.to).toLocaleDateString()}
              ({report.comparisonPeriod.totalScans} scans)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Score Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Score Comparison</h3>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(report.scoreChanges.oldScore)}`}>
                  {report.scoreChanges.oldScore}
                </div>
                <div className={`text-sm ${getGradeColor(report.scoreChanges.oldGrade)}`}>
                  Grade: {report.scoreChanges.oldGrade}
                </div>
                <div className="text-xs text-gray-500">First Scan</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl ${report.scoreChanges.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {report.scoreChanges.change >= 0 ? '↗️' : '↘️'} {Math.abs(report.scoreChanges.change)}
                </div>
                <div className="text-xs text-gray-500">Change</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(report.scoreChanges.newScore)}`}>
                  {report.scoreChanges.newScore}
                </div>
                <div className={`text-sm ${getGradeColor(report.scoreChanges.newGrade)}`}>
                  Grade: {report.scoreChanges.newGrade}
                </div>
                <div className="text-xs text-gray-500">Latest Scan</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vulnerability Changes</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{report.vulnerabilityChanges.fixed}</div>
                <div className="text-xs text-gray-600">Fixed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{report.vulnerabilityChanges.introduced}</div>
                <div className="text-xs text-gray-600">New</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{report.vulnerabilityChanges.persistent}</div>
                <div className="text-xs text-gray-600">Persistent</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className={`text-lg font-semibold ${report.vulnerabilityChanges.netChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                Net Change: {report.vulnerabilityChanges.netChange >= 0 ? '+' : ''}{report.vulnerabilityChanges.netChange}
              </div>
            </div>
          </div>
        </div>

        {/* Trends */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Score Trend</h3>
            <div className="flex items-center">
              <span className="text-2xl mr-3">{getTrendIcon(report.trends.scoreTrend.direction)}</span>
              <div>
                <div className="font-medium capitalize">{report.trends.scoreTrend.direction}</div>
                <div className="text-sm text-gray-600">{report.trends.scoreTrend.description}</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vulnerability Trend</h3>
            <div className="flex items-center">
              <span className="text-2xl mr-3">{getTrendIcon(report.trends.vulnerabilityTrend.direction)}</span>
              <div>
                <div className="font-medium capitalize">{report.trends.vulnerabilityTrend.direction}</div>
                <div className="text-sm text-gray-600">{report.trends.vulnerabilityTrend.description}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{report.summary.averageScore.toFixed(1)}</div>
              <div className="text-xs text-gray-600">Avg Score</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{report.summary.minScore} - {report.summary.maxScore}</div>
              <div className="text-xs text-gray-600">Score Range</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{report.summary.averageVulnerabilities.toFixed(1)}</div>
              <div className="text-xs text-gray-600">Avg Vulnerabilities</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{report.summary.totalScans}</div>
              <div className="text-xs text-gray-600">Total Scans</div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {report.recommendations.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
            <div className="space-y-3">
              {report.recommendations.map((rec, index) => (
                <div key={index} className={`border-l-4 p-4 rounded-r-lg ${getPriorityColor(rec.priority)}`}>
                  <div className="flex items-start">
                    <span className="text-xl mr-3">{getRecommendationIcon(rec.type)}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                      <p className="text-gray-700 text-sm mt-1">{rec.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scan Timeline */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Scan Timeline</h3>
          <div className="space-y-3">
            {report.scans.map((scan, index) => (
              <div key={scan.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <div>
                    <div className="font-medium">Scan #{index + 1}</div>
                    <div className="text-sm text-gray-600">{new Date(scan.timestamp).toLocaleString()}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${getScoreColor(scan.securityScore?.score || 0)}`}>
                    {scan.securityScore?.score || 0}
                  </div>
                  <div className="text-sm text-gray-600">{scan.vulnerabilityCount} vulnerabilities</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
