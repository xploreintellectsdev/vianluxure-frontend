import React, { useState, useEffect, useRef } from 'react';
import { pageInfoApi } from '@/api/pageInfo.api';
import showToast from '@/sharables/toast';
import { Plus, Edit2, Trash2, Upload, Loader2, Image as ImageIcon, ImagePlus } from 'lucide-react';
import EntityDialog from '@/sharables/EntityDialog';
import DeleteConfirmDialog from '@/sharables/DeleteConfirmDialog';
import { getImageUrl } from '@/utils/imageUtils';
import ActiveTrashBar from '@/sharables/ActiveTrashBar';
import { RotateCcw } from 'lucide-react';
import WhyChooseSection from '@/components/Users/shop/components/Whychoosehero';

const ChecklistPreview = ({ formValues }) => {
  const isActive = formValues?.is_active ?? true;
  return (
    <div className="w-full h-full min-h-[9.375rem] flex items-center justify-center bg-[#FDFBF7] p-8 border-y border-stone-200">
      <div className={`w-full max-w-lg group flex items-start gap-4 p-4 rounded-2xl transition-colors duration-300 ${isActive ? 'hover:bg-[#fbf9f4] border border-transparent hover:border-[#e0e0e0]' : 'bg-red-50/50 border-red-500/50 opacity-75'}`}>
        <span className={`flex-shrink-0 w-[1.625rem] h-[1.625rem] rounded-full border flex items-center justify-center mt-0.5 transition-all duration-300 ${isActive ? 'bg-transparent border-[#e0e0e0] group-hover:border-[#C8A64D] group-hover:bg-[#C8A64D]' : 'border-red-300 bg-red-100'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 transition-colors duration-300 ${isActive ? 'text-[#C8A64D] group-hover:text-white' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            {isActive ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />}
          </svg>
        </span>
        <p className={`text-[0.9375rem] md:text-[1rem] leading-[1.6] ${isActive ? 'text-[#444444]' : 'text-red-500'}`}>
          <span className={`font-semibold ${isActive ? 'text-[#161c24]' : 'text-red-700 line-through'}`}>
            {formValues?.item_title || 'Checklist Title'}:
          </span>{' '}
          {formValues?.item_description || 'Checklist description text goes here. It explains the feature in more detail.'}
        </p>
      </div>
    </div>
  );
};

export default function WhyChooseTab({ pageKey }) {
  const [section, setSection] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(false);
  const [viewMode, setViewMode] = useState('active');
  
  // Section form state
  const [subtitle, setSubtitle] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [pageKey]);

  useEffect(() => {
    fetchData(false);
  }, [viewMode]);

  const fetchData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const res = await pageInfoApi.getByPage(pageKey, false, viewMode);
      if (res?.success && res?.data) {
        const whyChoose = res.data.whyChoose;
        if (whyChoose) {
          setSection(whyChoose);
          setSubtitle(whyChoose.subtitle || '');
          setTitle(whyChoose.title || '');
          setDescription(whyChoose.description || '');
          setImagePreview(whyChoose.image ? getImageUrl(whyChoose.image) : '');
          setItems(whyChoose.items || []);
        } else {
          setSection(null);
          setSubtitle('');
          setTitle('');
          setDescription('');
          setImagePreview('');
          setItems([]);
        }
        setSelectedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error(err);
      showToast.error('Failed to load section data');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveSection = async () => {
    try {
      setSavingSection(true);
      const fd = new FormData();
      fd.append('subtitle', subtitle);
      fd.append('title', title);
      fd.append('description', description);
      if (selectedImage) {
        fd.append('image', selectedImage);
      }
      fd.append('is_active', section?.is_active ?? 1);
      
      await pageInfoApi.upsertSection(pageKey, 'why_choose', fd);
      showToast.success('Section details saved');
      fetchData(false);
    } catch (err) {
      console.error(err);
      showToast.error('Failed to save section details');
    } finally {
      setSavingSection(false);
    }
  };

  const handleOpenDialog = (item = null) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      await pageInfoApi.deleteItem(deletingItem.item_id);
      showToast.success('Item moved to trash');
      setIsDeleteDialogOpen(false);
      fetchData(false);
    } catch (err) {
      console.error(err);
      showToast.error('Failed to move item to trash');
    }
  };

  const handleRestore = async (item) => {
    try {
      await pageInfoApi.restoreItem(item.item_id);
      showToast.success('Item restored successfully');
      fetchData(false);
    } catch (err) {
      console.error(err);
      showToast.error('Failed to restore item');
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      const newStatus = item.is_active === 1 ? 0 : 1;
      await pageInfoApi.updateItem(item.item_id, { is_active: newStatus });
      showToast.success('Item status updated');
      fetchData(false);
    } catch (err) {
      console.error(err);
      showToast.error('Failed to update status');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-500" size={32} /></div>;
  }

  const dialogFields = [
    { name: 'item_title', label: 'Item Title', type: 'text', required: true },
    { name: 'item_description', label: 'Item Description', type: 'textarea', required: false },
    { name: 'order_no', label: 'Order Number', type: 'number', required: false },
    { name: 'is_active', label: 'Active Status', type: 'toggle', required: false }
  ];

  return (
    <div className="space-y-8">
      {/* Live Preview of the entire section */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="bg-slate-50/50 border-b border-stone-100 p-4 px-6 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Live Preview</h2>
        </div>
        <div className="w-full bg-[#FDFBF7] relative scale-[0.85] sm:scale-[0.95] md:scale-100 origin-top">
          <div className="pointer-events-none">
            <WhyChooseSection 
              imageSrc={imagePreview || section?.image_url || '/images/shop/default-why-choose.webp'}
              subtitle={subtitle || 'Subtitle'}
              title={title || 'Section Title'}
              description={description || 'Section description text goes here.'}
              features={items.filter(item => item.is_active !== 0).map(item => ({
                title: item.item_title,
                desc: item.item_description
              }))}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <h2 className="text-lg font-bold text-slate-800 p-6 border-b border-stone-100 bg-slate-50/50">Section Header & Image</h2>
        <div className="p-6 space-y-5 max-w-2xl">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Section Image</label>
            <div className="flex items-center gap-6 mt-2">
              <div className="relative w-40 h-40 rounded-xl border-2 border-dashed border-stone-300 flex items-center justify-center bg-slate-50 overflow-hidden group">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImagePlus className="text-stone-400" size={32} />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-medium px-2 py-1 bg-black bg-opacity-60 rounded-md">Change</span>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500 font-medium">Upload a high-quality image for the section.</p>
                <p className="text-xs text-stone-400 mt-1">Recommended size: 800x1200px (JPG/PNG)</p>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Subtitle</label>
            <input 
              type="text" 
              value={subtitle} 
              onChange={e => setSubtitle(e.target.value)} 
              className="mt-1.5 block w-full rounded-xl border border-stone-300 px-4 py-2.5 shadow-sm focus:border-[#C8A64D] focus:ring-[#C8A64D] focus:ring-1 sm:text-sm transition-all bg-white"
              placeholder="e.g. WHY CHOOSE"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="mt-1.5 block w-full rounded-xl border border-stone-300 px-4 py-2.5 shadow-sm focus:border-[#C8A64D] focus:ring-[#C8A64D] focus:ring-1 sm:text-sm transition-all bg-white"
              placeholder="e.g. Our Fabric?"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              rows={3}
              className="mt-1.5 block w-full rounded-xl border border-stone-300 px-4 py-2.5 shadow-sm focus:border-[#C8A64D] focus:ring-[#C8A64D] focus:ring-1 sm:text-sm transition-all bg-white"
            />
          </div>
          <button
            onClick={handleSaveSection}
            disabled={savingSection}
            className="px-6 py-2.5 bg-gradient-to-r from-[#C8A64D] to-[#B39340] hover:from-[#B39340] hover:to-[#9A7D34] text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 mt-2"
          >
            {savingSection ? 'Saving...' : 'Save Section Details'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-stone-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">Checklist Items</h2>
          <div className="flex items-center gap-4">
            <ActiveTrashBar viewMode={viewMode} onChange={setViewMode} />
            <button
              onClick={() => handleOpenDialog()}
              disabled={!section?.section_id}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#C8A64D] to-[#B39340] hover:from-[#B39340] hover:to-[#9A7D34] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Plus size={16} strokeWidth={2.5} /> Add Item
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {!section?.section_id && (
            <p className="text-sm text-amber-700 mb-6 bg-amber-50 p-4 rounded-xl border border-amber-200/50">
              Please save the section header details first before adding features.
            </p>
          )}

          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 bg-white">
                {items.map((item) => (
                  <tr key={item.item_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-800">
                      <div className="font-bold">{item.item_title}</div>
                      <div className="text-slate-500 text-xs mt-1 truncate max-w-lg">{item.item_description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${item.is_active ? 'bg-[#10B981]' : 'bg-stone-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.is_active ? 'translate-x-4' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {viewMode === 'active' ? (
                        <>
                          <button onClick={() => handleOpenDialog(item)} className="text-[#C8A64D] hover:text-[#9A7D34] mr-4 p-1 rounded-md hover:bg-stone-100 transition-colors">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => { setDeletingItem(item); setIsDeleteDialogOpen(true); }} className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestore(item)}
                          className="flex items-center gap-1.5 ml-auto text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors font-semibold"
                        >
                          <RotateCcw size={16} strokeWidth={2.5} />
                          Restore
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-sm text-slate-500 bg-slate-50/30">
                      No checklist items added yet.
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
        editData={editingItem}
        getIdFromData={(data) => data?.item_id}
        fields={dialogFields}
        entityLabel="Checklist Item"
        renderPreview={(values) => <ChecklistPreview formValues={values} />}
        apiCreate={async (data) => {
          if (!section) throw new Error('Please save section details first');
          return pageInfoApi.createItem(section.section_id, data);
        }}
        apiUpdate={async (id, data) => {
          return pageInfoApi.updateItem(id, data);
        }}
        buildPayload={(formData) => ({
          item_title: formData.item_title,
          item_description: formData.item_description,
          order_no: formData.order_no || (items ? items.length : 0),
          is_active: formData.is_active === false ? 0 : 1
        })}
      />
      
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Move to Trash"
        message={`Are you sure you want to move "${deletingItem?.item_title}" to trash? You can restore it later.`}
      />
    </div>
  );
}
