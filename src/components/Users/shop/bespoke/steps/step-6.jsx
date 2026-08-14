"use client";

import { useRef } from "react";
import Image from "next/image";
import { Plus, FileText, X } from "lucide-react";

const MEASUREMENT_FIELDS = [
  { key: "neck", label: "Neck", placeholder: "e.g. 38" },
  { key: "leftWrist", label: "Left Wrist", placeholder: "e.g. 17" },
  { key: "rightWrist", label: "Right Wrist", placeholder: "e.g. 17" },
  { key: "shoulders", label: "Shoulders", placeholder: "e.g. 44" },
  { key: "lengthBack", label: "Length Back", placeholder: "e.g. 76" },
  { key: "sleeve", label: "Sleeve", placeholder: "e.g. 62" },
  { key: "biceps", label: "Biceps", placeholder: "e.g. 32" },
  { key: "chest", label: "Chest", placeholder: "e.g. 96" },
  { key: "hips", label: "Hips", placeholder: "e.g. 98" },
  { key: "waist", label: "Waist", placeholder: "e.g. 84" },
];

const MeasurementStep = ({
  measurements,
  onMeasurementChange,
  referenceFile,
  onFileSelect,
  onFileRemove,
  onSubmit,
  isComplete,
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    // Reset input so the same file can be uploaded again if removed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      <div className="text-center mb-2">
        <h3
          className="text-3xl text-[#221F1E] mb-2 tracking-tight"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          Measurement Method
        </h3>
        <p className="text-[#75716B] text-sm tracking-wide">
          Fill in your measurements and upload a reference file.
        </p>
      </div>

      {/* Upload Reference pill button */}
      <div className="flex justify-center my-8">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#221F1E] text-white font-semibold px-10 py-4 rounded-2xl hover:bg-[#8C7355] transition-all text-center shadow-lg shadow-[#221F1E]/10 active:scale-95"
        >
          <span className="block text-sm">Upload Reference</span>
          <span className="block text-[0.625rem] font-bold tracking-widest uppercase opacity-80 mt-0.5">
            Photo or Measurement PDF
          </span>
        </button>
      </div>

      <div className="border-t border-[#EBE8E2] mb-10" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* LEFT: Body measurement fields */}
        <div>
          <p className="text-center lg:text-left text-[0.625rem] font-bold uppercase tracking-[0.2em] text-[#A09C96] mb-6">
            Body Measurements (cm)
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            {MEASUREMENT_FIELDS.map((field) => (
              <div key={field.key}>
                <label
                  htmlFor={`measurement-${field.key}`}
                  className="block text-[0.625rem] font-bold uppercase tracking-widest text-[#75716B] mb-2"
                >
                  {field.label}
                </label>
                <input
                  id={`measurement-${field.key}`}
                  type="number"
                  inputMode="decimal"
                  placeholder={field.placeholder}
                  value={measurements[field.key] || ""}
                  onChange={(e) => onMeasurementChange(field.key, e.target.value)}
                  className="w-full bg-[#FBF9F5] border border-[#EBE8E2] rounded-xl px-4 py-3 text-[#221F1E] text-sm focus:outline-none focus:border-[#8C7355] focus:bg-white transition-colors"
                />
              </div>
            ))}
          </div>

          <div className="mt-5">
            <label
              htmlFor="measurement-notes"
              className="block text-[0.625rem] font-bold uppercase tracking-widest text-[#75716B] mb-2"
            >
              Notes
            </label>
            <textarea
              id="measurement-notes"
              rows={4}
              placeholder="Notes (specify if you wear a watch and on which wrist)"
              value={measurements.notes || ""}
              onChange={(e) => onMeasurementChange("notes", e.target.value)}
              className="w-full bg-[#FBF9F5] border border-[#EBE8E2] rounded-xl px-4 py-3 text-[#221F1E] text-sm focus:outline-none focus:border-[#8C7355] focus:bg-white transition-colors resize-none"
            />
          </div>
        </div>

        {/* RIGHT: Reference file upload */}
        <div>
          <p className="text-center lg:text-left text-[0.625rem] font-bold uppercase tracking-[0.2em] text-[#A09C96] mb-6">
            Reference File
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            role="button"
            tabIndex={0}
            className="cursor-pointer relative w-full min-h-[26.25rem] rounded-3xl border border-dashed border-[#E2DFDA] bg-[#FBF9F5] hover:border-[#8C7355] hover:bg-[#F5F1E9] transition-all flex flex-col items-center justify-center gap-4 p-8 outline-none focus-visible:ring-2 focus-visible:ring-[#8C7355]"
          >
            {referenceFile ? (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileRemove();
                  }}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white border border-[#EBE8E2] flex items-center justify-center text-[#75716B] hover:text-[#221F1E] hover:border-[#D1CECB] transition-colors z-10"
                  aria-label="Remove file"
                >
                  <X size={14} />
                </button>

                {referenceFile.previewUrl ? (
                  <div className="relative w-full max-w-xs aspect-square rounded-2xl overflow-hidden bg-white">
                    <Image
                      src={referenceFile.previewUrl}
                      alt="Reference preview"
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                    <FileText size={26} className="text-[#8C7355]" />
                  </div>
                )}

                <div className="text-center">
                  <p className="font-semibold text-[#221F1E] text-sm break-all px-4">
                    {referenceFile.name}
                  </p>
                  <p className="text-xs text-[#A09C96] mt-1">
                    {(referenceFile.size / 1024).toFixed(0)} KB — click to replace
                  </p>
                </div>
              </>
            ) : (
              <>
                <span className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
                  <Plus size={22} className="text-[#A09C96]" />
                </span>
                <span className="text-center">
                  <span className="block font-bold text-[#221F1E]">
                    Click to Upload File
                  </span>
                  <span className="block text-sm text-[#A09C96] mt-1">
                    Upload a photo of your measurements
                    <br />
                    or a sample shirt (image / PDF)
                  </span>
                </span>
              </>
            )}
          </div>

          <p className="text-center lg:text-left text-xs font-medium text-[#8C7355] mt-4">
            Mandatory — helps us tailor more accurately
          </p>
        </div>
      </div>

    
    </div>
  );
};

export default MeasurementStep;