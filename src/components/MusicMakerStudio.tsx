import React, { useState, useEffect } from "react";
import {
  Music,
  Play,
  Square,
  Sliders,
  Volume2,
  Mic,
  Flame,
  Zap,
  Sparkles,
  RefreshCw,
  Radio,
  Disc,
} from "lucide-react";
import { MusicSettings, SoundEffectType, VideoGenre, VoiceTone } from "../types";
import { globalAudioEngine } from "../utils/audioEngine";

interface MusicMakerStudioProps {
  settings: MusicSettings;
  onChange: (updated: MusicSettings) => void;
  compact?: boolean;
}

export const MusicMakerStudio: React.FC<MusicMakerStudioProps> = ({
  settings,
  onChange,
  compact = false,
}) => {
  const [isPlayingBeat, setIsPlayingBeat] = useState(false);
  const [lastSfxPlayed, setLastSfxPlayed] = useState<string | null>(null);

  const genres: {
    id: VideoGenre;
    label: string;
    icon: string;
    desc: string;
    recommendedBpm: number;
    color: string;
  }[] = [
    {
      id: "trap",
      label: "Trap / Hip-Hop",
      icon: "🔥",
      desc: "Punchy 808 bass, crisp rolls & rolling hi-hats",
      recommendedBpm: 138,
      color: "from-amber-500/20 to-rose-500/20 text-amber-300 border-amber-500/40",
    },
    {
      id: "phonk",
      label: "Drift Phonk",
      icon: "🏎️",
      desc: "Aggressive cowbell, distorted sub-bass & high energy",
      recommendedBpm: 145,
      color: "from-rose-500/20 to-purple-500/20 text-rose-300 border-rose-500/40",
    },
    {
      id: "synthwave",
      label: "Retro Synthwave",
      icon: "⚡",
      desc: "1980s analog arpeggios & futuristic drive",
      recommendedBpm: 126,
      color: "from-cyan-500/20 to-indigo-500/20 text-cyan-300 border-cyan-500/40",
    },
    {
      id: "lofi",
      label: "Lo-Fi Aesthetic",
      icon: "☕",
      desc: "Mellow vinyl chords, cozy snare & relaxed tempo",
      recommendedBpm: 90,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/40",
    },
    {
      id: "cinematic",
      label: "Cinematic Deep",
      icon: "🎬",
      desc: "Orchestral atmosphere, epic sub-booms & tension",
      recommendedBpm: 102,
      color: "from-indigo-500/20 to-purple-500/20 text-indigo-300 border-indigo-500/40",
    },
    {
      id: "electronic",
      label: "Upbeat EDM",
      icon: "🎛️",
      desc: "Club house rhythm, energetic buildups & drops",
      recommendedBpm: 130,
      color: "from-fuchsia-500/20 to-pink-500/20 text-fuchsia-300 border-fuchsia-500/40",
    },
  ];

  const voiceTones: { id: VoiceTone; label: string; desc: string; sample: string }[] = [
    {
      id: "energetic",
      label: "⚡ High-Energy Creator",
      desc: "Fast, punchy & enthusiastic hook delivery",
      sample: "Stop scrolling! Here is the secret you cannot afford to miss!",
    },
    {
      id: "cinematic_deep",
      label: "🎙️ Deep Cinematic",
      desc: "Dramatic, rich & authoritative narrative",
      sample: "In the quiet moments before dawn, true greatness is built.",
    },
    {
      id: "friendly_creator",
      label: "👋 Friendly Casual",
      desc: "Warm, relatable, authentic storytelling",
      sample: "Hey everyone! Let me share a trick that saved me 10 hours this week.",
    },
    {
      id: "tech_modern",
      label: "🧠 Modern Tech",
      desc: "Sharp, crisp & highly informative",
      sample: "Let's break down the exact algorithmic framework in 3 simple steps.",
    },
    {
      id: "chill_storyteller",
      label: "🌙 Chill Storyteller",
      desc: "Smooth, reflective & captivating rhythm",
      sample: "Most people rush through life, forgetting the art of simplicity.",
    },
    {
      id: "dramatic_trailer",
      label: "🔥 Dramatic Trailer",
      desc: "Intense, booming movie trailer delivery",
      sample: "When everything is on the line... only the relentless survive.",
    },
  ];

  const soundFxList: { id: SoundEffectType; label: string; icon: string }[] = [
    { id: "whoosh", label: "Whoosh Transition", icon: "💨" },
    { id: "bass_drop", label: "808 Bass Drop", icon: "💥" },
    { id: "glitch", label: "Digital Glitch", icon: "⚡" },
    { id: "pop", label: "Graphic Pop", icon: "🎈" },
    { id: "ding", label: "Success Ding", icon: "🔔" },
    { id: "camera_shutter", label: "Camera Shutter", icon: "📸" },
    { id: "impact", label: "Heavy Impact", icon: "🔨" },
    { id: "riser", label: "Tension Riser", icon: "📈" },
  ];

  // Stop music when component unmounts
  useEffect(() => {
    return () => {
      globalAudioEngine.stopMusic();
    };
  }, []);

  const togglePlayBeat = () => {
    if (isPlayingBeat) {
      globalAudioEngine.stopMusic();
      setIsPlayingBeat(false);
    } else {
      globalAudioEngine.startMusic(settings);
      setIsPlayingBeat(true);
    }
  };

  const handleSelectGenre = (g: typeof genres[0]) => {
    const updated = {
      ...settings,
      genre: g.id,
      tempoBpm: g.recommendedBpm,
    };
    onChange(updated);
    if (isPlayingBeat) {
      globalAudioEngine.startMusic(updated);
    }
  };

  const handleTriggerSfx = (type: SoundEffectType) => {
    globalAudioEngine.playSoundEffect(type);
    setLastSfxPlayed(type);
    setTimeout(() => setLastSfxPlayed(null), 600);
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Header with Live Player Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <span>Interactive Music Studio & Beat Synthesizer</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Live Audio Engine
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Customize audio genre, tempo, sound FX drops, and voiceover tones in real time.
            </p>
          </div>
        </div>

        {/* Live Audio Preview Trigger */}
        <button
          type="button"
          onClick={togglePlayBeat}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg ${
            isPlayingBeat
              ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-pulse"
              : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black shadow-amber-500/25"
          }`}
        >
          {isPlayingBeat ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop Beat Preview</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Live Preview Beat ({settings.genre.toUpperCase()})</span>
            </>
          )}
        </button>
      </div>

      {/* Genre Selector Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-zinc-200 flex items-center gap-1.5">
            <Disc className="w-3.5 h-3.5 text-amber-400" />
            Select Soundtrack Genre:
          </span>
          <span className="text-zinc-500 text-[11px]">
            Selected: <strong className="text-amber-400 capitalize">{settings.genre}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {genres.map((g) => {
            const isSelected = settings.genre === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => handleSelectGenre(g)}
                className={`text-left p-3 rounded-2xl border transition-all relative overflow-hidden group ${
                  isSelected
                    ? `bg-gradient-to-br ${g.color} shadow-md scale-[1.02]`
                    : "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-zinc-100">
                    <span>{g.icon}</span>
                    <span className="truncate">{g.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 font-semibold">
                    {g.recommendedBpm}BPM
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                  {g.desc}
                </p>
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tempo BPM & Bass Drop Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-zinc-800/80">
        {/* Tempo Slider */}
        <div className="space-y-2 bg-zinc-950/50 p-3.5 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" /> Tempo Speed (BPM):
            </span>
            <span className="font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {settings.tempoBpm} BPM
            </span>
          </div>
          <input
            type="range"
            min="70"
            max="165"
            step="1"
            value={settings.tempoBpm}
            onChange={(e) => {
              const bpm = Number(e.target.value);
              const updated = { ...settings, tempoBpm: bpm };
              onChange(updated);
              if (isPlayingBeat) globalAudioEngine.startMusic(updated);
            }}
            className="w-full accent-amber-500 cursor-pointer bg-zinc-800 h-2 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>Chill (80)</span>
            <span>House (128)</span>
            <span>Trap (138)</span>
            <span>Phonk (148)</span>
          </div>
        </div>

        {/* Bass Drop Second Timing */}
        <div className="space-y-2 bg-zinc-950/50 p-3.5 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-300 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-400" /> Bass Drop Marker:
            </span>
            <span className="font-mono font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              at {settings.bassDropSecond}s
            </span>
          </div>
          <input
            type="range"
            min="1.0"
            max="8.0"
            step="0.5"
            value={settings.bassDropSecond}
            onChange={(e) => {
              onChange({ ...settings, bassDropSecond: Number(e.target.value) });
            }}
            className="w-full accent-rose-500 cursor-pointer bg-zinc-800 h-2 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>Early Hook (1.5s)</span>
            <span>Standard (3.5s)</span>
            <span>Cinematic Build (6.0s)</span>
          </div>
        </div>
      </div>

      {/* Sound FX Interactive Soundboard */}
      <div className="space-y-2 pt-2 border-t border-zinc-800/80">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-zinc-200 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            Sound Effects Soundboard (Click to test sound):
          </span>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-400">
            <span>Auto SFX Sync</span>
            <input
              type="checkbox"
              checked={settings.soundFxEnabled}
              onChange={(e) => onChange({ ...settings, soundFxEnabled: e.target.checked })}
              className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {soundFxList.map((sfx) => {
            const isJustPlayed = lastSfxPlayed === sfx.id;
            return (
              <button
                key={sfx.id}
                type="button"
                onClick={() => handleTriggerSfx(sfx.id)}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between transform active:scale-95 ${
                  isJustPlayed
                    ? "bg-amber-500 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/30 scale-105"
                    : "bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700 text-zinc-300 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <span>{sfx.icon}</span>
                  <span className="text-[11px] truncate">{sfx.label}</span>
                </span>
                <Play className="w-2.5 h-2.5 opacity-60 flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Voiceover Tone & Volume Mixer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2 border-t border-zinc-800/80">
        {/* Voiceover Tone Selector (7 cols) */}
        <div className="lg:col-span-7 space-y-2">
          <label className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5 text-rose-400" /> Voiceover Narration Tone:
          </label>
          <select
            value={settings.voiceoverTone}
            onChange={(e) =>
              onChange({ ...settings, voiceoverTone: e.target.value as VoiceTone })
            }
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 font-semibold focus:outline-none focus:border-rose-500"
          >
            {voiceTones.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label} - {v.desc}
              </option>
            ))}
          </select>
          {/* Tone Script Sample Preview */}
          <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-[11px] text-zinc-400 italic">
            Sample delivery: "
            <span className="text-zinc-200">
              {voiceTones.find((t) => t.id === settings.voiceoverTone)?.sample}
            </span>
            "
          </div>
        </div>

        {/* Volume Balance Mixers (5 cols) */}
        <div className="lg:col-span-5 space-y-3 bg-zinc-950/60 p-3.5 rounded-2xl border border-zinc-800">
          <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-zinc-400" /> Volume Balance:
          </span>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                <span>Soundtrack Music</span>
                <span className="font-bold text-amber-400">
                  {Math.round(settings.musicVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) => {
                  const vol = Number(e.target.value);
                  onChange({ ...settings, musicVolume: vol });
                  globalAudioEngine.updateSettings({ ...settings, musicVolume: vol });
                }}
                className="w-full accent-amber-500 h-1.5 bg-zinc-800 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                <span>Voiceover Narration</span>
                <span className="font-bold text-rose-400">
                  {Math.round(settings.voiceoverVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.voiceoverVolume}
                onChange={(e) => {
                  const vol = Number(e.target.value);
                  onChange({ ...settings, voiceoverVolume: vol });
                  globalAudioEngine.updateSettings({ ...settings, voiceoverVolume: vol });
                }}
                className="w-full accent-rose-500 h-1.5 bg-zinc-800 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
