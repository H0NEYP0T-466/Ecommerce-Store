import { MessageCircle } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import './WhatsAppButton.css';

export default function WhatsAppButton() {
  const { settings } = useSettingsStore();

  if (!settings?.whatsapp_number) return null;

  const url = `https://wa.me/${settings.whatsapp_number.replace(/\+/g, '')}?text=Hi%2C%20I'm%20interested%20in%20your%20products!`;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="whatsapp-btn" aria-label="Chat on WhatsApp">
      <MessageCircle size={24} />
    </a>
  );
}
