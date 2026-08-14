import React, { useState, useEffect, useRef } from 'react';
import { customerStoryApi } from '@/api/customerStory.api';
import showToast from '@/sharables/toast';
import { Plus, Edit2, Trash2, Upload, Loader2, ImagePlus } from 'lucide-react';
import EntityDialog from '@/sharables/EntityDialog';
import DeleteConfirmDialog from '@/sharables/DeleteConfirmDialog';
import { getImageUrl } from '@/utils/imageUtils';
import ActiveTrashBar from '@/sharables/ActiveTrashBar';
import { RotateCcw } from 'lucide-react';
import CustomerStoriesLayout from '@/components/Users/shop/components/CustomerStoriesLayout';

export default function CustomerStoriesTab({ pageKey }) {
  const [section, setSection] = useState(null);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(false);
  const [viewMode, setViewMode] = useState('active');
  
  // Section form state
  const [title, setTitle] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingStory, setDeletingStory] = useState(null);

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
      const res = await customerStoryApi.getByPage(pageKey, false, viewMode);
      if (res?.success && res?.data) {
        const storySection = res.data;
        setSection(storySection);
        setTitle(storySection.title || '');
        setImagePreview(storySection.image ? getImageUrl(storySection.image) : '');
        setStories(storySection.stories || []);
      } else {
        setSection(null);
        setTitle('');
        setImagePreview('');
        setStories([]);
      }
      setSelectedImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error(err);
      showToast.error('Failed to load customer stories data');
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
      fd.append('title', title);
      if (selectedImage) {
        fd.append('image', selectedImage);
      }
      fd.append('is_active', section?.is_active ?? 1);
      
      await customerStoryApi.upsertSection(pageKey, fd);
      showToast.success('Section details saved');
      fetchData(false);
    } catch (err) {
      console.error(err);
      showToast.error('Failed to save section details');
    } finally {
      setSavingSection(false);
    }
  };

  const handleOpenDialog = (story = null) => {
    setEditingStory(story);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingStory) return;
    try {
      await customerStoryApi.deleteStory(deletingStory.story_id);
      showToast.success('Story moved to trash');
      setIsDeleteDialogOpen(false);
      fetchData(false);
    } catch (err) {
      console.error(err);
      showToast.error('Failed to move story to trash');
    }
  };

  const handleRestore = async (story) => {
    try {
      await customerStoryApi.restoreStory(story.story_id);
      showToast.success('Story restored successfully');
      fetchData(false);
    } catch (err) {
      console.error(err);
      showToast.error('Failed to restore story');
    }
  };

  const handleToggleStatus = async (story) => {
    try {
      const newStatus = story.is_active === 1 ? 0 : 1;
      await customerStoryApi.updateStory(story.story_id, { is_active: newStatus });
      showToast.success('Story status updated');
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
    { name: 'customer_name', label: 'Customer Name', type: 'text', required: true },
    { name: 'story_date', label: 'Date', type: 'date', required: false },
    { name: 'rating', label: 'Rating (1-5)', type: 'number', required: true, min: 1, max: 5 },
    { name: 'story_text', label: 'Story Content', type: 'textarea', required: true },
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
        <div className="w-full relative scale-[0.85] sm:scale-[0.95] md:scale-100 origin-top">
          <div className="pointer-events-none">
            <CustomerStoriesLayout 
              title={title}
              image={imagePreview || section?.image}
              stories={stories.filter(s => s.is_active !== 0)}
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
                <p className="text-xs text-stone-400 mt-1">Recommended size: 800x1000px (JPG/PNG)</p>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Section Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="mt-1.5 block w-full rounded-xl border border-stone-300 px-4 py-2.5 shadow-sm focus:border-[#C8A64D] focus:ring-[#C8A64D] focus:ring-1 sm:text-sm transition-all bg-white"
              placeholder="e.g. Customer Stories"
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
          <h2 className="text-lg font-bold text-slate-800">Stories List</h2>
          <div className="flex items-center gap-4">
            <ActiveTrashBar viewMode={viewMode} onChange={setViewMode} />
            <button
              onClick={() => handleOpenDialog()}
              disabled={!section?.story_section_id}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#C8A64D] to-[#B39340] hover:from-[#B39340] hover:to-[#9A7D34] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Plus size={16} strokeWidth={2.5} /> Add Story
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {!section?.story_section_id && (
            <p className="text-sm text-amber-700 mb-6 bg-amber-50 p-4 rounded-xl border border-amber-200/50">
              Please save the section header details first before adding stories.
            </p>
          )}

          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Story Preview</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 bg-white">
                {stories.map((story) => (
                  <tr key={story.story_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                      <div className="font-bold">{story.customer_name}</div>
                      <div className="text-slate-500 text-xs mt-1">{story.story_date ? new Date(story.story_date).toLocaleDateString() : '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-800">
                      <div className="text-slate-500 text-sm truncate max-w-sm">"{story.story_text}"</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                      <div className="flex text-[#cba962]">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-4 h-4 ${i < story.rating ? 'fill-current' : 'fill-stone-200'}`} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(story)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${story.is_active ? 'bg-[#10B981]' : 'bg-stone-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${story.is_active ? 'translate-x-4' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {viewMode === 'active' ? (
                        <>
                          <button onClick={() => handleOpenDialog(story)} className="text-[#C8A64D] hover:text-[#9A7D34] mr-4 p-1 rounded-md hover:bg-stone-100 transition-colors">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => { setDeletingStory(story); setIsDeleteDialogOpen(true); }} className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestore(story)}
                          className="flex items-center gap-1.5 ml-auto text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors font-semibold"
                        >
                          <RotateCcw size={16} strokeWidth={2.5} />
                          Restore
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {stories.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-sm text-slate-500 bg-slate-50/30">
                      No stories added yet.
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
        editData={editingStory}
        getIdFromData={(data) => data?.story_id}
        fields={dialogFields}
        entityLabel="Customer Story"
        renderPreview={() => null} // No inner preview needed, we use the section live preview
        apiCreate={async (data) => {
          if (!section) throw new Error('Please save section details first');
          // Format date if needed
          if(data.story_date && data.story_date.length > 10) data.story_date = data.story_date.split('T')[0];
          return customerStoryApi.createStory(section.story_section_id, data);
        }}
        apiUpdate={async (id, data) => {
          if(data.story_date && data.story_date.length > 10) data.story_date = data.story_date.split('T')[0];
          return customerStoryApi.updateStory(id, data);
        }}
        buildPayload={(formData) => ({
          customer_name: formData.customer_name,
          story_date: formData.story_date || null,
          rating: Number(formData.rating || 5),
          story_text: formData.story_text,
          order_no: formData.order_no || (stories ? stories.length : 0),
          is_active: formData.is_active === false ? 0 : 1
        })}
      />
      
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Move to Trash"
        message={`Are you sure you want to move this story by "${deletingStory?.customer_name}" to trash? You can restore it later.`}
      />
    </div>
  );
}
