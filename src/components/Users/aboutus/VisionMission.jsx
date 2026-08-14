"use client";
import React from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';
import { getImageUrl } from '@/utils/imageUtils';

const VisionMission = ({ vision, mission, gallery }) => {
  if (!vision && !mission && (!gallery || !gallery.items || gallery.items.length === 0)) return null;

  return (
    <section className="w-full bg-white py-8 px-4 md:px-8 space-y-10">

      {/* OUR VISION */}
      {vision && (
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="relative h-[17.5rem] md:h-[21.25rem] w-full overflow-hidden rounded-3xl">
            {vision.image && (
              <Image
                src={getImageUrl(vision.image, 'about-page')}
                alt={vision.title || "Our Vision"}
                fill
                className="object-cover"
              />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-3 uppercase">
              {vision.title}
            </h2>
            <div 
              className="text-slate-500 text-[0.9375rem] mb-4 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: vision.description?.trim() }}
            />
            {vision.items && vision.items.length > 0 && (
              <>
                {vision.button_text && <h3 className="font-semibold text-slate-900 mb-2">{vision.button_text}</h3>}
                <div className="space-y-4 mt-2">
                  {vision.items.map(item => (
                    <div key={item.item_id} className="flex gap-3">
                      <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border border-slate-800 flex items-center justify-center">
                        <Check size={13} strokeWidth={3} className="text-slate-800" />
                      </div>
                      <div className="pt-0.5">
                        {item.item_title && <p className="font-bold text-slate-900 text-[0.9375rem] md:text-base">{item.item_title}</p>}
                        {item.item_text && <p className="text-[0.9375rem] md:text-base text-slate-700 leading-relaxed mt-1">{item.item_text}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* OUR MISSION */}
      {mission && (
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-3 uppercase">
              {mission.title}
            </h2>
            <div 
              className="text-slate-500 text-[0.9375rem] mb-4 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: mission.description?.trim() }}
            />
            {mission.items && mission.items.length > 0 && (
              <>
                {mission.button_text && <h3 className="font-semibold text-slate-900 mb-2">{mission.button_text}</h3>}
                <div className="space-y-4 mt-2">
                  {mission.items.map(item => (
                    <div key={item.item_id} className="flex gap-3">
                      <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border border-slate-800 flex items-center justify-center">
                        <Check size={13} strokeWidth={3} className="text-slate-800" />
                      </div>
                      <div className="pt-0.5">
                        {item.item_title && <p className="font-bold text-slate-900 text-[0.9375rem] md:text-base">{item.item_title}</p>}
                        {item.item_text && <p className="text-[0.9375rem] md:text-base text-slate-700 leading-relaxed mt-1">{item.item_text}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="relative h-[17.5rem] md:h-[21.25rem] w-full overflow-hidden rounded-3xl order-1 md:order-2">
            {mission.image && (
              <Image
                src={getImageUrl(mission.image, 'about-page')}
                alt={mission.title || "Our Mission"}
                fill
                className="object-cover"
              />
            )}
          </div>
        </div>
      )}

      {/* GALLERY MARQUEE */}
      {gallery && gallery.items && gallery.items.length > 0 && (
        <div className="relative w-full overflow-hidden py-4">
          <div className="flex w-max animate-marquee gap-6">
            {[...gallery.items, ...gallery.items].map((item, idx) => (
              <div
                key={idx}
                className="relative h-[25rem] w-[16.25rem] flex-shrink-0 overflow-hidden rounded-3xl bg-neutral-100"
              >
                <Image
                  src={getImageUrl(item.item_image, 'about-page')}
                  alt={`Gallery image ${idx + 1}`}
                  fill
                  className="object-cover object-top"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default VisionMission;