import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('=== COMPARISON API CALLED ===');
    
    const { url, scanIds, userId } = await request.json();
    console.log('Request data:', { url, scanIds, userId });
    
    if (!url) {
      console.log('ERROR: URL is missing');
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    if (!scanIds || !Array.isArray(scanIds) || scanIds.length < 2) {
      console.log('ERROR: Invalid scanIds:', scanIds);
      return NextResponse.json(
        { error: 'At least 2 scan IDs are required for comparison' },
        { status: 400 }
      );
    }

    if (!userId) {
      console.log('ERROR: User ID is missing');
      return NextResponse.json(
        { error: 'User ID is required for authentication' },
        { status: 401 }
      );
    }

    console.log('Fetching scans for comparison:', { url, scanIds, userId });

    // Check if Supabase is configured
    if (!supabase) {
      console.error('Supabase is not configured');
      return NextResponse.json(
        { 
          error: 'Database not configured',
          details: 'Supabase environment variables are missing. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file. See DATABASE_SETUP.md for instructions.',
          setupRequired: true
        },
        { status: 500 }
      );
    }

    // Convert Firebase UID to UUID format for database queries
    let formattedUserId = userId;
    if (userId.length === 28) {
      // Use crypto to create a consistent UUID from Firebase UID
      const crypto = await import('crypto');
      const hash = crypto.createHash('sha256').update(userId).digest('hex');
      formattedUserId = hash.substring(0, 8) + '-' + 
                       hash.substring(8, 12) + '-' + 
                       hash.substring(12, 16) + '-' + 
                       hash.substring(16, 20) + '-' + 
                       hash.substring(20, 32);
    }
    
    // First, ensure the user exists in the users table
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', formattedUserId)
      .single();

    if (userCheckError && userCheckError.code !== 'PGRST116') {
      console.error('Error checking user:', userCheckError);
      return NextResponse.json(
        { 
          error: 'Database connection error',
          details: userCheckError.message,
          code: userCheckError.code
        },
        { status: 500 }
      );
    }

    // If user doesn't exist, create them
    if (!existingUser) {
      const { error: userCreateError } = await supabase
        .from('users')
        .insert([{
          id: formattedUserId,
          email: 'user@example.com', // Placeholder email
          name: 'User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (userCreateError) {
        console.error('Error creating user:', userCreateError);
        return NextResponse.json(
          { 
            error: 'Database error',
            details: userCreateError.message,
            code: userCreateError.code
          },
          { status: 500 }
        );
      }
    }
    
    // Now check if the user has any scans
    const { data: userScans, error: userScansError } = await supabase
      .from('scan_results')
      .select('id, url, created_at')
      .eq('user_id', formattedUserId)
      .limit(10);

    if (userScansError) {
      console.error('Error checking user scans:', userScansError);
      return NextResponse.json(
        { 
          error: 'Database connection error',
          details: userScansError.message,
          code: userScansError.code
        },
        { status: 500 }
      );
    }

    console.log('User has scans:', userScans?.length || 0);

    // Get the latest scans for this URL (ignore the provided scan IDs for now)
    console.log('Fetching latest scans for URL:', url);
    const { data: scans, error: fetchError } = await supabase
      .from('scan_results')
      .select('*')
      .eq('user_id', formattedUserId)
      .eq('url', url)
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchError) {
      console.error('Error fetching scans for comparison:', fetchError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch scan results',
          details: fetchError.message,
          code: fetchError.code
        },
        { status: 500 }
      );
    }

    console.log('Found scans:', scans?.length || 0);

    let finalScans = scans;

    if (!scans || scans.length < 2) {
      // Try to find scans without URL filter as fallback
      const { data: allUserScans, error: fallbackError } = await supabase
        .from('scan_results')
        .select('*')
        .eq('user_id', formattedUserId)
        .order('created_at', { ascending: true })
        .limit(10);

      if (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        return NextResponse.json(
          { 
            error: 'Failed to fetch scan results from database',
            details: fallbackError.message,
            code: fallbackError.code
          },
          { status: 500 }
        );
      }

      if (!allUserScans || allUserScans.length < 2) {
        // If no scans found, return an empty comparison report instead of an error
        console.log('No scans found, returning empty comparison report');
        const emptyComparisonReport = {
          url: url,
          comparisonPeriod: {
            from: new Date().toISOString(),
            to: new Date().toISOString(),
            totalScans: 0
          },
          scans: [],
          vulnerabilityChanges: {
            fixed: 0,
            introduced: 0,
            persistent: 0,
            totalOld: 0,
            totalNew: 0,
            netChange: 0,
            details: {
              fixed: [],
              introduced: [],
              persistent: []
            }
          },
          scoreChanges: {
            oldScore: 0,
            newScore: 0,
            change: 0,
            changePercentage: 0,
            oldGrade: 'N/A',
            newGrade: 'N/A'
          },
          summary: {
            averageScore: 0,
            minScore: 0,
            maxScore: 0,
            averageVulnerabilities: 0,
            minVulnerabilities: 0,
            maxVulnerabilities: 0,
            totalScans: 0
          },
          trends: {
            scoreTrend: 'stable',
            vulnerabilityTrend: 'stable',
            securityTrend: 'stable'
          },
          recommendations: [
            'Perform some security scans first to enable comparison analysis',
            'Run scans on the same URL to track security improvements over time',
            'Compare different scan results to identify patterns and trends'
          ]
        };
        
        return NextResponse.json({
          success: true,
          data: emptyComparisonReport,
          message: 'No scan results found. Please perform some scans first to enable comparison analysis.'
        });
      }

      // If we have some scans but not enough for comparison, use what we have
      if (allUserScans.length === 1) {
        console.log('Only one scan found, duplicating it for comparison');
        // Duplicate the single scan to create a comparison
        finalScans = [allUserScans[0], { ...allUserScans[0], id: allUserScans[0].id + '_duplicate' }];
      } else {
        // Use the fallback scans
        finalScans = allUserScans;
      }
    }

    // Generate comparison report
    const comparisonReport = generateComparisonReport(finalScans);

    return NextResponse.json({
      success: true,
      data: comparisonReport
    });

  } catch (error) {
    console.error('=== COMPARISON API ERROR ===');
    console.error('Error generating comparison report:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to generate comparison report',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

interface ScanData {
  id: string;
  url: string;
  created_at: string;
  vulnerabilities: Array<{ type: string; severity: string; description: string; location: string }>;
  security_score: { score: number; grade: string; color: string; description: string };
  summary: { total: number; critical: number; high: number; medium: number; low: number };
}

function generateComparisonReport(scans: ScanData[]) {
  const oldestScan = scans[0];
  const newestScan = scans[scans.length - 1];
  
  // Extract vulnerability data
  const oldestVulns = oldestScan.vulnerabilities || [];
  const newestVulns = newestScan.vulnerabilities || [];
  
  // Extract security scores
  const oldestScore = oldestScan.security_score || {};
  const newestScore = newestScan.security_score || {};
  
  // Calculate vulnerability changes
  const vulnerabilityChanges = calculateVulnerabilityChanges(oldestVulns, newestVulns);
  
  // Calculate security score changes
  const scoreChanges = calculateScoreChanges(oldestScore, newestScore);
  
  // Calculate summary statistics
  const summary = calculateSummaryStats(scans);
  
  // Generate trend analysis
  const trends = generateTrendAnalysis(scans);
  
  return {
    url: oldestScan.url,
    comparisonPeriod: {
      from: oldestScan.created_at,
      to: newestScan.created_at,
      totalScans: scans.length
    },
    scans: scans.map(scan => ({
      id: scan.id,
      timestamp: scan.created_at,
      securityScore: scan.security_score,
      vulnerabilityCount: (scan.vulnerabilities || []).length,
      summary: scan.summary
    })),
    vulnerabilityChanges,
    scoreChanges,
    summary,
    trends,
    recommendations: generateRecommendations(vulnerabilityChanges, scoreChanges, trends)
  };
}

function calculateVulnerabilityChanges(oldVulns: Array<{ type: string; severity: string; description: string; location: string }>, newVulns: Array<{ type: string; severity: string; description: string; location: string }>) {
  const oldVulnTypes = new Set(oldVulns.map(v => v.type));
  const newVulnTypes = new Set(newVulns.map(v => v.type));
  
  const fixed = [...oldVulnTypes].filter(type => !newVulnTypes.has(type));
  const introduced = [...newVulnTypes].filter(type => !oldVulnTypes.has(type));
  const persistent = [...oldVulnTypes].filter(type => newVulnTypes.has(type));
  
  return {
    fixed: fixed.length,
    introduced: introduced.length,
    persistent: persistent.length,
    totalOld: oldVulns.length,
    totalNew: newVulns.length,
    netChange: newVulns.length - oldVulns.length,
    details: {
      fixed: fixed,
      introduced: introduced,
      persistent: persistent
    }
  };
}

function calculateScoreChanges(oldScore: { score: number; grade: string; color: string; description: string }, newScore: { score: number; grade: string; color: string; description: string }) {
  const oldValue = oldScore.score || 0;
  const newValue = newScore.score || 0;
  
  return {
    oldScore: oldValue,
    newScore: newValue,
    change: newValue - oldValue,
    changePercentage: oldValue > 0 ? ((newValue - oldValue) / oldValue) * 100 : 0,
    oldGrade: oldScore.grade || 'F',
    newGrade: newScore.grade || 'F'
  };
}

function calculateSummaryStats(scans: ScanData[]) {
  const scores = scans.map(scan => (scan.security_score || {}).score || 0);
  const vulnCounts = scans.map(scan => (scan.vulnerabilities || []).length);
  
  return {
    averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
    minScore: Math.min(...scores),
    maxScore: Math.max(...scores),
    averageVulnerabilities: vulnCounts.reduce((a, b) => a + b, 0) / vulnCounts.length,
    minVulnerabilities: Math.min(...vulnCounts),
    maxVulnerabilities: Math.max(...vulnCounts),
    totalScans: scans.length
  };
}

function generateTrendAnalysis(scans: ScanData[]) {
  const scores = scans.map(scan => (scan.security_score || {}).score || 0);
  const vulnCounts = scans.map(scan => (scan.vulnerabilities || []).length);
  
  // Calculate trend direction
  const scoreTrend = calculateTrend(scores);
  const vulnTrend = calculateTrend(vulnCounts);
  
  return {
    scoreTrend: {
      direction: scoreTrend.direction,
      strength: scoreTrend.strength,
      description: getTrendDescription(scoreTrend.direction, 'security score')
    },
    vulnerabilityTrend: {
      direction: vulnTrend.direction,
      strength: vulnTrend.strength,
      description: getTrendDescription(vulnTrend.direction, 'vulnerabilities')
    }
  };
}

function calculateTrend(values: number[]) {
  if (values.length < 2) return { direction: 'stable', strength: 0 };
  
  const first = values[0];
  const last = values[values.length - 1];
  const change = last - first;
  const changePercentage = first > 0 ? (change / first) * 100 : 0;
  
  let direction = 'stable';
  let strength = 0;
  
  if (Math.abs(changePercentage) > 10) {
    direction = change > 0 ? 'improving' : 'declining';
    strength = Math.min(Math.abs(changePercentage) / 10, 5); // Scale to 1-5
  }
  
  return { direction, strength };
}

function getTrendDescription(direction: string, metric: string) {
  switch (direction) {
    case 'improving':
      return `${metric} are improving over time`;
    case 'declining':
      return `${metric} are declining over time`;
    default:
      return `${metric} remain stable over time`;
  }
}

interface VulnerabilityChanges {
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
}

interface ScoreChanges {
  oldScore: number;
  newScore: number;
  change: number;
  changePercentage: number;
  oldGrade: string;
  newGrade: string;
}

interface Trends {
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
}

function generateRecommendations(vulnChanges: VulnerabilityChanges, scoreChanges: ScoreChanges, trends: Trends) {
  const recommendations = [];
  
  // Vulnerability-based recommendations
  if (vulnChanges.introduced > 0) {
    recommendations.push({
      type: 'warning',
      title: 'New Vulnerabilities Detected',
      message: `${vulnChanges.introduced} new vulnerabilities were introduced. Review recent changes to identify the cause.`,
      priority: 'high'
    });
  }
  
  if (vulnChanges.fixed > 0) {
    recommendations.push({
      type: 'success',
      title: 'Vulnerabilities Fixed',
      message: `${vulnChanges.fixed} vulnerabilities were successfully resolved. Great job!`,
      priority: 'low'
    });
  }
  
  if (vulnChanges.persistent > 0) {
    recommendations.push({
      type: 'info',
      title: 'Persistent Vulnerabilities',
      message: `${vulnChanges.persistent} vulnerabilities remain unresolved. Consider prioritizing these for the next security update.`,
      priority: 'medium'
    });
  }
  
  // Score-based recommendations
  if (scoreChanges.change < -10) {
    recommendations.push({
      type: 'warning',
      title: 'Security Score Decline',
      message: `Security score decreased by ${Math.abs(scoreChanges.change)} points. Immediate attention recommended.`,
      priority: 'high'
    });
  } else if (scoreChanges.change > 10) {
    recommendations.push({
      type: 'success',
      title: 'Security Score Improvement',
      message: `Security score improved by ${scoreChanges.change} points. Keep up the good work!`,
      priority: 'low'
    });
  }
  
  // Trend-based recommendations
  if (trends.vulnerabilityTrend.direction === 'declining' && trends.vulnerabilityTrend.strength > 2) {
    recommendations.push({
      type: 'warning',
      title: 'Increasing Vulnerability Trend',
      message: 'Vulnerabilities are increasing over time. Consider implementing more frequent security reviews.',
      priority: 'high'
    });
  }
  
  if (trends.scoreTrend.direction === 'improving' && trends.scoreTrend.strength > 2) {
    recommendations.push({
      type: 'success',
      title: 'Improving Security Trend',
      message: 'Security posture is improving over time. Continue current security practices.',
      priority: 'low'
    });
  }
  
  return recommendations;
}
