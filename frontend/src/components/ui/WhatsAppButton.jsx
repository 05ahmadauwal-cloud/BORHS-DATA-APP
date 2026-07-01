import { useState } from 'react';
import { X, MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '2347065896598'; // change to real number
const WHATSAPP_MESSAGE = "Hello BORHS Data Support 👋 I need help with my account.";

export default function WhatsAppButton() {
  const [tooltip, setTooltip] = useState(false);

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <div className="fixed bottom-[4.75rem] lg:bottom-8 right-4 lg:right-6 z-50 flex flex-col items-end gap-2">

      {/* Tooltip bubble */}
      {tooltip && (
        <div className="flex items-start gap-2 animate-slide-up">
          <div
            className="relative bg-white text-gray-800 text-sm font-medium px-4 py-3 rounded-2xl rounded-br-sm shadow-2xl max-w-[200px] leading-snug"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}
          >
            <p className="font-bold text-[13px] text-gray-900 mb-0.5">BORHS Data Support</p>
            <p className="text-[12px] text-gray-500">We reply in minutes ⚡</p>
            {/* Tail */}
            <span className="absolute -bottom-2 right-4 w-0 h-0 border-l-8 border-l-transparent border-r-0 border-t-8 border-t-white" />
          </div>
          <button
            onClick={() => setTooltip(false)}
            className="mt-1 w-5 h-5 rounded-full bg-dark-700 text-dark-400 hover:bg-dark-600 flex items-center justify-center shrink-0"
          >
            <X size={10} />
          </button>
        </div>
      )}

      {/* Main button */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          boxShadow: '0 4px 24px rgba(37,211,102,0.45)',
        }}
        aria-label="Chat on WhatsApp"
      >
        {/* Ping animation */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />

        {/* WhatsApp SVG icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          className="w-7 h-7 fill-white drop-shadow"
        >
          <path d="M16 .5C7.44.5.5 7.44.5 16c0 2.83.74 5.56 2.14 7.96L.5 31.5l7.74-2.1A15.45 15.45 0 0 0 16 31.5C24.56 31.5 31.5 24.56 31.5 16S24.56.5 16 .5Zm0 28.4a13.8 13.8 0 0 1-7.04-1.93l-.5-.3-5.18 1.4 1.38-5.04-.33-.52A13.82 13.82 0 0 1 2.1 16C2.1 8.35 8.35 2.1 16 2.1S29.9 8.35 29.9 16 23.65 28.9 16 28.9Zm7.56-10.34c-.41-.21-2.44-1.2-2.82-1.34-.38-.13-.65-.2-.93.21-.27.4-1.07 1.34-1.31 1.62-.24.27-.48.3-.89.1-.41-.2-1.73-.64-3.3-2.03-1.22-1.09-2.04-2.43-2.28-2.84-.24-.4-.03-.62.18-.82.18-.18.41-.48.62-.72.2-.24.27-.41.41-.68.13-.27.07-.51-.03-.72-.1-.2-.93-2.24-1.27-3.07-.34-.8-.68-.69-.93-.7h-.79c-.27 0-.72.1-1.1.51-.38.41-1.44 1.41-1.44 3.43s1.48 3.98 1.68 4.25c.2.27 2.9 4.43 7.04 6.2.98.43 1.75.68 2.35.87.99.31 1.89.27 2.6.16.79-.12 2.44-1 2.79-1.96.34-.96.34-1.79.24-1.96-.1-.17-.37-.27-.78-.48Z" />
        </svg>
      </a>
    </div>
  );
}
