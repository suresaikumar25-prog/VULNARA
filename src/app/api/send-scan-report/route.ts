import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generateScanPDFBuffer } from '@/lib/generateScanPDF';

// ── Gmail SMTP transport ──────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { toEmail, url, score, grade, assessment, risks, scannedAt } = await request.json();

    if (!toEmail || !url) {
      return NextResponse.json({ error: 'toEmail and url are required' }, { status: 400 });
    }

    const pdfBuffer = await generateScanPDFBuffer({
      url,
      score: score ?? 0,
      grade: grade ?? 'N/A',
      assessment: assessment ?? 'No assessment available',
      risks: Array.isArray(risks) ? risks : [],
      scannedAt: scannedAt || new Date().toLocaleString(),
    });

    await transporter.sendMail({
      from: `"ThreatLens Scanner" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: `ThreatLens Scan Report - ${url}`,
      text: "Your ThreatLens security scan is complete. Please find your detailed report attached.",
      attachments: [
        {
          filename: 'ThreatLens_Report.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[send-scan-report] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send email report', details: String(error) },
      { status: 500 }
    );
  }
}
