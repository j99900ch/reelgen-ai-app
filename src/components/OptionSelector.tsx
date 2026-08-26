import React, { useState } from "react";
import {
  CheckCircle2,
  Sparkles,
  Flame,
  Film,
  Music,
  Clock,
  Layers,
  Edit3,
  ChevronRight,
  Eye,
  Sliders,
  Camera,
  Play,
  RotateCcw,
  Volume2,
  Check,
  Tag,
  Radio,
  Zap,
  Square,
  Wand2,
  Image as ImageIcon,
} from "lucide-react";
import { CameraMotion, CaptionStyle, VideoOption, VideoScene, VisualFilter } from "../types";
import { SceneImageModal } from "./SceneImageModal";
import { globalAudioEngine } from "../utils/audioEngine";

interface OptionSelectorProps {
  options: VideoOption[];
  selectedOption: VideoOption | null;
  onSelectOption: (option: VideoOption) => void;
  onPreviewClick: (option: VideoOption) => void;
  onUpdateOptionScenes?: (updatedOption: VideoOption) => void;
}

export const OptionSelector: React.FC<OptionSelectorProps> = ({
  options,
  selectedOption,
  onSelectOption,
  onPreviewClick,
  onUpdateOptionScenes,
}) => {
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [activeSceneIdx, setActiveSceneIdx] = useState<number>(0);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>("all");
  const [modalSceneState, setModalSceneState] = useState<{
    isOpen: boolean;
    scene: VideoScene | null;
    option: VideoOption | null;
  }>({
    isOpen: false,
    scene: null,
    option: null,
  });
  const [playingOptionAudioId, setPlayingOptionAudioId] = useState<string | null>(null);

  const handleTogglePlayOptionBeat = (opt: VideoOption) => {
    if (playingOptionAudioId === opt.id) {
      globalAudioEngine.stopMusic();
      setPlayingOptionAudioId(null);
    } else {
      globalAudioEngine.startMusic(opt.musicSettings);
      setPlayingOptionAudioId(opt.id);
    }
  };

  const handleEditScene = (
    opt: VideoOption,
    sceneIdx: number,
    field: keyof VideoScene | "captionText" | "captionSubtext" | "captionBadge",
    value: any
  ) => {
    if (!onUpdateOptionScenes) return;

    const newScenes = opt.scenes.map((s, idx) => {
      if (idx !== sceneIdx) return s;
      if (field === "captionText") {
        return { ...s, caption: { ...s.caption, text: value } };
      }
      if (field === "captionSubtext") {
        return { ...s, caption: { ...s.caption, subtext: value } };
      }
      if (field === "captionBadge") {
        return { ...s, caption: { ...s.caption, badge: value } };
      }
      return { ...s, [field]: value };
    });

    const updated = { ...opt, scenes: newScenes };
    onUpdateOptionScenes(updated);
  };

  const handleOpenSceneImageModal = (opt: VideoOption, scene: VideoScene) => {
    setModalSceneState({
      isOpen: true,
      scene,
      option: opt,
    });
  };

  const handleSaveModalScene = (updatedScene: VideoScene) => {
    if (!modalSceneState.option || !onUpdateOptionScenes) return;
    const newScenes = modalSceneState.option.scenes.map((s) =>
      s.id === updatedScene.id ? updatedScene : s
    );
    onUpdateOptionScenes({
      ...modalSceneState.option,
      scenes: newScenes,
    });
  };

  const getOptionStyleBadge = (index: number, category: string) => {
    switch (index) {
      case 0:
        return {
          bar: "bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500",
          tagBg: "bg-rose-500/15 text-rose-300 border-rose-500/30",
          icon: "⚡",
          accentColor: "rose",
        };
      case 1:
        return {
          bar: "bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400",
          tagBg: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
          icon: "🎬",
          accentColor: "indigo",
        };
      case 2:
        return {
          bar: "bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500",
          tagBg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
          icon: "🧠",
          accentColor: "emerald",
        };
      case 3:
        return {
          bar: "bg-gradient-to-r from-fuchsia-500 via-rose-500 to-orange-500",
          tagBg: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
          icon: "🏎️",
          accentColor: "fuchsia",
        };
      case 4:
      default:
        return {
          bar: "bg-gradient-to-r from-amber-400 via-zinc-400 to-yellow-600",
          tagBg: "bg-amber-500/15 text-amber-300 border-amber-500/30",
          icon: "👑",
          accentColor: "amber",
        };
    }
  };

  const filteredOptions =
    selectedFilterCategory === "all"
      ? options
      : options.filter((opt) => opt.id === selectedFilterCategory);

  return (
    <div className="space-y-6">
      {/* Header Info & Category Filter Bar */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h2 className="text-xl font-black text-white tracking-tight">
                5 Distinct Creative Video Variations
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                5 Archetypes
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Each variation offers a unique creative direction, viral retention mechanics, and dynamically matched music settings.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 bg-zinc-950 px-3.5 py-2 rounded-xl border border-zinc-800 self-start md:self-auto shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Select any variation to preview & export in 1080x1920 HD</span>
          </div>
        </div>

        {/* Filter / Quick Jump Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={() => setSelectedFilterCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedFilterCategory === "all"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                : "bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
            }`}
          >
            All 5 Variations ({options.length})
          </button>

          {options.map((opt, i) => {
            const badge = getOptionStyleBadge(i, opt.styleCategory);
            const isSelected = selectedFilterCategory === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedFilterCategory(opt.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-zinc-800 text-white border border-rose-500 shadow-md"
                    : "bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                }`}
              >
                <span>{badge.icon}</span>
                <span>
                  Var {i + 1}: {opt.styleCategory}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5 Variation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOptions.map((opt) => {
          const index = options.findIndex((o) => o.id === opt.id);
          const isSelected = selectedOption?.id === opt.id;
          const totalDuration = opt.scenes.reduce((sum, s) => sum + s.durationSec, 0);
          const badge = getOptionStyleBadge(index, opt.styleCategory);
          const isPlayingAudio = playingOptionAudioId === opt.id;

          return (
            <div
              key={opt.id}
              className={`rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden relative ${
                isSelected
                  ? "bg-zinc-900/95 border-rose-500 shadow-2xl shadow-rose-500/15 ring-2 ring-rose-500/40"
                  : "bg-zinc-900/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/90 shadow-lg"
              }`}
            >
              {/* Top Accent Gradient Bar */}
              <div className={`h-2 w-full ${badge.bar}`} />

              <div className="p-5 sm:p-6 space-y-4 flex-1">
                {/* Header: Option Number, Archetype Tag & Viral Score */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${badge.tagBg}`}
                  >
                    <span>{badge.icon}</span>
                    <span>
                      Variation {index + 1}: {opt.styleCategory}
                    </span>
                  </span>

                  <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-md text-[11px] font-bold text-amber-300">
                    <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>Score {opt.viralScore}/100</span>
                  </div>
                </div>

                {/* Title & Tagline */}
                <div>
                  <h3 className="font-black text-base text-zinc-100 leading-snug">
                    {opt.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {opt.tagline}
                  </p>
                </div>

                {/* Retention Strategy */}
                <div className="bg-zinc-950/70 rounded-2xl p-3.5 border border-zinc-800/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-rose-400" />
                    Viral Retention Hook:
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                    {opt.retentionAngle}
                  </p>
                </div>

                {/* Dynamically Matched Music Settings Badge & Live Player */}
                <div className="bg-zinc-950/70 p-3.5 rounded-2xl border border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                      <Music className="w-3.5 h-3.5" />
                      <span className="capitalize">{opt.musicSettings.genre} Beat</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTogglePlayOptionBeat(opt)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition ${
                        isPlayingAudio
                          ? "bg-rose-600 text-white animate-pulse"
                          : "bg-zinc-800 text-zinc-300 hover:text-white"
                      }`}
                    >
                      {isPlayingAudio ? (
                        <>
                          <Square className="w-2.5 h-2.5 fill-current" />
                          <span>Stop Beat</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>Test Beat</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px] text-zinc-400 pt-1 border-t border-zinc-900">
                    <div>
                      <span className="text-zinc-500">Tone: </span>
                      <span className="text-zinc-200 capitalize font-medium">
                        {opt.musicSettings.voiceoverTone.replace("_", " ")}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-zinc-500">Duration: </span>
                      <span className="text-white font-mono font-bold">
                        {Math.round(totalDuration)}s
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scene Flow Micro-Timeline */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
                    <span>Scenes ({opt.scenes.length} Cuts):</span>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingOptionId(editingOptionId === opt.id ? null : opt.id)
                      }
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>
                        {editingOptionId === opt.id ? "Close Editor" : "Customize Scenes"}
                      </span>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {opt.scenes.map((scene) => (
                      <div
                        key={scene.id}
                        onClick={() => handleOpenSceneImageModal(opt, scene)}
                        className="flex items-start gap-2 bg-zinc-950/80 hover:bg-zinc-900 p-2.5 rounded-2xl border border-zinc-800/70 text-xs cursor-pointer group transition"
                      >
                        <span className="font-mono text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-bold mt-0.5">
                          {scene.durationSec}s
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-zinc-200 truncate group-hover:text-purple-300 transition">
                            {scene.caption.text}
                          </p>
                          <p className="text-[10px] text-zinc-400 line-clamp-1 italic">
                            "{scene.voiceoverScript}"
                          </p>
                        </div>
                        <div className="p-1 rounded-lg bg-zinc-800 group-hover:bg-purple-600/30 text-zinc-500 group-hover:text-purple-300 transition self-center">
                          <ImageIcon className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inline Scene Customizer Drawer */}
                {editingOptionId === opt.id && (
                  <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 space-y-3 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5" /> Edit Scene Text & Visuals:
                      </span>
                      <div className="flex gap-1">
                        {opt.scenes.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setActiveSceneIdx(i)}
                            className={`w-6 h-6 rounded-lg text-[11px] font-bold ${
                              activeSceneIdx === i
                                ? "bg-indigo-600 text-white"
                                : "bg-zinc-800 text-zinc-400"
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                    </div>

                    {opt.scenes[activeSceneIdx] && (
                      <div className="space-y-2.5">
                        <div>
                          <label className="text-[10px] font-semibold text-zinc-400">
                            Scene Subtitle Headline:
                          </label>
                          <input
                            type="text"
                            value={opt.scenes[activeSceneIdx].caption.text}
                            onChange={(e) =>
                              handleEditScene(opt, activeSceneIdx, "captionText", e.target.value)
                            }
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-zinc-400">
                            Voiceover Speech Text:
                          </label>
                          <input
                            type="text"
                            value={opt.scenes[activeSceneIdx].voiceoverScript}
                            onChange={(e) =>
                              handleEditScene(
                                opt,
                                activeSceneIdx,
                                "voiceoverScript",
                                e.target.value
                              )
                            }
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>

                        {/* Open Visual Image Studio Button */}
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenSceneImageModal(opt, opt.scenes[activeSceneIdx])
                          }
                          className="w-full py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold transition flex items-center justify-center gap-1.5"
                        >
                          <Wand2 className="w-3.5 h-3.5 text-purple-300" />
                          <span>AI Visual & Image Studio for Scene #{activeSceneIdx + 1}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="p-4 bg-zinc-950/90 border-t border-zinc-800/80 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onSelectOption(opt);
                    onPreviewClick(opt);
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 shadow-md ${
                    isSelected
                      ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Selected & Open Preview</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Select Variation {index + 1}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Scene Visual & Reference Image Studio Modal */}
      {modalSceneState.isOpen && modalSceneState.scene && modalSceneState.option && (
        <SceneImageModal
          isOpen={modalSceneState.isOpen}
          onClose={() =>
            setModalSceneState({ isOpen: false, scene: null, option: null })
          }
          scene={modalSceneState.scene}
          option={modalSceneState.option}
          onSaveScene={handleSaveModalScene}
        />
      )}
    </div>
  );
};
