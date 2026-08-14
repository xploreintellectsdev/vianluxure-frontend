'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Pencil, FileText, Plus, ChevronRight, Trash2, RotateCcw, Eye, EyeOff, Save, Layout, BarChart2, Grid, Settings, X } from 'lucide-react';
import { policyApi } from '@/api/policy.api';
import showToast from '@/sharables/toast';
import DeleteConfirmDialog from '@/sharables/DeleteConfirmDialog';
import StatusToggle from '@/sharables/StatusToggle';
import { PolicyIcon } from '@/components/Users/policy/PolicyIcon';
import { renderPolicyContent } from '@/utils/renderPolicyContent';

// ─────────────────────────────────────────────
// Inline Live Preview (mirrors DynamicPolicyPage)
// ─────────────────────────────────────────────
const LivePolicyCard = ({ icon, title, content }) => (
  <div className="rounded-2xl border p-6 transition-all duration-300 h-full" style={{ borderColor: 'rgba(201,162,93,0.35)', background: '#FFFDF7' }}>
    <div className="flex items-start gap-3 mb-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border" style={{ background: 'rgba(201,162,93,0.14)', borderColor: 'rgba(201,162,93,0.4)', color: '#9c7a35' }}>
        <PolicyIcon name={icon} className="w-4 h-4" />
      </div>
      {title && <h3 className="pt-1.5 text-base font-semibold tracking-tight" style={{ color: '#1a1611', fontFamily: 'Georgia, serif' }}>{title}</h3>}
    </div>
    {content && (
      <div className="text-sm space-y-2 [&_strong]:font-semibold [&_ul]:space-y-1 [&_li]:text-sm [&_p]:text-sm [&_p]:leading-relaxed" style={{ color: '#4a4238' }}>
        {renderPolicyContent(content)}
      </div>
    )}
  </div>
);

const LiveStatCard = ({ stat_value, stat_unit, stat_label, stat_caption }) => (
  <div className="rounded-2xl p-6 text-center border" style={{ background: '#141210', borderColor: 'rgba(201,162,93,0.35)' }}>
    <p className="text-4xl font-bold" style={{ color: '#dcb96a' }}>{stat_value || '—'}</p>
    <p className="text-xs mt-1 tracking-widest uppercase" style={{ color: 'rgba(253,249,239,0.5)' }}>{stat_unit || 'unit'}</p>
    <p className="mt-3 font-semibold text-sm" style={{ color: '#FDF9EF' }}>{stat_label || 'Label'}</p>
    {stat_caption && <p className="text-xs mt-1" style={{ color: 'rgba(253,249,239,0.55)' }}>{stat_caption}</p>}
  </div>
);

// ─────────────────────────────────────────────
// Section Form (inline, no modal)
// ─────────────────────────────────────────────
const ICON_OPTIONS = [
  'pin','globe','tag','shield','clock','alert','address','box','x','mail','crown',
  'document','users','copyright','card','shieldOff','droplet','eye','xCircle','refresh','ban','swap'
];

const SectionForm = ({ groupName, editData, onSave, onCancel, sections }) => {
  const isNew = !editData?.section_id;
  const defaultType = groupName === 'stats' ? 'stat' : 'card';

  const [formValues, setFormValues] = useState(() => ({
    section_type: editData?.section_type || defaultType,
    icon: editData?.icon || '',
    title: editData?.title || '',
    content: editData?.content || '',
    stat_value: editData?.stat_value || '',
    stat_unit: editData?.stat_unit || '',
    stat_label: editData?.stat_label || '',
    stat_caption: editData?.stat_caption || '',
    order_no: editData?.order_no !== undefined && editData?.order_no !== null ? String(editData.order_no) : '',
    is_active: editData?.is_active !== undefined ? Boolean(editData.is_active) : true,
  }));

  const [saving, setSaving] = useState(false);

  const set = (key, val) => setFormValues(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let orderNo = formValues.order_no !== '' ? parseInt(formValues.order_no, 10) : null;
      if (orderNo === null || isNaN(orderNo)) {
        // Auto-assign next sequential number
        const groupSections = sections.filter(s => s.group_name === groupName);
        orderNo = groupSections.length + 1;
      }
      await onSave({ ...formValues, order_no: orderNo, is_active: formValues.is_active ? 1 : 0 });
    } finally {
      setSaving(false);
    }
  };

  const isCard = formValues.section_type === 'card';
  const isStat = formValues.section_type === 'stat';

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 bg-stone-50/70 flex items-center justify-between">
          <h3 className="font-semibold text-stone-800 text-sm">{isNew ? 'Add New Section' : 'Edit Section'}</h3>
          <button type="button" onClick={onCancel} className="text-stone-400 hover:text-stone-700 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* Section Type */}
          {groupName !== 'stats' && (
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wider">Section Type</label>
              <div className="flex gap-2">
                {[{ value: 'card', label: 'Policy Card' }, { value: 'stat', label: 'Stat Block' }].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set('section_type', opt.value)}
                    className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold border transition-all ${formValues.section_type === opt.value ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Card Fields */}
          {isCard && (
            <>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wider">Icon</label>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 p-3 bg-stone-50 border border-stone-200 rounded-xl max-h-36 overflow-y-auto">
                  {ICON_OPTIONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => set('icon', icon)}
                      title={icon}
                      className={`flex items-center justify-center h-9 w-9 rounded-lg border transition-all ${formValues.icon === icon ? 'bg-stone-900 border-stone-900 text-white' : 'bg-white border-stone-200 text-stone-500 hover:border-stone-400'}`}
                    >
                      <PolicyIcon name={icon} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
                {formValues.icon && <p className="mt-1 text-xs text-stone-400">Selected: <span className="font-semibold text-stone-600">{formValues.icon}</span></p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wider">Title</label>
                <input
                  type="text" value={formValues.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="Card title..."
                  className="w-full h-10 px-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wider">Content</label>
                <textarea
                  value={formValues.content}
                  onChange={e => set('content', e.target.value)}
                  rows={6}
                  placeholder={'Use "- " for bullet points\nDouble newline for paragraphs\n**bold** for bold text'}
                  className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all resize-y leading-relaxed"
                />
                <p className="text-xs text-stone-400 mt-1">Use <code className="bg-stone-100 px-1 rounded">- item</code> for bullets, <code className="bg-stone-100 px-1 rounded">**text**</code> for bold</p>
              </div>
            </>
          )}

          {/* Stat Fields */}
          {isStat && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wider">Value</label>
                  <input type="text" value={formValues.stat_value} onChange={e => set('stat_value', e.target.value)} placeholder="e.g. 7-10" className="w-full h-10 px-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wider">Unit</label>
                  <input type="text" value={formValues.stat_unit} onChange={e => set('stat_unit', e.target.value)} placeholder="e.g. days" className="w-full h-10 px-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wider">Label</label>
                <input type="text" value={formValues.stat_label} onChange={e => set('stat_label', e.target.value)} placeholder="e.g. Major Metro Cities" className="w-full h-10 px-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wider">Caption</label>
                <input type="text" value={formValues.stat_caption} onChange={e => set('stat_caption', e.target.value)} placeholder="e.g. from order confirmation" className="w-full h-10 px-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all" />
              </div>
            </>
          )}

          {/* Order & Active */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-100">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wider">Order No.</label>
              <input
                type="number" min="1"
                value={formValues.order_no}
                onChange={e => set('order_no', e.target.value)}
                placeholder="Auto"
                className="w-full h-10 px-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
              />
              <p className="text-xs text-stone-400 mt-0.5">Leave blank for auto</p>
            </div>
            <div className="flex flex-col justify-center">
              <label className="block text-xs font-semibold text-stone-600 mb-2 uppercase tracking-wider">Active</label>
              <button
                type="button"
                onClick={() => set('is_active', !formValues.is_active)}
                className={`flex items-center gap-2 h-10 px-3 rounded-xl border text-sm font-semibold transition-all ${formValues.is_active ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-stone-50 border-stone-200 text-stone-500'}`}
              >
                {formValues.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                {formValues.is_active ? 'Visible' : 'Hidden'}
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-stone-100 bg-stone-50/50 flex gap-2 justify-end">
          <button type="button" onClick={onCancel} className="px-4 h-9 text-sm font-semibold text-stone-600 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-all">Cancel</button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 h-9 text-sm font-semibold text-white bg-stone-900 rounded-xl hover:bg-stone-800 disabled:opacity-60 transition-all">
            <Save size={14} />
            {saving ? 'Saving…' : (isNew ? 'Add Section' : 'Save Changes')}
          </button>
        </div>
      </form>

      {/* ── Live Preview ── */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 bg-white flex items-center gap-2">
          <Eye size={14} className="text-amber-500" />
          <h3 className="font-semibold text-stone-800 text-sm">Live Preview</h3>
        </div>
        <div className="p-5">
          {isCard ? (
            <LivePolicyCard icon={formValues.icon} title={formValues.title} content={formValues.content} />
          ) : (
            <div className="max-w-xs mx-auto">
              <LiveStatCard
                stat_value={formValues.stat_value}
                stat_unit={formValues.stat_unit}
                stat_label={formValues.stat_label}
                stat_caption={formValues.stat_caption}
              />
            </div>
          )}
          <p className="text-center text-xs text-stone-400 mt-4">This is how it will look on the public page</p>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Section Row (table-style list item)
// ─────────────────────────────────────────────
const SectionRow = ({ section, onEdit, onDelete, onToggle, onRestore, isTrash }) => {
  const isCard = section.section_type === 'card';
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors group">
      <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-500">{section.order_no}</div>
      {isCard && section.icon && (
        <div className="flex-shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center" style={{ background: 'rgba(201,162,93,0.1)', borderColor: 'rgba(201,162,93,0.3)', color: '#9c7a35' }}>
          <PolicyIcon name={section.icon} className="w-3.5 h-3.5" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-stone-800 truncate">
          {isCard ? (section.title || 'Untitled Card') : `${section.stat_value} ${section.stat_unit} — ${section.stat_label}`}
        </p>
        {isCard && section.content && (
          <p className="text-xs text-stone-400 truncate">{section.content.slice(0, 60)}…</p>
        )}
      </div>
      <span className={`flex-shrink-0 text-[0.625rem] font-bold uppercase px-2 py-0.5 rounded-full ${isCard ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
        {isCard ? 'Card' : 'Stat'}
      </span>
      <div className="flex items-center gap-2 flex-shrink-0">
        {isTrash ? (
          <button onClick={() => onRestore(section)} className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-all">
            <RotateCcw size={12} /> Restore
          </button>
        ) : (
          <>
            <StatusToggle isActive={section.is_active} onToggle={() => onToggle(section)} />
            <button onClick={() => onEdit(section)} className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors opacity-0 group-hover:opacity-100" title="Edit">
              <Pencil size={14} />
            </button>
            <button onClick={() => onDelete(section)} className="p-1.5 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100" title="Delete">
              <Trash2 size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Group Tab Panel (Main Grid / Stats / Footer Grid)
// ─────────────────────────────────────────────
const GroupPanel = ({ groupName, sections, loading, onRefresh, selectedPage, viewMode, setViewMode }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const groupSections = sections
    .filter(s => s.group_name === groupName)
    .sort((a, b) => (a.order_no || 0) - (b.order_no || 0));

  const handleEdit = (row) => {
    setEditingSection(row);
    setShowForm(true);
  };

  const handleSave = async (formData) => {
    try {
      const payload = {
        ...formData,
        page_id: selectedPage.page_id,
        group_name: groupName,
      };
      if (editingSection?.section_id) {
        await policyApi.updateSection(editingSection.section_id, payload);
        showToast.success('Section updated.');
      } else {
        await policyApi.createSection(selectedPage.page_id, payload);
        showToast.success('Section added.');
      }
      setShowForm(false);
      setEditingSection(null);
      onRefresh();
    } catch (err) {
      showToast.error('Failed to save section.');
    }
  };

  const handleToggle = async (row) => {
    try {
      const newStatus = row.is_active === 1 ? 0 : 1;
      await policyApi.updateSection(row.section_id, { ...row, is_active: newStatus });
      showToast.success(`Marked as ${newStatus ? 'active' : 'inactive'}.`);
      onRefresh();
    } catch {
      showToast.error('Failed to update.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const name = deleteTarget.title || deleteTarget.stat_label || 'Section';
      await policyApi.deleteSection(deleteTarget.section_id);
      setDeleteTarget(null);
      onRefresh();
      showToast.undo(`Moved "${name}" to trash.`, async () => {
        try { await policyApi.restoreSection(deleteTarget.section_id); onRefresh(); } catch {}
      });
    } catch {
      showToast.error('Failed to delete.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRestore = async (row) => {
    try {
      await policyApi.restoreSection(row.section_id);
      showToast.success('Section restored.');
      onRefresh();
    } catch {
      showToast.error('Failed to restore.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Active / Trash toggle */}
          <div className="flex bg-stone-100 p-1 rounded-lg gap-1">
            {['active', 'trash'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === mode ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                {mode === 'active' ? 'Active' : 'Trash'}
              </button>
            ))}
          </div>
          <span className="text-xs text-stone-400">{groupSections.length} section{groupSections.length !== 1 ? 's' : ''}</span>
        </div>
        {viewMode === 'active' && !showForm && (
          <button
            onClick={() => { setEditingSection(null); setShowForm(true); }}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={14} /> Add Section
          </button>
        )}
      </div>

      {/* Inline form */}
      {showForm && viewMode === 'active' && (
        <SectionForm
          groupName={groupName}
          editData={editingSection}
          sections={sections.filter(s => s.group_name === groupName)}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingSection(null); }}
        />
      )}

      {/* Sections list */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col gap-2 p-4">
            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-stone-100 rounded-xl animate-pulse" />)}
          </div>
        ) : groupSections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mb-3">
              <FileText size={20} className="text-stone-300" />
            </div>
            <p className="text-sm font-semibold text-stone-500">{viewMode === 'trash' ? 'No deleted sections' : 'No sections yet'}</p>
            {viewMode === 'active' && <p className="text-xs text-stone-400 mt-1">Click "Add Section" to get started</p>}
          </div>
        ) : (
          groupSections.map(section => (
            <SectionRow
              key={section.section_id}
              section={section}
              onEdit={handleEdit}
              onDelete={(row) => setDeleteTarget(row)}
              onToggle={handleToggle}
              onRestore={handleRestore}
              isTrash={viewMode === 'trash'}
            />
          ))
        )}
      </div>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Section"
        message="Move this section to trash? You can restore it later."
        loading={deleteLoading}
      />
    </div>
  );
};

// ─────────────────────────────────────────────
// Page Details Tab
// ─────────────────────────────────────────────
const PageDetailsTab = ({ page, onUpdate }) => {
  const [values, setValues] = useState({
    hero_eyebrow: page.hero_eyebrow || '',
    hero_title: page.hero_title || '',
    hero_subtitle: page.hero_subtitle || '',
    intro_note: page.intro_note || '',
    is_active: page.is_active === 1,
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setValues(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await policyApi.updatePage(page.page_id, { ...values, is_active: values.is_active ? 1 : 0 });
      showToast.success('Page details saved.');
      onUpdate({ ...page, ...values, is_active: values.is_active ? 1 : 0 });
    } catch {
      showToast.error('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 bg-stone-50/70">
          <h3 className="font-semibold text-stone-800 text-sm">Page Metadata</h3>
          <p className="text-xs text-stone-400 mt-0.5">This controls the hero section at the top of the policy page</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wider">Eyebrow Text</label>
              <input value={values.hero_eyebrow} onChange={e => set('hero_eyebrow', e.target.value)} placeholder="e.g. Policy" className="w-full h-10 px-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wider">Page Key</label>
              <input value={page.page_key} readOnly className="w-full h-10 px-3 border border-stone-100 bg-stone-50 rounded-xl text-sm text-stone-400 cursor-not-allowed" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wider">Hero Title *</label>
            <input required value={values.hero_title} onChange={e => set('hero_title', e.target.value)} placeholder="e.g. Shipping Policy" className="w-full h-10 px-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wider">Hero Subtitle</label>
            <input value={values.hero_subtitle} onChange={e => set('hero_subtitle', e.target.value)} placeholder="Optional subtitle under the title" className="w-full h-10 px-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wider">Intro Note</label>
            <textarea value={values.intro_note} onChange={e => set('intro_note', e.target.value)} rows={4} placeholder="Brief introductory note shown below the hero..." className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all resize-y" />
          </div>
          <div className="flex items-center gap-3 py-1">
            <button
              type="button"
              onClick={() => set('is_active', !values.is_active)}
              className={`relative flex-shrink-0 h-6 w-11 rounded-full transition-colors ${values.is_active ? 'bg-emerald-500' : 'bg-stone-200'}`}
            >
              <span className={`absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full shadow transition-transform ${values.is_active ? 'translate-x-5' : ''}`} />
            </button>
            <span className="text-sm font-semibold text-stone-700">{values.is_active ? 'Page is Active (visible to users)' : 'Page is Inactive (hidden)'}</span>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-stone-100 bg-stone-50/50 flex justify-end">
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 h-9 text-sm font-semibold text-white bg-stone-900 rounded-xl hover:bg-stone-800 disabled:opacity-60 transition-all">
            <Save size={14} /> {saving ? 'Saving…' : 'Save Details'}
          </button>
        </div>
      </form>

      {/* Hero Preview */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 bg-white flex items-center gap-2">
          <Eye size={14} className="text-amber-500" />
          <h3 className="font-semibold text-stone-800 text-sm">Hero Preview</h3>
        </div>
        <div className="p-5">
          <div className="rounded-2xl overflow-hidden" style={{ background: '#141210' }}>
            <div className="px-6 py-8 text-center relative">
              <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(201,162,93,0.16) 0%, transparent 60%)' }} />
              <div className="relative">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="h-px w-6" style={{ background: '#c9a25d' }} />
                  <PolicyIcon name="crown" className="w-4 h-4" style={{ color: '#c9a25d' }} />
                  <span className="h-px w-6" style={{ background: '#c9a25d' }} />
                </div>
                <p className="text-xs uppercase tracking-[0.3em] mb-3 font-medium" style={{ color: '#c9a25d' }}>
                  {values.hero_eyebrow || 'Eyebrow'}
                </p>
                <h1 className="text-2xl font-bold mb-3" style={{ color: '#FDF9EF', fontFamily: 'Georgia, serif' }}>
                  {values.hero_title || 'Page Title'}
                </h1>
                {values.hero_subtitle && (
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(253,249,239,0.72)' }}>
                    {values.hero_subtitle}
                  </p>
                )}
              </div>
            </div>
            {values.intro_note && (
              <div className="mx-4 mb-4 rounded-xl px-4 py-3 text-xs leading-relaxed border" style={{ borderColor: 'rgba(201,162,93,0.4)', background: '#FDF9EF', color: '#3d362c' }}>
                {values.intro_note}
              </div>
            )}
          </div>
          <p className="text-center text-xs text-stone-400 mt-4">Hero section preview</p>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main PolicyPagesManager Component
// ─────────────────────────────────────────────
const TABS = [
  { id: 'details',     label: 'Page Details',    icon: Settings },
  { id: 'main-grid',  label: 'Main Grid Cards',  icon: Grid },
  { id: 'stats',      label: 'Delivery Stats',   icon: BarChart2 },
  { id: 'footer-grid',label: 'Footer Cards',     icon: Layout },
];

export default function PolicyPagesManager() {
  const [pages, setPages] = useState([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [selectedPage, setSelectedPage] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [sections, setSections] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('active');
  const [createPageDialog, setCreatePageDialog] = useState(false);

  // New page form state
  const [newPage, setNewPage] = useState({ page_key: '', hero_title: '', hero_eyebrow: 'Policy', hero_subtitle: '', intro_note: '', is_active: true });
  const [creatingPage, setCreatingPage] = useState(false);

  const fetchPages = useCallback(async () => {
    setLoadingPages(true);
    try {
      const res = await policyApi.getAllPages();
      setPages(res.data || []);
    } catch {
      showToast.error('Failed to load policy pages.');
    } finally {
      setLoadingPages(false);
    }
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const fetchSections = useCallback(async () => {
    if (!selectedPage) return;
    setSectionsLoading(true);
    try {
      const res = await policyApi.getSections(selectedPage.page_id, { trashed: viewMode === 'trash' });
      setSections(res.data || []);
    } catch {
      showToast.error('Failed to load sections.');
    } finally {
      setSectionsLoading(false);
    }
  }, [selectedPage, viewMode]);

  useEffect(() => { fetchSections(); }, [fetchSections]);

  const handleCreatePage = async (e) => {
    e.preventDefault();
    if (!newPage.page_key || !newPage.hero_title) return showToast.error('Page Key and Title are required.');
    setCreatingPage(true);
    try {
      await policyApi.createPage({ ...newPage, is_active: newPage.is_active ? 1 : 0 });
      showToast.success('Policy page created.');
      setCreatePageDialog(false);
      setNewPage({ page_key: '', hero_title: '', hero_eyebrow: 'Policy', hero_subtitle: '', intro_note: '', is_active: true });
      fetchPages();
    } catch {
      showToast.error('Failed to create page.');
    } finally {
      setCreatingPage(false);
    }
  };

  // ── Page List View ──
  if (!selectedPage) {
    return (
      <div className="p-6 md:p-10 max-w-[75rem] mx-auto min-h-screen">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Policy Pages</h1>
            <p className="text-stone-500 mt-1 text-sm">Manage all your policy pages and their content.</p>
          </div>
          <button onClick={() => setCreatePageDialog(true)} className="flex items-center gap-2 text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 px-4 py-2 rounded-xl transition-colors">
            <Plus size={16} /> Add Policy Page
          </button>
        </div>

        {loadingPages ? (
          <div className="animate-pulse grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4].map(i => <div key={i} className="h-40 bg-stone-100 rounded-2xl" />)}
          </div>
        ) : pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText size={40} className="text-stone-200 mb-4" />
            <p className="text-stone-500 font-semibold">No policy pages yet.</p>
            <button onClick={() => setCreatePageDialog(true)} className="mt-4 text-sm text-amber-600 font-semibold hover:underline">Create your first page →</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pages.map(page => (
              <button
                key={page.page_id}
                onClick={() => { setSelectedPage(page); setActiveTab('details'); }}
                className="flex flex-col text-left p-6 bg-white border border-stone-200 rounded-2xl hover:border-amber-300 hover:shadow-lg hover:shadow-amber-500/10 transition-all group"
              >
                <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center text-stone-400 group-hover:text-amber-600 group-hover:bg-amber-50 mb-4 transition-colors">
                  <FileText size={24} />
                </div>
                <h3 className="font-semibold text-lg text-stone-800">{page.hero_title || page.page_key}</h3>
                <p className="text-xs text-stone-400 mt-1 font-mono">{page.page_key}</p>
                <div className="mt-4 flex items-center justify-between w-full pt-4 border-t border-stone-100">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${page.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {page.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <ChevronRight size={18} className="text-stone-300 group-hover:text-amber-500 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Create Page Modal */}
        {createPageDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
                <h2 className="font-bold text-stone-800">Create Policy Page</h2>
                <button onClick={() => setCreatePageDialog(false)} className="text-stone-400 hover:text-stone-700 transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleCreatePage} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wider">Page Key *</label>
                  <select
                    required
                    value={newPage.page_key}
                    onChange={e => setNewPage(p => ({ ...p, page_key: e.target.value }))}
                    className="w-full h-10 px-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all bg-white"
                  >
                    <option value="">Select a page key…</option>
                    {['ShippingPolicy','TermsAndConditions','PrivacyPolicy','CancellationAndRefunds']
                      .filter(k => !pages.find(p => p.page_key === k))
                      .map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wider">Eyebrow</label>
                    <input value={newPage.hero_eyebrow} onChange={e => setNewPage(p => ({ ...p, hero_eyebrow: e.target.value }))} placeholder="Policy" className="w-full h-10 px-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wider">Title *</label>
                    <input required value={newPage.hero_title} onChange={e => setNewPage(p => ({ ...p, hero_title: e.target.value }))} placeholder="Shipping Policy" className="w-full h-10 px-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wider">Subtitle</label>
                  <input value={newPage.hero_subtitle} onChange={e => setNewPage(p => ({ ...p, hero_subtitle: e.target.value }))} placeholder="Optional subtitle" className="w-full h-10 px-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wider">Intro Note</label>
                  <textarea value={newPage.intro_note} onChange={e => setNewPage(p => ({ ...p, intro_note: e.target.value }))} rows={3} placeholder="Optional intro note..." className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all resize-none" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="np_active" checked={newPage.is_active} onChange={e => setNewPage(p => ({ ...p, is_active: e.target.checked }))} className="w-4 h-4 rounded accent-amber-500" />
                  <label htmlFor="np_active" className="text-sm font-semibold text-stone-700">Active</label>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setCreatePageDialog(false)} className="flex-1 h-10 text-sm font-semibold text-stone-600 bg-stone-100 rounded-xl hover:bg-stone-200 transition-all">Cancel</button>
                  <button type="submit" disabled={creatingPage} className="flex-1 h-10 text-sm font-semibold text-white bg-stone-900 rounded-xl hover:bg-stone-800 disabled:opacity-60 transition-all">
                    {creatingPage ? 'Creating…' : 'Create Page'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Page Edit View (with tabs) ──
  return (
    <div className="p-6 md:p-10 max-w-[75rem] mx-auto min-h-screen">
      {/* Breadcrumb + Page Title */}
      <div className="mb-6">
        <button onClick={() => setSelectedPage(null)} className="text-sm text-stone-500 hover:text-stone-800 flex items-center gap-1 mb-3 transition-colors font-semibold">
          ← Back to All Policies
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">{selectedPage.hero_title || selectedPage.page_key}</h1>
            <p className="text-xs text-stone-400 font-mono mt-1">{selectedPage.page_key}</p>
          </div>
          <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${selectedPage.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
            {selectedPage.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* ── 4 Tabs ── */}
      <div className="border-b border-stone-200 mb-6">
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setViewMode('active'); }}
                className={`flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-stone-900 text-stone-900'
                    : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Tab Content ── */}
      <div>
        {activeTab === 'details' && (
          <PageDetailsTab
            page={selectedPage}
            onUpdate={(updatedPage) => setSelectedPage(updatedPage)}
          />
        )}
        {(activeTab === 'main-grid' || activeTab === 'stats' || activeTab === 'footer-grid') && (
          <GroupPanel
            groupName={activeTab}
            sections={sections}
            loading={sectionsLoading}
            onRefresh={fetchSections}
            selectedPage={selectedPage}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        )}
      </div>
    </div>
  );
}
