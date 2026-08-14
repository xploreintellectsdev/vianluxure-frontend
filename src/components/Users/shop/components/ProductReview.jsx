"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Star, X, Upload, ChevronLeft, ChevronRight, Lock, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/Users/context/AuthContext";
import { reviewApi } from "@/api/review.api";

function StarRow({ rating, size = 16 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= rating ? "fill-[#C8A64D] text-[#C8A64D]" : "text-gray-300"}
        />
      ))}
    </div>
  );
}

function RatingInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className="p-0.5"
        >
          <Star
            size={28}
            className={
              i <= (hover || value)
                ? "fill-[#C8A64D] text-[#C8A64D]"
                : "text-gray-300"
            }
          />
        </button>
      ))}
    </div>
  );
}

// Inline "mini dialog" write-review form — sits directly in the page
// flow (no overlay, no z-index fight with the navbar), compact card
// styled with the same cream/gold/neutral palette as the rest of the page.
//
// Image handling: the first uploaded image is kept as a local File for
// upload plus a base64 preview for display while the form is open. On
// submit, the file (if any) is uploaded to the backend, which stores it
// under uploads/reviews/ and returns a URL; that URL is what actually
// gets saved to fabric_reviews.review_image_url.
function WriteReviewForm({ user, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: user?.name || user?.username || "",
    email: user?.email || "",
    rating: 0,
    title: "",
    comment: "",
  });
  const [previews, setPreviews] = useState([]);
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  const MAX_IMAGES = 3;

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, MAX_IMAGES - files.length);

    incoming.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviews((prev) => (prev.length < MAX_IMAGES ? [...prev, reader.result] : prev));
      };
      reader.readAsDataURL(file);
      setFiles((prev) => (prev.length < MAX_IMAGES ? [...prev, file] : prev));
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const removeImage = (idx) => {
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const isValid = form.rating && form.comment.trim();

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setError(null);
    setSubmitting(true);

    try {
      // Upload the first image (if any) and use the returned path as
      // review_image_url. Only one image is stored per review.
      let review_image_url = null;
      if (files[0]) {
        try {
          const uploaded = await reviewApi.uploadImage(files[0]);
          review_image_url = uploaded.url || null;
        } catch (uploadErr) {
          console.error("Image upload failed:", uploadErr);
          // Fall through and submit without an image rather than
          // blocking the whole review.
        }
      }

      await onSubmit({
        customer_name: form.name.trim(),
        customer_email: form.email.trim(),
        rating: form.rating,
        review_title: form.title.trim() || "Review",
        review_text: form.comment.trim(),
        review_image_url,
      });
    } catch (err) {
      console.error("Failed to submit review:", err);
      setError("Something went wrong submitting your review. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={formRef}
      className="mx-auto w-full max-w-xl bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 mt-8 mb-4 relative"
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors"
      >
        <X size={20} />
      </button>

      <h3 className="font-serif text-2xl text-gray-900 mb-1">Write a review</h3>
      <p className="text-gray-500 text-sm mb-6">
        Share your experience to help other customers
      </p>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <div className="mb-4">
        <p className="text-gray-500 text-xs font-semibold tracking-widest uppercase mb-2">
          Rating
        </p>
        <RatingInput
          value={form.rating}
          onChange={(r) => setForm((f) => ({ ...f, rating: r }))}
        />
      </div>

      <input
        type="text"
        placeholder="Give your review a title"
        value={form.title}
        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        className="w-full bg-[#F5EFE8] border-none rounded-xl px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8A64D] mb-4"
      />

      <textarea
        placeholder="Write your comments here"
        value={form.comment}
        onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
        rows={4}
        className="w-full bg-[#F5EFE8] border-none rounded-xl px-4 py-3 text-sm placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#C8A64D] mb-5"
      />

      <div className="mb-5">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors ${
            dragOver ? "border-[#C8A64D] bg-[#F5EFE8]" : "border-gray-200"
          }`}
        >
          <p className="text-sm text-gray-500 mb-3">
            Drag and drop your images anywhere or
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={files.length >= MAX_IMAGES}
            className="inline-flex items-center gap-2 bg-[#C8A64D] text-white text-sm font-medium px-4 py-2.5 rounded-full hover:bg-[#b8974a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload size={16} />
            Upload an image
          </button>
          <p className="text-xs text-gray-400 mt-2">(max {MAX_IMAGES} images)</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>

        {previews.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-3">
            {previews.map((img, i) => (
              <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden">
                <img src={img} alt={`upload-${i}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5"
                >
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          disabled={submitting}
          className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-full hover:border-gray-300 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          className="flex-1 bg-[#C8A64D] text-white font-semibold py-3 rounded-full hover:bg-[#b8974a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting..." : "Submit review"}
        </button>
      </div>
    </div>
  );
}

// productId identifies which product's reviews to show, mapped to fab_id
// on the backend. Reviews now live in MySQL (fabric_reviews) and are
// fetched/created through the review API — no localStorage anywhere here.
const ProductReview = ({ productId = "default" }) => {
  // productId arrives as a slug like "fabric-7" (same scheme the old
  // localStorage keys used); fab_id in MySQL is numeric, so pull the
  // trailing number out here once and use it for every API call below.
  const fabId = String(productId).match(/\d+$/)?.[0];
  const { user } = useAuthContext();
  const router = useRouter();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef(null);

  const fetchReviews = useCallback(async () => {
    if (!fabId) {
      setLoadError("Invalid product reference.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const data = await reviewApi.getByFabric(fabId);

      const mapped = (data.reviews || []).map((r) => ({
        id: r.rev_id,
        name: r.customer_name,
        date: new Date(r.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        // mysql2 returns numeric/decimal columns as strings, not JS
        // numbers — without this, `rating === star` never matches and
        // the star counts / average silently come out as 0 / NaN.
        rating: Number(r.rating),
        title: r.review_title,
        comment: r.review_text,
        image: r.review_image_url,
      }));

      setReviews(mapped);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      setLoadError("Couldn't load reviews right now. Please try again later.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [fabId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const total = reviews.length;
  const counts = [5, 4, 3, 2, 1].map(
    (star) => reviews.filter((r) => r.rating === star).length
  );
  const maxCount = Math.max(...counts, 1);
  const avgRating = total
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
    : 0;

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [updateScrollButtons, reviews]);

  const scrollByCard = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild?.offsetWidth ?? 300;
    el.scrollBy({ left: direction * (cardWidth + 20), behavior: "smooth" });
  };

  const handleAddReview = async (payload) => {
    await reviewApi.create({ fab_id: fabId, ...payload });

    // Re-fetch from MySQL so the list, counts, and average all reflect
    // the actual stored data rather than an optimistic local guess.
    await fetchReviews();
    setFormOpen(false);
  };

  return (
    <section className="w-full bg-page-bg py-10">
      <div className="mx-auto w-[92%] max-w-[87.5rem]">
        {/* "Write a review" pinned to the top-right corner */}
        <div className="flex justify-end mb-4">
          {!formOpen && (
            <button
              onClick={() => {
                if (!user) {
                  setShowLoginModal(true);
                } else {
                  setFormOpen(true);
                }
              }}
              className="bg-[#C8A64D] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#b8974a] transition-colors shadow-sm hover:shadow-md"
            >
              Write a review
            </button>
          )}
        </div>

        {/* Summary block on the left, review cards beside it on the
            right, scrollable horizontally. */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          <div className="w-full lg:w-[18.75rem] shrink-0">
            <h2 className="font-serif text-4xl text-gray-900 mb-3">
              Customer Reviews
            </h2>

            <div className="flex items-center gap-3 mb-5">
              <StarRow rating={Math.round(avgRating)} size={18} />
              <span className="text-gray-500 text-sm">
                Based on {total} review{total !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              {[5, 4, 3, 2, 1].map((star, idx) => (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <span className="text-gray-700 font-semibold w-12 shrink-0">
                    {star} Star
                  </span>
                  <div className="flex-1 h-2.5 bg-[#EDE7DC] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#C8A64D] rounded-full transition-all"
                      style={{ width: `${(counts[idx] / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-gray-600 w-6 text-right shrink-0">
                    {counts[idx]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex-1 min-w-0">
            {canScrollLeft && (
              <div className="hidden sm:block absolute left-0 top-0 bottom-4 w-16 bg-gradient-to-r from-[#FAFAF8] to-transparent pointer-events-none z-10" />
            )}
            {canScrollRight && (
              <div className="hidden sm:block absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-[#FAFAF8] to-transparent pointer-events-none z-10" />
            )}

            {loading && (
              <p className="text-sm text-gray-500">Loading reviews...</p>
            )}
            {!loading && loadError && (
              <p className="text-sm text-red-500">{loadError}</p>
            )}
            {!loading && !loadError && total === 0 && (
              <p className="text-sm text-gray-500">
                No reviews yet. Be the first to write one.
              </p>
            )}

            {!loading && !loadError && total > 0 && (
              <div
                ref={scrollRef}
                className="flex gap-5 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory scrollbar-none"
              >
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="min-w-[18.75rem] max-w-[18.75rem] shrink-0 snap-start border border-gray-200 rounded-2xl bg-white p-5"
                  >
                    <StarRow rating={r.rating} />
                    <h3 className="font-semibold text-gray-900 mt-2 mb-1">
                      {r.title}
                    </h3>
                    <p className="text-xs text-gray-400 mb-3">
                      {r.name} on {r.date}
                    </p>
                    <div className="flex gap-3">
                      <p className="text-sm text-gray-600 leading-relaxed flex-1">
                        {r.comment}
                      </p>
                      {r.image && (
                        <img
                          src={r.image}
                          alt={r.name}
                          className="w-16 h-16 rounded-xl object-cover shrink-0"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(canScrollLeft || canScrollRight) && (
              <div className="hidden sm:flex justify-end gap-2 mt-3">
                <button
                  onClick={() => scrollByCard(-1)}
                  disabled={!canScrollLeft}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:border-[#C8A64D] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => scrollByCard(1)}
                  disabled={!canScrollRight}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:border-[#C8A64D] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {formOpen && (
          <WriteReviewForm
            user={user}
            onClose={() => setFormOpen(false)}
            onSubmit={handleAddReview}
          />
        )}

        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-[#C8A64D]/30 relative transform transition-all scale-100 text-center">
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 bg-[#FDFBF7] border border-[#C8A64D]/30 rounded-full flex items-center justify-center mx-auto mb-5 text-[#C8A64D] shadow-sm">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-slate-800 mb-2">
                Account Required
              </h3>
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                Please sign in to your Vian Luxure store account to share your feedback and write a verified product review.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => router.push("/login")}
                  className="w-full py-3.5 px-6 bg-[#C8A64D] hover:bg-[#B5943E] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                >
                  <LogIn className="w-4 h-4" /> Login / Create Account
                </button>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="w-full py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors text-xs uppercase tracking-wider"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductReview;