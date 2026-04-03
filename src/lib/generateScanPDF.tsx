import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToStream,
  Font,
} from '@react-pdf/renderer';

Font.register({
  family: 'Open Sans',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf' },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf', fontWeight: 600 },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#0a1628',
    color: '#ffffff',
    fontFamily: 'Open Sans',
    padding: 40,
  },
  header: {
    marginBottom: 20,
    borderBottom: '1px solid #1e3a5f',
    paddingBottom: 20,
  },
  logo: {
    color: '#00d4ff',
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 10,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 12,
  },
  section: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  urlText: {
    color: '#00d4ff',
    fontSize: 14,
    fontWeight: 600,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10,
    paddingTop: 15,
    paddingBottom: 15,
    borderTop: '1px solid #1e3a5f',
    borderBottom: '1px solid #1e3a5f',
  },
  scoreCol: {
    width: '45%',
  },
  scoreValueWrapper: {
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 700,
  },
  scoreLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  assessmentText: {
    fontSize: 14,
    lineHeight: 1.5,
    fontWeight: 600,
  },
  riskCard: {
    backgroundColor: '#0d1b33',
    border: '1px solid #1e3a5f',
    borderLeftWidth: 4,
    borderRadius: 4,
    padding: 12,
    marginBottom: 10,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  riskBadgeWrapper: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    borderWidth: 1,
    marginRight: 8,
  },
  riskBadgeText: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  riskTitle: {
    fontSize: 12,
    fontWeight: 700,
    flex: 1,
  },
  riskDescription: {
    color: '#94a3b8',
    fontSize: 10,
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#334155',
    fontSize: 10,
  },
});

function severityColor(severity: string) {
  switch (severity.toLowerCase()) {
    case 'critical': return '#ef4444';
    case 'high':     return '#f97316';
    case 'medium':   return '#eab308';
    case 'low':      return '#22d3ee';
    default:         return '#94a3b8';
  }
}

function gradeColor(grade: string) {
  if (['A+', 'A', 'A-'].includes(grade)) return '#10b981';
  if (['B+', 'B', 'B-'].includes(grade)) return '#3b82f6';
  if (['C+', 'C', 'C-'].includes(grade)) return '#eab308';
  if (['D+', 'D', 'D-'].includes(grade)) return '#f97316';
  return '#ef4444';
}

const ScanReportRenderer = ({ data }: { data: any }) => {
  const { url, score, grade, assessment, risks, scannedAt } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logo}>Shield · ThreatLens</Text>
          <Text style={styles.title}>Scan Report</Text>
          <Text style={styles.subtitle}>Completed on {scannedAt}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scanned Target</Text>
          <Text style={styles.urlText}>{url}</Text>
        </View>

        <View style={styles.scoreRow}>
          <View style={styles.scoreCol}>
            <View style={styles.scoreValueWrapper}>
              <Text style={[styles.scoreValue, { color: gradeColor(grade) }]}>{score}</Text>
            </View>
            <Text style={styles.scoreLabel}>Security Score</Text>
          </View>
          <View style={styles.scoreCol}>
            <View style={styles.scoreValueWrapper}>
              <Text style={[styles.scoreValue, { color: gradeColor(grade) }]}>{grade}</Text>
            </View>
            <Text style={styles.scoreLabel}>Grade</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Assessment</Text>
          <Text style={styles.assessmentText}>{assessment}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identified Risks ({risks.length})</Text>
          {risks.length > 0 ? (
            risks.map((r: unknown, idx: number) => {
              const color = severityColor(r.severity);
              return (
                <View key={idx} style={[styles.riskCard, { borderLeftColor: color }]}>
                  <View style={styles.riskHeader}>
                    <View style={[styles.riskBadgeWrapper, { backgroundColor: color + '22', borderColor: color + '55' }]}>
                      <Text style={[styles.riskBadgeText, { color: color }]}>{r.severity}</Text>
                    </View>
                    <Text style={styles.riskTitle}>{r.title}</Text>
                  </View>
                  <Text style={styles.riskDescription}>{r.description}</Text>
                </View>
              );
            })
          ) : (
            <Text style={{ color: '#10b981', fontSize: 12 }}>No vulnerabilities detected.</Text>
          )}
        </View>

        <Text style={styles.footer}>
          Sent by ThreatLens Security Scanner
        </Text>
      </Page>
    </Document>
  );
};

export async function generateScanPDFBuffer(scanData: unknown): Promise<Buffer> {
  const stream = await renderToStream(<ScanReportRenderer data={scanData} />);
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}
