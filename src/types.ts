export type VideoGenre = 
  | 'electronic' 
  | 'lofi' 
  | 'trap' 
  | 'cinematic' 
  | 'phonk' 
  | 'acoustic' 
  | 'synthwave' 
  | 'drill' 
  | 'ambient';

export type VoiceTone = 
  | 'energetic' 
  | 'cinematic_deep' 
  | 'friendly_creator' 
  | 'tech_modern' 
  | 'chill_storyteller' 
  | 'dramatic_trailer';

export type CameraMotion = 
  | 'zoom_in' 
  | 'zoom_out' 
  | 'pan_left' 
  | 'pan_right' 
  | 'punch_cut' 
  | 'gentle_float' 
  | 'shake_impact';

export type VisualFilter = 
  | 'none' 
  | 'cinematic_glow' 
  | 'retro_vhs' 
  | 'cyberpunk_neon' 
  | 'warm_sunset' 
  | 'film_grain' 
  | 'high_contrast_clean';

export type CaptionStyle = 
  | 'hormozi_bold' 
  | 'neon_glow' 
  | 'minimal_clean' 
  | 'retro_typewriter' 
  | 'pop_box';

export type SoundEffectType = 
  | 'whoosh' 
  | 'bass_drop' 
  | 'pop' 
  | 'ding' 
  | 'riser' 
  | 'camera_shutter' 
  | 'glitch' 
  | 'impact';

export interface ReferenceImage {
  id: string;
  url: string; // data URL or web URL
  name: string;
  role: 'product' | 'character' | 'aesthetic' | 'background';
}

export interface VideoRequirement {
  promptText: string;
  videoLinkRef?: string;
  referenceImages: ReferenceImage[];
  targetDuration: 15 | 30 | 45 | 60;
  musicSettings: MusicSettings;
  captionStyle: CaptionStyle;
}

export interface MusicSettings {
  genre: VideoGenre;
  tempoBpm: number;
  mood: string;
  soundFxEnabled: boolean;
  bassDropSecond: number;
  voiceoverTone: VoiceTone;
  voiceoverLanguage: string;
  musicVolume: number; // 0 to 1
  voiceoverVolume: number; // 0 to 1
}

export interface SceneCaption {
  text: string;
  highlightWords?: string[];
  subtext?: string;
  badge?: string;
}

export interface VideoScene {
  id: string;
  sceneIndex: number;
  durationSec: number; // duration in seconds
  caption: SceneCaption;
  voiceoverScript: string;
  visualPrompt: string;
  visualTheme: string;
  gradientColors: [string, string, string];
  customImageUrl?: string;
  cameraMotion: CameraMotion;
  visualFilter: VisualFilter;
  sfxCues: {
    type: SoundEffectType;
    offsetSec: number;
  }[];
  stickerIcon?: string;
}

export type StyleCategory =
  | 'Viral High-Energy'
  | 'Cinematic Aesthetic'
  | 'Bold Explainer Hook'
  | 'Trendy POV / Cultural'
  | 'Dark Luxury / Masterclass';

export interface VideoOption {
  id: string;
  title: string;
  tagline: string;
  styleCategory: StyleCategory | string;
  viralScore: number; // e.g. 96
  retentionAngle: string;
  recommendedDuration: number;
  musicSettings: MusicSettings;
  scenes: VideoScene[];
  instagramMetadata: {
    recommendedTitle: string;
    captionCopy: string;
    trendingHashtags: string[];
    bestTimeToPost: string;
  };
}

export interface AnalysisSummary {
  linkDetected: boolean;
  linkType?: string;
  extractedHooks: string[];
  suggestedPacing: string;
  keyInsights: string;
  toneRecommendation: string;
}

export interface ExportProgress {
  isExporting: boolean;
  progressPercent: number;
  currentFrame: number;
  totalFrames: number;
  statusText: string;
  downloadUrl?: string;
  fileName?: string;
}

export interface InstagramAccountInfo {
  id: string;
  username: string;
  name: string;
  profilePictureUrl?: string;
  followersCount?: number;
  isConnected: boolean;
  accountType?: 'BUSINESS' | 'CREATOR' | 'PERSONAL';
}

export interface InstagramPublishOptions {
  target: 'reels' | 'stories' | 'feed';
  caption: string;
  shareToFeed?: boolean;
  coverTimeSec?: number;
  audioName?: string;
}

export interface InstagramPublishStatus {
  status: 'idle' | 'preparing' | 'authenticating' | 'uploading' | 'processing' | 'published' | 'error';
  progressPercent: number;
  message: string;
  containerId?: string;
  publishedMediaId?: string;
  permalink?: string;
  timestamp?: string;
  error?: string;
}

export type TemplateCategory =
  | 'all'
  | 'viral_tech'
  | 'luxury_brand'
  | 'motivation_gym'
  | 'food_lifestyle'
  | 'commerce_product'
  | 'podcast_talk';

export interface SceneImagePromptRequest {
  prompt: string;
  visualTheme: string;
  musicGenre: VideoGenre;
  mood: string;
  cameraMotion: CameraMotion;
  referenceImageUrl?: string;
}


