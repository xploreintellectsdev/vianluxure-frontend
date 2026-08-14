"use client";
import React, { useState, useEffect, useRef } from 'react';
import { homeReviewApi } from '@/api/homeReview.api';
import showToast from '@/sharables/toast';
import { Plus, Edit2, Trash2, UploadCloud, Loader2, RotateCcw, X, Image as ImageIcon } from 'lucide-react';
import EntityDialog from '@/sharables/EntityDialog';
import DeleteConfirmDialog from '@/sharables/DeleteConfirmDialog';
import ActiveTrashBar from '@/sharables/ActiveTrashBar';
import Reviews from '@/components/Users/home/Reviews';
import { getImageUrl } from '@/utils/imageUtils';

export default function HomeReviewsIndex() {
  const [settings, setSettings] = useState({ heading: '', subheading: '', is_visible: 1 });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [viewMode, setViewMode] = useState('active');
  
  // Bulk upload state
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingReview, setDeletingReview] = useState(null);

  useEffect(() => {
    fetchData();
  }, [viewMode]);

  const fetchData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const [settingsRes, reviewsRes] = await Promise.all([
        homeReviewApi.getSettings(),
        homeReviewApi.getAll(viewMode)
      ]);
      if (settingsRes?.success && settingsRes?.data) {
        setSettings(settingsRes.data);
      }
      if (reviewsRes?.success && reviewsRes?.data) {
        setReviews(reviewsRes.data);
      }
    } catch (err) {
      console.error(err);
      showToast.error('Failed to load home reviews data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      await homeReviewApi.updateSettings(settings);
      showToast.success('Settings saved successfully');
      fetchData(false);
    } catch (err) {
      console.error(err);
      showToast.error('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const removeSelectedFile = (index) => {
    const updated = [...selectedFiles];
    updated.splice(index, 1);
    setSelectedFiles(updated);
  };

  const handleBulkUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });
      
      await homeReviewApi.bulkUpload(formData);
      showToast.success(`Successfully uploaded ${selectedFiles.length} images.`);
      setSelectedFiles([]);
      fetchData(false);
    } catch (error) {
      console.error('Failed to upload images:', error);
      showToast.error('Failed to upload images.');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenDialog = (review = null) => {
    setEditingReview(review);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingReview) return;
    try {
      await homeReviewApi.delete(deletingReview.review_id);
      showToast.success('Review moved to trash');
      setIsDeleteDialogOpen(false);
      fetchData(false);
    } catch (err) {
      console.error(err);
      showToast.error('Failed to move review to trash');
    }
  };

  const handleRestore = async (review) => {
    try {
      await homeReviewApi.restore(review.review_id);
      showToast.success('Review restored successfully');
      fetchData(false);
    } catch (err) {
      console.error(err);
      showToast.error('Failed to restore review');
    }
  };

  const handleToggleStatus = async (review) => {
    try {
      const newStatus = review.is_active === 1 ? 0 : 1;
      const formData = new FormData();
      formData.append('is_active', newStatus);
      await homeReviewApi.update(review.review_id, formData);
      showToast.success('Review status updated');
      fetchData(false);
    } catch (err) {
      console.error(err);
      showToast.error('Failed to update status');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-slate-500" size={32} /></div>;
  }

  const dialogFields = [
    { name: 'image', label: 'Customer Image', type: 'image', required: !editingReview },
    { name: 'quote', label: 'Quote', type: 'textarea', required: true },
    { name: 'author_name', label: 'Author Name', type: 'text', required: true },
    { name: 'author_location', label: 'Author Location', type: 'text', required: false },
    { name: 'order_no', label: 'Order Number', type: 'number', required: false },
    { name: 'is_active', label: 'Active Status', type: 'toggle', required: false }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Live Preview */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-stone-100 p-4 px-6">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Live Preview</h2>
        </div>
        <div className="w-full relative origin-top pointer-events-none">
          {settings.is_visible ? (
            <Reviews 
              headline={settings.heading} 
              ratingCount={settings.subheading.replace(/\D/g, '') || "1000+"} // Extract number or fallback
              reviews={reviews.filter(r => r.is_active !== 0).map(r => ({
                id: r.review_id,
                customerImage: getImageUrl(r.customer_image, 'home-reviews'),
                quote: r.quote,
                authorName: r.author_name,
                authorLocation: r.author_location
              }))}
            />
          ) : (
            <div className="p-12 text-center text-stone-500 bg-stone-50">
              Section is currently hidden (Visibility is OFF)
            </div>
          )}
        </div>
      </div>

      {/* Settings Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <h2 className="text-lg font-bold text-slate-800 p-6 border-b border-stone-100 bg-slate-50/50">Section Settings</h2>
        <div className="p-6 space-y-5 max-w-2xl">
          <div>
            <label className="block text-sm font-semibold text-slate-700">Heading</label>
            <input 
              type="text" 
              value={settings.heading} 
              onChange={e => setSettings({...settings, heading: e.target.value})} 
              className="mt-1.5 block w-full rounded-xl border border-stone-300 px-4 py-2.5 shadow-sm focus:border-[#C8A64D] focus:ring-[#C8A64D] focus:ring-1 sm:text-sm transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Subheading (e.g. "Over 1000+ 5-star reviews")</label>
            <input 
              type="text" 
              value={settings.subheading} 
              onChange={e => setSettings({...settings, subheading: e.target.value})} 
              className="mt-1.5 block w-full rounded-xl border border-stone-300 px-4 py-2.5 shadow-sm focus:border-[#C8A64D] focus:ring-[#C8A64D] focus:ring-1 sm:text-sm transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSettings({...settings, is_visible: settings.is_visible ? 0 : 1})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.is_visible ? 'bg-[#10B981]' : 'bg-stone-300'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${settings.is_visible ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
            <span className="text-sm font-semibold text-slate-700">Visible on Home Page</span>
          </div>
          <button
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="px-6 py-2.5 bg-gradient-to-r from-[#C8A64D] to-[#B39340] hover:from-[#B39340] hover:to-[#9A7D34] text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 mt-2"
          >
            {savingSettings ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Bulk Upload Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Add (Bulk Upload Images)</h3>
        <p className="text-sm text-stone-500 mb-4">Upload multiple images at once to quickly create placeholder review cards. You can edit their text and names below afterward.</p>
        <div className="flex flex-col gap-4">
          <div className="relative border-2 border-dashed border-stone-300 rounded-xl p-8 hover:bg-stone-50 transition-colors text-center cursor-pointer">
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <UploadCloud className="text-stone-400 w-10 h-10" />
              <p className="text-sm text-stone-600 font-medium">Click or drag images here to select</p>
              <p className="text-xs text-stone-400">You can select multiple files at once</p>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-4">
              <div className="text-sm font-medium text-slate-700">
                {selectedFiles.length} file(s) selected:
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-stone-100 border border-stone-200 rounded-lg py-1.5 pl-3 pr-2 text-xs">
                    <span className="truncate max-w-[9.375rem]">{file.name}</span>
                    <button onClick={() => removeSelectedFile(idx)} className="text-stone-500 hover:text-red-500">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={handleBulkUpload}
                  disabled={uploading}
                  className="px-6 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={16} />
                      <span>Upload {selectedFiles.length} Images</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-stone-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">Reviews List</h2>
          <div className="flex items-center gap-4">
            <ActiveTrashBar viewMode={viewMode} onChange={setViewMode} />
            <button
              onClick={() => handleOpenDialog()}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#C8A64D] to-[#B39340] hover:from-[#B39340] hover:to-[#9A7D34] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <Plus size={16} strokeWidth={2.5} /> Add Single Review
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Review Text</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 bg-white">
                {reviews.map((r) => (
                  <tr key={r.review_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img src={getImageUrl(r.customer_image, 'home-reviews')} alt="" className="w-16 h-20 object-cover rounded-lg border border-stone-200" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-800 max-w-sm line-clamp-2">{r.quote}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-800">{r.author_name}</div>
                      <div className="text-xs text-slate-500">{r.author_location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(r)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${r.is_active ? 'bg-[#10B981]' : 'bg-stone-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${r.is_active ? 'translate-x-4' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {viewMode === 'active' ? (
                        <>
                          <button onClick={() => handleOpenDialog(r)} className="text-[#C8A64D] hover:text-[#9A7D34] mr-4 p-1 rounded-md hover:bg-stone-100 transition-colors">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => { setDeletingReview(r); setIsDeleteDialogOpen(true); }} className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestore(r)}
                          className="flex items-center gap-1.5 ml-auto text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors font-semibold"
                        >
                          <RotateCcw size={16} strokeWidth={2.5} />
                          Restore
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {reviews.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-sm text-slate-500 bg-slate-50/30">
                      No reviews found. Upload images to quickly generate placeholders!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <EntityDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={() => fetchData(false)}
        editData={editingReview}
        getIdFromData={(data) => data?.review_id}
        fields={dialogFields}
        entityLabel="Review Card"
        apiCreate={async (data) => homeReviewApi.create(data)}
        apiUpdate={async (id, data) => homeReviewApi.update(id, data)}
        buildPayload={(formData) => {
          const payload = new FormData();
          if (formData.image instanceof File) {
            payload.append('image', formData.image);
          }
          payload.append('quote', formData.quote);
          payload.append('author_name', formData.author_name);
          payload.append('author_location', formData.author_location || '');
          payload.append('order_no', formData.order_no || (reviews ? reviews.length : 0));
          payload.append('is_active', formData.is_active === false ? 0 : 1);
          return payload;
        }}
      />
      
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Move to Trash"
        message="Are you sure you want to move this review to trash? You can restore it later."
      />
    </div>
  );
}
