import confetti from "canvas-confetti";
import { CaptionStyle, ExportProgress, VideoOption } from "../types";
import { AudioEngine } from "./audioEngine";
import { VideoRenderer } from "./videoRenderer";

export class HDExportEngine {
  private isCancelled = false;

  public async exportVideo(
    option: VideoOption,
    captionStyle: CaptionStyle,
    onProgress: (progress: ExportProgress) => void
  ): Promise<{ blob: Blob; url: string; fileName: string }> {
    this.isCancelled = false;

    // 1. Setup Canvas at High Definition 1080x1920
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d", { alpha: false });

    if (!ctx) {
      throw new Error("Unable to create 2D canvas context for HD export");
    }

    onProgress({
      isExporting: true,
      progressPercent: 5,
      currentFrame: 0,
      totalFrames: 0,
      statusText: "Preloading HD assets and initializing sound engine...",
    });

    const renderer = new VideoRenderer();
    const loadedImages = await renderer.preloadImages(option.scenes);

    const totalDurationSec = option.scenes.reduce((sum, s) => sum + s.durationSec, 0) || 30;
    const fps = 30; // 30fps ensures smooth export across all browsers without dropping frames
    const totalFrames = Math.floor(totalDurationSec * fps);

    // 2. Setup Audio Recording
    const audioEngine = new AudioEngine();
    audioEngine.init();
    await audioEngine.resume();
    audioEngine.updateSettings(option.musicSettings);

    const audioStream = audioEngine.getAudioStream();
    const canvasStream = canvas.captureStream(fps);

    // Combine Video + Audio tracks
    const combinedTracks: MediaStreamTrack[] = [
      ...canvasStream.getVideoTracks(),
      ...(audioStream ? audioStream.getAudioTracks() : []),
    ];

    const combinedStream = new MediaStream(combinedTracks);

    // Choose supported MIME type
    let mimeType = "video/webm;codecs=vp9,opus";
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) {
        mimeType = "video/webm;codecs=vp8,opus";
      } else if (MediaRecorder.isTypeSupported("video/mp4;codecs=avc1")) {
        mimeType = "video/mp4;codecs=avc1";
      } else if (MediaRecorder.isTypeSupported("video/mp4")) {
        mimeType = "video/mp4";
      } else {
        mimeType = "video/webm";
      }
    }

    const recordedChunks: Blob[] = [];
    const recorder = new MediaRecorder(combinedStream, {
      mimeType,
      videoBitsPerSecond: 12000000, // 12 Mbps for crystal clear HD
    });

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    recorder.start(100);
    audioEngine.startMusic(option.musicSettings);

    // 3. Render frame by frame in real-time pace
    const frameIntervalMs = 1000 / fps;
    let currentFrame = 0;
    let playedSfx = new Set<string>();

    return new Promise((resolve, reject) => {
      const renderLoop = () => {
        if (this.isCancelled) {
          recorder.stop();
          audioEngine.stopMusic();
          reject(new Error("Export cancelled by user"));
          return;
        }

        const currentTimeSec = currentFrame / fps;

        if (currentFrame >= totalFrames || currentTimeSec >= totalDurationSec) {
          // Finished rendering
          audioEngine.stopMusic();
          onProgress({
            isExporting: true,
            progressPercent: 98,
            currentFrame: totalFrames,
            totalFrames,
            statusText: "Encoding 1080x1920 HD Instagram Short...",
          });

          recorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: mimeType.split(";")[0] });
            const url = URL.createObjectURL(blob);
            const cleanTitle = option.title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
            const ext = mimeType.includes("mp4") ? "mp4" : "webm";
            const fileName = `${cleanTitle}_1080p_Instagram_Short.${ext}`;

            // Trigger celebration
            try {
              confetti({
                particleCount: 120,
                spread: 70,
                origin: { y: 0.6 },
              });
            } catch (e) {
              // ignore
            }

            onProgress({
              isExporting: false,
              progressPercent: 100,
              currentFrame: totalFrames,
              totalFrames,
              statusText: "Export Complete! Ready to download in HD.",
              downloadUrl: url,
              fileName,
            });

            resolve({ blob, url, fileName });
          };

          recorder.stop();
          return;
        }

        // Determine current scene
        let accumulatedSec = 0;
        let activeScene = option.scenes[0];
        let sceneTimeSec = 0;

        for (const scene of option.scenes) {
          if (currentTimeSec < accumulatedSec + scene.durationSec) {
            activeScene = scene;
            sceneTimeSec = currentTimeSec - accumulatedSec;
            break;
          }
          accumulatedSec += scene.durationSec;
        }

        // Trigger SFX cues if any
        if (activeScene && activeScene.sfxCues) {
          activeScene.sfxCues.forEach((cue) => {
            const cueKey = `${activeScene.id}-${cue.type}-${cue.offsetSec}`;
            if (!playedSfx.has(cueKey) && sceneTimeSec >= cue.offsetSec) {
              playedSfx.add(cueKey);
              audioEngine.playSoundEffect(cue.type);
            }
          });
        }

        // Render visual frame
        renderer.renderFrame({
          canvas,
          ctx,
          option,
          currentScene: activeScene,
          sceneTimeSec,
          totalTimeSec: currentTimeSec,
          totalDurationSec,
          loadedImages,
          showInstagramOverlay: false,
          captionStyle,
        });

        currentFrame++;
        const percent = Math.floor((currentFrame / totalFrames) * 95);

        if (currentFrame % 10 === 0) {
          onProgress({
            isExporting: true,
            progressPercent: percent,
            currentFrame,
            totalFrames,
            statusText: `Rendering Frame ${currentFrame}/${totalFrames} (${percent}%) • Scene ${activeScene.sceneIndex + 1}/${option.scenes.length}`,
          });
        }

        setTimeout(renderLoop, frameIntervalMs);
      };

      // Kick off render loop
      renderLoop();
    });
  }

  public cancel() {
    this.isCancelled = true;
  }
}

export const globalExportEngine = new HDExportEngine();
