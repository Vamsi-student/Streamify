const STYLES = {
  container: `
    max-width: 480px;
    margin: 0 auto;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: #f4f4f8;
  `,
  card: `
    background-color: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  `,
  header: `
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    padding: 32px 24px;
    text-align: center;
  `,
  logo: `
    font-size: 28px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.5px;
  `,
  body: `
    padding: 32px 24px;
  `,
  heading: `
    font-size: 20px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 8px 0;
  `,
  text: `
    font-size: 15px;
    line-height: 1.6;
    color: #475569;
    margin: 0 0 24px 0;
  `,
  otpContainer: `
    text-align: center;
    margin: 28px 0;
  `,
  otpCode: `
    font-size: 36px;
    letter-spacing: 10px;
    font-weight: 800;
    color: #6366f1;
    background: #eef2ff;
    padding: 16px 28px;
    border-radius: 10px;
    display: inline-block;
    font-family: 'Courier New', monospace;
  `,
  footer: `
    padding: 20px 24px;
    text-align: center;
    border-top: 1px solid #e2e8f0;
  `,
  footerText: `
    font-size: 12px;
    color: #94a3b8;
    margin: 4px 0;
  `,
};

function wrapLayout(bodyHtml) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Streamify</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f8;padding:24px 16px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:32px 24px;text-align:center;">
              <span style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Streamify</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 24px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="font-size:12px;color:#94a3b8;margin:4px 0;">&copy; ${new Date().getFullYear()} Streamify. All rights reserved.</p>
              <p style="font-size:12px;color:#94a3b8;margin:4px 0;">If you didn't request this email, you can safely ignore it.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function verificationOTPEmail(otp) {
  const body = `
    <h1 style="font-size:20px;font-weight:700;color:#1e293b;margin:0 0 8px 0;">Verify Your Email Address</h1>
    <p style="font-size:15px;line-height:1.6;color:#475569;margin:0 0 24px 0;">
      Thanks for signing up! Please use the verification code below to activate your account.
    </p>
    <div style="text-align:center;margin:28px 0;">
      <span style="font-size:36px;letter-spacing:10px;font-weight:800;color:#6366f1;background:#eef2ff;padding:16px 28px;border-radius:10px;display:inline-block;font-family:'Courier New',monospace;">
        ${otp}
      </span>
    </div>
    <p style="font-size:13px;color:#64748b;margin:0 0 4px 0;">This code expires in <strong>10 minutes</strong>.</p>
    <p style="font-size:13px;color:#64748b;margin:0;">Enter it on the verification screen to complete your registration.</p>
  `;
  return wrapLayout(body);
}

export function passwordResetOTPEmail(otp) {
  const body = `
    <h1 style="font-size:20px;font-weight:700;color:#1e293b;margin:0 0 8px 0;">Reset Your Password</h1>
    <p style="font-size:15px;line-height:1.6;color:#475569;margin:0 0 24px 0;">
      We received a request to reset your password. Use the code below to proceed.
    </p>
    <div style="text-align:center;margin:28px 0;">
      <span style="font-size:36px;letter-spacing:10px;font-weight:800;color:#6366f1;background:#eef2ff;padding:16px 28px;border-radius:10px;display:inline-block;font-family:'Courier New',monospace;">
        ${otp}
      </span>
    </div>
    <p style="font-size:13px;color:#64748b;margin:0 0 4px 0;">This code expires in <strong>10 minutes</strong>.</p>
    <p style="font-size:13px;color:#64748b;margin:0;">If you didn't request this, you can safely ignore this email.</p>
  `;
  return wrapLayout(body);
}

export function welcomeEmail(name) {
  const body = `
    <h1 style="font-size:20px;font-weight:700;color:#1e293b;margin:0 0 8px 0;">Welcome to Streamify, ${name}!</h1>
    <p style="font-size:15px;line-height:1.6;color:#475569;margin:0 0 24px 0;">
      Your email has been verified successfully. You're all set to start connecting with friends and practicing languages.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
        <tr>
          <td style="background:#6366f1;border-radius:8px;padding:0;">
            <a href="${process.env.CLIENT_URL || "http://localhost:5173"}" 
               style="display:inline-block;padding:12px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
              Get Started
            </a>
          </td>
        </tr>
      </table>
    </div>
    <p style="font-size:13px;color:#64748b;margin:24px 0 0 0;">
      Start exploring, add friends, and practice languages together!
    </p>
  `;
  return wrapLayout(body);
}
