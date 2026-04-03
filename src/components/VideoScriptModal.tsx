"use client";

import React, { useEffect, useRef, useState } from 'react';
import { X, Loader2 } from 'lucide-react';

export default function VideoScriptModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Close when clicking the backdrop (not the video box)
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-6"
    >
      {/* Modal box */}
      <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl bg-[#0a0f1d] flex flex-col animate-in fade-in zoom-in duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/5 shrink-0">
          <span className="text-base font-black tracking-widest text-white uppercase">
            🎬 ThreatLens Walkthrough
          </span>
          <button
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white/50 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video area */}
        <div className="relative bg-black aspect-video flex items-center justify-center">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-cyan-400/60 z-10">
              <Loader2 className="h-10 w-10 animate-spin" />
              <p className="text-xs font-bold uppercase tracking-widest">Loading video...</p>
            </div>
          )}
          <video
            className="w-full h-full object-contain"
            controls
            autoPlay
            src="/ThreatLens_ The 60s Bliss Point Walkthrough_720p_caption.mp4"
            onCanPlay={() => setLoading(false)}
          />
        </div>

      </div>
    </div>
  );
}
