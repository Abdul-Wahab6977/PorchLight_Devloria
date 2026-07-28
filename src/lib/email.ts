// -----------------------------------------------------------------------------
// Notification service for agent inquiry alerts.
//
// This sandbox has no outbound SMTP access, so the default transport logs a
// formatted notification to the server console (and it's always recorded as
// an in-app message on the Inquiry row regardless of transport). To send real
// email in production, drop a RESEND_API_KEY into .env and swap the body of
// `sendMail` for the commented Resend call below — nothing else in the app
// needs to change, since every caller goes through `notifyAgentOfInquiry`.
// -----------------------------------------------------------------------------

interface MailPayload {
  to: string;
  subject: string;
  text: string;
}

async function sendMail({ to, subject, text }: MailPayload) {
  if (process.env.RESEND_API_KEY) {
    // import { Resend } from "resend";
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({ from: "Porchlight <notify@yourdomain.com>", to, subject, text });
  }

  // Dev/demo transport — visible in the server logs.
  console.log(
    `\n📬  [email] to: ${to}\n    subject: ${subject}\n    ${text.replace(/\n/g, "\n    ")}\n`
  );
}

export async function notifyAgentOfInquiry(opts: {
  agentEmail: string;
  agentName: string;
  propertyTitle: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string | null;
  message: string;
  propertyUrl: string;
}) {
  await sendMail({
    to: opts.agentEmail,
    subject: `New inquiry: ${opts.propertyTitle}`,
    text: [
      `Hi ${opts.agentName},`,
      ``,
      `${opts.buyerName} (${opts.buyerEmail}${opts.buyerPhone ? `, ${opts.buyerPhone}` : ""}) sent a new inquiry about "${opts.propertyTitle}".`,
      ``,
      `"${opts.message}"`,
      ``,
      `View it in your dashboard: ${opts.propertyUrl}`,
    ].join("\n"),
  });
}
