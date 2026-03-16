import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string, name: string) {
  await resend.emails.send({
    from: "InterviewPrep AI <noreply@yourdomain.com>",
    to: email,
    subject: "Welcome to InterviewPrep AI 🎯",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#0f172a;color:#e2e8f0;border-radius:12px;">
        <h1 style="color:#a78bfa;margin-bottom:8px;">Welcome, ${name || "there"}!</h1>
        <p style="color:#94a3b8;">You're all set to start practising interviews with AI.</p>
        <p style="color:#94a3b8;">Here's how it works:</p>
        <ol style="color:#94a3b8;line-height:1.8;">
          <li>Paste any job description</li>
          <li>Get 5 tailored interview questions</li>
          <li>Answer them and receive expert AI feedback</li>
        </ol>
        <a href="${process.env.NEXTAUTH_URL}/dashboard"
           style="display:inline-block;margin-top:24px;background:#7c3aed;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
          Start Practising →
        </a>
        <p style="margin-top:32px;font-size:12px;color:#475569;">
          Your free plan includes 3 sessions. Upgrade to Pro for unlimited access.
        </p>
      </div>
    `,
  });
}

export async function sendReportEmail(
  email: string,
  name: string,
  jobTitle: string,
  avgScore: number,
  reportUrl: string
) {
  const scoreColor = avgScore >= 7 ? "#4ade80" : avgScore >= 5 ? "#fbbf24" : "#f87171";

  await resend.emails.send({
    from: "InterviewPrep AI <noreply@yourdomain.com>",
    to: email,
    subject: `Your interview report: ${jobTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#0f172a;color:#e2e8f0;border-radius:12px;">
        <h1 style="color:#a78bfa;margin-bottom:8px;">Interview Report Ready</h1>
        <p style="color:#94a3b8;">Here's how you did for: <strong style="color:#e2e8f0;">${jobTitle}</strong></p>
        <div style="text-align:center;margin:32px 0;">
          <span style="font-size:64px;font-weight:900;color:${scoreColor};">${avgScore}</span>
          <span style="font-size:24px;color:#475569;">/10</span>
          <p style="color:#94a3b8;margin-top:8px;">Average score</p>
        </div>
        <a href="${reportUrl}"
           style="display:inline-block;background:#7c3aed;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
          View Full Report →
        </a>
      </div>
    `,
  });
}
