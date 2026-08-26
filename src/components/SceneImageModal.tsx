import React, { useState } from "react";
import {
  X,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Camera,
  Layers,
  Wand2,
  Check,
  RefreshCw,
  Music,
} from "lucide-react";
import { CameraMotion, VideoOption, VideoScene, VisualFilter } from "../types";

interface SceneImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  scene: VideoScene;
  option: VideoOption;
  onSaveScene: (updatedScene: VideoScene) => void;
}

export const SceneImageModal: React.FC<SceneImageModalProps> = ({
  isOpen,
  onClose,
  scene,
  option,
  onSaveScene,
}) => {
  const [promptInput, setPromptInput] = useState(scene.visualPrompt || "");
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | undefined>(
    scene.customImageUrl
  );
  const [cameraMotion, setCameraMotion] = useState<CameraMotion>(scene.cameraMotion);
  const [visualFilter, setVisualFilter] = useState<VisualFilter>(scene.visualFilter);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const curatedStockSuggestions = [
    {
      label: "Cyberpunk City",
      theme: "neon_cyberpunk",
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=80",
    },
    {
      label: "Minimal Studio",
      theme: "luxury_minimal",
      url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1080&q=80",
    },
    {
      label: "Dark Iron Gym",
      theme: "dark_studio",
      url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1080&q=80",
    },
    {
      label: "3D Tech Hologram",
      theme: "tech_abstract",
      url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1080&q=80",
    },
    {
      label: "Vibrant Ramen Food",
      theme: "vibrant_pop",
      url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1080&q=80",
    },
    {
      label: "Supercar Night Drift",
      theme: "cyberpunk_neon",
      url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1080&q=80",
    },
  ];

  const handleGenerateAiImage = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const res = await fetch("/api/generate-scene-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptInput,
          visualTheme: scene.visualTheme,
          musicGenre: option.musicSettings.genre,
          mood: option.musicSettings.mood,
          cameraMotion: cameraMotion,
          referenceImageUrl: selectedImageUrl,
        }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setSelectedImageUrl(data.imageUrl);
      } else {
        setGenerationError("Could not generate image. Selected curated fallback.");
      }
    } catch (err: any) {
      console.error(err);
      setGenerationError(err.message || "Failed to generate AI scene image");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImageUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSaveScene({
      ...scene,
      visualPrompt: promptInput,
      customImageUrl: selectedImageUrl,
      cameraMotion,
      visualFilter,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>AI Scene Visual & Music-Matched Image Studio</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Scene #{scene.sceneIndex + 1}
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Generate or attach 9:16 vertical imagery tailored for "{option.musicSettings.genre.toUpperCase()}" beat vibe.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form & Generator (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Visual Description Prompt */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                  AI Visual Scene Prompt
                </span>
                <span className="text-[11px] text-zinc-500 font-normal">
                  Matches {option.musicSettings.genre} beat rhythm
                </span>
              </label>
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                rows={3}
                placeholder="Describe the 9:16 scene visual in detail..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition resize-none leading-relaxed"
              />

              {/* Generate AI Button */}
              <button
                type="button"
                onClick={handleGenerateAiImage}
                disabled={isGenerating || !promptInput.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:via-pink-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-purple-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating AI Visual with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Generate AI Visual for this Scene</span>
                  </>
                )}
              </button>
              {generationError && (
                <p className="text-[11px] text-rose-400">{generationError}</p>
              )}
            </div>

            {/* Upload Custom Image or Select Curated Reference */}
            <div className="space-y-3 pt-2 border-t border-zinc-800">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-200">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                  Upload Image or Choose Curated Visual
                </span>
                <label className="cursor-pointer text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  <span>Upload from Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              {/* Curated Aesthetic Grid */}
              <div className="grid grid-cols-3 gap-2">
                {curatedStockSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageUrl(item.url)}
                    className={`aspect-[9/16] rounded-xl overflow-hidden border relative group text-left transition ${
                      selectedImageUrl === item.url
                        ? "border-purple-500 ring-2 ring-purple-500/50"
                        : "border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-1.5">
                      <p className="text-[10px] font-bold text-white truncate">{item.label}</p>
                    </div>
                    {selectedImageUrl === item.url && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center shadow">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Motion & Filter Selectors */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
              <div>
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1 mb-1.5">
                  <Camera className="w-3.5 h-3.5 text-rose-400" /> Camera Motion:
                </label>
                <select
                  value={cameraMotion}
                  onChange={(e) => setCameraMotion(e.target.value as CameraMotion)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-xs text-zinc-200 font-semibold focus:outline-none focus:border-purple-500"
                >
                  <option value="zoom_in">🔍 Ken Burns Zoom In</option>
                  <option value="zoom_out">🔍 Ken Burns Zoom Out</option>
                  <option value="pan_left">⬅️ Smooth Pan Left</option>
                  <option value="pan_right">➡️ Smooth Pan Right</option>
                  <option value="punch_cut">⚡ Sudden Punch Cut</option>
                  <option value="gentle_float">🌊 Gentle Floating Drift</option>
                  <option value="shake_impact">💥 Heavy Shake Impact</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1 mb-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" /> Visual Filter:
                </label>
                <select
                  value={visualFilter}
                  onChange={(e) => setVisualFilter(e.target.value as VisualFilter)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-xs text-zinc-200 font-semibold focus:outline-none focus:border-purple-500"
                >
                  <option value="none">Original (None)</option>
                  <option value="cinematic_glow">✨ Cinematic Warm Glow</option>
                  <option value="cyberpunk_neon">🌆 Cyberpunk Neon Cyan/Pink</option>
                  <option value="retro_vhs">📼 Retro 90s VHS Scanlines</option>
                  <option value="warm_sunset">🌅 Golden Hour Sunset</option>
                  <option value="film_grain">🎞️ 35mm Film Grain</option>
                  <option value="high_contrast_clean">💎 High Contrast Clean Studio</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column: Live 9:16 Canvas Mockup Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="text-xs font-bold text-zinc-300 mb-2 flex items-center gap-1.5">
              <span>9:16 Vertical Preview</span>
              <span className="text-[10px] text-zinc-500 font-normal">
                ({scene.durationSec}s Scene)
              </span>
            </div>

            <div className="relative aspect-[9/16] w-52 sm:w-60 rounded-2xl overflow-hidden border-2 border-zinc-800 bg-zinc-950 shadow-2xl flex flex-col justify-between p-4 group">
              {/* Background Image or Gradient */}
              {selectedImageUrl ? (
                <img
                  src={selectedImageUrl}
                  alt="Scene preview"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${scene.gradientColors[0]}, ${scene.gradientColors[1]}, ${scene.gradientColors[2]})`,
                  }}
                />
              )}

              {/* Visual Filter Overlay */}
              <div className="absolute inset-0 pointer-events-none bg-black/20" />

              {/* Scene Top Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-extrabold text-white border border-white/20">
                  {scene.caption.badge || `SCENE #${scene.sceneIndex + 1}`}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-black/50 backdrop-blur-md text-[9px] font-mono text-zinc-300">
                  {scene.durationSec}s
                </span>
              </div>

              {/* Scene Subtitle / Caption Overlay */}
              <div className="relative z-10 text-center space-y-1 my-auto">
                <div className="inline-block bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 shadow-xl">
                  <p className="text-xs font-black text-amber-300 tracking-wide uppercase leading-tight">
                    {scene.caption.text}
                  </p>
                </div>
                {scene.caption.subtext && (
                  <p className="text-[10px] font-semibold text-white/90 drop-shadow-md">
                    {scene.caption.subtext}
                  </p>
                )}
              </div>

              {/* Scene Bottom Music Info */}
              <div className="relative z-10 flex items-center justify-between text-[10px] text-zinc-300 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                <span className="flex items-center gap-1">
                  <Music className="w-2.5 h-2.5 text-amber-400" />
                  <span className="capitalize font-bold">{option.musicSettings.genre}</span>
                </span>
                <span className="font-mono text-[9px]">{option.musicSettings.tempoBpm} BPM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-zinc-200 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:via-pink-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-purple-600/30 transition transform active:scale-95"
          >
            Apply Scene Visual Changes
          </button>
        </div>
      </div>
    </div>
  );
};
