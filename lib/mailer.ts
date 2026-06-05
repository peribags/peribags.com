import "server-only";

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { siteConfig } from "@/lib/site";

/**
 * SMTP mailer — used for enquiry notifications.
 *
 * Configure with env vars (works with Gmail app passwords or any SMTP host):
 *   SMTP_HOST   e.g. smtp.gmail.com
 *   SMTP_PORT   e.g. 465 (SSL) or 587 (STARTTLS)
 *   SMTP_USER   the mailbox that sends, e.g. peribags01@gmail.com
 *   SMTP_PASS   the app password
 *   MAIL_FROM   optional display from, defaults to SMTP_USER
 *   ADMIN_EMAIL optional comma-separated recipients, defaults to siteConfig.emails
 *
 * When SMTP is not configured, sending is silently skipped so enquiries are
 * never blocked by email problems.
 */

let cached: Transporter | null = null;

function getTransport(): Transporter | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  if (cached) return cached;
  const port = Number(process.env.SMTP_PORT ?? 465);
  cached = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return cached;
}

function fromAddress(): string {
  return (
    process.env.MAIL_FROM ??
    `${siteConfig.name} <${process.env.SMTP_USER ?? siteConfig.email}>`
  );
}

function adminRecipients(): string[] {
  const env = (process.env.ADMIN_EMAIL ?? "").trim();
  if (env) return env.split(",").map((e) => e.trim()).filter(Boolean);
  return [...siteConfig.emails];
}

const esc = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

type EnquiryEmailInput = {
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  message: string;
  productName?: string | null;
  sourceUrl?: string | null;
};

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 14px 6px 0;color:#71717a;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;vertical-align:top;white-space:nowrap;">${label}</td>
    <td style="padding:6px 0;color:#18181b;font-size:14px;">${value}</td>
  </tr>`;
}

function shell(body: string): string {
  return `<div style="background:#f4f4f5;padding:32px 16px;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
      <p style="margin:0 0 24px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#71717a;">${esc(siteConfig.name)}</p>
      ${body}
      <p style="margin:28px 0 0;border-top:1px solid #e4e4e7;padding-top:16px;font-size:12px;color:#a1a1aa;">
        ${esc(siteConfig.name)} · ${esc(siteConfig.address.full)}
      </p>
    </div>
  </div>`;
}

function adminHtml(e: EnquiryEmailInput): string {
  return shell(`
    <h1 style="margin:0;font-size:20px;font-weight:600;color:#18181b;">New enquiry${e.productName ? ` — ${esc(e.productName)}` : ""}</h1>
    <p style="margin:8px 0 20px;font-size:14px;color:#52525b;">A customer just sent an enquiry from the website.</p>
    <table style="border-collapse:collapse;">
      ${row("Name", esc(e.customerName))}
      ${e.customerEmail ? row("Email", `<a href="mailto:${esc(e.customerEmail)}" style="color:#18181b;">${esc(e.customerEmail)}</a>`) : ""}
      ${e.customerPhone ? row("Phone", esc(e.customerPhone)) : ""}
      ${e.productName ? row("Product", esc(e.productName)) : ""}
      ${e.sourceUrl ? row("Page", `<a href="${esc(e.sourceUrl)}" style="color:#18181b;">${esc(e.sourceUrl)}</a>`) : ""}
    </table>
    <p style="margin:20px 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#71717a;">Message</p>
    <p style="margin:0;font-size:14px;line-height:1.7;color:#18181b;white-space:pre-wrap;">${esc(e.message)}</p>
  `);
}

function customerHtml(e: EnquiryEmailInput): string {
  return shell(`
    <h1 style="margin:0;font-size:20px;font-weight:600;color:#18181b;">Thanks, ${esc(e.customerName)} — we've got your enquiry.</h1>
    <p style="margin:12px 0 0;font-size:14px;line-height:1.7;color:#52525b;">
      We've received your enquiry${e.productName ? ` about <strong style="color:#18181b;">${esc(e.productName)}</strong>` : ""} and will get back to you within one business day.
    </p>
    <p style="margin:20px 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#71717a;">Your message</p>
    <p style="margin:0;font-size:14px;line-height:1.7;color:#18181b;white-space:pre-wrap;">${esc(e.message)}</p>
    <p style="margin:24px 0 0;font-size:14px;line-height:1.7;color:#52525b;">
      Need us sooner? Call <a href="tel:+91${siteConfig.phone}" style="color:#18181b;">+91 ${siteConfig.phone}</a> or reply to this email.
    </p>
  `);
}

/**
 * Sends the admin notification + customer acknowledgment for an enquiry.
 * Never throws — email failure must not break enquiry submission.
 */
export async function sendEnquiryEmails(e: EnquiryEmailInput): Promise<void> {
  const transport = getTransport();
  if (!transport) return;

  const from = fromAddress();
  const subjectSuffix = e.productName ? ` — ${e.productName}` : "";

  const sends: Promise<unknown>[] = [
    transport.sendMail({
      from,
      to: adminRecipients().join(", "),
      replyTo: e.customerEmail ?? undefined,
      subject: `New enquiry${subjectSuffix} (${e.customerName})`,
      html: adminHtml(e),
    }),
  ];

  if (e.customerEmail) {
    sends.push(
      transport.sendMail({
        from,
        to: e.customerEmail,
        subject: `We've received your enquiry${subjectSuffix} · ${siteConfig.name}`,
        html: customerHtml(e),
      }),
    );
  }

  const results = await Promise.allSettled(sends);
  for (const r of results) {
    if (r.status === "rejected") {
      console.error("[mailer] enquiry email failed:", r.reason);
    }
  }
}
