import React, { useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { reviewApi } from '@/api/review.api';
import showToast from '@/sharables/toast';

const getApiImageUrl = (url) => {
  if (!url) return url;
  if (typeof window !== 'undefined' && url.includes('localhost')) {
    return url.replace('localhost', window.location.hostname);
  }
  return url;
};

export default function ReviewEditModal({ review, onClose }) {
  const [formData, setFormData] = useState({
    rating: review.rating || 5,
    review_title: review.review_title || '',
    review_text: review.review_text || '',
    is_approved: review.is_approved ? true : false,
    review_image_url: review.review_image_url || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    review.review_image_url ? getApiImageUrl(review.review_image_url) : null
  );
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setFormData((prev) => ({ ...prev, review_image_url: 'TO_BE_UPLOADED' }));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, review_image_url: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.review_text.trim()) {
      showToast.error('Review text cannot be empty.');
      return;
    }
    
    setSubmitting(true);
    try {
      let finalImageUrl = formData.review_image_url;
      
      if (imageFile) {
        try {
          const uploaded = await reviewApi.uploadImage(imageFile);
          finalImageUrl = uploaded.url || null;
        } catch (uploadErr) {
          console.error("Image upload failed:", uploadErr);
          showToast.error('Failed to upload image.');
          finalImageUrl = null;
        }
      }

      await reviewApi.updateReview(review.rev_id, {
        rating: Number(formData.rating),
        review_title: formData.review_title,
        review_text: formData.review_text,
        is_approved: formData.is_approved,
        review_image_url: finalImageUrl,
      });
      showToast.success('Review updated successfully.');
      onClose(true); // Signal that an update occurred
    } catch (err) {
      showToast.error(err?.response?.data?.message || 'Failed to update review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-serif text-[#C8A64D]">Edit Review</h2>
          <button 
            onClick={() => onClose(false)}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Rating (1-5)
              </label>
              <input
                type="number"
                name="rating"
                min="1"
                max="5"
                value={formData.rating}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8A64D]/50 focus:border-[#C8A64D] transition-all"
                required
              />
            </div>
            <div className="flex items-end mb-2">
              <label className="flex items-center gap-2 cursor-pointer p-3 border border-slate-200 rounded-xl w-full bg-slate-50">
                <input
                  type="checkbox"
                  name="is_approved"
                  checked={formData.is_approved}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#C8A64D] focus:ring-[#C8A64D] rounded"
                />
                <span className="text-sm font-bold text-slate-700">Visible to Public</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
              Review Title
            </label>
            <input
              type="text"
              name="review_title"
              value={formData.review_title}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8A64D]/50 focus:border-[#C8A64D] transition-all"
              placeholder="e.g. Excellent fabric!"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
              Review Text
            </label>
            <textarea
              name="review_text"
              value={formData.review_text}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8A64D]/50 focus:border-[#C8A64D] transition-all resize-none"
              placeholder="Enter full review here..."
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
              Review Image
            </label>
            {imagePreview ? (
              <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-slate-200">
                <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-1 right-1 bg-black/60 rounded-full p-1 hover:bg-black/80 transition-colors"
                >
                  <X size={14} className="text-white" />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-[#C8A64D] hover:bg-[#F5EFE8] transition-colors"
              >
                <Upload size={24} className="mb-2" />
                <span className="text-sm font-medium">Click to upload image</span>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageChange} 
            />
          </div>

          {/* Footer Actions */}
          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="flex-1 py-3 px-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 px-4 bg-[#C8A64D] text-white font-bold rounded-xl hover:bg-[#b8974a] shadow-lg shadow-[#C8A64D]/30 transition-all disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
