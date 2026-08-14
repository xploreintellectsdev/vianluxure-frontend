"use client";
import React, { useState, useEffect } from 'react';
import DataTable from '@/sharables/DataTable';
import { Plus, Edit2, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { monogramApi } from '@/api/monogram.api';
import showToast from '@/sharables/toast';

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

function resolveImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

export default function MonogramPlacementsPage() {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, placement_name: '', extra_price: 0, is_active: true });
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPlacements = async () => {
    setLoading(true);
    try {
      const res = await monogramApi.getAdminPlacements();
      setPlacements(res.data || []);
    } catch (err) {
      showToast.error("Failed to load monogram placements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacements();
  }, []);

  const handleOpenModal = (item = null) => {
    setImageFile(null);
    if (item) {
      setFormData({ 
        id: item.placement_id, 
        placement_name: item.placement_name || '', 
        extra_price: item.extra_price || 0, 
        is_active: item.is_active === 1 || item.is_active === true 
      });
      setPreviewImage(resolveImageUrl(item.placement_image));
    } else {
      setFormData({ id: null, placement_name: '', extra_price: 350, is_active: true });
      setPreviewImage("");
    }
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.id && !imageFile) {
      showToast.error("Please select an image");
      return;
    }
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("placement_name", formData.placement_name);
      payload.append("extra_price", formData.extra_price);
      payload.append("is_active", formData.is_active ? "true" : "false");
      if (imageFile) {
        payload.append("placement_image", imageFile);
      }

      if (formData.id) {
        await monogramApi.updatePlacement(formData.id, payload);
        showToast.success("Placement updated successfully");
      } else {
        await monogramApi.createPlacement(payload);
        showToast.success("Placement created successfully");
      }
      setModalOpen(false);
      fetchPlacements();
    } catch (err) {
      showToast.error(err?.response?.data?.message || "Failed to save placement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this placement?")) return;
    try {
      await monogramApi.deletePlacement(id);
      showToast.success("Placement deleted successfully");
      fetchPlacements();
    } catch (err) {
      showToast.error("Failed to delete placement");
    }
  };

  const columns = [
    { 
      id: 'image', 
      label: 'Image',
      render: (row) => (
        <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center border">
          {row.placement_image ? (
            <img src={resolveImageUrl(row.placement_image)} alt={row.placement_name} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon size={20} className="text-slate-400" />
          )}
        </div>
      )
    },
    { id: 'placement_name', label: 'Placement Name' },
    { 
      id: 'extra_price', 
      label: 'Price',
      render: (row) => <span className="font-semibold text-slate-700">₹{Number(row.extra_price).toFixed(2)}</span>
    },
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
          <button onClick={() => handleDelete(row.placement_id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Monogram Placements</h1>
          <p className="text-slate-500 text-sm mt-1">Manage collar, cuff, or other embroidery placement options and prices for shirts</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm font-medium"
        >
          <Plus size={16} /> Add Placement
        </button>
      </div>

      <DataTable 
        columns={columns} 
        data={placements} 
        loading={loading}
        page={0}
        rowsPerPage={100}
        totalRows={placements.length}
        onPageChange={() => {}}
        onRowsPerPageChange={() => {}}
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-6">
            <h2 className="text-xl font-bold mb-4 text-slate-800">{formData.id ? 'Edit Placement' : 'New Placement'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Placement Name</label>
                <input required type="text" value={formData.placement_name} onChange={e => setFormData({...formData, placement_name: e.target.value})} className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none" placeholder="e.g. Cuff, Collar, Chest" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Extra Price (₹)</label>
                <input required type="number" min="0" step="0.01" value={formData.extra_price} onChange={e => setFormData({...formData, extra_price: e.target.value})} className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Placement Image / Icon</label>
                <div className="mt-1 flex items-center gap-4">
                  {(previewImage || imageFile) && (
                    <div className="w-16 h-16 rounded-xl border overflow-hidden bg-slate-50 flex items-center justify-center">
                      <img src={imageFile ? URL.createObjectURL(imageFile) : previewImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl p-3 text-center cursor-pointer transition-colors">
                    <Upload size={18} className="mx-auto text-slate-400 mb-1" />
                    <span className="text-xs text-slate-600 font-medium">Click to choose file</span>
                    <input type="file" accept="image/*" onChange={e => {
                      if (e.target.files?.[0]) setImageFile(e.target.files[0]);
                    }} className="hidden" />
                  </label>
                </div>
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
