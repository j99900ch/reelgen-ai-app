import React from "react";
import { Sparkles, Video, Film, Download, Layers, Volume2, Instagram } from "lucide-react";

interface HeaderProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  hasOptions: boolean;
  onNewProject: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  onStepClick,
  hasOptions,
  onNewProject,
}) => {
  const steps = [
    { id: 1, label: "1. Prompt & Ref", icon: Video },
    { id: 2, label: "2. 5 AI Variations", icon: Layers },
    { id: 3, label: "3. Interactive Preview", icon: Film },
    { id: 4, label: "4. Export & Instagram", icon: Download },
  ];

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            {/* Attractive Custom App Icon */}
            <div className="relative group cursor-pointer">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2px] shadow-xl shadow-rose-500/25 transition-transform duration-300 group-hover:scale-105">
                <div className="w-full h-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
                  {/* Glowing ambient light */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/20 via-purple-500/20 to-amber-500/20 opacity-80 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Icon Graphic: Camera Reel with Play Center & Sparkle */}
                  <svg
                    className="w-6 h-6 text-white relative z-10 drop-shadow-md"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="6" stroke="url(#headerInstaGrad)" />
                    <circle cx="12" cy="12" r="4.5" stroke="url(#headerInstaGrad)" />
                    <polygon points="11,10.2 14.5,12 11,13.8" fill="url(#headerInstaGrad)" stroke="none" />
                    <circle cx="17.5" cy="6.5" r="1" fill="#f43f5e" />
                    <defs>
                      <linearGradient id="headerInstaGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="50%" stopColor="#f43f5e" />
                        <stop offset="100%" stopColor="#c084fc" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Sparkle badge on corner */}
                  <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-ping opacity-75" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-rose-100 to-amber-200 bg-clip-text text-transparent">
                  Insta_Content Maker
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500/20 to-purple-500/20 text-rose-300 border border-rose-500/30 tracking-wide">
                  (Video, Template)
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                <span>AI Shorts & Reels Creator</span>
                <span className="text-zinc-600">•</span>
                <span className="text-amber-400/90 font-semibold">5 Variations & Templates</span>
              </p>
            </div>
          </div>

          <button
            onClick={onNewProject}
            className="md:hidden text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
          >
            New Reel
          </button>
        </div>

        {/* Pipeline Step Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 overflow-x-auto max-w-full">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = currentStep === s.id;
            const isAvailable = s.id === 1 || hasOptions;

            return (
              <button
                key={s.id}
                onClick={() => isAvailable && onStepClick(s.id)}
                disabled={!isAvailable}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                    : isAvailable
                    ? "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
                    : "text-zinc-600 cursor-not-allowed opacity-60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right action button */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-lg">
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium">Beat Sync & Instagram API</span>
          </div>
          <button
            onClick={onNewProject}
            className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white transition shadow-sm"
          >
            + Reset / New Project
          </button>
        </div>
      </div>
    </header>
  );
};
