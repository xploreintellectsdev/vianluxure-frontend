import React from 'react';
import { Star, User } from 'lucide-react';
import { getImageUrl } from '@/utils/imageUtils';

export default function CustomerStoriesLayout({ title, image, stories }) {
  const displayStories = stories && stories.length > 0 ? stories : [
    { customer_name: 'Example Customer', story_text: 'This is a placeholder story to show how the layout looks. Add your own real stories below!', rating: 5, story_date: '2026-01-01' },
    { customer_name: 'Jane Doe', story_text: 'The layout will automatically adjust as you add more customer reviews.', rating: 4, story_date: '2026-01-02' }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  return (
    <section className="py-20 lg:py-32 bg-white relative">
      <div className="max-w-[87.5rem] mx-auto px-6 md:px-12">
        <div className="flex flex-col lg:flex-row gap-16 xl:gap-24">
          
          {/* Left Column - Stories List */}
          <div className="w-full lg:w-[55%] flex flex-col order-2 lg:order-1">
            <h2 className="text-4xl md:text-5xl lg:text-6xl text-[#1a1a1a] font-serif font-bold mb-12 tracking-tight">
              {title || 'Customer Stories'}
            </h2>
            
            <div className="flex flex-col">
              {displayStories.map((story, idx) => (
                <div key={idx} className="flex flex-col border-b border-stone-100 last:border-b-0 py-6 first:pt-0">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#fcf8ef] flex items-center justify-center flex-shrink-0 text-[#cba962]">
                      <User size={24} strokeWidth={1.5} />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-[#1a1a1a] text-lg font-serif">{story.customer_name || 'Customer'}</h4>
                          <span className="text-xs font-semibold text-stone-400 mt-0.5 block">{formatDate(story.story_date)}</span>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={14} 
                              className={i < (story.rating || 5) ? "fill-[#cba962] text-[#cba962]" : "stroke-[#e5e7eb] text-transparent"} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-[#666] leading-relaxed text-sm mt-4">
                        {story.story_text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="w-full lg:w-[45%] order-1 lg:order-2">
            <div className="relative h-full min-h-[37.5rem] rounded-3xl overflow-hidden bg-stone-100">
              <img 
                src={getImageUrl(image) || '/images/shop/default-story.webp'} 
                alt={title || "Customer Stories"}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => { e.target.src = '/images/shop/fabric-hero.webp'; }}
              />
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
