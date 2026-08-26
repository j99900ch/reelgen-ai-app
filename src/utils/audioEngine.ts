import { MusicSettings, SoundEffectType, VideoGenre } from "../types";

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private voiceGain: GainNode | null = null;
  private destNode: MediaStreamAudioDestinationNode | null = null;
  
  private isPlaying = false;
  private musicInterval: any = null;
  private step = 0;
  private currentSettings: MusicSettings | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();

  constructor() {
    // Lazy initialized on first user interaction to comply with browser autoplay policies
  }

  public init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Create stream destination for video recording
    this.destNode = this.ctx.createMediaStreamDestination();
    this.masterGain.connect(this.destNode);

    // Sub gains
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);

    this.voiceGain = this.ctx.createGain();
    this.voiceGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    this.voiceGain.connect(this.masterGain);
  }

  public getAudioStream(): MediaStream | null {
    this.init();
    return this.destNode ? this.destNode.stream : null;
  }

  public updateSettings(settings: MusicSettings) {
    this.currentSettings = settings;
    if (this.ctx && this.musicGain && this.voiceGain) {
      this.musicGain.gain.setValueAtTime(settings.musicVolume ?? 0.35, this.ctx.currentTime);
      this.voiceGain.gain.setValueAtTime(settings.voiceoverVolume ?? 0.95, this.ctx.currentTime);
    }
  }

  public async resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  public startMusic(settings: MusicSettings) {
    this.init();
    this.resume();
    this.currentSettings = settings;
    this.stopMusic();

    this.isPlaying = true;
    this.step = 0;

    const bpm = settings.tempoBpm || 128;
    const beatInterval = (60 / bpm) * 1000 / 4; // 16th note steps

    this.musicInterval = setInterval(() => {
      if (!this.isPlaying) return;
      this.playStep(this.step, settings.genre);
      this.step = (this.step + 1) % 64;
    }, beatInterval);
  }

  public stopMusic() {
    this.isPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  private playStep(step: number, genre: VideoGenre) {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;

    // Kick on 0, 4, 8, 12 in 16-step bar
    const isQuarter = step % 4 === 0;
    const isSnare = step % 8 === 4;
    const isHihat = step % 2 === 0;

    switch (genre) {
      case 'trap':
      case 'phonk':
        if (isQuarter) this.playKick(now, 130, 45, 0.28);
        if (isSnare) this.playSnare(now, 0.25);
        if (isHihat) this.playHihat(now, 0.05, 0.15);
        // Bassline on specific steps
        if (step % 16 === 0 || step % 16 === 6 || step % 16 === 10) {
          const notes = [55, 65.4, 73.4, 82.4];
          const note = notes[Math.floor(step / 16) % notes.length];
          this.playBass(now, note, 0.4);
        }
        break;

      case 'electronic':
      case 'synthwave':
        if (isQuarter) this.playKick(now, 150, 50, 0.22);
        if (isSnare) this.playSnare(now, 0.22);
        if (isHihat) this.playHihat(now, 0.04, 0.2);
        // Synth arpeggio
        const arpeggio = [220, 277.18, 329.63, 440, 329.63, 277.18, 440, 554.37];
        const freq = arpeggio[step % arpeggio.length];
        this.playSynthNote(now, freq, 0.12, 'sawtooth');
        break;

      case 'cinematic':
      case 'ambient':
        if (step % 16 === 0) {
          this.playPad(now, 164.81, 2.5); // Warm chord pad
          this.playPad(now, 220, 2.5);
          this.playPad(now, 261.63, 2.5);
        }
        if (step % 16 === 8) {
          this.playKick(now, 90, 35, 0.4);
        }
        break;

      case 'lofi':
      case 'acoustic':
      default:
        if (isQuarter && step % 8 === 0) this.playKick(now, 110, 40, 0.2);
        if (isSnare) this.playSnare(now, 0.15, 0.1);
        if (isHihat) this.playHihat(now, 0.03, 0.1);
        if (step % 16 === 0) {
          this.playChords(now, [261.63, 329.63, 392.0, 493.88]); // Cmaj7
        } else if (step % 16 === 8) {
          this.playChords(now, [220.0, 261.63, 329.63, 392.0]); // Amin7
        }
        break;
    }
  }

  // Synthesis methods
  private playKick(time: number, startFreq = 140, endFreq = 40, duration = 0.25) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + duration);

    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playSnare(time: number, duration = 0.2, volume = 0.4) {
    if (!this.ctx || !this.musicGain) return;
    
    // Noise buffer
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    noise.start(time);
  }

  private playHihat(time: number, duration = 0.05, volume = 0.2) {
    if (!this.ctx || !this.musicGain) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    noise.start(time);
  }

  private playBass(time: number, freq: number, duration = 0.4) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, time);
    filter.frequency.exponentialRampToValueAtTime(100, time + duration);

    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playSynthNote(time: number, freq: number, duration = 0.15, type: OscillatorType = 'triangle') {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playPad(time: number, freq: number, duration = 2.0) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.01, time);
    gain.gain.linearRampToValueAtTime(0.18, time + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playChords(time: number, frequencies: number[]) {
    frequencies.forEach((f) => {
      this.playSynthNote(time, f, 0.8, 'sine');
    });
  }

  // Play Sound Effects (Whoosh, Bass Drop, Ding, etc.)
  public playSoundEffect(type: SoundEffectType) {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    switch (type) {
      case 'whoosh': {
        const bufferSize = this.ctx.sampleRate * 0.45;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 3.5;
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(2800, now + 0.22);
        filter.frequency.exponentialRampToValueAtTime(400, now + 0.45);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.8, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        source.start(now);
        break;
      }

      case 'bass_drop': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 1.2);

        gain.gain.setValueAtTime(0.9, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 1.2);
        break;
      }

      case 'ding': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1760, now); // A6
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.6);

        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.6);
        break;
      }

      case 'pop': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);

        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.09);
        break;
      }

      case 'camera_shutter': {
        this.playSnare(now, 0.08, 0.6);
        setTimeout(() => {
          if (this.ctx) this.playSnare(this.ctx.currentTime, 0.05, 0.4);
        }, 90);
        break;
      }

      case 'glitch': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.setValueAtTime(880, now + 0.05);
        osc.frequency.setValueAtTime(340, now + 0.1);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.18);
        break;
      }

      case 'riser': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 1.5);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.7, now + 1.4);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 1.5);
        break;
      }

      case 'impact':
      default: {
        this.playKick(now, 180, 30, 0.8);
        this.playHihat(now, 0.3, 0.5);
        break;
      }
    }
  }

  // Voiceover narration using Web Speech API or Gemini TTS
  public speakVoiceover(text: string, voiceTone: string = 'energetic', onEnd?: () => void) {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    // Configure pitch and rate based on voiceTone
    switch (voiceTone) {
      case 'energetic':
        utterance.rate = 1.15;
        utterance.pitch = 1.1;
        break;
      case 'cinematic_deep':
        utterance.rate = 0.95;
        utterance.pitch = 0.85;
        break;
      case 'tech_modern':
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        break;
      case 'chill_storyteller':
        utterance.rate = 0.98;
        utterance.pitch = 0.95;
        break;
      default:
        utterance.rate = 1.1;
        utterance.pitch = 1.0;
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopVoiceover() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const globalAudioEngine = new AudioEngine();
