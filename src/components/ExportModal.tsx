import React, { useState } from "react";
import {
  Download,
  CheckCircle2,
  X,
  Sparkles,
  Film,
  Copy,
  Check,
  Share2,
  Instagram,
} from "lucide-react";
import { CaptionStyle, ExportProgress, VideoOption } from "../types";
import { globalExportEngine } from "../utils/exportEngine";
import { InstagramPublishModal } from "./InstagramPublishModal";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  option: VideoOption;
  captionStyle: CaptionStyle;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  option,
  captionStyle,
}) => {
  const [progress, setProgress] = useState<ExportProgress>({
    isExporting: false,
    progressPercent: 0,
    currentFrame: 0,
    totalFrames: 0,
    statusText: "Ready to render 1080x1920 HD Short",
  });

  const [downloadResult, setDownloadResult] = useState<{
    url: string;
    fileName: string;
  } | null>(null);

  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);
  const [isInstagramModalOpen, setIsInstagramModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    try {
      setDownloadResult(null);

      const res = await globalExportEngine.exportVideo(
        option,
        captionStyle,
        (p) => setProgress(p)
      );

      setDownloadResult({
        url: res.url,
        fileName: res.fileName,
      });
    } catch (e: any) {
      console.error("Export error:", e);

      setProgress({
        isExporting: false,
        progressPercent: 0,
        currentFrame: 0,
        totalFrames: 0,
        statusText: `Export stopped: ${e.message || "Unknown error"}`,
      });
    }
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(option.instagramMetadata.captionCopy);
    setCopiedCaption(true);

    setTimeout(() => {
      setCopiedCaption(false);
    }, 2000);
  };

  const handleCopyHashtags = () => {
    navigator.clipboard.writeText(
      option.instagramMetadata.trendingHashtags.join(" ")
    );

    setCopiedHashtags(true);

    setTimeout(() => {
      setCopiedHashtags(false);
    }, 2000);
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
        {/* Modal */}
        <div className="relative flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl">
          {/* Background Glow */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-rose-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />

          {/* Header */}
          <div className="relative shrink-0 border-b border-zinc-800 px-5 py-4 sm:px-6">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="shrink-0 rounded-xl border border-rose-500/30 bg-rose-500/20 p-2.5 text-rose-400">
                <Film className="h-5 w-5" />
              </div>

              {/* Title */}
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-black leading-tight text-white sm:text-lg">
                  Export High-Definition Short
                </h3>

                <p className="mt-1 max-w-xl text-[11px] leading-relaxed text-zinc-400 sm:text-xs">
                  1080×1920 9:16 Portrait • Crystal Clear HD with
                  Beat-Synced Audio
                </p>
              </div>

              {/* Close */}
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-xl bg-zinc-800 p-2 text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
                aria-label="Close export modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="relative flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
            <div className="space-y-5">
              {/* Video Specs Card */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
                    Video Specifications
                  </span>

                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                    HD READY
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Variation */}
                  <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] items-start gap-4 text-xs">
                    <span className="text-zinc-500">Variation & Theme</span>

                    <span className="break-words text-right font-bold text-white">
                      {option.styleCategory}
                    </span>
                  </div>

                  {/* Resolution */}
                  <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] items-start gap-4 text-xs">
                    <span className="text-zinc-500">Video Resolution</span>

                    <span className="break-words text-right font-mono font-bold text-white">
                      1080 × 1920
                      <span className="ml-1 font-sans text-zinc-400">
                        (Full HD 9:16)
                      </span>
                    </span>
                  </div>

                  {/* Soundtrack */}
                  <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] items-start gap-4 text-xs">
                    <span className="text-zinc-500">Soundtrack</span>

                    <span className="break-words text-right font-bold capitalize text-amber-400">
                      {option.musicSettings.genre}{" "}
                      <span className="text-amber-500/70">
                        ({option.musicSettings.tempoBpm} BPM)
                      </span>
                    </span>
                  </div>

                  {/* Voiceover */}
                  <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] items-start gap-4 text-xs">
                    <span className="text-zinc-500">Voiceover Tone</span>

                    <span className="break-words text-right font-bold capitalize text-indigo-400">
                      {option.musicSettings.voiceoverTone.replace("_", " ")}
                    </span>
                  </div>

                  {/* Scenes */}
                  <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] items-start gap-4 text-xs">
                    <span className="text-zinc-500">Scenes Count</span>

                    <span className="text-right font-bold text-emerald-400">
                      {option.scenes.length} Scenes
                      <span className="ml-1 text-emerald-500/70">
                        (~
                        {Math.round(
                          option.scenes.reduce(
                            (acc, s) => acc + s.durationSec,
                            0
                          )
                        )}
                        s)
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress */}
              {progress.isExporting && (
                <div className="rounded-2xl border border-rose-800/40 bg-rose-950/30 p-4">
                  <div className="mb-3 flex items-center justify-between gap-4 text-xs font-bold">
                    <div className="flex min-w-0 items-center gap-2 text-rose-300">
                      <div className="h-2.5 w-2.5 shrink-0 animate-ping rounded-full bg-rose-500" />

                      <span className="truncate">
                        {progress.statusText}
                      </span>
                    </div>

                    <span className="shrink-0 font-mono text-white">
                      {progress.progressPercent}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-3 w-full overflow-hidden rounded-full border border-zinc-800 bg-zinc-950 p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-500 transition-all duration-200"
                      style={{
                        width: `${progress.progressPercent}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Download Result */}
              {downloadResult && !progress.isExporting && (
                <div className="space-y-4 rounded-2xl border border-emerald-800/40 bg-emerald-950/30 p-4 sm:p-5">
                  {/* Success Header */}
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />

                    <span>Video Rendered in High Definition!</span>
                  </div>

                  {/* Main Actions */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <a
                      href={downloadResult.url}
                      download={downloadResult.fileName}
                      className="flex min-h-[50px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-center text-xs font-black text-white shadow-lg shadow-emerald-600/25 transition hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98]"
                    >
                      <Download className="h-4 w-4 shrink-0" />
                      <span>Download .MP4</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setIsInstagramModalOpen(true)}
                      className="flex min-h-[50px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 px-4 py-3 text-center text-xs font-black text-white shadow-lg shadow-rose-600/25 transition hover:from-purple-500 hover:via-pink-500 hover:to-rose-500 active:scale-[0.98]"
                    >
                      <Instagram className="h-4 w-4 shrink-0" />
                      <span>Upload to Instagram</span>
                    </button>
                  </div>

                  {/* Publishing Toolkit */}
                  <div className="space-y-3 border-t border-emerald-900/40 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-300">
                        Instagram Publishing Toolkit
                      </span>

                      <span className="text-[10px] font-semibold text-zinc-500">
                        READY TO COPY
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {/* Caption */}
                      <button
                        type="button"
                        onClick={handleCopyCaption}
                        className="flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-800"
                      >
                        {copiedCaption ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Caption Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy Caption</span>
                          </>
                        )}
                      </button>

                      {/* Hashtags */}
                      <button
                        type="button"
                        onClick={handleCopyHashtags}
                        className="flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-800"
                      >
                        {copiedHashtags ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Hashtags Copied!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="h-3.5 w-3.5" />
                            <span>Copy Hashtags</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Initial Actions */}
              {!progress.isExporting && !downloadResult && (
                <div className="space-y-3">
                  {/* Render */}
                  <button
                    type="button"
                    onClick={handleStartExport}
                    className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 px-4 py-3 text-sm font-black text-white shadow-xl shadow-rose-600/30 transition hover:from-rose-500 hover:via-pink-500 hover:to-indigo-500 active:scale-[0.98]"
                  >
                    <Sparkles className="h-4 w-4 shrink-0 text-amber-300" />

                    <span>Start HD Rendering (1080×1920)</span>
                  </button>

                  {/* Instagram */}
                  <button
                    type="button"
                    onClick={() => setIsInstagramModalOpen(true)}
                    className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-xs font-bold text-zinc-200 transition hover:bg-zinc-800"
                  >
                    <Instagram className="h-4 w-4 shrink-0 text-pink-400" />

                    <span className="text-center">
                      Upload Directly to Instagram API
                      <span className="hidden sm:inline">
                        {" "}
                        (Reels / Stories)
                      </span>
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Safe Area */}
          <div className="relative shrink-0 border-t border-zinc-800 bg-zinc-900/95 px-5 py-3 sm:px-6">
            <div className="flex items-center justify-center">
              <p className="text-center text-[10px] text-zinc-500">
                Your video is rendered locally and prepared for high-quality
                social publishing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Instagram API Publisher Modal */}
      <InstagramPublishModal
        isOpen={isInstagramModalOpen}
        onClose={() => setIsInstagramModalOpen(false)}
        option={option}
        captionStyle={captionStyle}
      />
    </>
  );
};