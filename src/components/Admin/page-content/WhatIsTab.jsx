import React, { useState, useEffect } from 'react';
import { pageInfoApi } from '@/api/pageInfo.api';
import showToast from '@/sharables/toast';
import { Plus, Edit2, Trash2, GripVertical, Loader2 } from 'lucide-react';
import EntityDialog from '@/sharables/EntityDialog';
import DeleteConfirmDialog from '@/sharables/DeleteConfirmDialog';
import IconPicker from './IconPicker';
import ActiveTrashBar from '@/sharables/ActiveTrashBar';
import { RotateCcw } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import WhatIsHero from '@/components/Users/shop/components/WhatIsHero';

const FeaturePreview = ({ formValues }) => {
  const Icon = LucideIcons[formValues?.icon_key] || LucideIcons['Shirt'];
  const isActive = formValues?.is_active ?? true;
  
  return (
    <div className="w-full h-full min-h-[18.75rem] flex items-center justify-center bg-[#FDFBF7] p-8 border-y border-stone-200">
      <div className={`w-full max-w-sm group flex flex-col items-center text-center p-8 md:p-10 rounded-3xl bg-white/80 border transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${isActive ? 'border-stone-200 hover:bg-white hover:border-[#C8A64D]/40 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-1' : 'border-red-500/50 bg-red-50/50 opacity-75'}`}>
        <div
          className={`flex items-center justify-center mb-5 rounded-2xl transition-all duration-500 ${isActive ? 'bg-[#C8A64D]/10 text-[#C8A64D] group-hover:bg-[#C8A64D] group-hover:text-white' : 'bg-red-100 text-red-500'}`}
          style={{ width: '3.25rem', height: '3.25rem' }}
        >
          {Icon && <Icon size={24} strokeWidth={1.5} />}
        </div>
        <h3 className={`text-[1.25rem] font-serif font-bold mb-3 leading-tight ${isActive ? 'text-stone-900' : 'text-red-700 line-through'}`}>
          {formValues?.item_title || 'Feature Title'}
        </h3>
        <p className={`text-[0.95rem] leading-[1.65] font-medium ${isActive ? 'text-stone-600' : 'text-red-500'}`}>
          {formValues?.item_description || 'Feature description goes here.'}
        </p>
      </div>
    </div>
  );
};

export default function WhatIsTab({ pageKey }) {
  const [section, setSection] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(false);
  const [viewMode, setViewMode] = useState('active');
  
  // Section form state
  const [subtitle, setSubtitle] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

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
        const whatIs = res.data.whatIs;
        if (whatIs) {
          setSection(whatIs);
          setSubtitle(whatIs.subtitle || '');
          setTitle(whatIs.title || '');
          setDescription(whatIs.description || '');
          setItems(whatIs.items || []);
        } else {
          setSection(null);
          setSubtitle('');
          setTitle('');
          setDescription('');
          setItems([]);
        }
      }
    } catch (err) {
      console.error(err);
      showToast.error('Failed to load section data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async () => {
    try {
      setSavingSection(true);
      const fd = new FormData();
      fd.append('subtitle', subtitle);
      fd.append('title', title);
      fd.append('description', description);
      fd.append('is_active', section?.is_active ?? 1);
      
      await pageInfoApi.upsertSection(pageKey, 'what_is', fd);
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
    {
      name: 'icon_key',
      label: 'Select Icon',
      type: 'custom',
      render: ({ value, onChange }) => (
        <IconPicker value={value} onChange={onChange} />
      ),
      required: true
    },
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
            <WhatIsHero 
              subtitle={subtitle || 'Subtitle'} 
              title={title || 'Section Title'} 
              description={description || 'Section description text goes here.'}
              features={items.filter(item => item.is_active !== 0).map(item => ({
                title: item.item_title,
                description: item.item_description,
                icon: LucideIcons[item.icon_key] || LucideIcons['Shirt']
              }))}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <h2 className="text-lg font-bold text-slate-800 p-6 border-b border-stone-100 bg-slate-50/50">Section Header</h2>
        <div className="p-6 space-y-5 max-w-2xl">
          <div>
            <label className="block text-sm font-semibold text-slate-700">Subtitle</label>
            <input 
              type="text" 
              value={subtitle} 
              onChange={e => setSubtitle(e.target.value)} 
              className="mt-1.5 block w-full rounded-xl border border-stone-300 px-4 py-2.5 shadow-sm focus:border-[#C8A64D] focus:ring-[#C8A64D] focus:ring-1 sm:text-sm transition-all bg-white"
              placeholder="e.g. WHAT IS IN OUR"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="mt-1.5 block w-full rounded-xl border border-stone-300 px-4 py-2.5 shadow-sm focus:border-[#C8A64D] focus:ring-[#C8A64D] focus:ring-1 sm:text-sm transition-all bg-white"
              placeholder="e.g. Fabric Collection?"
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
          <h2 className="text-lg font-bold text-slate-800">Features List</h2>
          <div className="flex items-center gap-4">
            <ActiveTrashBar viewMode={viewMode} onChange={setViewMode} />
            <button
              onClick={() => handleOpenDialog()}
              disabled={!section?.section_id}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#C8A64D] to-[#B39340] hover:from-[#B39340] hover:to-[#9A7D34] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Plus size={16} strokeWidth={2.5} /> Add Feature
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
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Icon</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 bg-white">
                {items.map((item) => (
                  <tr key={item.item_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                      {item.icon_key}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-800">
                      <div className="font-bold">{item.item_title}</div>
                      <div className="text-slate-500 text-xs mt-1 truncate max-w-md">{item.item_description}</div>
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
                    <td colSpan="4" className="px-6 py-12 text-center text-sm text-slate-500 bg-slate-50/30">
                      No features added yet.
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
        entityLabel="Feature"
        renderPreview={(values) => <FeaturePreview formValues={values} />}
        apiCreate={async (data) => {
          if (!section) throw new Error('Please save section details first');
          return pageInfoApi.createItem(section.section_id, data);
        }}
        apiUpdate={async (id, data) => {
          return pageInfoApi.updateItem(id, data);
        }}
        buildPayload={(formData) => ({
          icon_key: formData.icon_key,
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
