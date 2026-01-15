export function getPasswordResetEmailTemplate(resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            color: #2563eb;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #2563eb;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
          .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 10px;
            border-radius: 4px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <h1>Password Reset</h1>
        <p>You requested a password reset for your Mini Time Tracker account.</p>
        <p>Click the button below to set a new password:</p>
        <a href="${resetUrl}" class="button">Reset Password</a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p>${resetUrl}</p>
        <div class="warning">
          <strong>Security Notice:</strong> This link will expire in 1 hour. If you did not request this password reset, please ignore this email and your password will remain unchanged.
        </div>
        <p class="footer">For security reasons, do not share this link with anyone.</p>
      </body>
    </html>
  `;
}
