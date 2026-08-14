"use client";
import React, { useState, useEffect } from 'react';
import { Mail, Search, Check, Trash2, Eye, Loader2, Calendar } from 'lucide-react';
import { contactApi } from '@/api/contact.api';
import showToast from '@/sharables/toast';

const ContactSubmissionsTab = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState(''); // '' | 'read' | 'unread'
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [viewMessage, setViewMessage] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubmissions();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filterStatus, page]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await contactApi.getSubmissions({ search, status: filterStatus, page, limit: 10 });
      setSubmissions(res.data?.data || []);
      setTotalPages(res.data?.meta?.totalPages || 1);
      setTotal(res.data?.meta?.total || 0);
    } catch (err) {
      console.error(err);
      showToast.error("Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await contactApi.markSubmissionRead(id);
      showToast.success("Marked as read");
      setSubmissions(prev => prev.map(s => s.submission_id === id ? { ...s, is_read: 1 } : s));
    } catch (err) {
      showToast.error("Failed to mark as read");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure? This submission will be deleted.")) {
      try {
        await contactApi.deleteSubmission(id);
        showToast.success("Submission deleted");
        fetchSubmissions();
      } catch (err) {
        showToast.error("Failed to delete submission");
      }
    }
  };

  const openMessage = (sub) => {
    if (sub.is_read === 0) {
      handleMarkRead(sub.submission_id);
    }
    setViewMessage(sub);
  };

  return (
    <div className="p-6 sm:p-8 relative min-h-[31.25rem]">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-900">Form Submissions</h2>
          <p className="text-sm text-slate-500">View and manage messages sent from the Contact Us page</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <select 
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="px-4 py-2 bg-white border border-stone-200 rounded-xl text-sm font-semibold outline-none focus:border-[#C8A64D]"
          >
            <option value="">All Statuses</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-stone-400" />
            <input 
              type="text"
              placeholder="Search name, email, or number..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 w-full sm:w-64 bg-white border border-stone-200 rounded-xl text-sm font-semibold outline-none focus:border-[#C8A64D]"
            />
          </div>
        </div>
      </div>

      {loading && submissions.length === 0 ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-[#C8A64D]" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-200">
          <Mail className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No Submissions Found</h3>
          <p className="text-sm text-stone-500 mt-1">There are no contact form submissions matching your criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-stone-200 rounded-2xl">
          <table className="w-full text-left border-collapse min-w-[50rem]">
            <thead>
              <tr className="bg-stone-50 text-[0.625rem] font-black uppercase text-stone-500 tracking-wider">
                <th className="p-4 border-b border-stone-200 w-12">Status</th>
                <th className="p-4 border-b border-stone-200">Date</th>
                <th className="p-4 border-b border-stone-200">Name</th>
                <th className="p-4 border-b border-stone-200">Contact Details</th>
                <th className="p-4 border-b border-stone-200 w-64">Message Excerpt</th>
                <th className="p-4 border-b border-stone-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-semibold text-slate-700">
              {submissions.map(sub => (
                <tr key={sub.submission_id} className={`border-b border-stone-100 hover:bg-stone-50 transition-colors ${sub.is_read === 0 ? 'bg-amber-50/30' : 'bg-white'}`}>
                  <td className="p-4 text-center">
                    {sub.is_read === 0 ? (
                      <span className="inline-flex w-3 h-3 bg-amber-500 rounded-full" title="Unread"></span>
                    ) : (
                      <span className="inline-flex w-3 h-3 bg-green-500 rounded-full" title="Read"></span>
                    )}
                  </td>
                  <td className="p-4 whitespace-nowrap text-stone-500">
                    {new Date(sub.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    <div className="text-xs font-normal mt-0.5">{new Date(sub.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td className="p-4 font-bold text-slate-900">{sub.full_name}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      {sub.email && <span className="text-blue-600 font-medium">{sub.email}</span>}
                      {sub.whatsapp_number && <span className="text-slate-500">{sub.whatsapp_number}</span>}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="line-clamp-2 text-slate-500 font-normal">{sub.message || '-'}</p>
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <button onClick={() => openMessage(sub)} className="p-2 text-stone-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mr-1" title="View Full Message">
                      <Eye size={16} />
                    </button>
                    {sub.is_read === 0 && (
                      <button onClick={() => handleMarkRead(sub.submission_id)} className="p-2 text-amber-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors mr-1" title="Mark as Read">
                        <Check size={16} strokeWidth={3} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(sub.submission_id)} className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 bg-stone-50 border-t border-stone-200">
              <span className="text-sm font-semibold text-stone-500">
                Total: {total} items
              </span>
              <div className="flex gap-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-sm font-bold disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="px-3 py-1.5 text-sm font-bold text-slate-700">Page {page} of {totalPages}</span>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-sm font-bold disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View Message Modal */}
      {viewMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h3 className="font-serif font-bold text-xl text-slate-900">Message Details</h3>
              <button onClick={() => setViewMessage(null)} className="text-stone-400 hover:text-slate-900">
                <Trash2 size={0} className="hidden"/> {/* Just to satisfy unused var */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[0.625rem] font-black uppercase tracking-wider text-stone-400 block mb-1">Name</label>
                  <div className="font-bold text-slate-800">{viewMessage.full_name}</div>
                </div>
                <div>
                  <label className="text-[0.625rem] font-black uppercase tracking-wider text-stone-400 block mb-1">Date</label>
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Calendar size={14} className="text-stone-400" />
                    {new Date(viewMessage.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>
                <div>
                  <label className="text-[0.625rem] font-black uppercase tracking-wider text-stone-400 block mb-1">Email</label>
                  <div className="font-semibold text-blue-600 break-all">{viewMessage.email || '-'}</div>
                </div>
                <div>
                  <label className="text-[0.625rem] font-black uppercase tracking-wider text-stone-400 block mb-1">Whatsapp</label>
                  <div className="font-semibold text-slate-800">{viewMessage.whatsapp_number || '-'}</div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-stone-100">
                <label className="text-[0.625rem] font-black uppercase tracking-wider text-stone-400 block mb-2">Message</label>
                <div className="p-4 bg-stone-50 rounded-xl text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {viewMessage.message || <span className="italic text-stone-400">No message provided.</span>}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-stone-100 bg-stone-50 flex justify-end">
              <button 
                onClick={() => setViewMessage(null)}
                className="px-6 py-2.5 bg-white border border-stone-200 text-slate-700 rounded-xl font-bold text-sm shadow-sm hover:bg-stone-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default ContactSubmissionsTab;
