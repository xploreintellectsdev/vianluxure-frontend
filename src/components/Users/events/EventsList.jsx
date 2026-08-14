"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import { Calendar, Play, Sparkles, Film, ImageIcon, Pause } from "lucide-react";
import { eventApi } from "@/api/event.api";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const isVideoEvent = (event) =>
  event?.media_type === "Video" ||
  (event?.event_media && /\.(mp4|webm|mov|mkv)$/i.test(event.event_media));

// ---------------------------------------------------------------------------
// Single event card
// ---------------------------------------------------------------------------
const EventMediaCard = ({ event, hoveredId, onHoverStart, onHoverEnd }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mediaError, setMediaError] = useState(false);

  const isVideo = isVideoEvent(event);
  const mediaUrl = event?.event_media ? `${API_URL}${event.event_media}` : null;

  const isHovered = hoveredId === event.event_id;

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleMouseEnter = () => {
    onHoverStart(event.event_id);
    if (isVideo && videoRef.current && !isPlaying) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    onHoverEnd();
    if (isVideo && videoRef.current && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    // Real grid expansion: spanning 2 columns pushes neighboring cards to
    // reflow naturally instead of floating an overlay on top of them.
    <div
      className={`bg-white rounded-3xl overflow-hidden border border-stone-200/70 shadow-sm hover:shadow-xl hover:border-[#C8A64D]/60 transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col h-full group ${
        isHovered && isVideo
          ? "basis-full lg:basis-[calc(66.666%-0.889rem)]"
          : "basis-full sm:basis-[calc(50%-1.25rem)] lg:basis-[calc(33.333%-1.778rem)]"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative overflow-hidden bg-slate-950 flex items-center justify-center h-72 sm:h-80">
        {!mediaUrl || mediaError ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-stone-500 bg-stone-900">
            <ImageIcon size={28} />
            <span className="text-[0.6875rem] font-semibold uppercase tracking-widest">Media unavailable</span>
          </div>
        ) : isVideo ? (
          <>
            <video
              ref={videoRef}
              src={mediaUrl}
              className={`w-full h-full transition-all duration-500 ease-out ${
                isHovered ? "object-contain" : "object-cover"
              }`}
              loop
              muted
              playsInline
              onClick={togglePlay}
              onError={() => setMediaError(true)}
            />

            {/* Persistent VIDEO label */}
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-full text-white text-[0.625rem] font-black tracking-widest uppercase border border-[#C8A64D]/40 flex items-center gap-1.5 pointer-events-none z-10">
              <Film size={12} className="text-[#C8A64D]" />
              <span>Video</span>
            </div>

            {/* Play/pause control */}
            <button
              type="button"
              onClick={togglePlay}
              className={`absolute inset-0 flex items-center justify-center transition-colors duration-300 ${
                isPlaying ? "bg-black/0" : "bg-black/30"
              }`}
            >
              {!isPlaying && (
                <div className="w-16 h-16 rounded-full bg-[#C8A64D] text-white flex items-center justify-center shadow-2xl scale-95 group-hover:scale-110 transition-transform">
                  <Play size={24} fill="white" className="ml-1" />
                </div>
              )}
              {isPlaying && isHovered && (
                <div className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Pause size={14} />
                </div>
              )}
            </button>
          </>
        ) : (
          <img
            src={mediaUrl}
            alt={event.event_title}
            className={`w-full h-full transition-all duration-500 ease-out ${
              isHovered ? "object-contain" : "object-cover group-hover:scale-105"
            }`}
            onError={() => setMediaError(true)}
          />
        )}
      </div>

      <div className="p-8 flex flex-col justify-between flex-1 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C8A64D]">
            <Calendar size={14} />
            <span>
              {event.event_date
                ? new Date(event.event_date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Atelier Showcase"}
            </span>
          </div>

          <h3 className="text-2xl font-serif font-bold text-slate-900 group-hover:text-[#C8A64D] transition-colors leading-snug line-clamp-2 min-h-[2lh]">
            {event.event_title}
          </h3>

          <p className="text-stone-600 text-sm leading-relaxed font-normal line-clamp-2 min-h-[2.75rem]">
            {event.short_description || "\u00A0"}
          </p>
        </div>

        <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-stone-400">
          <span className="uppercase tracking-wider">Vian Luxure Exclusive</span>
          {isVideo && <span className="text-[0.6875rem] text-[#C8A64D] font-bold">Hover to view in full</span>}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// List / page
// ---------------------------------------------------------------------------
const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState("ALL"); // ALL | VIDEO | IMAGE
  const [hoveredId, setHoveredId] = useState(null);

  React.useEffect(() => {
    let cancelled = false;
    const fetchEvents = async () => {
      try {
        const res = await eventApi.getAll({ status: "1", limit: 100, sort: "order_no", order: "ASC" });
        const list = res.data?.data || res.data || [];
        if (!cancelled) setEvents(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Error fetching events:", err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center pt-28 pb-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#C8A64D] border-t-transparent animate-spin" />
          <p className="text-stone-500 text-sm font-semibold uppercase tracking-widest">
            Loading Exclusive Events...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center pt-28 pb-20 px-4">
        <div className="text-center py-16 px-8 bg-white rounded-3xl border border-stone-200/60 shadow-sm max-w-md">
          <p className="text-stone-500 font-serif text-xl">Couldn't load events right now.</p>
          <p className="text-xs font-bold text-[#C8A64D] uppercase tracking-widest mt-2">Please try again shortly</p>
        </div>
      </div>
    );
  }

  const filteredEvents = events.filter((e) => {
    if (filter === "ALL") return true;
    const isVid = isVideoEvent(e);
    if (filter === "VIDEO") return isVid;
    if (filter === "IMAGE") return !isVid;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 pb-28 pt-28 px-4 md:px-8 xl:px-0">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#C8A64D]/30 shadow-sm">
            <Sparkles size={15} className="text-[#C8A64D]" />
            <span className="text-xs font-black tracking-widest text-[#C8A64D] uppercase">
              Trunk Shows & Showcases
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight">
            Atelier Events & Exclusives
          </h1>
          <p className="text-stone-600 font-normal leading-relaxed text-base md:text-lg">
            Immerse yourself in our recent fashion showcases, trunk show reveals, styling consultations, and runway
            features.
          </p>
        </div>

        {/* Filter Buttons */}
        {events.length > 0 && (
          <div className="flex justify-center items-center gap-3 flex-wrap">
            {[
              { id: "ALL", label: "All Highlights" },
              { id: "VIDEO", label: "Video Reels" },
              { id: "IMAGE", label: "Photo Gallery" },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilter(btn.id)}
                className={`px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
                  filter === btn.id
                    ? "bg-[#C8A64D] text-white shadow-lg shadow-[#C8A64D]/30"
                    : "bg-white border border-stone-200 text-stone-600 hover:border-[#C8A64D] hover:text-slate-900"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}

        {filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-200/60 shadow-sm">
            <p className="text-stone-500 font-serif text-xl">No events available in this view at the moment.</p>
            <p className="text-xs font-bold text-[#C8A64D] uppercase tracking-widest mt-2">
              Please check back soon for our upcoming showcases
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap items-stretch gap-8 sm:gap-10">
            {filteredEvents.map((ev) => (
              <EventMediaCard
                key={ev.event_id}
                event={ev}
                hoveredId={hoveredId}
                onHoverStart={setHoveredId}
                onHoverEnd={() => setHoveredId(null)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsList;