"use client";
import React, { useState, useEffect } from 'react';
import DataTable from '@/sharables/DataTable';
import { Plus, Edit2, Trash2, Upload, Type, Image as ImageIcon } from 'lucide-react';
import { monogramApi } from '@/api/monogram.api';
import showToast from '@/sharables/toast';

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

function resolveImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

export default function MonogramFontsPage() {
  const [fonts, setFonts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, font_name: '', is_active: true });
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchFonts = async () => {
    setLoading(true);
    try {
      const res = await monogramApi.getAdminFonts();
      setFonts(res.data || []);
    } catch (err) {
      showToast.error("Failed to load monogram fonts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFonts();
  }, []);

  const handleOpenModal = (item = null) => {
    setImageFile(null);
    if (item) {
      setFormData({ 
        id: item.font_id, 
        font_name: item.font_name || '', 
        is_active: item.is_active === 1 || item.is_active === true 
      });
      setPreviewImage(resolveImageUrl(item.font_preview_image));
    } else {
      setFormData({ id: null, font_name: '', is_active: true });
      setPreviewImage("");
    }
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.id && !imageFile) {
      showToast.error("Please select a font preview image");
      return;
    }
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("font_name", formData.font_name);
      payload.append("is_active", formData.is_active ? "true" : "false");
      if (imageFile) {
        payload.append("font_preview_image", imageFile);
      }

      if (formData.id) {
        await monogramApi.updateFont(formData.id, payload);
        showToast.success("Font updated successfully");
      } else {
        await monogramApi.createFont(payload);
        showToast.success("Font created successfully");
      }
      setModalOpen(false);
      fetchFonts();
    } catch (err) {
      showToast.error(err?.response?.data?.message || "Failed to save font");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this font?")) return;
    try {
      await monogramApi.deleteFont(id);
      showToast.success("Font deleted successfully");
      fetchFonts();
    } catch (err) {
      showToast.error("Failed to delete font");
    }
  };

  const columns = [
    { 
      id: 'image', 
      label: 'Font Style Preview',
      render: (row) => (
        <div className="w-24 h-10 bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center border p-1 shadow-inner">
          {row.font_preview_image ? (
            <img src={resolveImageUrl(row.font_preview_image)} alt={row.font_name} className="h-full object-contain" />
          ) : (
            <ImageIcon size={18} className="text-slate-400" />
          )}
        </div>
      )
    },
    { id: 'font_name', label: 'Font Style Name' },
    { 
      id: 'is_active', 
      label: 'Status',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex gap-2 justify-end">
          <button onClick={() => handleOpenModal(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
          <button onClick={() => handleDelete(row.font_id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Monogram Fonts</h1>
          <p className="text-slate-500 text-sm mt-1">Manage monogram lettering styles (Block, Italic, Bold, Script) available for shirts</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm font-medium"
        >
          <Plus size={16} /> Add Font Style
        </button>
      </div>

      <DataTable 
        columns={columns} 
        data={fonts} 
        loading={loading}
        page={0}
        rowsPerPage={100}
        totalRows={fonts.length}
        onPageChange={() => {}}
        onRowsPerPageChange={() => {}}
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-6">
            <h2 className="text-xl font-bold mb-4 text-slate-800">{formData.id ? 'Edit Font Style' : 'New Font Style'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Font Style Name</label>
                <input required type="text" value={formData.font_name} onChange={e => setFormData({...formData, font_name: e.target.value})} className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none" placeholder="e.g. Block, Italic, Bold, Royal Script" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Font Sample / Preview Image</label>
                <div className="mt-1 flex items-center gap-4">
                  {(previewImage || imageFile) && (
                    <div className="w-24 h-12 rounded-xl border overflow-hidden bg-slate-50 flex items-center justify-center shadow-sm p-1">
                      <img src={imageFile ? URL.createObjectURL(imageFile) : previewImage} alt="Preview" className="h-full object-contain" />
                    </div>
                  )}
                  <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl p-3 text-center cursor-pointer transition-colors">
                    <Upload size={18} className="mx-auto text-slate-400 mb-1" />
                    <span className="text-xs text-slate-600 font-medium">Click to choose preview image</span>
                    <input type="file" accept="image/*" onChange={e => {
                      if (e.target.files?.[0]) setImageFile(e.target.files[0]);
                    }} className="hidden" />
                  </label>
                </div>
                <p className="text-xs text-slate-400 mt-1">Upload an image showing sample letters (e.g., &quot;Abc&quot;) in this font style.</p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="active" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-4 h-4 text-slate-900 rounded" />
                <label htmlFor="active" className="text-sm font-medium text-slate-700">Active Status</label>
              </div>
              <div className="flex gap-2 justify-end pt-4 border-t mt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-xl font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 disabled:opacity-50">{submitting ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
