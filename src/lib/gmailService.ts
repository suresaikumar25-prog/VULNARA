import { google } from 'googleapis';

export class GmailService {
  private oauth2Client: any;
  private gmail: any;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      'http://localhost:3000/api/gmail-callback'
    );

    this.oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN
    });

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/gmail.send'
      ],
      prompt: 'consent'
    });
  }

  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }

  async getUnreadEmails() {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread'
      });

      const messages = response.data.messages || [];
      const emails = [];

      for (const message of messages.slice(0, 5)) {
        const email = await this.getEmailDetails(message.id);
        if (email) emails.push(email);
      }

      return emails;
    } catch (error) {
      console.error('Error fetching emails:', error);
      return [];
    }
  }

  async getEmailDetails(messageId: string) {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
      });

      const headers = response.data.payload.headers;
      const from = headers.find((h: any) => h.name === 'From')?.value || '';
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
      
      let body = '';
      
      // Try to get body from different parts
      if (response.data.payload.body?.data) {
        body = Buffer.from(response.data.payload.body.data, 'base64').toString();
      } else if (response.data.payload.parts) {
        // Look through all parts for text content
        for (const part of response.data.payload.parts) {
          if (part.mimeType === 'text/plain' && part.body?.data) {
            body = Buffer.from(part.body.data, 'base64').toString();
            break;
          } else if (part.mimeType === 'text/html' && part.body?.data) {
            // If no plain text, use HTML
            const htmlBody = Buffer.from(part.body.data, 'base64').toString();
            // Simple HTML to text conversion
            body = htmlBody.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
            break;
          }
        }
      }

      console.log(`📧 Email body content: "${body}"`);
      return { id: messageId, from, subject, body };
    } catch (error) {
      console.error('Error fetching email details:', error);
      return null;
    }
  }

  async markAsRead(messageId: string) {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: { removeLabelIds: ['UNREAD'] }
      });
    } catch (error) {
      console.error('Error marking email as read:', error);
    }
  }

  async sendReply(to: string, subject: string, body: string) {
    try {
      const message = [
        `To: ${to}`,
        `Subject: Re: ${subject}`,
        'Content-Type: text/html; charset=utf-8',
        '',
        body
      ].join('\n');

      const encodedMessage = Buffer.from(message).toString('base64')
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encodedMessage }
      });
      
      console.log(`✅ Reply sent to: ${to}`);
      console.log(`📧 Message ID: ${response.data.id}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending reply:', error);
      console.error('❌ Error details:', (error as Error).message);
      
      if ((error as Error).message.includes('insufficient authentication scopes')) {
        console.error('❌ Gmail API needs send permission! Re-authorize with gmail.send scope');
      }
      
      return false;
    }
  }
}
