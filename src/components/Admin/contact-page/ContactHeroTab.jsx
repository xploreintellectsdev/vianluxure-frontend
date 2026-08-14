"use client";
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Loader2, Image as ImageIcon } from 'lucide-react';
import { contactApi } from '@/api/contact.api';
import showToast from '@/sharables/toast';
import { getImageUrl } from '@/utils/imageUtils';

const ContactHeroTab = () => {
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  
  const { register, handleSubmit, reset, watch, setValue, formState: { isSubmitting } } = useForm();
  
  const imageFile = watch('image');

  useEffect(() => {
    fetchHero();
  }, []);

  useEffect(() => {
    if (imageFile && imageFile[0] && imageFile[0] instanceof File) {
      const url = URL.createObjectURL(imageFile[0]);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  const fetchHero = async () => {
    try {
      const res = await contactApi.getHero();
      if (res.data?.data) {
        const hero = res.data.data;
        reset({
          title: hero.title || '',
          eyebrow_label: hero.eyebrow_label || '',
          form_title: hero.form_title || '',
          description: hero.description || '',
          is_active: hero.is_active === 1
        });
        if (hero.image) {
          setPreview(getImageUrl(hero.image, 'contact-page'));
        }
      }
    } catch (err) {
      console.error(err);
      showToast.error("Failed to fetch hero section");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('eyebrow_label', data.eyebrow_label);
      formData.append('form_title', data.form_title);
      formData.append('description', data.description);
      formData.append('is_active', data.is_active ? 1 : 0);
      
      if (data.image && data.image[0]) {
        formData.append('image', data.image[0]);
      }
      
      await contactApi.updateHero(formData);
      showToast.success("Hero updated successfully");
      fetchHero();
    } catch (err) {
      console.error(err);
      showToast.error("Failed to update hero");
    }
  };

  if (loading) {
    return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#C8A64D]" /></div>;
  }
  
  const formValues = watch();

  return (
    <div className="flex flex-col w-full h-full bg-[#FDFBF7]">
      <div className="w-full bg-stone-900 border-b border-stone-200 shrink-0 relative flex flex-col justify-center overflow-hidden min-h-[40vh]">
        <div className="absolute top-4 left-4 z-50 bg-black/50 text-white px-3 py-1 rounded-full text-[0.625rem] font-bold tracking-widest uppercase backdrop-blur-md">Live Preview</div>
        <section className="relative w-full h-[50vh] min-h-[26.25rem]">
          {/* Background Image */}
          {preview ? (
            <img
              src={preview}
              alt={formValues.title || "Contact Us"}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-stone-300 flex items-center justify-center text-stone-500 font-bold tracking-widest uppercase text-sm">
               Upload Hero Image
            </div>
          )}

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40 z-10"></div>

          {/* Hero Text */}
          <div className="relative z-20 flex flex-col justify-end items-start h-full w-full pl-3 md:pl-8 pr-6 pb-10">
            <div className="max-w-2xl text-white">
              <h1 className="text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight mb-4 whitespace-pre-line">
                {formValues.title || "Get In-\nTouch With Us"}
              </h1>
              <p className="text-sm md:text-base font-normal opacity-90 leading-relaxed whitespace-pre-line">
                {formValues.description || "We love hearing from you! Whether you have questions about our products, need assistance with your order, or simply want to share your thoughts, our team is here to help."}
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="p-6 sm:p-8 flex-1 max-w-7xl mx-auto w-full">
        <h2 className="text-xl font-serif font-bold text-slate-900 mb-6">Hero Section Content</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[0.6875rem] font-black text-stone-500 uppercase tracking-wider mb-1.5">
                Hero Title
              </label>
              <input
                {...register('title')}
                placeholder="e.g. Get In-Touch With Us"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-stone-200 focus:border-[#C8A64D] outline-none text-sm font-semibold"
              />
            </div>
            
            <div>
              <label className="block text-[0.6875rem] font-black text-stone-500 uppercase tracking-wider mb-1.5">
                Hero Description (Optional)
              </label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Enter hero description..."
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-stone-200 focus:border-[#C8A64D] outline-none text-sm font-semibold resize-y"
              />
            </div>
          </div>
          
          <div className="w-full h-px border-t border-dashed border-stone-300 my-4"></div>
          <h3 className="text-sm font-bold text-slate-700 mb-2">Form Section Text</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[0.6875rem] font-black text-stone-500 uppercase tracking-wider mb-1.5">
                Form Eyebrow Label
              </label>
              <input
                {...register('eyebrow_label')}
                placeholder="e.g. Contact Us"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-stone-200 focus:border-[#C8A64D] outline-none text-sm font-semibold"
              />
            </div>
            
            <div>
              <label className="block text-[0.6875rem] font-black text-stone-500 uppercase tracking-wider mb-1.5">
                Form Title
              </label>
              <input
                {...register('form_title')}
                placeholder="e.g. Let's Connect"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-stone-200 focus:border-[#C8A64D] outline-none text-sm font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[0.6875rem] font-black text-stone-500 uppercase tracking-wider mb-1.5">
              Background Image
            </label>
            <div className="flex items-start gap-6">
              <label className="flex flex-col items-center justify-center w-40 h-40 rounded-2xl border-2 border-dashed border-stone-300 bg-white hover:bg-stone-50 cursor-pointer transition-colors overflow-hidden relative">
                {preview ? (
                  <img src={preview} alt="Hero" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-stone-400 mb-2" />
                    <span className="text-xs font-bold text-stone-500">Upload Image</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" {...register('image')} />
              </label>
              
              <div className="flex-1 mt-2">
                <p className="text-sm text-stone-500 mb-4">Recommended size: 1920x600 pixels. High quality image for the page header.</p>
                <label className="flex items-center gap-2.5 h-[2.625rem] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    {...register('is_active')}
                    className="w-4 h-4 rounded accent-[#A67C3D]"
                  />
                  <span className="text-sm font-semibold text-stone-700">Section is Active</span>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-[#C8A64D] to-[#B39340] text-white rounded-xl font-bold text-sm shadow-md flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Hero Section
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactHeroTab;
