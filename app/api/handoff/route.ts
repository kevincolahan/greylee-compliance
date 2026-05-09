import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

interface HandoffPayload {
  practiceName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  responses: { questionId: string; answerIndex: number }[];
  submissionId: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: HandoffPayload = await req.json();

    const { practiceName, contactName, contactEmail, responses, submissionId } =
      body;

    // Validate required fields
    if (
      !practiceName ||
      !contactName ||
      !contactEmail ||
      !responses ||
      !submissionId
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json(
        { error: "Responses must be a non-empty array" },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.POAM_WEBHOOK_URL;
    const webhookSecret = process.env.POAM_WEBHOOK_SECRET;

    if (!webhookUrl || !webhookSecret) {
      console.error("Missing POAM_WEBHOOK_URL or POAM_WEBHOOK_SECRET");
      return NextResponse.json(
        {
          message:
            "Your request has been received. Our team will reach out within 1 business day to set up your account.",
        },
        { status: 200 }
      );
    }

    // Construct webhook payload
    const webhookPayload = {
      submissionId,
      practice: {
        name: practiceName,
        contactName,
        contactEmail,
        contactPhone: body.contactPhone || undefined,
      },
      assessment: {
        mode: "practice",
        completedAt: new Date().toISOString(),
        responses: responses.map((r) => ({
          questionId: r.questionId,
          answerIndex: r.answerIndex,
        })),
      },
    };

    const rawBody = JSON.stringify(webhookPayload);

    // Sign with HMAC-SHA256
    const signature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    // POST to POA&M Manager
    const webhookRes = await fetch(
      `${webhookUrl}/api/webhooks/compliance-handoff`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Compliance-Signature": `sha256=${signature}`,
          "X-Submission-Id": submissionId,
        },
        body: rawBody,
      }
    );

    if (webhookRes.ok) {
      const data = await webhookRes.json().catch(() => ({}));

      if (data.status === "created") {
        const redirectUrl = `https://auth.ontract.io/signup?email=${encodeURIComponent(contactEmail)}&continue=${encodeURIComponent("https://poam-manager.vercel.app/")}`;
        return NextResponse.json({
          ok: true,
          redirectUrl,
          orgId: data.orgId,
        });
      }
    }

    // Non-200 or unexpected response — friendly fallback
    console.error(
      "Webhook non-success:",
      webhookRes.status,
      await webhookRes.text().catch(() => "")
    );

    return NextResponse.json({
      ok: true,
      message:
        "We couldn't create your account automatically. Our team will reach out within 1 business day to get you set up.",
    });
  } catch (err) {
    console.error("Handoff error:", err);
    return NextResponse.json(
      {
        message:
          "Something went wrong. Our team will follow up within 1 business day.",
      },
      { status: 500 }
    );
  }
}
