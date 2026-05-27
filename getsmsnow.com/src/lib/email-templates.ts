/**
 * Enterprise email templates: recipient email + code prominent.
 * If user closes the page, they can still find the code in the email.
 */
export function verificationCodeEmail(params: {
  code: string;
  recipientEmail: string;
  purpose: "register" | "login";
  validMinutes?: number;
}): { subject: string; html: string } {
  const { code, recipientEmail, purpose, validMinutes = 15 } = params;
  const purposeText = purpose === "register" ? "Verify your GetSMSNow account" : "Your GetSMSNow login code";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${purposeText}</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;">
  <div style="max-width:480px;margin:24px auto;padding:24px;background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <h1 style="margin:0 0 16px;font-size:20px;color:#111;">${purposeText}</h1>
    <p style="margin:0 0 20px;color:#555;font-size:14px;">
      This code was sent to: <strong style="color:#111;">${recipientEmail}</strong>
    </p>
    <p style="margin:0 0 12px;color:#555;font-size:14px;">Your verification code:</p>
    <div style="margin:0 0 20px;padding:16px 24px;background:#f0f4ff;border-radius:8px;border:1px solid #d0d9f7;">
      <span style="font-size:28px;font-weight:700;letter-spacing:0.2em;font-family:monospace;color:#1a1a1a;">${code}</span>
    </div>
    <p style="margin:0 0 20px;color:#666;font-size:13px;">Valid for ${validMinutes} minutes.</p>
    <p style="margin:0;color:#888;font-size:12px;">If you didn&apos;t request this, you can safely ignore this email.</p>
  </div>
</body>
</html>
`.trim();

  return {
    subject: purpose === "register" ? "Verify your GetSMSNow account" : "Your GetSMSNow login code",
    html,
  };
}
