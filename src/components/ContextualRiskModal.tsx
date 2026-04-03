"use client";

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Shield, TrendingUp, Target, Activity } from 'lucide-react';

interface ContextualRiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  vulnerability: any;
}

export default function ContextualRiskModal({
  isOpen,
  onClose,
  vulnerability
}: ContextualRiskModalProps) {
  const [riskAnalysis, setRiskAnalysis] = useState<unknown>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (isOpen && vulnerability) {
      analyzeRisk();
    }
  }, [isOpen, vulnerability]);

  const analyzeRisk = async () => {
    setIsAnalyzing(true);
    
    // Simulate contextual risk analysis
    setTimeout(() => {
      setRiskAnalysis({
        overallRisk: 'medium',
        riskScore: 65,
        factors: [
          {
            factor: 'Attack Surface',
            risk: 'high',
            description: 'Large attack surface with multiple entry points',
            impact: 'Critical'
          },
          {
            factor: 'Data Sensitivity',
            risk: 'medium',
            description: 'Moderate sensitivity data exposure risk',
            impact: 'High'
          },
          {
            factor: 'User Impact',
            risk: 'low',
            description: 'Limited user impact potential',
            impact: 'Medium'
          },
          {
            factor: 'Business Impact',
            risk: 'medium',
            description: 'Potential for moderate business disruption',
            impact: 'High'
          }
        ],
        recommendations: [
          'Implement additional input validation',
          'Add rate limiting to prevent abuse',
          'Monitor for suspicious activity patterns',
          'Consider implementing Web Application Firewall (WAF)'
        ],
        threatIntelligence: {
          recentAttacks: 12,
          attackTrend: 'increasing',
          commonVectors: ['SQL Injection', 'XSS', 'CSRF']
        }
      });
      setIsAnalyzing(false);
    }, 1500);
  };

  if (!isOpen) return null;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-500/10 border border-red-500/20';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'low': return 'text-green-600 bg-emerald-500/10 border border-emerald-500/20';
      default: return 'text-white/60 bg-white/5 border border-white/10';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'medium': return <Shield className="h-4 w-4 text-orange-600" />;
      case 'low': return <Shield className="h-4 w-4 text-green-600" />;
      default: return <Shield className="h-4 w-4 text-white/60" />;
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
            <Target className="h-6 w-6 text-orange-600" />
            <h2 className="text-xl font-bold text-white">Contextual Risk Analysis</h2>
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Analyzing Risk Context
              </h3>
              <p className="text-white/60">
                Evaluating vulnerability impact and business context...
              </p>
            </div>
          ) : riskAnalysis ? (
            <div className="space-y-6">
              {/* Overall Risk Score */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Overall Risk Assessment</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(riskAnalysis.overallRisk)}`}>
                    {riskAnalysis.overallRisk.toUpperCase()} RISK
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-3xl font-bold text-orange-600">
                    {riskAnalysis.riskScore}/100
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-orange-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${riskAnalysis.riskScore}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-white/60 mt-1">
                      Risk score based on vulnerability severity and business impact
                    </p>
                  </div>
                </div>
              </div>

              {/* Risk Factors */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Risk Factors</h4>
                <div className="space-y-3">
                  {riskAnalysis.factors.map((factor: unknown, index: number) => (
                    <div key={index} className="bg-white/5 border border-white/10 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getRiskIcon(factor.risk)}
                          <span className="font-medium text-white">{factor.factor}</span>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(factor.risk)}`}>
                          {factor.risk.toUpperCase()}
                        </div>
                      </div>
                      <p className="text-white/60 text-sm mb-2">{factor.description}</p>
                      <div className="text-xs text-white/50">
                        Impact: <span className="font-medium">{factor.impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Threat Intelligence */}
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-white mb-3">Threat Intelligence</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">{riskAnalysis.threatIntelligence.recentAttacks}</div>
                    <div className="text-sm text-white">Recent Attacks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 capitalize">{riskAnalysis.threatIntelligence.attackTrend}</div>
                    <div className="text-sm text-white">Attack Trend</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-fuchsia-400">{riskAnalysis.threatIntelligence.commonVectors.length}</div>
                    <div className="text-sm text-white">Common Vectors</div>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-white">
                    <strong>Common attack vectors:</strong> {riskAnalysis.threatIntelligence.commonVectors.join(', ')}
                  </p>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Risk Mitigation Recommendations</h4>
                <ul className="space-y-2">
                  {riskAnalysis.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="bg-orange-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">
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
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
