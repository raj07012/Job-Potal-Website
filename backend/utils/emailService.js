const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const STATUS_INFO = {
  shortlisted: {
    label: 'Shortlisted ⭐',
    color: '#8b5cf6',
    bgColor: '#8b5cf622',
    borderColor: '#8b5cf644',
    message: 'Great news! You have been shortlisted for this position. The recruiter will be in touch with you soon regarding the next steps.',
    emoji: '🎯',
  },
  hired: {
    label: 'Selected / Hired 🎉',
    color: '#10b981',
    bgColor: '#10b98122',
    borderColor: '#10b98144',
    message: 'Congratulations! You have been selected for this position. Please reply to this email or contact the recruiter directly for further details.',
    emoji: '🎊',
  },
};

const sendAcceptanceEmail = async ({
  applicantEmail,
  applicantName,
  jobTitle,
  company,
  newStatus,
  recruiterName,
  recruiterEmail,
}) => {
  const info = STATUS_INFO[newStatus];
  if (!info) return { skipped: true, reason: `No email for status: ${newStatus}` };

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Application Update</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0f17;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f17;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#1a1a2e;border-radius:16px;overflow:hidden;border:1px solid #2a2a45;">
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:32px;text-align:center;">
              <p style="margin:0;font-size:28px;">💼</p>
              <h1 style="color:#ffffff;margin:8px 0 4px;font-size:22px;letter-spacing:-0.5px;">JobPortal</h1>
              <p style="color:rgba(255,255,255,0.75);margin:0;font-size:13px;">Application Status Update</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="color:#e2e8f0;font-size:16px;margin:0 0 6px;">Hi <strong>${applicantName}</strong>,</p>
              <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;line-height:1.7;">
                Your application for <strong style="color:#e2e8f0;">${jobTitle}</strong> at 
                <strong style="color:#e2e8f0;">${company}</strong> has been updated.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f17;border-radius:12px;margin-bottom:24px;border:1px solid #2a2a45;">
                <tr>
                  <td style="padding:20px;text-align:center;">
                    <p style="color:#64748b;font-size:11px;margin:0 0 10px;text-transform:uppercase;letter-spacing:1.5px;">New Status</p>
                    <span style="display:inline-block;background:${info.bgColor};color:${info.color};border:1px solid ${info.borderColor};padding:10px 28px;border-radius:999px;font-weight:700;font-size:17px;">
                      ${info.label}
                    </span>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:${info.bgColor};border-radius:10px;border-left:4px solid ${info.color};margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="color:#e2e8f0;font-size:14px;margin:0;line-height:1.7;">${info.emoji} ${info.message}</p>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f17;border-radius:10px;border:1px solid #2a2a45;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="color:#64748b;font-size:11px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Recruiter Details</p>
                    <p style="color:#e2e8f0;font-size:14px;margin:0 0 4px;font-weight:600;">${recruiterName}</p>
                    <p style="color:#6366f1;font-size:13px;margin:0;">${recruiterEmail}</p>
                  </td>
                </tr>
              </table>
              <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0;">
                💡 <strong style="color:#e2e8f0;">Tip:</strong> Simply reply to this email — your reply will go directly to <strong style="color:#6366f1;">${recruiterEmail}</strong>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 28px;text-align:center;border-top:1px solid #2a2a45;">
              <p style="color:#475569;font-size:12px;margin:0;">
                Sent via <strong style="color:#6366f1;">JobPortal</strong> on behalf of ${recruiterName} (${company}).
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'JobPortal <onboarding@resend.dev>',
      to: applicantEmail,
      reply_to: recruiterEmail,
      subject: `${info.emoji} Application Update: ${info.label} — ${jobTitle} at ${company}`,
      html,
    });
    console.log(`✅ Email sent to ${applicantEmail} | Status: ${newStatus} | ID: ${result.data?.id}`);
    return { success: true, id: result.data?.id };
  } catch (err) {
    console.error('❌ Email send error:', err.message);
    return { success: false, error: err.message };
  }
};

// Interview Schedule Email
const sendInterviewEmail = async ({
  applicantEmail,
  applicantName,
  jobTitle,
  company,
  recruiterName,
  recruiterEmail,
  interviewDate,
  interviewTime,
  interviewLink,
  interviewNote,
}) => {
  const formattedDate = new Date(interviewDate).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Interview Scheduled</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0f17;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f17;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#1a1a2e;border-radius:16px;overflow:hidden;border:1px solid #2a2a45;">
          <tr>
            <td style="background:linear-gradient(135deg,#0ea5e9 0%,#6366f1 100%);padding:32px;text-align:center;">
              <p style="margin:0;font-size:36px;">📅</p>
              <h1 style="color:#ffffff;margin:8px 0 4px;font-size:22px;letter-spacing:-0.5px;">Interview Scheduled!</h1>
              <p style="color:rgba(255,255,255,0.75);margin:0;font-size:13px;">JobPortal — Interview Notification</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="color:#e2e8f0;font-size:16px;margin:0 0 6px;">Hi <strong>${applicantName}</strong>,</p>
              <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;line-height:1.7;">
                Your interview has been scheduled for <strong style="color:#e2e8f0;">${jobTitle}</strong> at 
                <strong style="color:#e2e8f0;">${company}</strong>. Please check the details below.
              </p>

              <!-- Interview Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f17;border-radius:12px;margin-bottom:24px;border:1px solid #0ea5e944;">
                <tr>
                  <td style="padding:24px;">
                    <p style="color:#0ea5e9;font-size:11px;margin:0 0 16px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">Interview Details</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #2a2a45;">
                          <span style="color:#64748b;font-size:13px;">📅 Date</span>
                          <span style="color:#e2e8f0;font-size:14px;font-weight:600;float:right;">${formattedDate}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #2a2a45;">
                          <span style="color:#64748b;font-size:13px;">🕐 Time</span>
                          <span style="color:#e2e8f0;font-size:14px;font-weight:600;float:right;">${interviewTime || 'To be confirmed'}</span>
                        </td>
                      </tr>
                      ${interviewLink ? `
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #2a2a45;">
                          <span style="color:#64748b;font-size:13px;">🔗 Meeting Link</span>
                          <a href="${interviewLink}" style="color:#6366f1;font-size:13px;font-weight:600;float:right;text-decoration:none;">Join Meeting →</a>
                        </td>
                      </tr>` : ''}
                    </table>
                    ${interviewNote ? `
                    <div style="margin-top:16px;padding:12px;background:#1a1a2e;border-radius:8px;border-left:3px solid #0ea5e9;">
                      <p style="color:#64748b;font-size:11px;margin:0 0 6px;text-transform:uppercase;letter-spacing:1px;">Note from Recruiter</p>
                      <p style="color:#e2e8f0;font-size:13px;margin:0;line-height:1.6;">${interviewNote}</p>
                    </div>` : ''}
                  </td>
                </tr>
              </table>

              <!-- Recruiter Info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f17;border-radius:10px;border:1px solid #2a2a45;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="color:#64748b;font-size:11px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Your Recruiter</p>
                    <p style="color:#e2e8f0;font-size:14px;margin:0 0 4px;font-weight:600;">${recruiterName}</p>
                    <p style="color:#6366f1;font-size:13px;margin:0;">${recruiterEmail}</p>
                  </td>
                </tr>
              </table>

              <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0;">
                💡 Reply to this email to contact your recruiter directly at <strong style="color:#6366f1;">${recruiterEmail}</strong>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 28px;text-align:center;border-top:1px solid #2a2a45;">
              <p style="color:#475569;font-size:12px;margin:0;">
                Sent via <strong style="color:#6366f1;">JobPortal</strong> on behalf of ${recruiterName} (${company}).
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'JobPortal <onboarding@resend.dev>',
      to: applicantEmail,
      reply_to: recruiterEmail,
      subject: `📅 Interview Scheduled — ${jobTitle} at ${company} | ${formattedDate}`,
      html,
    });
    console.log(`✅ Interview email sent to ${applicantEmail} | ID: ${result.data?.id}`);
    return { success: true, id: result.data?.id };
  } catch (err) {
    console.error('❌ Interview email error:', err.message);
    return { success: false, error: err.message };
  }
};

module.exports = { sendAcceptanceEmail, sendInterviewEmail };

