// src/components/contactus/contactForm.jsx
'use client';

import React, { useState } from 'react';
import { Phone, MapPin, Mail, ArrowUpRight, Loader2 } from 'lucide-react';

const InstagramIcon = ({ size = 22, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const YoutubeIcon = ({ size = 22, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);
import showToast from '@/sharables/toast';
import { contactApi } from '@/api/contact.api';

const iconMap = {
  'phone': Phone,
  'map-pin': MapPin,
  'mail': Mail,
  'instagram': InstagramIcon,
  'youtube': YoutubeIcon
};

const ContactForm = ({ infoItems = [], hero = null }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    whatsapp_number: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  // Group items by type
  const cards = infoItems.filter(item => item.item_type === 'card');
  const mapItem = infoItems.find(item => item.item_type === 'map');

  // Fallback for empty state (if user hasn't added cards yet)
  const displayCards = cards.length > 0 ? cards : [
    { icon_key: 'phone', label: "Whatsapp Number", value: "+91 99449 44255", link_url: "https://wa.me/919944944255" },
    { icon_key: 'map-pin', label: "Address", value: "V L Group, 36/11, CHB Colony Street No-04, Tiruchengode, Namakkal-637211,Tamil Nadu.", link_url: "https://maps.google.com/maps?q=VL%20Group%2C%2036%2F11%2C%20CHB%20Colony%20Street%2C%20Velur%20Road%2C%20Mahadhavapuram%2C%20Thiruchengode%2C%20Tamil%20Nadu%20637211&t=&z=15&ie=UTF8&iwloc=&output=embed" },
    { icon_key: 'mail', label: "Email ID", value: "support@vianluxure.com", link_url: "mailto:support@vianluxure.com" }
  ];

  let mapUrl = mapItem?.value || "https://maps.google.com/maps?q=VL%20Group%2C%2036%2F11%2C%20CHB%20Colony%20Street%2C%20Velur%20Road%2C%20Mahadhavapuram%2C%20Thiruchengode%2C%20Tamil%20Nadu%20637211&t=&z=15&ie=UTF8&iwloc=&output=embed";

  // Automatically extract URL if user accidentally pasted the whole <iframe src="..."> HTML
  if (mapUrl.includes('<iframe') && mapUrl.includes('src="')) {
    const srcMatch = mapUrl.match(/src="([^"]+)"/);
    if (srcMatch && srcMatch[1]) {
      mapUrl = srcMatch[1];
    }
  }

  const formEyebrow = hero && hero.is_active === 1 && hero.eyebrow_label ? hero.eyebrow_label : "Contact Us";
  const rawFormTitle = hero && hero.is_active === 1 && hero.form_title ? hero.form_title : "Let's \nConnect";

  // Convert newlines to <br/> tags
  const formTitleElements = rawFormTitle.split('\n').map((line, i, arr) => (
    <React.Fragment key={i}>
      {line}
      {i < arr.length - 1 && <br />}
    </React.Fragment>
  ));

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name) {
      showToast.error('Full name is required');
      return;
    }

    setLoading(true);
    try {
      await contactApi.submitForm(formData);
      showToast.success('Message sent successfully!');
      setFormData({ full_name: '', whatsapp_number: '', email: '', message: '' });
    } catch (err) {
      console.error(err);
      showToast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="pt-10 pb-10 px-4 md:px-6 lg:px-8 max-w-[87.5rem] mx-auto">
      <div className="grid md:grid-cols-2 gap-10 items-start">

        {/* Left Side: Contact Info */}
        <div>
          <p className="text-gray-500 uppercase tracking-widest text-sm mb-1">{formEyebrow}</p>
          <h2 className="text-5xl font-bold text-gray-900 mb-8 max-w-xs leading-tight whitespace-pre-line">{formTitleElements}</h2>

          <div className="space-y-4">
            {displayCards.map((item, idx) => {
              const IconComp = iconMap[item.icon_key] || MapPin;

              const Wrapper = item.link_url ? 'a' : 'div';
              const wrapperProps = item.link_url ? { href: item.link_url, target: '_blank', rel: 'noopener noreferrer' } : {};

              return (
                <Wrapper
                  key={idx}
                  {...wrapperProps}
                  className="block border border-gray-300 rounded-2xl p-5 hover:border-gray-500 transition-colors cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <IconComp size={22} className="text-gray-600" />
                      <h3 className="font-semibold text-gray-900">{item.label}</h3>
                    </div>
                    <ArrowUpRight size={18} className="text-gray-400 group-hover:text-black transition-colors" />
                  </div>
                  <p className="text-gray-600 whitespace-pre-line">{item.value}</p>
                </Wrapper>
              );
            })}
          </div>
        </div>

        {/* Right Side: Form */}
        <div
          className="p-6 md:p-8 rounded-3xl shadow-lg border border-amber-200"
          style={{
            backgroundColor: '#f0cf72',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cg fill='none' stroke='%23000000' stroke-opacity='0.05' stroke-width='2'%3E%3Cpath d='M-50 20 Q 50 60 150 20 T 350 20'/%3E%3Cpath d='M-50 60 Q 50 100 150 60 T 350 60'/%3E%3Cpath d='M-50 100 Q 50 140 150 100 T 350 100'/%3E%3Cpath d='M-50 140 Q 50 180 150 140 T 350 140'/%3E%3Cpath d='M-50 180 Q 50 220 150 180 T 350 180'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                className="w-full p-3.5 rounded-full bg-white border border-transparent focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Whatsapp Number</label>
              <input
                type="tel"
                name="whatsapp_number"
                value={formData.whatsapp_number}
                onChange={handleChange}
                placeholder="Enter your Whatsapp number"
                className="w-full p-3.5 rounded-full bg-white border border-transparent focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Email id</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email id"
                className="w-full p-3.5 rounded-full bg-white border border-transparent focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                placeholder="Write your message"
                className="w-full p-3.5 rounded-2xl bg-white border border-transparent focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-gray-400"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-yellow-500 font-bold py-3.5 rounded-xl hover:bg-gray-900 transition-colors flex justify-center items-center gap-2 disabled:opacity-75"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : "Submit"}
            </button>
          </form>
        </div>

      </div>

      {/* Map Section */}
      <div className="mt-10 rounded-3xl overflow-hidden border border-gray-200 shadow-lg h-[26.25rem] w-full">
        <iframe
          title="V L Group Location"
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

    </section>
  );
};

export default ContactForm;