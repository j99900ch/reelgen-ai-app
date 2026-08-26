import React, { useState } from "react";
import { Header } from "./components/Header";
import { InputSection } from "./components/InputSection";
import { OptionSelector } from "./components/OptionSelector";
import { VideoPreviewPlayer } from "./components/VideoPreviewPlayer";
import { ExportModal } from "./components/ExportModal";
import { CaptionStyle, VideoOption, VideoRequirement } from "./types";
import { PRESET_TEMPLATES } from "./data/presets";

export default function App() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initial State initialized with Preset 1 for immediate gratification
  const defaultPreset = PRESET_TEMPLATES[0];
  const [requirement, setRequirement] = useState<VideoRequirement>({
    promptText: defaultPreset.promptText,
    videoLinkRef: defaultPreset.videoLinkRef,
    referenceImages: defaultPreset.sampleImages,
    targetDuration: defaultPreset.targetDuration,
    musicSettings: defaultPreset.musicSettings,
    captionStyle: defaultPreset.captionStyle,
  });

  const [generatedOptions, setGeneratedOptions] = useState<VideoOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<VideoOption | null>(null);
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>(defaultPreset.captionStyle);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Generate 5 AI Variations
  const handleGenerateOptions = async () => {
    if (!requirement.promptText.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/generate-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptText: requirement.promptText,
          videoLinkRef: requirement.videoLinkRef,
          referenceImages: requirement.referenceImages,
          targetDuration: requirement.targetDuration,
          musicSettings: requirement.musicSettings,
          captionStyle: requirement.captionStyle,
        }),
      });

      const data = await response.json();
      if (data.options && data.options.length > 0) {
        setGeneratedOptions(data.options);
        setSelectedOption(data.options[0]);
        setCaptionStyle(requirement.captionStyle);
        setCurrentStep(2);
      } else {
        throw new Error(data.error || "Failed to generate options");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to generate options. Please check your prompt or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (option: VideoOption) => {
    setSelectedOption(option);
  };

  const handlePreviewClick = (option: VideoOption) => {
    setSelectedOption(option);
    setCurrentStep(3);
  };

  const handleUpdateOptionScenes = (updatedOption: VideoOption) => {
    setGeneratedOptions((prev) =>
      prev.map((opt) => (opt.id === updatedOption.id ? updatedOption : opt))
    );
    if (selectedOption?.id === updatedOption.id) {
      setSelectedOption(updatedOption);
    }
  };

  const handleNewProject = () => {
    setRequirement({
      promptText: "",
      videoLinkRef: "",
      referenceImages: [],
      targetDuration: 30,
      musicSettings: {
        genre: "trap",
        tempoBpm: 135,
        mood: "Energetic, hype",
        soundFxEnabled: true,
        bassDropSecond: 3.5,
        voiceoverTone: "energetic",
        voiceoverLanguage: "English (US)",
        musicVolume: 0.35,
        voiceoverVolume: 0.95,
      },
      captionStyle: "hormozi_bold",
    });
    setGeneratedOptions([]);
    setSelectedOption(null);
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Global Navigation Bar */}
      <Header
        currentStep={currentStep}
        onStepClick={(step) => setCurrentStep(step)}
        hasOptions={generatedOptions.length > 0}
        onNewProject={handleNewProject}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-950/50 border border-rose-800 rounded-2xl text-rose-300 text-xs font-semibold flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-rose-400 hover:text-white font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Step 1: Input & References */}
        {currentStep === 1 && (
          <InputSection
            requirement={requirement}
            onChange={setRequirement}
            onGenerate={handleGenerateOptions}
            isLoading={isLoading}
          />
        )}

        {/* Step 2: 5 Original AI Variations */}
        {currentStep === 2 && generatedOptions.length > 0 && (
          <OptionSelector
            options={generatedOptions}
            selectedOption={selectedOption}
            onSelectOption={handleSelectOption}
            onPreviewClick={handlePreviewClick}
            onUpdateOptionScenes={handleUpdateOptionScenes}
          />
        )}

        {/* Step 3: Interactive Video Preview Player */}
        {currentStep === 3 && selectedOption && (
          <VideoPreviewPlayer
            option={selectedOption}
            captionStyle={captionStyle}
            onChangeCaptionStyle={setCaptionStyle}
            onOpenExportModal={() => setIsExportModalOpen(true)}
            onBackToOptions={() => setCurrentStep(2)}
          />
        )}
      </main>

      {/* Export & Download Modal */}
      {selectedOption && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          option={selectedOption}
          captionStyle={captionStyle}
        />
      )}
    </div>
  );
}
