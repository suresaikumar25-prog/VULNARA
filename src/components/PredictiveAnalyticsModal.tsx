"use client";

import React, { useState, useEffect } from 'react';
import { X, TrendingUp, BarChart3, AlertTriangle, Shield, Calendar } from 'lucide-react';

interface PredictiveAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  scanHistory: any[];
}

export default function PredictiveAnalyticsModal({
  isOpen,
  onClose,
  scanHistory
}: PredictiveAnalyticsModalProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (isOpen && scanHistory.length > 0) {
      generateAnalytics();
    }
  }, [isOpen, scanHistory]);

  const generateAnalytics = async () => {
    setIsAnalyzing(true);
    
    // Simulate predictive analytics generation
    setTimeout(() => {
      const totalScans = scanHistory.length;
      const avgScore = scanHistory.reduce((sum, scan) => sum + (scan.securityScore?.score || 0), 0) / totalScans;
      const criticalVulns = scanHistory.reduce((sum, scan) => sum + (scan.vulnerabilities?.filter((v: any) => v.severity === 'critical').length || 0), 0);
      
      setAnalytics({
        totalScans,
        avgScore: Math.round(avgScore),
        trends: {
          securityScore: {
            trend: avgScore > 70 ? 'improving' : 'declining',
            change: Math.round(Math.random() * 20 - 10),
            prediction: avgScore > 70 ? 'Continue current practices' : 'Implement additional security measures'
          },
          vulnerabilities: {
            trend: criticalVulns > totalScans * 0.3 ? 'increasing' : 'decreasing',
            change: Math.round(Math.random() * 10 - 5),
            prediction: criticalVulns > totalScans * 0.3 ? 'Focus on critical vulnerability remediation' : 'Maintain current security posture'
          }
        },
        predictions: [
          {
            timeframe: 'Next 30 days',
            prediction: 'Security score likely to improve by 5-10 points',
            confidence: 85,
            factors: ['Regular security updates', 'Improved monitoring']
          },
          {
            timeframe: 'Next 90 days',
            prediction: 'Risk of new critical vulnerabilities: Medium',
            confidence: 72,
            factors: ['Emerging threat landscape', 'Technology stack updates']
          },
          {
            timeframe: 'Next 6 months',
            prediction: 'Overall security posture: Stable to improving',
            confidence: 78,
            factors: ['Security program maturity', 'Team expertise growth']
          }
        ],
        recommendations: [
          'Implement automated security scanning',
          'Regular security training for development team',
          'Establish security metrics dashboard',
          'Conduct quarterly security assessments',
          'Implement DevSecOps practices'
        ],
        riskFactors: [
          {
            factor: 'Code Complexity',
            risk: 'medium',
            impact: 'Increased vulnerability surface area',
            mitigation: 'Code review and refactoring'
          },
          {
            factor: 'Dependency Updates',
            risk: 'high',
            impact: 'Potential security vulnerabilities in dependencies',
            mitigation: 'Automated dependency scanning'
          },
          {
            factor: 'Team Knowledge',
            risk: 'low',
            impact: 'Security awareness and implementation',
            mitigation: 'Regular security training'
          }
        ]
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  if (!isOpen) return null;

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600';
      case 'declining': return 'text-red-600';
      case 'increasing': return 'text-red-600';
      case 'decreasing': return 'text-green-600';
      default: return 'text-white/60';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-500/10 border border-red-500/20';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'low': return 'text-green-600 bg-emerald-500/10 border border-emerald-500/20';
      default: return 'text-white/60 bg-white/5 border border-white/10';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Drawer Panel */}
      <div className="relative w-full max-w-3xl h-full bg-[#02040b] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 pointer-events-auto overflow-hidden text-white font-sans">
        
        {/* Cinematic Backgrounds */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(circle_at_0%_0%,rgba(168,85,247,0.15),transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-full h-[500px] bg-[radial-gradient(circle_at_100%_100%,rgba(6,182,212,0.1),transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

        <div className="flex justify-between items-center p-6 border-b border-white/10 relative z-10 bg-[#02040b]/50 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-bold text-white">Predictive Analytics</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white/60 transition-colors"
          >
            <X className="h-6 w-6 text-white/50 group-hover:text-cyan-400 group-hover:rotate-90 transition-all duration-300" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto h-full space-y-8 pb-32">
          {isAnalyzing ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Analyzing Security Trends
              </h3>
              <p className="text-white/60">
                Processing scan history and generating predictions...
              </p>
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg text-center">
                  <BarChart3 className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{analytics.totalScans}</div>
                  <div className="text-sm text-white/60">Total Scans</div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg text-center">
                  <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{analytics.avgScore}/100</div>
                  <div className="text-sm text-white/60">Avg Security Score</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{analytics.totalScans}</div>
                  <div className="text-sm text-white/60">Critical Vulnerabilities</div>
                </div>
              </div>

              {/* Trends */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Security Trends</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-white">Security Score</h5>
                      <span className={`text-sm font-medium ${getTrendColor(analytics.trends.securityScore.trend)}`}>
                        {analytics.trends.securityScore.trend.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-white/60 text-sm mb-2">
                      Change: {analytics.trends.securityScore.change > 0 ? '+' : ''}{analytics.trends.securityScore.change} points
                    </p>
                    <p className="text-white/50 text-xs">{analytics.trends.securityScore.prediction}</p>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-white">Vulnerabilities</h5>
                      <span className={`text-sm font-medium ${getTrendColor(analytics.trends.vulnerabilities.trend)}`}>
                        {analytics.trends.vulnerabilities.trend.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-white/60 text-sm mb-2">
                      Change: {analytics.trends.vulnerabilities.change > 0 ? '+' : ''}{analytics.trends.vulnerabilities.change}%
                    </p>
                    <p className="text-white/50 text-xs">{analytics.trends.vulnerabilities.prediction}</p>
                  </div>
                </div>
              </div>

              {/* Predictions */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Future Predictions</h4>
                <div className="space-y-3">
                  {analytics.predictions.map((prediction: any, index: number) => (
                    <div key={index} className="bg-white/5 border border-white/10 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-cyan-400" />
                          <span className="font-medium text-white">{prediction.timeframe}</span>
                        </div>
                        <span className="text-sm text-white/50">{prediction.confidence}% confidence</span>
                      </div>
                      <p className="text-white/80 text-sm mb-2">{prediction.prediction}</p>
                      <div className="text-xs text-white/50">
                        <strong>Factors:</strong> {prediction.factors.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Factors */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Risk Factors</h4>
                <div className="space-y-3">
                  {analytics.riskFactors.map((risk: any, index: number) => (
                    <div key={index} className="bg-white/5 border border-white/10 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-white">{risk.factor}</h5>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(risk.risk)}`}>
                          {risk.risk.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-white/60 text-sm mb-1">{risk.impact}</p>
                      <p className="text-white/50 text-xs">
                        <strong>Mitigation:</strong> {risk.mitigation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Strategic Recommendations</h4>
                <ul className="space-y-2">
                  {analytics.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-white/80">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={onClose}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                No Scan History Available
              </h3>
              <p className="text-white/60">
                Perform some security scans to enable predictive analytics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
