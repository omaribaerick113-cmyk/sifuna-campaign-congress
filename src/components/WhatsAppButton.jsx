import { MessageCircle } from 'lucide-react';
import { buildWhatsAppUrl, whatsappUrlFor } from '../services/whatsappService.js';

/**
 * A link that opens WhatsApp with a prefilled message.
 *  - messageKey: a key from whatsappMessages (e.g. "home", "volunteer")
 *  - message:    custom text (overrides messageKey)
 * Note: the visitor still has to press Send inside WhatsApp.
 */
export default function WhatsAppButton({ messageKey = 'contact', message, children, variant = 'whatsapp', className = '', icon = true, ...rest }) {
  const href = message ? buildWhatsAppUrl(message) : whatsappUrlFor(messageKey);
  return (
    <a className={`btn btn-${variant} ${className}`} href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {icon && <MessageCircle size={18} aria-hidden="true" />}
      <span>{children || 'Chat on WhatsApp'}</span>
    </a>
  );
}
