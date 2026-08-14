"use client";
import React, { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, UploadCloud, Trash2, X } from 'lucide-react';
import { aboutApi } from '@/api/about.api';
import showToast from '@/sharables/toast';
import DeleteConfirmDialog from '@/sharables/DeleteConfirmDialog';
import { getImageUrl } from '@/utils/imageUtils';

export default function GalleryManager({ sectionId, sectionTitle, onBack }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchGallery = useCallback(async () => {
    try {
      setLoading(true);
      const res = await aboutApi.getItemsBySectionId(sectionId);
      setItems(res.data || []);
    } catch (error) {
      console.error('Failed to load gallery items:', error);
      showToast.error('Failed to load gallery items.');
    } finally {
      setLoading(false);
    }
  }, [sectionId]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

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

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });
      
      await aboutApi.bulkUploadItems(sectionId, formData);
      showToast.success(`Successfully uploaded ${selectedFiles.length} images.`);
      setSelectedFiles([]);
      fetchGallery();
    } catch (error) {
      console.error('Failed to upload gallery images:', error);
      showToast.error('Failed to upload images.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await aboutApi.deleteItem(deleteTarget.item_id);
      showToast.success('Image deleted successfully.');
      setDeleteTarget(null);
      fetchGallery();
    } catch (error) {
      console.error('Error deleting image:', error);
      showToast.error('Failed to delete image.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-all flex-shrink-0" title="Back to Sections">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Manage Gallery Images</h2>
            <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">Editing Section: {sectionTitle}</p>
          </div>
        </div>
      </div>

      {/* Bulk Upload Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Upload New Images</h3>
        
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
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-6 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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

      {/* Grid of uploaded images */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Current Gallery Images</h3>
        
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-stone-50 border border-stone-200 rounded-2xl border-dashed">
            <ImageIcon className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 font-medium">No images uploaded to this gallery yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map((item) => (
              <div key={item.item_id} className="group relative bg-white border border-stone-200 rounded-xl overflow-hidden aspect-square">
                <img 
                  src={getImageUrl(item.item_image, 'about-page')} 
                  alt="Gallery Item" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => setDeleteTarget(item)}
                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 hover:scale-110 transition-all shadow-lg"
                    title="Delete Image"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Image"
        message="Are you sure you want to delete this gallery image? This cannot be undone."
      />
    </div>
  );
}

// Temporary icon needed above
const ImageIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
