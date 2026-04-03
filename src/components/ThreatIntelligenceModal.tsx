"use client";

import React, { useState, useEffect } from 'react';
import { X, Shield, AlertTriangle, TrendingUp, Globe, Database, Users } from 'lucide-react';

interface ThreatIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  vulnerabilityType: string;
  description: string;
  url: string;
}

export default function ThreatIntelligenceModal({
  isOpen,
  onClose,
  vulnerabilityType,
  description,
  url
}: ThreatIntelligenceModalProps) {
  const [threatData, setThreatData] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchThreatIntelligence();
    }
  }, [isOpen, vulnerabilityType]);

  const fetchThreatIntelligence = async () => {
    setIsLoading(true);
    
    // Simulate threat intelligence data fetching
    setTimeout(() => {
      setThreatData({
        vulnerabilityType,
        threatLevel: 'medium',
        globalStats: {
          totalAttacks: 1247,
          lastWeek: 89,
          trend: 'increasing',
          topCountries: ['United States', 'China', 'Russia', 'Germany', 'United Kingdom']
        },
        attackPatterns: [
          {
            pattern: 'Automated Scanning',
            frequency: 'high',
            description: 'Automated tools scanning for this vulnerability type',
            examples: ['Nmap', 'Nessus', 'OpenVAS']
          },
          {
            pattern: 'Manual Exploitation',
            frequency: 'medium',
            description: 'Manual attacks targeting specific vulnerabilities',
            examples: ['SQLMap', 'Burp Suite', 'Custom Scripts']
          },
          {
            pattern: 'Botnet Activity',
            frequency: 'low',
            description: 'Coordinated attacks from botnet networks',
            examples: ['Mirai', 'Echobot', 'Gafgyt']
          }
        ],
        indicators: [
          'Suspicious SQL queries in logs',
          'Unusual traffic patterns',
          'Failed authentication attempts',
          'Data exfiltration attempts'
        ],
        mitigation: [
          'Implement Web Application Firewall (WAF)',
          'Regular security updates and patches',
          'Input validation and sanitization',
          'Database access controls',
          'Monitoring and alerting systems'
        ],
        recentIncidents: [
          {
            date: '2024-01-15',
            severity: 'high',
            description: 'Mass SQL injection attack targeting e-commerce sites',
            affected: '500+ websites'
          },
          {
            date: '2024-01-10',
            severity: 'medium',
            description: 'XSS campaign targeting social media platforms',
            affected: '50+ websites'
          },
          {
            date: '2024-01-05',
            severity: 'critical',
            description: 'Ransomware attack exploiting similar vulnerabilities',
            affected: '1000+ systems'
          }
        ]
      });
      setIsLoading(false);
    }, 2000);
  };

  if (!isOpen) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-500/10 border border-red-500/20';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-emerald-500/10 border border-emerald-500/20';
      default: return 'text-white/60 bg-white/5 border border-white/10';
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-white/60';
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
            <Shield className="h-6 w-6 text-fuchsia-400" />
            <h2 className="text-xl font-bold text-white">Threat Intelligence</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white/60 transition-colors"
          >
            <X className="h-6 w-6 text-white/50 group-hover:text-cyan-400 group-hover:rotate-90 transition-all duration-300" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto h-full space-y-8 pb-32">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Gathering Threat Intelligence
              </h3>
              <p className="text-white/60">
                Analyzing global threat landscape and attack patterns...
              </p>
            </div>
          ) : threatData ? (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {threatData.vulnerabilityType} Analysis
                </h3>
                <p className="text-white text-sm mb-2">{description}</p>
                <p className="text-purple-700 text-xs">Target: {url}</p>
              </div>

              {/* Global Statistics */}
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 p-4 rounded-lg text-center">
                  <Database className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{threatData.globalStats.totalAttacks.toLocaleString()}</div>
                  <div className="text-sm text-white/60">Total Attacks</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-lg text-center">
                  <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{threatData.globalStats.lastWeek}</div>
                  <div className="text-sm text-white/60">Last Week</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-lg text-center">
                  <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white capitalize">{threatData.globalStats.trend}</div>
                  <div className="text-sm text-white/60">Trend</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-lg text-center">
                  <Globe className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{threatData.globalStats.topCountries.length}</div>
                  <div className="text-sm text-white/60">Top Countries</div>
                </div>
              </div>

              {/* Attack Patterns */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Attack Patterns</h4>
                <div className="space-y-3">
                  {threatData.attackPatterns.map((pattern: unknown, index: number) => (
                    <div key={index} className="bg-white/5 border border-white/10 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-white">{pattern.pattern}</h5>
                        <span className={`text-sm font-medium ${getFrequencyColor(pattern.frequency)}`}>
                          {pattern.frequency.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-white/60 text-sm mb-2">{pattern.description}</p>
                      <div className="text-xs text-white/50">
                        <strong>Tools:</strong> {pattern.examples.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Threat Indicators */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Threat Indicators</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {threatData.indicators.map((indicator: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2 bg-yellow-50 p-3 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                      <span className="text-sm text-white/80">{indicator}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Incidents */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Recent Incidents</h4>
                <div className="space-y-3">
                  {threatData.recentIncidents.map((incident: unknown, index: number) => (
                    <div key={index} className="bg-white/5 border border-white/10 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">{incident.date}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                          {incident.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-white/80 text-sm mb-1">{incident.description}</p>
                      <p className="text-white/50 text-xs">Affected: {incident.affected}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mitigation Strategies */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Recommended Mitigation</h4>
                <ul className="space-y-2">
                  {threatData.mitigation.map((strategy: string, index: number) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-white/80">{strategy}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={onClose}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
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
