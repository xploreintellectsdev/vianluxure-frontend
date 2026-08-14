"use client";

import { MessageCircle } from "lucide-react";

export default function FloatingWhatsApp() {
  return (
    <a 
      href="https://wa.me/yourphonenumber" 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 w-14 h-14 bg-[#395b46] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#2d4a36] hover:scale-105 transition-all z-50"
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle size={28} />
    </a>
  );
}