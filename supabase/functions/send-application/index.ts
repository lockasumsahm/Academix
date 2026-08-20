import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { corsFor } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));


interface ApplicationRequest {
  fullName: string;
  email: string;
  university: string;
  major: string;
  role: string;
  experience: string;
  portfolio?: string;
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
    const application: ApplicationRequest = await req.json();

    console.log("Received application from:", application.email);

    const portfolioUrl = application.portfolio ? safeUrl(application.portfolio) : "";

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e293b; border-bottom: 2px solid #d4a574; padding-bottom: 10px;">
          New Team Application - Inkspire HQ
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">Applicant Details</h3>
          
          <p><strong>Full Name:</strong> ${esc(application.fullName)}</p>
          <p><strong>Email:</strong> ${esc(application.email)}</p>
          <p><strong>University:</strong> ${esc(application.university)}</p>
          <p><strong>Major:</strong> ${esc(application.major)}</p>
          <p><strong>Role Interest:</strong> ${esc(application.role)}</p>
          ${portfolioUrl ? `<p><strong>Portfolio/Links:</strong> <a href="${esc(portfolioUrl)}">${esc(portfolioUrl)}</a></p>` : ''}
        </div>
        
        <div style="background-color: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">Skills & Experience</h3>
          <p style="white-space: pre-wrap;">${esc(application.experience)}</p>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;" />
        
        <p style="color: #64748b; font-size: 14px; text-align: center;">
          ✨ Inspiring Minds Through Ink & Ideas<br>
          Inkspire HQ Team Applications
        </p>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Inkspire HQ <onboarding@resend.dev>",
      to: ["inkspire528@gmail.com"],
      subject: `New Team Application: ${application.role} - ${application.fullName}`.slice(0, 200),
      html: emailHtml,
    });

    console.log("Application email sent successfully");

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-application function:", error);
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
