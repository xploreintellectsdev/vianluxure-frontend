"use client";

import React, { useState, useCallback } from 'react';
import DataTable from '@/sharables/DataTable';
import EntityDialog from '@/sharables/EntityDialog';
import DeleteConfirmDialog from '@/sharables/DeleteConfirmDialog';
import useTableData from '@/hooks/useTableData';
import { menuItemApi } from '@/api/menuItem.api';
import { trashApi } from '@/api/trash.api';
import { getMenuColumns } from './menu.columns';
import { getNavbarFields, getFooterFields } from './menu.fields';
import { toast } from 'react-hot-toast';
import { Plus, RotateCcw, Phone, Mail, MapPin, CheckCircle, Trash2 } from 'lucide-react';

const FacebookIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>;
const InstagramIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>;
const XIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16H20L8.267 4z" /><path d="M4 20l6.768-6.768m2.46-2.46L20 4" /></svg>;
const YoutubeIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 2-2 68.4 68.4 0 0 1 15 0 2 2 0 0 1 2 2 24.12 24.12 0 0 1 0 10 2 2 0 0 1-2 2 68.4 68.4 0 0 1-15 0 2 2 0 0 1-2-2Z" /><path d="m10 15 5-3-5-3z" /></svg>;

const NavbarPreview = ({ formValues }) => {
  return (
    <div className="w-full h-full min-h-[25rem] flex items-center justify-center bg-stone-200 p-4 sm:p-8 border-y border-[#EAE3D2] relative overflow-hidden"
      style={{ backgroundImage: "url('/images/contact/background.webp')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-5xl z-10 scale-[0.85] sm:scale-100 origin-center">
        <nav className="flex items-center justify-between min-h-[4.5rem] py-2 px-5 rounded-full border bg-black/90 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,.55)]">
          <div className="shrink-0 flex items-center pr-2">
            <span className="text-white font-serif font-bold text-2xl tracking-widest">VIAN</span>
          </div>
          <ul className="flex items-center gap-1 rounded-full px-1 py-1">
            <li className="shrink-0 hidden md:block">
              <div className="block px-3 py-2 rounded-full text-[0.90625rem] font-semibold text-white/60">Home</div>
            </li>
            {/* The currently edited item */}
            <li className="shrink-0 relative group">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-white text-black font-black text-[0.625rem] uppercase tracking-widest rounded-md shadow-xl whitespace-nowrap z-20 flex items-center gap-1.5 border border-stone-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Editing
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-r border-b border-stone-200"></div>
              </div>
              <div className={`block px-3.5 py-2 rounded-full text-[0.90625rem] font-semibold transition-all whitespace-nowrap shadow-sm ring-2 ring-white/20 ring-offset-2 ring-offset-black ${formValues?.is_active ? 'bg-[#C9A84C] text-white' : 'bg-red-500/20 text-red-200 border border-red-500/50 line-through'}`}>
                {formValues?.label || 'New Link'}
              </div>
            </li>
            <li className="shrink-0 hidden sm:block">
              <div className="block px-3 py-2 rounded-full text-[0.90625rem] font-semibold text-white/60">Ready To Wear</div>
            </li>
          </ul>
          <div className="flex items-center gap-2 pl-2">
            <div className="w-8 h-8 rounded-full bg-white/10"></div>
            <div className="w-8 h-8 rounded-full bg-white/10"></div>
            <div className="w-24 h-8 rounded-full bg-[#C9A84C] hidden sm:block"></div>
          </div>
        </nav>
      </div>
    </div>
  );
};

const FooterPreview = ({ formValues }) => {
  const group = formValues?.group_name || 'Links';
  const label = formValues?.label || 'New Item';
  const isActive = formValues?.is_active ?? true;

  const highlightClass = isActive
    ? 'bg-[#C9A84C]/20 text-[#C9A84C] font-bold ring-2 ring-[#C9A84C] px-2 rounded-md transition-all'
    : 'bg-red-500/20 text-red-500 font-bold ring-2 ring-red-500 px-2 rounded-md line-through transition-all';

  return (
    <div className="w-full h-full min-h-[25rem] flex items-center justify-center bg-stone-200 p-4 sm:p-8 border-y border-[#EAE3D2] relative overflow-hidden">
      <div className="relative w-full max-w-5xl z-10 scale-[0.75] sm:scale-100 origin-center bg-[#FAFAF8] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,.15)] border border-stone-200 overflow-hidden">
        <footer className="w-full pt-8 pb-6 md:pt-10">
          <div className="mx-auto w-[92%]">
            <div className="grid grid-cols-2 lg:grid-cols-[1.6fr_0.8fr_1fr_1.2fr] gap-x-6 gap-y-8 md:gap-10 mb-6 md:mb-8">

              {/* Column 1: Description & Social */}
              <div className="col-span-2 lg:col-span-1 flex flex-col gap-4 relative">
                <img src="/images/logo/vl_logo.png" alt="Vian Luxure" className="h-16 md:h-24 w-auto object-contain self-start filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]" />
                <div className="relative">
                  {group === 'Description' && (
                    <div className="absolute -top-8 left-0 px-2.5 py-1 bg-white text-black font-black text-[0.625rem] uppercase tracking-widest rounded-md shadow-xl whitespace-nowrap z-20 flex items-center gap-1.5 border border-stone-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Editing
                    </div>
                  )}
                  <p className={`text-sm leading-relaxed max-w-[20rem] inline-block mt-2 ${group === 'Description' ? highlightClass : 'text-gray-500'}`}>
                    {group === 'Description' ? label : "Comfort isn't just crafted, it's lived. Every thread tells a story of intention."}
                  </p>
                </div>
                <div className="flex gap-3 mt-4 relative">
                  <div className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                    <FacebookIcon />
                  </div>
                  <div className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                    <InstagramIcon />
                  </div>
                  <div className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                    <XIcon />
                  </div>
                  <div className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                    <YoutubeIcon />
                  </div>
                  {group === 'Social' && (
                    <div className="absolute -top-12 -left-2 px-2.5 py-1 bg-white text-black font-black text-[0.625rem] uppercase tracking-widest rounded-md shadow-xl whitespace-nowrap z-20 flex items-center gap-1.5 border border-stone-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Editing Social Items
                    </div>
                  )}
                </div>
              </div>

              {/* Column 2: Links */}
              <div className="col-span-1 flex flex-col gap-4 relative">
                <h3 className="font-bold text-gray-900 text-lg md:text-xl">Links</h3>
                <ul className="flex flex-col gap-3">
                  <li className="text-gray-500 text-[0.9375rem] font-medium">Home</li>
                  <li className="text-gray-500 text-[0.9375rem] font-medium">Blogs</li>
                  <li className="text-gray-500 text-[0.9375rem] font-medium">Events</li>
                  <li className="text-gray-500 text-[0.9375rem] font-medium">About Us</li>
                  <li className="text-gray-500 text-[0.9375rem] font-medium">Contact Us</li>
                  <li className="text-gray-500 text-[0.9375rem] font-medium">Corporate Order</li>
                  {group === 'Links' && (
                    <li className="relative">
                      <div className="absolute -top-8 -left-2 px-2.5 py-1 bg-white text-black font-black text-[0.625rem] uppercase tracking-widest rounded-md shadow-xl whitespace-nowrap z-20 flex items-center gap-1.5 border border-stone-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Editing
                      </div>
                      <span className={`inline-block mt-2 ${highlightClass}`}>{label}</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Column 3: Policy */}
              <div className="col-span-1 flex flex-col gap-4 relative">
                <h3 className="font-bold text-gray-900 text-lg md:text-xl">Policy</h3>
                <ul className="flex flex-col gap-3">
                  <li className="text-gray-500 text-[0.9375rem] font-medium">Shipping Policy</li>
                  <li className="text-gray-500 text-[0.9375rem] font-medium">Terms and Condition</li>
                  <li className="text-gray-500 text-[0.9375rem] font-medium">Cancellation and Refunds</li>
                  <li className="text-gray-500 text-[0.9375rem] font-medium">Privacy Policy</li>
                  {group === 'Policy' && (
                    <li className="relative">
                      <div className="absolute -top-8 -left-2 px-2.5 py-1 bg-white text-black font-black text-[0.625rem] uppercase tracking-widest rounded-md shadow-xl whitespace-nowrap z-20 flex items-center gap-1.5 border border-stone-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Editing
                      </div>
                      <span className={`inline-block mt-2 ${highlightClass}`}>{label}</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Column 4: Contacts */}
              <div className="col-span-2 lg:col-span-1 flex flex-col gap-4 relative">
                <h3 className="font-bold text-gray-900 text-lg md:text-xl">Contacts</h3>
                <div className="flex flex-col gap-3 text-[0.9375rem] font-medium leading-relaxed">
                  {(group !== 'Contacts' || formValues?.item_type !== 'phone') && (
                    <p className="text-gray-500 flex items-center gap-2"><Phone size={16} /> +91 9944944255</p>
                  )}
                  {(group !== 'Contacts' || formValues?.item_type !== 'email') && (
                    <p className="text-gray-500 flex items-center gap-2"><Mail size={16} /> support@vianluxure.com</p>
                  )}
                  {(group !== 'Contacts' || formValues?.item_type !== 'text') && (
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="mt-1 shrink-0 text-gray-500" />
                      <p className="text-gray-500 whitespace-pre-line leading-relaxed">V L Group<br />36/11, CHB Colony Street<br />No-04, Tiruchengode<br />Namakkal-637211<br />Tamil Nadu.</p>
                    </div>
                  )}
                  {group === 'Contacts' && (
                    <div className="relative mt-2">
                      <div className="absolute -top-8 -left-2 px-2.5 py-1 bg-white text-black font-black text-[0.625rem] uppercase tracking-widest rounded-md shadow-xl whitespace-nowrap z-20 flex items-center gap-1.5 border border-stone-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Editing
                      </div>
                      {formValues?.item_type === 'phone' && (
                        <p className={`flex items-center gap-2 mt-2 ${highlightClass}`}><Phone size={16} /> {label}</p>
                      )}
                      {formValues?.item_type === 'email' && (
                        <p className={`flex items-center gap-2 mt-2 ${highlightClass}`}><Mail size={16} /> {label}</p>
                      )}
                      {formValues?.item_type === 'text' && (
                        <div className={`flex items-start gap-2 mt-2 ${highlightClass}`}>
                           <MapPin size={16} className="mt-1 shrink-0" />
                           <p className="whitespace-pre-line">{label}</p>
                        </div>
                      )}
                      {(!formValues?.item_type || !['phone', 'email', 'text'].includes(formValues?.item_type)) && (
                        <span className={`inline-block mt-2 whitespace-pre-line ${highlightClass}`}>{label}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
          {/* BOTTOM SECTION */}
          <div className="pt-4 border-t border-gray-200 text-center">
            <p className="text-gray-400 text-sm md:text-base tracking-wide font-medium">
              © 2026 | All Rights Reserved by Vian Luxure. Designed by Xplore Intellects
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default function MenuManagerIndex() {
  const [activeTab, setActiveTab] = useState('navbar'); // 'navbar' | 'footer'
  const [viewMode, setViewMode] = useState('active'); // 'active' | 'trash'
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const apiFn = useCallback((params) => {
    if (viewMode === 'trash') return trashApi.getDeleted('menu_items', { location: activeTab, ...params });
    return menuItemApi.getMenuItems({ location: activeTab, ...params });
  }, [activeTab, viewMode]);

  const {
    data: items,
    loading,
    fetchData: fetchItems,
  } = useTableData(apiFn, 'Failed to fetch menu items');

  const handleOpenDialog = (item = null) => {
    setCurrentItem(item);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setCurrentItem(null);
    setDialogOpen(false);
  };

  const handleDeleteClick = (item) => {
    setCurrentItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentItem) return;
    try {
      await menuItemApi.deleteMenuItem(currentItem.menu_id);
      toast.success('Item moved to trash');
      fetchItems();
    } catch (error) {
      toast.error(error.message || 'Failed to delete item');
    } finally {
      setDeleteDialogOpen(false);
      setCurrentItem(null);
    }
  };

  const handleRestore = async (row) => {
    try {
      await trashApi.restore('menu_items', row.menu_id);
      toast.success(`Restored "${row.label}".`);
      fetchItems();
    } catch {
      toast.error('Failed to restore item.');
    }
  };

  // Build the extra columns for Footer grouping
  const baseColumns = getMenuColumns({
    onToggleStatus: async (row) => {
      try {
        const newStatus = row.is_active === 1 ? 0 : 1;
        await menuItemApi.updateMenuItem(row.menu_id, { is_active: newStatus });
        toast.success(`Item marked as ${newStatus === 1 ? 'Active' : 'Inactive'}`);
        fetchItems();
      } catch (err) {
        toast.error('Failed to update status');
      }
    }
  });

  const trashActionColumn = {
    id: "actions",
    label: "ACTIONS",
    align: "right",
    render: (row) => (
      <div className="flex justify-end">
        <button
          onClick={() => handleRestore(row)}
          className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs rounded-lg border border-emerald-200 transition-all active:scale-95"
        >
          <RotateCcw size={14} /> Restore
        </button>
      </div>
    )
  };

  const actionColumn = {
    id: "actions",
    label: "ACTIONS",
    align: "right",
    render: (row) => (
      <div className="flex justify-end gap-2">
        <button onClick={() => handleOpenDialog(row)} className="p-1.5 text-gray-500 hover:text-[#C8A64D] hover:bg-[#FAF6F0] rounded-md transition-colors" title="Edit">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <button onClick={() => handleDeleteClick(row)} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      </div>
    )
  };

  const currentBase = activeTab === 'footer'
    ? [{ id: "group_name", label: "GROUP", sortable: true }, ...baseColumns]
    : baseColumns;

  const columns = viewMode === 'trash'
    ? [...currentBase, trashActionColumn]
    : [...currentBase, actionColumn];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Menu Manager</h1>
          <p className="text-sm text-gray-500 mt-1">Manage navbar and footer links across the site.</p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center bg-stone-200/60 p-1 rounded-xl border border-stone-300/60 shrink-0">
            <button
              onClick={() => setViewMode('active')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all ${
                viewMode === 'active'
                  ? 'bg-gradient-to-r from-[#C8A64D] to-[#B39340] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#C8A64D]'
              }`}
            >
              <CheckCircle size={14} />
              <span>Active</span>
            </button>
            <button
              onClick={() => setViewMode('trash')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all ${
                viewMode === 'trash'
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              <Trash2 size={14} />
              <span>Trash</span>
            </button>
          </div>

          {viewMode === 'active' && (
            <button
              onClick={() => handleOpenDialog()}
              className="inline-flex items-center justify-center px-4 py-2 bg-[#C8A64D] hover:bg-[#b59545] text-white rounded-lg transition-colors font-medium text-sm shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add {activeTab === 'navbar' ? 'Navbar Link' : 'Footer Item'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {['navbar', 'footer'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab
                ? 'border-[#C8A64D] text-[#C8A64D]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab === 'navbar' ? 'Navbar Links' : 'Footer Links'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <DataTable
          columns={columns}
          data={items || []}
          onEdit={handleOpenDialog}
          onDelete={handleDeleteClick}
          idField="menu_id"
          loading={loading}
        />
      </div>

      <EntityDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSuccess={fetchItems}
        editData={currentItem || { is_active: 1, order_no: 0, _isNewVariant: true }}
        fields={activeTab === 'footer' ? getFooterFields() : getNavbarFields()}
        apiCreate={menuItemApi.createMenuItem}
        apiUpdate={menuItemApi.updateMenuItem}
        entityLabel={`${activeTab} item`}
        getIdFromData={(data) => data.menu_id}
        buildPayload={(data) => ({ ...data, location: activeTab })}
        renderPreview={(values) => {
          if (activeTab === 'navbar') return <NavbarPreview formValues={values} />;
          if (activeTab === 'footer') return <FooterPreview formValues={values} />;
          return null;
        }}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Menu Item"
        message="Are you sure you want to delete this menu item? It will move to Trash."
      />
    </div>
  );
}
