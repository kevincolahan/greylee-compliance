import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, company, phone, mode } = body;

    if (!name || !email || !company) {
      return NextResponse.json(
        { error: "Name, email, and company are required" },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const notificationEmail = process.env.LEAD_NOTIFICATION_EMAIL;

    if (!resendApiKey || !notificationEmail) {
      console.error("Missing RESEND_API_KEY or LEAD_NOTIFICATION_EMAIL");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const subjectPrefix =
      mode === "practice"
        ? `[Practice Lead] ${company} — HIPAA Readiness`
        : `[Federal Lead] ${company} — Compliance Dashboard`;

    const htmlBody = `
      <h2>${subjectPrefix}</h2>
      <table style="border-collapse:collapse;width:100%;max-width:500px;">
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Mode</td><td style="padding:8px;border-bottom:1px solid #eee;">${mode === "practice" ? "Healthcare Practice" : "Federal Subcontractor"}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(name)}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(email)}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Company</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(company)}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;">Phone</td><td style="padding:8px;">${escapeHtml(phone || "—")}</td></tr>
      </table>
    `;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "GreyLee Compliance <noreply@greyleegroup.com>",
        to: [notificationEmail],
        subject: subjectPrefix,
        html: htmlBody,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error("Resend error:", errText);
      return NextResponse.json(
        { error: "Failed to send notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Lead submission error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
