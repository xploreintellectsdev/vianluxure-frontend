"use client";
import React, { useState, useEffect } from 'react';
import DataTable from '@/sharables/DataTable';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { customStyleCategoryApi } from '@/api/customStyleCategory.api';
import showToast from '@/sharables/toast';

export default function StyleCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', slug: '', is_active: true });
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await customStyleCategoryApi.getAll();
      setCategories(res.data || []);
    } catch (err) {
      showToast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category = null) => {
    if (category) {
      setFormData({ id: category.id, name: category.name, slug: category.slug, is_active: category.is_active === 1 });
    } else {
      setFormData({ id: null, name: '', slug: '', is_active: true });
    }
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (formData.id) {
        await customStyleCategoryApi.update(formData.id, formData);
        showToast.success('Category updated');
      } else {
        await customStyleCategoryApi.create(formData);
        showToast.success('Category created');
      }
      setModalOpen(false);
      fetchCategories();
      // Reload page so sidebar picks up the new category in a hacky way (since it's a global nav)
      window.location.reload(); 
    } catch (err) {
      showToast.error(err?.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await customStyleCategoryApi.remove(id);
      showToast.success('Category deleted');
      fetchCategories();
      window.location.reload();
    } catch (err) {
      showToast.error('Failed to delete category');
    }
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    if (!formData.id) {
      setFormData({ ...formData, name, slug: generateSlug(name) });
    } else {
      setFormData({ ...formData, name });
    }
  };

  const columns = [
    { id: 'name', label: 'Category Name' },
    { id: 'slug', label: 'Slug' },
    { 
      id: 'is_active', 
      label: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${row.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
          <button onClick={() => handleOpenModal(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
          <button onClick={() => handleDelete(row.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Style Categories</h1>
          <p className="text-slate-500 text-sm mt-1">Manage bespoke style categories for the sidebar</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      <DataTable 
        columns={columns} 
        data={categories} 
        loading={loading}
        page={0}
        rowsPerPage={100}
        totalRows={categories.length}
        onPageChange={() => {}}
        onRowsPerPageChange={() => {}}
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-6">
            <h2 className="text-xl font-bold mb-4">{formData.id ? 'Edit Category' : 'New Category'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category Name</label>
                <input required type="text" value={formData.name} onChange={handleNameChange} className="w-full p-2 border rounded" placeholder="e.g. Cuffs" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug (URL)</label>
                <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full p-2 border rounded" placeholder="e.g. cuffs" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="active" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} />
                <label htmlFor="active" className="text-sm font-medium">Active</label>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-slate-900 text-white rounded">{submitting ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
