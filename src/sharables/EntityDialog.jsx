import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Fade } from '@mui/material';
import { X, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import FieldRenderer from './fields/FieldRenderer';
import showToast from '@/sharables/toast';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />;
});

const EntityDialog = ({ open, onClose, onSuccess, editData, fields, apiCreate, apiUpdate, entityLabel, icon: Icon, getIdFromData, buildPayload, renderPreview }) => {
  const isEdit = !!editData && !editData._isNewVariant;
  
  const { control, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm();
  const formValues = watch(); 

  React.useEffect(() => {
    if (open) reset(editData || {});
  }, [open, editData, reset]);

  const onSubmit = async (formValues) => {
    try {
      const payload = buildPayload ? buildPayload(formValues) : formValues;
      if (isEdit) await apiUpdate(getIdFromData(editData), payload);
      else await apiCreate(payload);
      showToast.success(`${entityLabel} ${isEdit ? 'updated' : 'created'} successfully.`);
      onSuccess();
      onClose();
    } catch (err) {
      showToast.error(err?.response?.data?.message || err?.message || 'Something went wrong.');
    }
  };

  const visibleFields = fields.filter(f => !f.showIf || f.showIf(formValues));
  const sections = visibleFields.reduce((acc, f) => {
    const key = f.section || 'General';
    if (!acc[key]) acc[key] = [];
    acc[key].push(f);
    return acc;
  }, {});

  return (
    <Dialog
      open={open}
      onClose={!isSubmitting ? onClose : undefined}
      maxWidth={renderPreview ? "xl" : "md"}
      fullWidth
      fullScreen={!!renderPreview}
      slots={{ transition: Transition }}
      slotProps={{
        paper: {
          sx: renderPreview ? {
            bgcolor: '#FDFBF7',
          } : {
            borderRadius: '24px',
            maxHeight: '90vh',
            bgcolor: '#FDFBF7',
            boxShadow: '0 25px 70px rgba(0,0,0,0.15)',
            border: '1px solid rgba(200, 166, 77, 0.25)',
            margin: { xs: '12px', sm: '32px' },
            width: 'calc(100% - 24px)',
          }
        },
        backdrop: { timeout: 400, sx: { bgcolor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' } },
      }}
    >
      <DialogTitle sx={{ bgcolor: '#FDFBF7', borderBottom: '1px solid #EAE3D2', py: { xs: 2, sm: 2.5 }, px: { xs: 3, sm: 4 } }}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 rounded-xl bg-[#C8A64D]/15 border border-[#C8A64D]/30 flex items-center justify-center shrink-0 shadow-2xs">
                <Icon size={20} className="text-[#C8A64D]" strokeWidth={2.2} />
              </div>
            )}
            <div>
              <span className="text-lg sm:text-xl font-serif font-bold text-slate-900 tracking-tight block leading-none">
                {isEdit ? 'Edit' : 'Add'} <span className="text-[#C8A64D]">{entityLabel || 'Entry'}</span>
              </span>
              <span className="text-xs font-medium text-stone-500 mt-1 block line-clamp-1">
                {isEdit ? `Modifying "${editData?.name || editData?.fab_name || editData?.blog_title || editData?.event_title || editData?.item_title || editData?.question || 'Record'}"` : `Create a new ${(entityLabel || 'entry').toLowerCase()} in inventory`}
              </span>
            </div>
          </div>
          <IconButton onClick={onClose} size="small" disabled={isSubmitting} sx={{ bgcolor: '#FAF6F0', '&:hover': { bgcolor: '#F0ECE4' } }}>
            <X size={18} className="text-slate-600" />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: '#FDFBF7', display: 'flex', flexDirection: 'column' }}>
        {renderPreview && (
          <div className="w-full bg-stone-900 border-b border-stone-200 shrink-0 relative flex flex-col justify-center overflow-hidden min-h-[40vh]">
            <div className="absolute top-4 left-4 z-50 bg-black/50 text-white px-3 py-1 rounded-full text-[0.625rem] font-bold tracking-widest uppercase backdrop-blur-md">Live Preview</div>
            {renderPreview(formValues)}
          </div>
        )}
        <div className={`p-6 sm:p-8 flex-1 ${renderPreview ? 'max-w-7xl mx-auto w-full' : ''}`}>
          <form id="entity-form" onSubmit={handleSubmit(onSubmit)}>
            {Object.entries(sections).map(([sectionName, sectionFields], idx) => {
            const isRtwSection = sectionName.includes('Ready To Wear');
            return (
              <div key={sectionName} className={`mb-8`}>
                {isRtwSection && (
                  <div className="w-full h-px border-t-2 border-dashed border-[#EAE3D2] mb-8 mt-4" />
                )}

                {Object.keys(sections).length > 1 && (
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-[#C8A64D] to-[#9A7D34]" />
                    <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#8C7A4E]">
                      {sectionName}
                    </span>
                    <div className="flex-1 h-px bg-[#EAE3D2]" />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                  {sectionFields.map(f => (
                    <FieldRenderer key={f.name} fieldConfig={f} control={control} errors={errors} editData={editData} />
                  ))}
                </div>
              </div>
            );
            })}
          </form>
        </div>
      </DialogContent>

      <DialogActions sx={{ p: { xs: 2.5, sm: 3 }, px: { xs: 3, sm: 4 }, borderTop: '1px solid #EAE3D2', bgcolor: '#FAF6F0', gap: 2, flexWrap: { xs: 'wrap-reverse', sm: 'nowrap' } }}>
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="w-full sm:w-auto flex-1 py-3 px-5 font-bold text-sm text-slate-600 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 transition-all active:scale-[0.99]"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="entity-form"
          disabled={isSubmitting}
          className="w-full sm:w-auto flex-1 py-3 px-6 font-bold text-sm bg-gradient-to-r from-[#C8A64D] to-[#B39340] hover:from-[#B39340] hover:to-[#9A7D34] text-white rounded-xl flex justify-center items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isEdit ? 'Save Changes' : `Save ${entityLabel || 'Entry'}`}
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default EntityDialog;