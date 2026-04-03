'use client';

import { useState } from 'react';
import { Shield, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';

export default function GmailSetupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const startAuth = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/gmail-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setAuthUrl(data.authUrl);
        setSuccess('Authorization URL generated successfully!');
      } else {
        setError(data.error || 'Failed to generate authorization URL');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gmail API Setup</h1>
              <p className="text-gray-600">Configure automated email monitoring for ThreatLens</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Step 1: Generate Auth URL */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3">Step 1: Generate Authorization URL</h3>
              <p className="text-blue-800 text-sm mb-4">
                Click the button below to generate a Gmail authorization URL. This will allow ThreatLens to access your Gmail account for automated email processing.
              </p>
              
              <button
                onClick={startAuth}
                disabled={isLoading}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    <span>Generate Authorization URL</span>
                  </>
                )}
              </button>

              {authUrl && (
                <div className="mt-4">
                  <p className="text-blue-800 text-sm mb-2">Click the link below to authorize Gmail access:</p>
                  <a
                    href={authUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Authorize Gmail Access</span>
                  </a>
                </div>
              )}
            </div>

            {/* Step 2: Instructions */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-3">Step 2: Complete Authorization</h3>
              <div className="space-y-2 text-green-800 text-sm">
                <p>1. Click the authorization URL above</p>
                <p>2. Sign in to your Gmail account</p>
                <p>3. Grant permission to ThreatLens</p>
                <p>4. Copy the refresh token from the callback page</p>
                <p>5. Add it to your environment variables</p>
              </div>
            </div>

            {/* Step 3: Environment Setup */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-3">Step 3: Environment Configuration</h3>
              <p className="text-yellow-800 text-sm mb-3">
                Create a <code className="bg-yellow-100 px-2 py-1 rounded">.env.local</code> file in your project root with:
              </p>
              <div className="bg-yellow-100 p-3 rounded text-sm font-mono">
                <div>GMAIL_CLIENT_ID=YOUR_GMAIL_CLIENT_ID</div>
                <div>GMAIL_CLIENT_SECRET=YOUR_GMAIL_CLIENT_SECRET</div>
                <div>GMAIL_REFRESH_TOKEN=your_refresh_token_here</div>
                <div>ADMIN_EMAIL=your_email@gmail.com</div>
              </div>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="text-red-800 font-medium">Error</span>
                </div>
                <p className="text-red-700 mt-2">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">Success</span>
                </div>
                <p className="text-green-700 mt-2">{success}</p>
              </div>
            )}

            {/* Test Section */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Test Automated Email Processing</h3>
              <p className="text-gray-700 text-sm mb-3">
                Once setup is complete, you can test the automated system:
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Send an email to your Gmail account with URLs to scan</p>
                <p>• The system will automatically detect and process the email</p>
                <p>• You'll receive a security report reply within 5-15 seconds</p>
                <p>• Monitor the process at <a href="/gmail-monitor" className="text-blue-600 hover:underline">/gmail-monitor</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
