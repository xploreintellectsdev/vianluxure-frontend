"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import CorporateOrderModal from "./CorporateOrderModal";

// Custom SVG Icons
const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16H20L8.267 4z"/><path d="M4 20l6.768-6.768m2.46-2.46L20 4"/></svg>
);

const YoutubeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 2-2 68.4 68.4 0 0 1 15 0 2 2 0 0 1 2 2 24.12 24.12 0 0 1 0 10 2 2 0 0 1-2 2 68.4 68.4 0 0 1-15 0 2 2 0 0 1-2-2Z"/><path d="m10 15 5-3-5-3z"/></svg>
);

import { menuItemApi } from "@/api/menuItem.api";
import { Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  const [isCorporateModalOpen, setIsCorporateModalOpen] = useState(false);
  const [footerItems, setFooterItems] = useState({
    Links: [],
    Policy: [],
    Contacts: [],
    Social: []
  });

  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const res = await menuItemApi.getMenuItems({ location: 'footer', activeOnly: true });
        if (res?.data) {
          const grouped = { Description: [], Links: [], Policy: [], Contacts: [], Social: [] };
          res.data.forEach(item => {
            if (grouped[item.group_name] !== undefined) {
              grouped[item.group_name].push(item);
            }
          });
          setFooterItems(grouped);
        }
      } catch (err) {
        console.error("Failed to load footer links", err);
      }
    };
    fetchFooter();
  }, []);

  const formatLink = (link) => {
    if (!link) return '#';
    if (link.startsWith('http') || link.startsWith('/') || link.startsWith('mailto:') || link.startsWith('tel:')) return link;
    return `/${link}`;
  };

  return (
    <footer className="w-full bg-[#FAFAF8] pt-8 pb-6 md:pt-10 border-t border-gray-100">
      <div className="mx-auto w-[92%] max-w-[112.5rem]">

        {/* TOP SECTION */}
        <div className="grid grid-cols-2 lg:grid-cols-[1.6fr_0.8fr_1fr_1.2fr] gap-x-6 gap-y-8 md:gap-10 mb-6 md:mb-8">

          {/* Column 1: Logo & Info */}
          <div className="col-span-2 lg:col-span-1 flex flex-col gap-4">
            <Link href="/" className="self-start inline-block">
              <img
                src="/images/logo/vl_logo.png"
                alt="Vian Luxure"
                width={220}
                height={120}
                className="h-[5rem] sm:h-[6rem] md:h-[7rem] w-auto object-contain filter drop-shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.25)] transition-transform hover:scale-102"
              />
            </Link>
            {footerItems.Description && footerItems.Description.length > 0 ? (
              <p className="text-gray-500 text-base leading-relaxed max-w-[20rem] whitespace-pre-line">
                {footerItems.Description[0].label}
              </p>
            ) : null}

            {/* Social Icons */}
            <div className="flex gap-3 mt-2">
              {(footerItems.Social || []).map((social, i) => {
                let IconComponent = null;
                if (social.icon === 'FacebookIcon') IconComponent = <FacebookIcon />;
                else if (social.icon === 'InstagramIcon') IconComponent = <InstagramIcon />;
                else if (social.icon === 'XIcon') IconComponent = <XIcon />;
                else if (social.icon === 'YoutubeIcon') IconComponent = <YoutubeIcon />;

                return (
                  <Link
                    key={i}
                    href={social.link || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[2.5rem] h-[2.5rem] border border-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:text-[#C8A64D] hover:border-[#C8A64D] transition-all"
                  >
                    {IconComponent}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Column 2: Links */}
          <div className="col-span-1 flex flex-col gap-3 md:gap-4">
            <h3 className="font-bold text-gray-900 text-[1.125rem] md:text-[1.25rem]">Links</h3>
            <ul className="flex flex-col gap-2.5 md:gap-3">
              {(footerItems.Links || []).map((item, i) => (
                <li key={i}>
                  <Link href={formatLink(item.link)} className="text-gray-500 hover:text-gray-900 transition-colors text-[0.9375rem] md:text-[1rem] font-medium">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => setIsCorporateModalOpen(true)}
                  className="text-gray-500 hover:text-gray-900 transition-colors text-[0.9375rem] md:text-[1rem] font-medium text-left cursor-pointer"
                >
                  Corporate Order
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Policy */}
          <div className="col-span-1 flex flex-col gap-3 md:gap-4">
            <h3 className="font-bold text-gray-900 text-[1.125rem] md:text-[1.25rem]">Policy</h3>
            <ul className="flex flex-col gap-2.5 md:gap-3">
              {(footerItems.Policy || []).map((item, i) => (
                <li key={i}>
                  <Link href={formatLink(item.link)} className="text-gray-500 hover:text-gray-900 transition-colors text-[0.9375rem] md:text-[1rem] font-medium">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contacts */}
          <div className="col-span-2 lg:col-span-1 flex flex-col gap-3 md:gap-4">
            <h3 className="font-bold text-gray-900 text-[1.125rem] md:text-[1.25rem]">Contacts</h3>
            <div className="flex flex-col gap-2.5 md:gap-3 text-[0.9375rem] md:text-base text-gray-500 leading-relaxed">
              {(footerItems.Contacts || []).map((contact, i) => {
                if (contact.item_type === 'phone') {
                  return (
                    <a key={i} href={contact.link || `tel:${contact.label}`} className="hover:text-gray-900 cursor-pointer font-medium flex items-center gap-2">
                      <Phone size={16} /> {contact.label}
                    </a>
                  );
                } else if (contact.item_type === 'email') {
                  return (
                    <a key={i} href={contact.link || `mailto:${contact.label}`} className="hover:text-gray-900 cursor-pointer font-medium break-all flex items-center gap-2">
                      <Mail size={16} /> {contact.label}
                    </a>
                  );
                } else if (contact.item_type === 'text') {
                  return (
                    <div key={i} className="flex items-start gap-2">
                      <MapPin size={16} className="mt-1 shrink-0" />
                      <p className="whitespace-pre-line leading-relaxed">{contact.label}</p>
                    </div>
                  );
                } else {
                  return (
                    <p key={i} className="whitespace-pre-line leading-relaxed">{contact.label}</p>
                  );
                }
              })}
            </div>
          </div>

        </div>

        {/* BOTTOM SECTION */}
        <div className="pt-4 border-t border-gray-200 text-center">
          <p className="text-gray-400 text-sm md:text-base tracking-wide font-medium">
            © 2026 | All Rights Reserved by Vian Luxure. Designed by Xplore Intellects
          </p>
        </div>

      </div>

      <CorporateOrderModal 
        isOpen={isCorporateModalOpen} 
        onClose={() => setIsCorporateModalOpen(false)} 
      />
    </footer>
  );
};

export default Footer;