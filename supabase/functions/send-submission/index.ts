import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { corsFor } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));


interface SubmissionRequest {
  fullName: string;
  email: string;
  instagram?: string;
  institution?: string;
  workType: string;
  title: string;
  description: string;
  fileLink: string;
}

// HTML-entity encode user-supplied text to prevent HTML injection in emails
const esc = (s: unknown): string =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Only allow http(s) URLs; otherwise return empty string
const safeUrl = (u: unknown): string => {
  const s = String(u ?? "").trim();
  if (/^https?:\/\//i.test(s)) return s;
  return "";
};

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = corsFor(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const submission: SubmissionRequest = await req.json();

    console.log("Received submission from:", submission.email);

    const fileUrl = safeUrl(submission.fileLink);

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e293b; border-bottom: 2px solid #d4a574; padding-bottom: 10px;">
          New Submission to Inkspire HQ
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">Submission Details</h3>
          
          <p><strong>Full Name:</strong> ${esc(submission.fullName)}</p>
          <p><strong>Email:</strong> ${esc(submission.email)}</p>
          ${submission.instagram ? `<p><strong>Instagram:</strong> ${esc(submission.instagram)}</p>` : ''}
          ${submission.institution ? `<p><strong>Institution:</strong> ${esc(submission.institution)}</p>` : ''}
          <p><strong>Work Type:</strong> ${esc(submission.workType)}</p>
          <p><strong>Title:</strong> ${esc(submission.title)}</p>
        </div>
        
        <div style="background-color: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">Description/Abstract</h3>
          <p style="white-space: pre-wrap;">${esc(submission.description)}</p>
        </div>
        
        <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px;">
          <p><strong>File Link:</strong></p>
          ${fileUrl
            ? `<a href="${esc(fileUrl)}" style="color: #1e40af; word-break: break-all;">${esc(fileUrl)}</a>`
            : `<span style="color: #64748b;">${esc(submission.fileLink)} (invalid or missing URL)</span>`}
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;" />
        
        <p style="color: #64748b; font-size: 14px; text-align: center;">
          ✨ Inspiring Minds Through Ink & Ideas<br>
          Inkspire HQ
        </p>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Inkspire HQ <onboarding@resend.dev>",
      to: ["inkspire528@gmail.com"],
      subject: `New Submission: ${submission.title} - ${submission.fullName}`.slice(0, 200),
      html: emailHtml,
    });

    console.log("Email sent successfully");

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-submission function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
