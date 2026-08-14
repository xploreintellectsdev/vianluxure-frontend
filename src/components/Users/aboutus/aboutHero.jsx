"use client";
import Image from 'next/image';
import { getImageUrl } from '@/utils/imageUtils';

const Hero = ({ data }) => {
  if (!data) return null;
  
  return (
    <section className="relative w-full h-[50vh] min-h-[26.25rem]">
      {/* Background Image */}
      <Image
        src={data.image ? getImageUrl(data.image, 'about-page') : "/images/aboutus/abouthero.webp"}
        alt={data.title || "Linen Fabrics"}
        fill
        priority
        className="object-cover object-center"
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40 z-10"></div>

      {/* Hero Text */}
      <div className="relative z-20 flex flex-col justify-end items-start h-full w-full pl-3 md:pl-8 pr-6 pb-10">
        <div className="max-w-xl text-white">
          <h1 className="text-3xl md:text-5xl font-bold leading-[1.1] tracking-tight mb-4 whitespace-pre-line">
            {data.title}
          </h1>
          <div 
            className="text-sm md:text-base font-normal opacity-90 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: data.description }}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;