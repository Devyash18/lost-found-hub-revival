import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  userName: string;
  userEmail: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userName, userEmail, message }: ContactRequest = await req.json();
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Lost & Found Hub <onboarding@resend.dev>",
        to: ["y6120867@gmail.com"],
        subject: `Contact Form from ${userName}`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #7c3aed;">New Contact Form Submission</h1>
          <div style="margin: 20px 0; padding: 15px; background-color: #f9fafb; border-left: 4px solid #7c3aed;">
            <p><strong>Name:</strong> ${userName}</p>
            <p><strong>Email:</strong> <a href="mailto:${userEmail}">${userEmail}</a></p>
          </div>
          <div style="margin: 20px 0; padding: 15px; background-color: #f9fafb; border-left: 4px solid #10b981;">
            <h2>Message</h2>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        </div>`,
      }),
    });

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Lost & Found Hub <onboarding@resend.dev>",
        to: [userEmail],
        subject: "We received your message!",
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed;">Thank you, ${userName}!</h1>
          <p>We have received your message and will get back to you soon.</p>
          <div style="background-color: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 8px;">
            <p><strong>Your message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        </div>`,
      }),
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
