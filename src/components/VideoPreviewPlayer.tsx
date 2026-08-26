import React, { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Download,
  Sparkles,
  Layers,
  Settings,
  Eye,
  Music,
  Mic,
  Sliders,
  ChevronLeft,
  CheckCircle2,
  Share2,
  Instagram,
} from "lucide-react";
import { CaptionStyle, VideoOption, VideoScene, VisualFilter } from "../types";
import { AudioEngine, globalAudioEngine } from "../utils/audioEngine";
import { VideoRenderer } from "../utils/videoRenderer";
import { InstagramPublishModal } from "./InstagramPublishModal";

interface VideoPreviewPlayerProps {
  option: VideoOption;
  captionStyle: CaptionStyle;
  onChangeCaptionStyle: (style: CaptionStyle) => void;
  onOpenExportModal: () => void;
  onBackToOptions: () => void;
}

export const VideoPreviewPlayer: React.FC<VideoPreviewPlayerProps> = ({
  option,
  captionStyle,
  onChangeCaptionStyle,
  onOpenExportModal,
  onBackToOptions,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showInstagramUI, setShowInstagramUI] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<VisualFilter>("none");
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map());
  const [isInstagramModalOpen, setIsInstagramModalOpen] = useState<boolean>(false);

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const playedSfxRef = useRef<Set<string>>(new Set());
  const currentVoiceSceneRef = useRef<number>(-1);

  const totalDurationSec =
    option.scenes.reduce((sum, s) => sum + s.durationSec, 0) || 30;

  // Preload images on option change
  useEffect(() => {
    const renderer = new VideoRenderer();
    renderer.preloadImages(option.scenes).then((imgMap) => {
      setLoadedImages(imgMap);
    });
  }, [option]);

  // Audio Engine Initialization & Settings Sync
  useEffect(() => {
    globalAudioEngine.init();
    globalAudioEngine.updateSettings({
      ...option.musicSettings,
      musicVolume: isMuted ? 0 : option.musicSettings.musicVolume,
      voiceoverVolume: isMuted ? 0 : option.musicSettings.voiceoverVolume,
    });
  }, [option.musicSettings, isMuted]);

  // Main Render & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderer = new VideoRenderer();

    const loop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaSec = ((timestamp - lastTimeRef.current) / 1000) * playbackSpeed;
      lastTimeRef.current = timestamp;

      let nextTime = currentTimeSec;

      if (isPlaying) {
        nextTime = currentTimeSec + deltaSec;
        if (nextTime >= totalDurationSec) {
          nextTime = 0; // Loop seamlessly
          playedSfxRef.current.clear();
          currentVoiceSceneRef.current = -1;
        }
        setCurrentTimeSec(nextTime);
      }

      // Determine active scene and local scene time
      let accumulatedSec = 0;
      let activeScene: VideoScene = option.scenes[0];
      let sceneTimeSec = 0;
      let activeSceneIndex = 0;

      for (let i = 0; i < option.scenes.length; i++) {
        const sc = option.scenes[i];
        if (nextTime < accumulatedSec + sc.durationSec) {
          activeScene = sc;
          sceneTimeSec = nextTime - accumulatedSec;
          activeSceneIndex = i;
          break;
        }
        accumulatedSec += sc.durationSec;
      }

      // Trigger Voiceover speech if entering a new scene while playing and not muted
      if (isPlaying && !isMuted && currentVoiceSceneRef.current !== activeSceneIndex) {
        currentVoiceSceneRef.current = activeSceneIndex;
        if (activeScene.voiceoverScript) {
          globalAudioEngine.speakVoiceover(
            activeScene.voiceoverScript,
            option.musicSettings.voiceoverTone
          );
        }
      }

      // Trigger SFX cues
      if (isPlaying && !isMuted && activeScene.sfxCues) {
        activeScene.sfxCues.forEach((cue) => {
          const cueKey = `${activeScene.id}-${cue.type}-${cue.offsetSec}`;
          if (!playedSfxRef.current.has(cueKey) && sceneTimeSec >= cue.offsetSec) {
            playedSfxRef.current.add(cueKey);
            globalAudioEngine.playSoundEffect(cue.type);
          }
        });
      }

      // Render Frame
      renderer.renderFrame({
        canvas,
        ctx,
        option,
        currentScene: {
          ...activeScene,
          visualFilter:
            activeFilter !== "none" ? activeFilter : activeScene.visualFilter,
        },
        sceneTimeSec,
        totalTimeSec: nextTime,
        totalDurationSec,
        loadedImages,
        showInstagramOverlay: showInstagramUI,
        captionStyle,
      });

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    isPlaying,
    currentTimeSec,
    playbackSpeed,
    totalDurationSec,
    option,
    loadedImages,
    showInstagramUI,
    activeFilter,
    captionStyle,
    isMuted,
  ]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      globalAudioEngine.stopMusic();
      globalAudioEngine.stopVoiceover();
    } else {
      globalAudioEngine.resume();
      if (!isMuted) {
        globalAudioEngine.startMusic(option.musicSettings);
      }
      lastTimeRef.current = 0;
      setIsPlaying(true);
    }
  };

  const handleReset = () => {
    setCurrentTimeSec(0);
    playedSfxRef.current.clear();
    currentVoiceSceneRef.current = -1;
    lastTimeRef.current = 0;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = Number(e.target.value);
    setCurrentTimeSec(targetTime);
    playedSfxRef.current.clear();
    currentVoiceSceneRef.current = -1;
    lastTimeRef.current = 0;
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${mins}:${s.toString().padStart(2, "0")}.${ms}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToOptions}
            className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition flex items-center gap-1 text-xs font-bold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Options</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {option.styleCategory}
              </span>
              <h2 className="text-base sm:text-lg font-black text-white truncate max-w-md">
                {option.title}
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live Real-Time Audio & Kinetic Visual Preview
            </p>
          </div>
        </div>

        {/* Action Buttons: Export HD and Upload to Instagram */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsInstagramModalOpen(true)}
            className="w-full sm:w-auto px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:via-pink-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg shadow-pink-600/25 transition flex items-center justify-center gap-1.5 transform active:scale-95"
          >
            <Instagram className="w-4 h-4" />
            <span>Upload to Instagram</span>
          </button>

          <button
            type="button"
            onClick={onOpenExportModal}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:via-pink-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-rose-600/30 transition flex items-center justify-center gap-2 transform active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Generate & Export HD</span>
          </button>
        </div>
      </div>

      {/* Main Preview Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center Phone Frame Simulator (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          {/* Smartphone Mockup Container */}
          <div
            ref={containerRef}
            className="relative w-full max-w-[360px] sm:max-w-[380px] aspect-[9/16] rounded-[36px] p-3 bg-zinc-950 border-[6px] border-zinc-800 shadow-2xl shadow-black/80 flex flex-col overflow-hidden group"
          >
            {/* Phone Speaker & Camera Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-zinc-900 rounded-full z-30 flex items-center justify-center gap-2">
              <div className="w-10 h-1 bg-zinc-700 rounded-full" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-700" />
            </div>

            {/* Canvas Video Surface */}
            <div className="relative w-full h-full rounded-[24px] overflow-hidden bg-black flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={1080}
                height={1920}
                className="w-full h-full object-cover cursor-pointer"
                onClick={togglePlay}
              />

              {/* Play Overlay Button if paused */}
              {!isPlaying && (
                <button
                  type="button"
                  onClick={togglePlay}
                  className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:scale-110 transition shadow-2xl z-20 group-hover:opacity-100"
                >
                  <Play className="w-7 h-7 fill-white translate-x-0.5" />
                </button>
              )}
            </div>
          </div>

          {/* Bottom Player Controller Bar */}
          <div className="w-full max-w-[420px] bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 mt-4 shadow-xl space-y-3">
            {/* Timeline Scrubber */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="text-rose-400 font-bold">
                  {formatTime(currentTimeSec)}
                </span>
                <span>{formatTime(totalDurationSec)}</span>
              </div>

              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max={totalDurationSec}
                  step="0.05"
                  value={currentTimeSec}
                  onChange={handleSeek}
                  className="w-full accent-rose-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
                />

                {/* Scene breakpoints ticks */}
                <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 pointer-events-none flex justify-between px-1">
                  {option.scenes.map((s, idx) => (
                    <div
                      key={s.id}
                      className="w-1.5 h-1.5 rounded-full bg-zinc-500/60"
                      title={`Scene ${idx + 1}: ${s.caption.text}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Playback Action Buttons */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition shadow-md shadow-rose-600/30"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 fill-white translate-x-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                  title="Replay from start"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-2.5 rounded-xl transition ${
                    isMuted
                      ? "bg-zinc-800 text-rose-400"
                      : "bg-zinc-800 text-zinc-300 hover:text-white"
                  }`}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Speed Switcher */}
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                {[1, 1.25, 1.5].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                      playbackSpeed === spd
                        ? "bg-rose-600 text-white"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Video Customizer & Instagram Tools (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Quick Real-Time Style Switcher */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Live Caption Typography</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "hormozi_bold", label: "🔥 Hormozi Punch" },
                { id: "neon_glow", label: "✨ Cyber Neon" },
                { id: "minimal_clean", label: "💎 Minimal Glass" },
                { id: "pop_box", label: "📦 Pop Box" },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => onChangeCaptionStyle(style.id as CaptionStyle)}
                  className={`p-2.5 rounded-xl text-xs font-bold border text-left transition ${
                    captionStyle === style.id
                      ? "bg-indigo-500/20 border-indigo-500 text-indigo-300"
                      : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Visual Filters Switcher */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Visual Aesthetic Filter</span>
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "none", label: "Clean / None" },
                { id: "retro_vhs", label: "📼 Retro VHS" },
                { id: "cyberpunk_neon", label: "⚡ Neon Edge" },
                { id: "cinematic_glow", label: "🌟 Glow" },
                { id: "warm_sunset", label: "🌅 Warm Sunset" },
                { id: "film_grain", label: "🎞️ Film Grain" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilter(f.id as VisualFilter)}
                  className={`p-2 rounded-xl text-[11px] font-bold border transition truncate ${
                    activeFilter === f.id
                      ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                      : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Instagram UI Simulator Toggle */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Eye className="w-4 h-4 text-pink-400" />
              <div>
                <div className="text-xs font-bold text-zinc-200">
                  Instagram Reel UI Simulator
                </div>
                <div className="text-[11px] text-zinc-500">
                  Preview likes, comments, audio disc, and safe zones
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={showInstagramUI}
              onChange={(e) => setShowInstagramUI(e.target.checked)}
              className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
            />
          </div>

          {/* Instagram Copywriting & Viral Metadata */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>Instagram Post Copy & Hashtags</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                Ready to Publish
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">
                  Suggested Caption Copy:
                </span>
                <p className="text-zinc-200 leading-relaxed">
                  {option.instagramMetadata.captionCopy}
                </p>
              </div>

              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">
                  Viral Trending Hashtags:
                </span>
                <div className="flex flex-wrap gap-1 text-[11px] text-indigo-300 font-mono">
                  {option.instagramMetadata.trendingHashtags.map((tag, idx) => (
                    <span key={idx}>{tag}</span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                <span>Best Time to Post:</span>
                <span className="font-bold text-amber-400">
                  {option.instagramMetadata.bestTimeToPost}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsInstagramModalOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:via-pink-500 hover:to-rose-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition mt-2"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Upload Directly via Instagram API</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Instagram API Direct Publisher Modal */}
      <InstagramPublishModal
        isOpen={isInstagramModalOpen}
        onClose={() => setIsInstagramModalOpen(false)}
        option={option}
        captionStyle={captionStyle}
      />
    </div>
  );
};
