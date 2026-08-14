import React, { useState, useEffect } from 'react';
import { pageFaqApi } from '@/api/pageFaq.api';
import showToast from '@/sharables/toast';
import { Plus, Edit2, Trash2, GripVertical, Loader2 } from 'lucide-react';
import EntityDialog from '@/sharables/EntityDialog';
import DeleteConfirmDialog from '@/sharables/DeleteConfirmDialog';
import ActiveTrashBar from '@/sharables/ActiveTrashBar';
import { RotateCcw, Minus } from 'lucide-react';
import HeroFAQ from '@/components/Users/shop/components/FaqHero';

const FaqPreview = ({ formValues }) => {
  const isActive = formValues?.is_active ?? true;
  
  return (
    <div className="w-full h-full min-h-[12.5rem] flex items-center justify-center bg-[#FDFBF7] p-8 border-y border-stone-200">
      <div className="w-full max-w-2xl bg-white border border-[#e0e0e0] rounded-2xl shadow-sm overflow-hidden group">
        <button className={`w-full flex items-center justify-between gap-6 py-5 md:py-6 px-6 text-left transition-colors duration-300 ${isActive ? 'hover:bg-stone-50' : 'bg-red-50/50 opacity-75'}`}>
          <span className={`text-[1.125rem] md:text-[1.25rem] font-medium leading-snug transition-colors duration-300 pr-4 ${isActive ? 'text-[#cba962]' : 'text-red-700 line-through'}`}>
            {formValues?.question || 'FAQ Question?'}
          </span>
          <span className={`flex-shrink-0 w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-500 ease-out ${isActive ? 'bg-[#cba962] border-[#cba962] text-white shadow-md' : 'bg-red-100 border-red-300 text-red-500'}`}>
            <Minus size={18} strokeWidth={2} />
          </span>
        </button>
        <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] grid-rows-[1fr] opacity-100 px-6 pb-6`}>
          <div className="overflow-hidden border-t border-stone-100 pt-6">
            <p className={`text-[0.9375rem] md:text-[1rem] leading-[1.7] pr-6 md:pr-12 ${isActive ? 'text-[#555555]' : 'text-red-500'}`}>
              {formValues?.answer || 'FAQ answer text goes here. It provides a detailed response to the question above.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function FaqTab({ pageKey }) {
  const [section, setSection] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(false);
  const [viewMode, setViewMode] = useState('active');
  
  // Section form state
  const [subtitle, setSubtitle] = useState('');
  const [title, setTitle] = useState('');
  const [footerText, setFooterText] = useState('');

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingFaq, setDeletingFaq] = useState(null);

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
      const res = await pageFaqApi.getByPage(pageKey, false, viewMode);
      if (res?.success && res?.data) {
        const faqSection = res.data;
        setSection(faqSection);
        setSubtitle(faqSection.subtitle || '');
        setTitle(faqSection.title || '');
        setFooterText(faqSection.footer_text || '');
        setFaqs(faqSection.faqs || []);
      } else {
        setSection(null);
        setSubtitle('');
        setTitle('');
        setFooterText('');
        setFaqs([]);
      }
    } catch (err) {
      console.error(err);
      showToast.error('Failed to load FAQ data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async () => {
    try {
      setSavingSection(true);
      await pageFaqApi.upsertSection(pageKey, {
        subtitle,
        title,
        footer_text: footerText,
        is_active: section?.is_active ?? 1
      });
      showToast.success('FAQ Section details saved');
      fetchData(false);
    } catch (err) {
      console.error(err);
      showToast.error('Failed to save FAQ section');
    } finally {
      setSavingSection(false);
    }
  };

  const handleOpenDialog = (faq = null) => {
    setEditingFaq(faq);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingFaq) return;
    try {
      await pageFaqApi.deleteFaq(deletingFaq.faq_id);
      showToast.success('FAQ moved to trash');
      setIsDeleteDialogOpen(false);
      fetchData(false);
    } catch (err) {
      console.error(err);
      showToast.error('Failed to move FAQ to trash');
    }
  };

  const handleRestore = async (faq) => {
    try {
      await pageFaqApi.restoreFaq(faq.faq_id);
      showToast.success('FAQ restored successfully');
      fetchData(false);
    } catch (err) {
      console.error(err);
      showToast.error('Failed to restore FAQ');
    }
  };

  const handleToggleStatus = async (faq) => {
    try {
      const newStatus = faq.is_active === 1 ? 0 : 1;
      await pageFaqApi.updateFaq(faq.faq_id, { is_active: newStatus });
      showToast.success('FAQ status updated');
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
    { name: 'question', label: 'Question', type: 'text', required: true },
    { name: 'answer', label: 'Answer', type: 'textarea', required: false },
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
            <HeroFAQ 
              subtitle={subtitle || 'Subtitle'} 
              title={title || 'Section Title'} 
              footerText={footerText || 'Section footer text goes here.'}
              faqs={faqs.filter(faq => faq.is_active !== 0).map(faq => ({
                question: faq.question,
                answer: faq.answer
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
              placeholder="e.g. Frequently Asked Questions"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="mt-1.5 block w-full rounded-xl border border-stone-300 px-4 py-2.5 shadow-sm focus:border-[#C8A64D] focus:ring-[#C8A64D] focus:ring-1 sm:text-sm transition-all bg-white"
              placeholder="e.g. Everything | You Need | to Know"
            />
            <p className="mt-1 text-xs text-stone-500">Use | (pipe) to create line breaks in the title.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Footer Text</label>
            <input 
              type="text" 
              value={footerText} 
              onChange={e => setFooterText(e.target.value)} 
              className="mt-1.5 block w-full rounded-xl border border-stone-300 px-4 py-2.5 shadow-sm focus:border-[#C8A64D] focus:ring-[#C8A64D] focus:ring-1 sm:text-sm transition-all bg-white"
              placeholder="e.g. Vian Luxure · Fabric Collections"
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
          <h2 className="text-lg font-bold text-slate-800">FAQ List</h2>
          <div className="flex items-center gap-4">
            <ActiveTrashBar viewMode={viewMode} onChange={setViewMode} />
            <button
              onClick={() => handleOpenDialog()}
              disabled={!section?.faq_section_id}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#C8A64D] to-[#B39340] hover:from-[#B39340] hover:to-[#9A7D34] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Plus size={16} strokeWidth={2.5} /> Add FAQ
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {!section?.faq_section_id && (
            <p className="text-sm text-amber-700 mb-6 bg-amber-50 p-4 rounded-xl border border-amber-200/50">
              Please save the section header details first before adding FAQ items.
            </p>
          )}

          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Question & Answer</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 bg-white">
                {faqs.map((faq) => (
                  <tr key={faq.faq_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-800">
                      <div className="font-bold">{faq.question}</div>
                      <div className="text-slate-500 text-xs mt-1 truncate max-w-lg">{faq.answer}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(faq)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${faq.is_active ? 'bg-[#10B981]' : 'bg-stone-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${faq.is_active ? 'translate-x-4' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {viewMode === 'active' ? (
                        <>
                          <button onClick={() => handleOpenDialog(faq)} className="text-[#C8A64D] hover:text-[#9A7D34] mr-4 p-1 rounded-md hover:bg-stone-100 transition-colors">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => { setDeletingFaq(faq); setIsDeleteDialogOpen(true); }} className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestore(faq)}
                          className="flex items-center gap-1.5 ml-auto text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors font-semibold"
                        >
                          <RotateCcw size={16} strokeWidth={2.5} />
                          Restore
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {faqs.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-sm text-slate-500 bg-slate-50/30">
                      No FAQs added yet.
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
        editData={editingFaq}
        getIdFromData={(data) => data?.faq_id}
        fields={dialogFields}
        entityLabel="FAQ Item"
        renderPreview={(values) => <FaqPreview formValues={values} />}
        apiCreate={async (data) => {
          if (!section) throw new Error('Please save section details first');
          return pageFaqApi.createFaq(section.faq_section_id, data);
        }}
        apiUpdate={async (id, data) => {
          return pageFaqApi.updateFaq(id, data);
        }}
        buildPayload={(formData) => ({
          question: formData.question,
          answer: formData.answer,
          order_no: formData.order_no || (faqs ? faqs.length : 0),
          is_active: formData.is_active === false ? 0 : 1
        })}
      />
      
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Move to Trash"
        message={`Are you sure you want to move this FAQ to trash? You can restore it later.`}
      />
    </div>
  );
}
