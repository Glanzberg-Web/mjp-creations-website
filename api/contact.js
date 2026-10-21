"use strict";

/**
 * Vercel serverless handler for the MJP Creations inquiry form.
 * Configure client-owned Resend credentials in hosting environment variables.
 * No private credentials should ever be committed or included in browser code.
 */
const SERVICES = new Set([
  "Branded products & merchandise",
  "Creative marketing & social media",
  "Graphic design & branding",
  "Strategic solutions",
  "A little bit of everything"
]);

function clean(value, max = 5000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
function escapeHtml(value) {
  return value.replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[c]);
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({error:"Method not allowed."});
  }
  const length = Number(req.headers["content-length"] || 0);
  if (length > 20000) return res.status(413).json({error:"Your message is too long."});

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Invalid input");
  } catch {
    return res.status(400).json({error:"Invalid form submission."});
  }

  // Honeypot: quietly accept bot submissions without sending an email.
  if (clean(body.website, 200)) return res.status(200).json({ok:true});
  const name = clean(body.name, 120);
  const email = clean(body.email, 254);
  const company = clean(body.company, 120);
  const phone = clean(body.phone, 50);
  const service = clean(body.service, 100);
  const message = clean(body.message, 5000);
  if (!name || !email || !message || !SERVICES.has(service)
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      || name.length < 2) {
    return res.status(400).json({error:"Please complete all required fields with valid information."});
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.MJP_CONTACT_TO;
  const from = process.env.MJP_CONTACT_FROM;
  if (!apiKey || !to || !from) {
    console.error("Contact form is missing required Resend environment variables.");
    return res.status(503).json({error:"The contact form is temporarily unavailable. Please try again later."});
  }

  const rows = [
    ["Name",name],
    ["Email",email],
    ["Company",company || "Not provided"],
    ["Phone",phone || "Not provided"],
    ["Interested in",service],
    ["Message",message]
  ];
  const html = '<h2>New inquiry from mjpcreations.com</h2>' + rows.map(([label,value]) =>
    '<p><strong>' + escapeHtml(label) + ':</strong><br>' +
    escapeHtml(value).replace(/\n/g,"<br>") + '</p>'
  ).join("");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method:"POST",
      headers:{"Authorization": "Bearer " + apiKey,"Content-Type":"application/json"},
      body:JSON.stringify({
        from,
        to:[to],
        reply_to:email,
        subject:"MJP Creations inquiry: " + service,
        html,
        text:rows.map(([label,value]) => label + ":\n" + value).join("\n\n")
      })
    });
    if (!response.ok) {
      console.error("Resend failed to accept the message:", response.status);
      return res.status(502).json({error:"We couldn't deliver your message just now. Please try again later."});
    }
    return res.status(200).json({ok:true});
  } catch (error) {
    console.error("Resend delivery error:", error instanceof Error ? error.message : "unknown error");
    return res.status(502).json({error:"We couldn't deliver your message just now. Please try again later."});
  }
};