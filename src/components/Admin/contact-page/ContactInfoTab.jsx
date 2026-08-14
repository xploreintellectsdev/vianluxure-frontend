"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin, Phone, Mail, Loader2, GripVertical, RotateCcw } from 'lucide-react';

const InstagramIcon = ({ size = 18, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const YoutubeIcon = ({ size = 18, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
    <path d="m10 15 5-3-5-3z"/>
  </svg>
);

import { contactApi } from '@/api/contact.api';
import { trashApi } from '@/api/trash.api';
import showToast from '@/sharables/toast';
import EntityDialog from '@/sharables/EntityDialog';
import DeleteConfirmDialog from '@/sharables/DeleteConfirmDialog';
import StatusToggle from '@/sharables/StatusToggle';

const renderIcon = (iconKey, size = 18, className = 'text-stone-600') => {
  if (iconKey === 'phone') return <Phone size={size} className={className} />;
  if (iconKey === 'map-pin') return <MapPin size={size} className={className} />;
  if (iconKey === 'mail') return <Mail size={size} className={className} />;
  if (iconKey === 'instagram') return <InstagramIcon size={size} className={className} />;
  if (iconKey === 'youtube') return <YoutubeIcon size={size} className={className} />;
  return null;
};

const ContactInfoPreview = ({ formValues }) => {
  const type = formValues?.item_type || 'card';

  if (type === 'card') {
    return (
      <div className="w-full h-full min-h-[25rem] flex items-center justify-center bg-[#FDFBF7] p-8 border-y border-[#EAE3D2]">
        <div className="w-full max-w-sm">
          <div className="block border border-gray-300 rounded-2xl p-5 hover:border-gray-500 transition-colors bg-white shadow-sm cursor-pointer group">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                {renderIcon(formValues?.icon_key, 22, 'text-gray-600') || <MapPin size={22} className="text-gray-600" />}
                <h3 className="font-semibold text-gray-900">{formValues?.label || 'Card Title'}</h3>
              </div>
              <svg className="text-gray-400 group-hover:text-black transition-colors" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
            </div>
            <p className="text-gray-600 whitespace-pre-line">{formValues?.value || 'Card details go here...'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'map') {
    let mapUrl = formValues?.value || "";
    if (mapUrl.includes('<iframe') && mapUrl.includes('src="')) {
      const srcMatch = mapUrl.match(/src="([^"]+)"/);
      if (srcMatch && srcMatch[1]) {
        mapUrl = srcMatch[1];
      }
    }

    return (
      <div className="w-full h-full min-h-[25rem] flex flex-col items-center justify-center bg-[#FDFBF7] p-8 border-y border-[#EAE3D2]">
        <div className="w-full max-w-2xl text-center mb-4">
           <h3 className="text-lg font-bold text-slate-900">{formValues?.label || 'Our Location'}</h3>
        </div>
        <div className="w-full max-w-3xl rounded-3xl overflow-hidden border border-gray-200 shadow-lg h-[25rem] bg-stone-100 flex items-center justify-center relative">
          {mapUrl ? (
            <iframe
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          ) : (
             <span className="text-stone-400 font-bold uppercase tracking-widest text-xs">Map Preview</span>
          )}
        </div>
      </div>
    );
  }

  return null;
};

const ContactInfoTab = () => {
  const [items, setItems] = useState([]);
  const [trashedItems, setTrashedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [activeType, setActiveType] = useState('card');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchItems();
    fetchTrashed();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await contactApi.getInfoItems(false);
      setItems(res.data?.data || []);
    } catch (err) {
      showToast.error("Failed to fetch info items");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrashed = async () => {
    try {
      const res = await trashApi.getDeleted('contact_info_items');
      setTrashedItems(res.data?.data || []);
    } catch {
      // silently fail — trash might be empty
    }
  };

  const handleToggle = async (item) => {
    try {
      const newStatus = item.is_active === 1 || item.is_active === true ? 0 : 1;
      await contactApi.updateInfoItem(item.item_id, { ...item, is_active: newStatus });
      showToast.success(`Card marked as ${newStatus ? 'Active' : 'Inactive'}.`);
      fetchItems();
    } catch {
      showToast.error('Failed to update status.');
    }
  };

  const handleDeleteClick = (item) => {
    setDeleteTarget(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await contactApi.deleteInfoItem(deleteTarget.item_id);
      showToast.undo(`Moved "${deleteTarget.label}" to trash.`, async () => {
        try {
          await trashApi.restore('contact_info_items', deleteTarget.item_id);
          showToast.success(`Restored "${deleteTarget.label}".`);
          fetchItems();
          fetchTrashed();
        } catch { showToast.error('Failed to restore.'); }
      });
      fetchItems();
      fetchTrashed();
    } catch {
      showToast.error('Failed to delete item');
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  const handleRestore = async (item) => {
    try {
      await trashApi.restore('contact_info_items', item.item_id);
      showToast.success(`Restored "${item.label}".`);
      fetchItems();
      fetchTrashed();
    } catch {
      showToast.error('Failed to restore item.');
    }
  };

  const handleDragStart = (e, index, type) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ index, type }));
  };

  const handleDrop = async (e, dropIndex, type) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData('text/plain');
    if (!dataStr) return;
    const { index: dragIndex, type: dragType } = JSON.parse(dataStr);
    if (dragType !== type || dragIndex === dropIndex) return;
    const typeItems = items.filter(item => item.item_type === type);
    const updatedTypeItems = [...typeItems];
    const [draggedItem] = updatedTypeItems.splice(dragIndex, 1);
    updatedTypeItems.splice(dropIndex, 0, draggedItem);
    const newOrderPayload = updatedTypeItems.map((item, idx) => ({ id: item.item_id, order_no: (idx + 1) * 10 }));
    const newItemsList = items.map(item => {
      const found = newOrderPayload.find(p => p.id === item.item_id);
      if (found) return { ...item, order_no: found.order_no };
      return item;
    }).sort((a, b) => a.order_no - b.order_no);
    setItems(newItemsList);
    try {
      await contactApi.reorderInfoItems(newOrderPayload);
    } catch {
      showToast.error("Failed to reorder items");
      fetchItems();
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const openDialog = (type, item = null) => {
    setActiveType(type);
    setEditItem(item);
    setDialogOpen(true);
  };

  const cards = items.filter(item => item.item_type === 'card');
  const mapItem = items.find(item => item.item_type === 'map');
  const trashedCards = trashedItems.filter(item => item.item_type === 'card');
  const trashedMaps = trashedItems.filter(item => item.item_type === 'map');

  const fields = [
    { name: 'item_type', label: 'Item Type', type: 'text', defaultValue: activeType, showIf: () => false },
    ...(activeType === 'card' ? [
      {
        name: 'icon_key', label: 'Icon', type: 'select',
        options: [
          { value: 'phone', label: 'Phone' },
          { value: 'map-pin', label: 'Map Pin' },
          { value: 'mail', label: 'Email' },
          { value: 'instagram', label: 'Instagram' },
          { value: 'youtube', label: 'YouTube' }
        ],
        validation: { required: 'Icon is required' }
      },
      { name: 'label', label: 'Title', type: 'text', placeholder: 'e.g. Whatsapp Number', validation: { required: 'Title is required' } },
      { name: 'value', label: 'Display Text', type: 'textarea', placeholder: 'e.g. +91 99449 44255', validation: { required: 'Display text is required' } },
      { name: 'link_url', label: 'Link URL (Optional)', type: 'text', placeholder: 'e.g. https://wa.me/919944944255' },
      { name: 'order_no', label: 'Order Level', type: 'number', placeholder: 'e.g. 10', defaultValue: 0 }
    ] : [
      { name: 'label', label: 'Map Label', type: 'text', placeholder: 'e.g. Our Location', validation: { required: 'Label is required' } },
      { name: 'value', label: 'Google Maps Embed URL', type: 'textarea', placeholder: 'https://maps.google.com/maps?...', validation: { required: 'Embed URL is required' } }
    ]),
    { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true }
  ];

  if (loading) {
    return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#C8A64D]" /></div>;
  }

  return (
    <div className="p-6 sm:p-8 space-y-10">

      {/* ── INFO CARDS SECTION ── */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-serif font-bold text-slate-900">Info Cards</h2>
            <p className="text-sm text-slate-500">Manage the 'Let's Connect' cards (Whatsapp, Email, Address)</p>
          </div>
          <button
            onClick={() => openDialog('card')}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-md hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <Plus size={16} /> Add Card
          </button>
        </div>

        <div className="space-y-3">
          {cards.length === 0 ? (
            <div className="text-center py-10 bg-stone-50 rounded-2xl border border-stone-200 text-stone-500">
              No info cards added yet.
            </div>
          ) : (
            cards.map((card, idx) => (
              <div
                key={card.item_id}
                draggable
                onDragStart={(e) => handleDragStart(e, idx, 'card')}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, idx, 'card')}
                className={`bg-white border rounded-2xl p-4 flex items-center justify-between gap-4 transition-all hover:border-[#C8A64D]/40 hover:shadow-sm overflow-hidden ${card.is_active ? 'border-stone-200' : 'border-stone-200 opacity-60 bg-stone-50/50'}`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="cursor-grab active:cursor-grabbing p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors shrink-0">
                    <GripVertical size={18} />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                    {renderIcon(card.icon_key)}
                  </div>
                  <div className="min-w-0 flex-1 pr-4">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{card.label}</h3>
                    <p className="text-sm text-slate-500 line-clamp-1 break-all">{card.value}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusToggle isActive={card.is_active} onToggle={() => handleToggle(card)} />
                  <button onClick={() => openDialog('card', card)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDeleteClick(card)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="w-full h-px border-t border-dashed border-stone-300"></div>

      {/* ── MAP SECTION ── */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-serif font-bold text-slate-900">Map Embed</h2>
            <p className="text-sm text-slate-500">Manage the Google Maps iframe URL</p>
          </div>
          {!mapItem && (
            <button
              onClick={() => openDialog('map')}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-md hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <Plus size={16} /> Add Map
            </button>
          )}
        </div>

        {mapItem ? (
          <div className={`bg-white border rounded-2xl p-4 flex items-center justify-between gap-4 transition-all hover:border-[#C8A64D]/40 hover:shadow-sm ${mapItem.is_active ? 'border-stone-200' : 'border-stone-200 opacity-60 bg-stone-50/50'}`}>
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-stone-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{mapItem.label}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1 break-all font-mono bg-stone-50 p-2 rounded border border-stone-100">{mapItem.value}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <StatusToggle isActive={mapItem.is_active} onToggle={() => handleToggle(mapItem)} />
              <button onClick={() => openDialog('map', mapItem)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDeleteClick(mapItem)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 bg-stone-50 rounded-2xl border border-stone-200 text-stone-500">
            No map embed configured.
          </div>
        )}
      </div>

      {/* ── TRASH SECTION ── */}
      {(trashedCards.length > 0 || trashedMaps.length > 0) && (
        <>
          <div className="w-full h-px border-t border-dashed border-stone-300"></div>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Trash2 size={18} className="text-amber-700" />
              <h2 className="text-xl font-serif font-bold text-amber-700">Trash</h2>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                {trashedCards.length + trashedMaps.length} items
              </span>
            </div>
            <div className="space-y-3">
              {[...trashedCards, ...trashedMaps].map((item) => (
                <div
                  key={item.item_id}
                  className="bg-stone-50 border border-dashed border-stone-300 rounded-2xl p-4 flex items-center justify-between gap-4 opacity-70"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center shrink-0">
                      {item.item_type === 'map'
                        ? <MapPin size={18} className="text-stone-500" />
                        : renderIcon(item.icon_key, 18, 'text-stone-500')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-600 truncate">{item.label}</h3>
                      <p className="text-xs text-slate-400 line-clamp-1 break-all">{item.value}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRestore(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs rounded-lg border border-emerald-200 transition-all active:scale-95 shrink-0"
                  >
                    <RotateCcw size={14} /> Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <EntityDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={fetchItems}
        editData={editItem}
        fields={fields}
        apiCreate={contactApi.createInfoItem}
        apiUpdate={contactApi.updateInfoItem}
        entityLabel={activeType === 'card' ? 'Info Card' : 'Map Embed'}
        getIdFromData={(data) => data.item_id}
        buildPayload={(data) => ({ ...data, item_type: activeType })}
        renderPreview={(values) => <ContactInfoPreview formValues={values} />}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setDeleteTarget(null); }}
        onConfirm={confirmDelete}
        itemName={deleteTarget?.label || 'this item'}
      />
    </div>
  );
};

export default ContactInfoTab;
