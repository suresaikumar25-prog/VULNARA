"use client";

import React, { useState, useEffect } from 'react';
import { X, Shield, Target, Activity, Brain, Zap, Code, Lock, AlertTriangle, CheckCircle } from 'lucide-react';

interface AdvancedSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

export default function AdvancedSecurityModal({
  isOpen,
  onClose,
  url
}: AdvancedSecurityModalProps) {
  const [scanResults, setScanResults] = useState<unknown>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen) {
      performAdvancedScan();
    }
  }, [isOpen]);

  const performAdvancedScan = async () => {
    setIsScanning(true);
    
    // Simulate advanced security scan
    setTimeout(() => {
      setScanResults({
        overview: {
          score: 78,
          grade: 'B+',
          totalTests: 156,
          passedTests: 122,
          failedTests: 34
        },
        penetrationTesting: {
          score: 72,
          tests: [
            { test: 'SQL Injection', status: 'passed', severity: 'low' },
            { test: 'XSS Vulnerability', status: 'failed', severity: 'medium' },
            { test: 'CSRF Protection', status: 'passed', severity: 'low' },
            { test: 'Authentication Bypass', status: 'passed', severity: 'low' },
            { test: 'Directory Traversal', status: 'failed', severity: 'high' },
            { test: 'File Upload Security', status: 'passed', severity: 'low' }
          ]
        },
        compliance: {
          score: 85,
          standards: [
            { standard: 'OWASP Top 10', compliance: 80, status: 'partial' },
            { standard: 'NIST Cybersecurity Framework', compliance: 75, status: 'partial' },
            { standard: 'ISO 27001', compliance: 90, status: 'compliant' },
            { standard: 'PCI DSS', compliance: 85, status: 'compliant' }
          ]
        },
        blockchain: {
          score: 65,
          assessments: [
            { area: 'Smart Contract Security', score: 70, status: 'needs-improvement' },
            { area: 'Cryptographic Implementation', score: 80, status: 'good' },
            { area: 'Network Security', score: 60, status: 'needs-improvement' },
            { area: 'Consensus Mechanism', score: 75, status: 'good' }
          ]
        },
        threatHunting: {
          score: 68,
          findings: [
            { threat: 'Suspicious Network Traffic', severity: 'medium', confidence: 75 },
            { threat: 'Anomalous User Behavior', severity: 'low', confidence: 60 },
            { threat: 'Potential APT Activity', severity: 'high', confidence: 85 },
            { threat: 'Malware Indicators', severity: 'medium', confidence: 70 }
          ]
        },
        soar: {
          score: 72,
          capabilities: [
            { capability: 'Automated Incident Response', status: 'implemented', score: 80 },
            { capability: 'Threat Intelligence Integration', status: 'partial', score: 65 },
            { capability: 'Security Orchestration', status: 'implemented', score: 75 },
            { capability: 'Playbook Automation', status: 'needs-improvement', score: 60 }
          ]
        }
      });
      setIsScanning(false);
    }, 4000);
  };

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600 bg-emerald-500/10 border border-emerald-500/20';
      case 'failed': return 'text-red-600 bg-red-500/10 border border-red-500/20';
      case 'compliant': return 'text-green-600 bg-emerald-500/10 border border-emerald-500/20';
      case 'partial': return 'text-orange-600 bg-orange-50';
      case 'needs-improvement': return 'text-red-600 bg-red-500/10 border border-red-500/20';
      case 'implemented': return 'text-green-600 bg-emerald-500/10 border border-emerald-500/20';
      case 'good': return 'text-green-600 bg-emerald-500/10 border border-emerald-500/20';
      default: return 'text-white/60 bg-white/5 border border-white/10';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-white/60';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'pentest', label: 'Penetration Testing', icon: Target },
    { id: 'compliance', label: 'Compliance', icon: CheckCircle },
    { id: 'blockchain', label: 'Blockchain', icon: Code },
    { id: 'threat-hunting', label: 'Threat Hunting', icon: Activity },
    { id: 'soar', label: 'SOAR', icon: Zap }
  ];

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
            <Brain className="h-6 w-6 text-fuchsia-400" />
            <h2 className="text-xl font-bold text-white">Advanced Security Assessment</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white/60 transition-colors"
          >
            <X className="h-6 w-6 text-white/50 group-hover:text-cyan-400 group-hover:rotate-90 transition-all duration-300" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto h-full space-y-8 pb-32">
          {isScanning ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Performing Advanced Security Scan
              </h3>
              <p className="text-white/60">
                Running comprehensive security assessments including penetration testing, compliance checks, and threat hunting...
              </p>
            </div>
          ) : scanResults ? (
            <div>
              {/* Header */}
              <div className="bg-purple-500/10 border border-purple-500/20 p-6 rounded-lg mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Advanced Security Score</h3>
                  <span className="text-sm text-purple-700">Target: {url}</span>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-4xl font-bold text-fuchsia-400">
                    {scanResults.overview.score}/100
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-purple-600 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${scanResults.overview.score}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-white mt-1">
                      Grade: {scanResults.overview.grade} - {scanResults.overview.passedTests}/{scanResults.overview.totalTests} tests passed
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-white/10 mb-6">
                <nav className="flex space-x-8 overflow-x-auto">
                  {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                        activeTab === id
                          ? 'border-purple-500 text-fuchsia-400'
                          : 'border-transparent text-white/50 hover:text-white/80 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="min-h-96">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-white/5 border border-white/10 p-4 rounded-lg text-center">
                        <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-white">{scanResults.overview.passedTests}</div>
                        <div className="text-sm text-white/60">Tests Passed</div>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-4 rounded-lg text-center">
                        <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-white">{scanResults.overview.failedTests}</div>
                        <div className="text-sm text-white/60">Tests Failed</div>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-4 rounded-lg text-center">
                        <Activity className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-white">{scanResults.overview.totalTests}</div>
                        <div className="text-sm text-white/60">Total Tests</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'pentest' && (
                  <div className="space-y-4">
                    {scanResults.penetrationTesting.tests.map((test: unknown, index: number) => (
                      <div key={index} className="bg-white/5 border border-white/10 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-white">{test.test}</h4>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${getSeverityColor(test.severity)}`}>
                              {test.severity.toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(test.status)}`}>
                              {test.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'compliance' && (
                  <div className="space-y-4">
                    {scanResults.compliance.standards.map((standard: unknown, index: number) => (
                      <div key={index} className="bg-white/5 border border-white/10 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-white">{standard.standard}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-white">{standard.compliance}%</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(standard.status)}`}>
                              {standard.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              standard.compliance >= 80 ? 'bg-emerald-500/10 border border-emerald-500/200' : standard.compliance >= 60 ? 'bg-orange-500' : 'bg-red-500/10 border border-red-500/200'
                            }`}
                            style={{ width: `${standard.compliance}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'blockchain' && (
                  <div className="space-y-4">
                    {scanResults.blockchain.assessments.map((assessment: unknown, index: number) => (
                      <div key={index} className="bg-white/5 border border-white/10 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-white">{assessment.area}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-white">{assessment.score}%</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(assessment.status)}`}>
                              {assessment.status.replace('-', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              assessment.score >= 80 ? 'bg-emerald-500/10 border border-emerald-500/200' : assessment.score >= 60 ? 'bg-orange-500' : 'bg-red-500/10 border border-red-500/200'
                            }`}
                            style={{ width: `${assessment.score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'threat-hunting' && (
                  <div className="space-y-4">
                    {scanResults.threatHunting.findings.map((finding: unknown, index: number) => (
                      <div key={index} className="bg-white/5 border border-white/10 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-white">{finding.threat}</h4>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${getSeverityColor(finding.severity)}`}>
                              {finding.severity.toUpperCase()}
                            </span>
                            <span className="text-sm text-white/50">{finding.confidence}% confidence</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'soar' && (
                  <div className="space-y-4">
                    {scanResults.soar.capabilities.map((capability: unknown, index: number) => (
                      <div key={index} className="bg-white/5 border border-white/10 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-white">{capability.capability}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-white">{capability.score}%</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(capability.status)}`}>
                              {capability.status.replace('-', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              capability.score >= 80 ? 'bg-emerald-500/10 border border-emerald-500/200' : capability.score >= 60 ? 'bg-orange-500' : 'bg-red-500/10 border border-red-500/200'
                            }`}
                            style={{ width: `${capability.score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div >
              </div>
            </div>
          ) : null}
        </div>
        
        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-[#02040b]/90 backdrop-blur-xl border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 font-bold uppercase tracking-widest text-[11px] rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.3) 0%, rgba(59,130,246,0.3) 100%)',
              color: '#fff',
              border: '1px solid rgba(168,85,247,0.5)',
            }}
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
