import nodemailer from 'nodemailer';

const createTransporter = () => {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('⚠️ Email service not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in environment variables.');
        return null;
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

export async function sendOTPEmail(email, otp, purpose = 'registration') {
    const transporter = createTransporter();

    if (!transporter) {
        console.error('Email transporter not configured');
        throw new Error('Email service not configured. Please contact support.');
    }

    const purposeText = {
        'registration': 'complete your registration',
        'password-reset': 'reset your password',
        'email-verification': 'verify your email address'
    };

    const mailOptions = {
        from: `"TruckSuvidha" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: `Your TruckSuvidha Verification Code: ${otp}`,
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Code</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 0;">
              <table role="presentation" style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 32px; text-align: center;">
                    <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">🚚 TruckSuvidha</h1>
                    <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Logistics Made Simple</p>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px 32px;">
                    <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 20px; font-weight: 600;">Verification Code</h2>
                    <p style="margin: 0 0 24px; color: #6b7280; font-size: 15px; line-height: 1.6;">
                      Use the following code to ${purposeText[purpose] || 'verify your identity'}:
                    </p>
                    
                    <!-- OTP Box -->
                    <div style="background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                      <span style="font-size: 36px; font-weight: 700; color: #7c3aed; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</span>
                    </div>
                    
                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                      ⏱️ This code expires in <strong>10 minutes</strong>
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                      If you didn't request this code, please ignore this email.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px;">
                      Need help? Contact us at support@trucksuvidha.com
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      © 2024 TruckSuvidha. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
        text: `Your TruckSuvidha verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ OTP email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Failed to send OTP email:', error);
        throw new Error('Failed to send verification email. Please try again.');
    }
}
export async function verifyEmailConfig() {
    const transporter = createTransporter();

    if (!transporter) {
        return { configured: false, error: 'SMTP not configured' };
    }

    try {
        await transporter.verify();
        console.log('✅ Email service configured and ready');
        return { configured: true };
    } catch (error) {
        console.error('❌ Email configuration error:', error);
        return { configured: false, error: error.message };
    }
}
