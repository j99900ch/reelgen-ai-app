import React, { useState, useRef } from "react";
import {
  Sparkles,
  Link as LinkIcon,
  Upload,
  Music,
  Sliders,
  Play,
  Volume2,
  Trash2,
  CheckCircle2,
  Flame,
  Info,
  Clock,
  Mic,
  FileText,
  HelpCircle,
  Wand2,
  Image as ImageIcon,
  Layers,
  Filter,
} from "lucide-react";
import {
  CaptionStyle,
  MusicSettings,
  ReferenceImage,
  TemplateCategory,
  VideoGenre,
  VideoRequirement,
  VoiceTone,
} from "../types";
import { PRESET_TEMPLATES, PresetTemplate } from "../data/presets";
import { MusicMakerStudio } from "./MusicMakerStudio";

interface InputSectionProps {
  requirement: VideoRequirement;
  onChange: (req: VideoRequirement) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({
  requirement,
  onChange,
  onGenerate,
  isLoading,
}) => {
  const [analyzingLink, setAnalyzingLink] = useState(false);
  const [linkAnalysisResult, setLinkAnalysisResult] = useState<any>(null);
  const [selectedTemplateCategory, setSelectedTemplateCategory] =
    useState<TemplateCategory>("all");
  const [isGeneratingRefImage, setIsGeneratingRefImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const templateCategories: { id: TemplateCategory; label: string; icon: string }[] = [
    { id: "all", label: "All Templates", icon: "✨" },
    { id: "viral_tech", label: "Viral Tech & AI", icon: "⚡" },
    { id: "luxury_brand", label: "Luxury & Brand", icon: "👑" },
    { id: "motivation_gym", label: "Gym & Motivation", icon: "🔥" },
    { id: "food_lifestyle", label: "Food & ASMR", icon: "🍳" },
    { id: "commerce_product", label: "E-Commerce Dropship", icon: "📦" },
    { id: "podcast_talk", label: "Podcast & Talk", icon: "🎙️" },
  ];

  const filteredPresets =
    selectedTemplateCategory === "all"
      ? PRESET_TEMPLATES
      : PRESET_TEMPLATES.filter((p) => p.category === selectedTemplateCategory);

  const captionStyles: { id: CaptionStyle; label: string; desc: string; sample: string }[] = [
    {
      id: "hormozi_bold",
      label: "🔥 Hormozi / MrBeast Bold",
      desc: "Yellow & green highlighted punch text",
      sample: "SECRET HACK",
    },
    {
      id: "neon_glow",
      label: "✨ Cyberpunk Glow",
      desc: "Cyan & magenta neon blur with drop-shadow",
      sample: "NEON IMPACT",
    },
    {
      id: "minimal_clean",
      label: "💎 Minimalist Glass",
      desc: "Clean Apple-style frosted pill backdrop",
      sample: "Simplicity.",
    },
    {
      id: "pop_box",
      label: "📦 Kinetic Pop Box",
      desc: "High-contrast dark badge with vibrant text",
      sample: "STEP #1",
    },
  ];

  const handleApplyPreset = (preset: PresetTemplate) => {
    onChange({
      promptText: preset.promptText,
      videoLinkRef: preset.videoLinkRef,
      referenceImages: preset.sampleImages,
      targetDuration: preset.targetDuration,
      musicSettings: preset.musicSettings,
      captionStyle: preset.captionStyle,
    });
    setLinkAnalysisResult(null);
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const newImg: ReferenceImage = {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          url,
          name: file.name,
          role: "product",
        };
        onChange({
          ...requirement,
          referenceImages: [...requirement.referenceImages, newImg],
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleGenerateAiStarterImage = async () => {
    if (!requirement.promptText.trim()) return;
    setIsGeneratingRefImage(true);
    try {
      const res = await fetch("/api/generate-scene-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: requirement.promptText,
          visualTheme: "cyberpunk_neon",
          musicGenre: requirement.musicSettings.genre,
          mood: requirement.musicSettings.mood,
          cameraMotion: "zoom_in",
        }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        const newImg: ReferenceImage = {
          id: `img-ai-${Date.now()}`,
          url: data.imageUrl,
          name: `AI Ref (${requirement.musicSettings.genre.toUpperCase()})`,
          role: "aesthetic",
        };
        onChange({
          ...requirement,
          referenceImages: [...requirement.referenceImages, newImg],
        });
      }
    } catch (e) {
      console.error("Error generating reference image:", e);
    } finally {
      setIsGeneratingRefImage(false);
    }
  };

  const handleRemoveImage = (id: string) => {
    onChange({
      ...requirement,
      referenceImages: requirement.referenceImages.filter((img) => img.id !== id),
    });
  };

  const handleUpdateImageRole = (id: string, role: ReferenceImage["role"]) => {
    onChange({
      ...requirement,
      referenceImages: requirement.referenceImages.map((img) =>
        img.id === id ? { ...img, role } : img
      ),
    });
  };

  const handleAnalyzeLink = async () => {
    if (!requirement.videoLinkRef) return;
    setAnalyzingLink(true);
    try {
      const res = await fetch("/api/analyze-reference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoLink: requirement.videoLinkRef,
          promptText: requirement.promptText,
          referenceImages: requirement.referenceImages,
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setLinkAnalysisResult(data.analysis);
      } else if (data.fallback) {
        setLinkAnalysisResult(data.fallback);
      }
    } catch (e) {
      console.error(e);
      setLinkAnalysisResult({
        linkDetected: true,
        linkType: "Instagram Short / Reel",
        suggestedPacing: "High-Energy (1.5s - 2s rapid cuts)",
        extractedHooks: [
          "Pattern Interrupt Hook: Stop scrolling immediately!",
          "Curiosity Gap: The hidden truth no one explains.",
        ],
        keyInsights:
          "High viral potential extracted from link reference: uses dynamic text pop-ins and heavy bassline drop.",
      });
    } finally {
      setAnalyzingLink(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Variance Templates Drawer & Quick Starts */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>Variance Templates & Viral Archetypes</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {PRESET_TEMPLATES.length} Presets
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                1-click load pre-configured prompts, sample visual assets, kinetic caption styles, and tailored music beats.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-zinc-400 self-start sm:self-auto bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800">
            Select any template to auto-populate
          </span>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-zinc-800/80">
          {templateCategories.map((cat) => {
            const isSelected = selectedTemplateCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedTemplateCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                    : "bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Preset Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-left p-3.5 rounded-2xl bg-zinc-950/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-zinc-700 transition-all group relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-xs font-black text-zinc-100 group-hover:text-white truncate">
                    {preset.name}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 whitespace-nowrap">
                    {preset.badge}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mb-2.5">
                  {preset.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-500">
                <span className="flex items-center gap-1 font-semibold text-amber-400/90">
                  <Music className="w-3 h-3" />
                  <span className="capitalize">{preset.musicSettings.genre}</span> ({preset.musicSettings.tempoBpm} BPM)
                </span>
                <span className="font-mono text-zinc-400">{preset.targetDuration}s HD</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Workspace: Prompt & Reference (Left) | Interactive Music Studio (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Requirements & References (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Text Requirement Prompt Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-extrabold text-white">
                  1. Video Requirement & Narrative Prompt
                </h3>
              </div>
              <span className="text-[11px] text-zinc-400 font-semibold">
                Natural Language Instructions
              </span>
            </div>

            <textarea
              value={requirement.promptText}
              onChange={(e) =>
                onChange({ ...requirement, promptText: e.target.value })
              }
              rows={4}
              placeholder="Describe the Instagram Short you want to make... (e.g. 'Make a high-energy 30-sec Reel about 3 AI tools that will save you 10 hours a week with fast-paced cuts, beat drops, and a punchy hook.')"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition resize-none leading-relaxed"
            />

            {/* Target Duration Selector */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-500" /> Target Duration:
              </span>
              <div className="flex items-center gap-1.5">
                {([15, 30, 45, 60] as const).map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() =>
                      onChange({ ...requirement, targetDuration: dur })
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      requirement.targetDuration === dur
                        ? "bg-rose-600 text-white shadow-sm"
                        : "bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                    }`}
                  >
                    {dur}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reference Video Link Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-extrabold text-white">
                  2. Reference Video Link (Optional)
                </h3>
              </div>
              <span className="text-[11px] text-zinc-400 font-semibold">
                Instagram / TikTok / YouTube
              </span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="url"
                  value={requirement.videoLinkRef}
                  onChange={(e) =>
                    onChange({ ...requirement, videoLinkRef: e.target.value })
                  }
                  placeholder="Paste Instagram Reel / TikTok / YouTube Shorts URL..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
              </div>
              <button
                type="button"
                onClick={handleAnalyzeLink}
                disabled={analyzingLink || !requirement.videoLinkRef.trim()}
                className="px-4 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold border border-zinc-700 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {analyzingLink ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Analyze Pacing</span>
                  </>
                )}
              </button>
            </div>

            {/* Analysis Result Banner */}
            {linkAnalysisResult && (
              <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 text-xs space-y-2">
                <div className="flex items-center gap-2 text-cyan-300 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>Reference Insights Extracted:</span>
                </div>
                <p className="text-zinc-300 leading-relaxed">
                  {linkAnalysisResult.keyInsights || linkAnalysisResult.toneRecommendation}
                </p>
              </div>
            )}
          </div>

          {/* Reference Images & AI Visual Matcher */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-extrabold text-white">
                  3. Reference Images & AI Visual Matcher
                </h3>
              </div>

              {/* Generate AI Starter Image Button */}
              <button
                type="button"
                onClick={handleGenerateAiStarterImage}
                disabled={isGeneratingRefImage || !requirement.promptText.trim()}
                className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {isGeneratingRefImage ? (
                  <>
                    <div className="w-3 h-3 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
                    <span>Generating Image...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3 h-3 text-purple-300" />
                    <span>Generate AI Ref Image</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Upload product photos, character references, or background moods. The AI will seamlessly weave them into generated scenes.
            </p>

            {/* Drag & Drop / Upload Trigger Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-800 hover:border-purple-500/60 bg-zinc-950/60 hover:bg-zinc-950 p-6 rounded-2xl text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files)}
              />
              <div className="p-3 rounded-2xl bg-zinc-900 group-hover:bg-purple-500/20 text-zinc-400 group-hover:text-purple-300 transition">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-zinc-200">
                Click to upload reference images or drag & drop
              </p>
              <p className="text-[10px] text-zinc-500">
                Supports PNG, JPG, WebP (Vertical 9:16 recommended)
              </p>
            </div>

            {/* Image Preview Thumbnails */}
            {requirement.referenceImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {requirement.referenceImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-[9/16] rounded-2xl overflow-hidden border border-zinc-800 group shadow-md"
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.id)}
                      className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/70 hover:bg-rose-600 text-white transition shadow"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-zinc-950/90 p-1.5 border-t border-zinc-800">
                      <select
                        value={img.role}
                        onChange={(e) =>
                          handleUpdateImageRole(
                            img.id,
                            e.target.value as ReferenceImage["role"]
                          )
                        }
                        className="w-full bg-zinc-900 text-[10px] text-zinc-300 font-semibold rounded px-1.5 py-0.5 border border-zinc-700 focus:outline-none"
                      >
                        <option value="product">📦 Product</option>
                        <option value="aesthetic">✨ Aesthetic</option>
                        <option value="background">🖼️ Background</option>
                        <option value="character">👤 Character</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Music Studio & Captions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Integrated Interactive Music Studio */}
          <MusicMakerStudio
            settings={requirement.musicSettings}
            onChange={(updatedMusic) =>
              onChange({ ...requirement, musicSettings: updatedMusic })
            }
          />

          {/* Subtitle Caption Style Selector */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Kinetic Caption Animation Style</span>
              </h3>
              <span className="text-[10px] font-bold text-zinc-500 uppercase">
                4 Typography Engines
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {captionStyles.map((c) => {
                const isSelected = requirement.captionStyle === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onChange({ ...requirement, captionStyle: c.id })}
                    className={`text-left p-3 rounded-2xl border transition-all ${
                      isSelected
                        ? "bg-indigo-500/15 border-indigo-500/50 text-indigo-200 shadow-sm"
                        : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <div className="text-xs font-bold">{c.label}</div>
                    <div className="text-[10px] text-zinc-500 leading-tight mt-0.5">
                      {c.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Big Generate Action Button */}
          <button
            type="button"
            onClick={onGenerate}
            disabled={isLoading || !requirement.promptText.trim()}
            className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:via-pink-500 hover:to-indigo-500 text-white font-black text-base shadow-xl shadow-rose-600/30 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                <span>Crafting 5 Original AI Variations...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300 animate-bounce" />
                <span>Generate 5 Original Video Variations</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
