import { whatsappHref } from "@/lib/site";
import { WhatsAppIcon } from "@/components/storefront/social-links";

/**
 * Floating "Chat with us" WhatsApp button, fixed to the bottom-right on every
 * storefront page.
 */
export function WhatsAppButton() {
  return (
    <a
      href={whatsappHref("Hi Peri Bags! I'd like to know more about your bags.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-[0_12px_30px_-8px_rgba(37,211,102,0.6)] transition-transform duration-200 hover:scale-[1.03] sm:bottom-6 sm:right-6"
    >
      <WhatsAppIcon className="size-6" />
      <span className="hidden text-sm font-medium tracking-tight sm:inline">
        Chat with us
      </span>
    </a>
  );
}
