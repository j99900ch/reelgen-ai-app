import { CaptionStyle, CameraMotion, VideoOption, VideoScene, VisualFilter } from "../types";
import { AudioEngine } from "./audioEngine";

export interface RenderFrameOptions {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  option: VideoOption;
  currentScene: VideoScene;
  sceneTimeSec: number;
  totalTimeSec: number;
  totalDurationSec: number;
  loadedImages: Map<string, HTMLImageElement>;
  showInstagramOverlay?: boolean;
  captionStyle?: CaptionStyle;
}

export class VideoRenderer {
  private imageCache: Map<string, HTMLImageElement> = new Map();

  public async preloadImages(scenes: VideoScene[]): Promise<Map<string, HTMLImageElement>> {
    const promises: Promise<void>[] = [];

    for (const scene of scenes) {
      if (scene.customImageUrl && !this.imageCache.has(scene.customImageUrl)) {
        const p = new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            this.imageCache.set(scene.customImageUrl!, img);
            resolve();
          };
          img.onerror = () => {
            console.warn("Failed to load scene image:", scene.customImageUrl);
            resolve();
          };
          img.src = scene.customImageUrl!;
        });
        promises.push(p);
      }
    }

    await Promise.all(promises);
    return this.imageCache;
  }

  public renderFrame(opts: RenderFrameOptions) {
    const { canvas, ctx, currentScene, sceneTimeSec, totalTimeSec, totalDurationSec, loadedImages, showInstagramOverlay = false, captionStyle = "hormozi_bold" } = opts;
    const width = canvas.width;
    const height = canvas.height;

    const sceneDuration = currentScene.durationSec || 4;
    const sceneProgress = Math.min(1, Math.max(0, sceneTimeSec / sceneDuration));

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Background (Image or Animated Dynamic Aesthetic Gradient)
    const img = currentScene.customImageUrl ? loadedImages.get(currentScene.customImageUrl) : null;

    if (img && img.complete && img.naturalWidth > 0) {
      this.drawMovingImage(ctx, img, width, height, currentScene.cameraMotion, sceneProgress);
    } else {
      this.drawProceduralBackground(ctx, width, height, currentScene, sceneProgress, totalTimeSec);
    }

    // 2. Apply Visual Filters (Film Grain, VHS, Glow, etc.)
    this.applyVisualFilter(ctx, width, height, currentScene.visualFilter, sceneProgress, totalTimeSec);

    // 3. Draw Kinetic Subtitles & Captions
    this.drawKineticCaptions(ctx, width, height, currentScene, sceneProgress, captionStyle);

    // 4. Draw Top Scene Segment Progress Bars
    this.drawSegmentProgressBar(ctx, width, height, opts.option.scenes, totalTimeSec, totalDurationSec);

    // 5. Draw Optional Instagram Shorts UI Simulation Overlay
    if (showInstagramOverlay) {
      this.drawInstagramUI(ctx, width, height, opts.option, totalTimeSec);
    }
  }

  // Camera Motion & Ken Burns Image Drawing
  private drawMovingImage(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    width: number,
    height: number,
    motion: CameraMotion,
    progress: number
  ) {
    ctx.save();

    let scale = 1.0;
    let dx = 0;
    let dy = 0;

    switch (motion) {
      case "zoom_in":
        scale = 1.05 + progress * 0.18;
        break;
      case "zoom_out":
        scale = 1.25 - progress * 0.18;
        break;
      case "pan_left":
        scale = 1.15;
        dx = (progress - 0.5) * -80;
        break;
      case "pan_right":
        scale = 1.15;
        dx = (progress - 0.5) * 80;
        break;
      case "punch_cut":
        scale = progress < 0.1 ? 1.3 : 1.08 + progress * 0.05;
        break;
      case "shake_impact":
        const shake = progress < 0.25 ? Math.sin(progress * 40) * 8 : 0;
        scale = 1.12;
        dx = shake;
        dy = shake * 0.5;
        break;
      case "gentle_float":
      default:
        scale = 1.08 + Math.sin(progress * Math.PI) * 0.05;
        dy = Math.cos(progress * Math.PI) * 15;
        break;
    }

    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = width / height;

    let drawW: number;
    let drawH: number;

    if (imgAspect > canvasAspect) {
      drawH = height * scale;
      drawW = drawH * imgAspect;
    } else {
      drawW = width * scale;
      drawH = drawW / imgAspect;
    }

    const drawX = (width - drawW) / 2 + dx;
    const drawY = (height - drawH) / 2 + dy;

    // Draw darkened backdrop to ensure text readability
    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // Subtle dark gradient vignette at top and bottom for caption legibility
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, "rgba(0, 0, 0, 0.4)");
    grad.addColorStop(0.3, "rgba(0, 0, 0, 0.05)");
    grad.addColorStop(0.65, "rgba(0, 0, 0, 0.35)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0.85)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
  }

  // Dynamic Procedural Background
  private drawProceduralBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scene: VideoScene,
    progress: number,
    totalTime: number
  ) {
    ctx.save();
    const colors = scene.gradientColors || ["#0f172a", "#1e1b4b", "#0284c7"];
    const c1 = colors[0] || "#09090b";
    const c2 = colors[1] || "#1e1b4b";
    const c3 = colors[2] || "#3b82f6";

    // Animated diagonal gradient
    const angle = (totalTime * 0.4) % (Math.PI * 2);
    const x1 = width / 2 + Math.cos(angle) * (width * 0.8);
    const y1 = height / 2 + Math.sin(angle) * (height * 0.8);
    const x2 = width / 2 - Math.cos(angle) * (width * 0.8);
    const y2 = height / 2 - Math.sin(angle) * (height * 0.8);

    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, c1);
    grad.addColorStop(0.5, c2);
    grad.addColorStop(1, c3);

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Glowing Bokeh Orbs
    const orbCount = 5;
    for (let i = 0; i < orbCount; i++) {
      const orbTime = totalTime * 0.8 + i * 1.5;
      const ox = width * (0.2 + 0.6 * ((Math.sin(orbTime * 0.5 + i) + 1) / 2));
      const oy = height * (0.2 + 0.6 * ((Math.cos(orbTime * 0.4 + i) + 1) / 2));
      const r = width * (0.25 + 0.15 * Math.sin(orbTime + i));

      const orbGrad = ctx.createRadialGradient(ox, oy, 10, ox, oy, r);
      orbGrad.addColorStop(0, `${c3}55`);
      orbGrad.addColorStop(0.6, `${c2}22`);
      orbGrad.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(ox, oy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Grid wireframe lines (tech feel)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1.5;
    const gridSize = 80;
    const offsetY = (totalTime * 30) % gridSize;

    for (let y = offsetY; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Visual Filters (VHS, Cinematic Glow, Film Grain)
  private applyVisualFilter(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    filter: VisualFilter,
    _progress: number,
    totalTime: number
  ) {
    if (filter === "none") return;
    ctx.save();

    switch (filter) {
      case "retro_vhs": {
        // Scanlines
        ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
        for (let y = 0; y < height; y += 4) {
          ctx.fillRect(0, y, width, 1.5);
        }

        // Glitch bar
        if (Math.random() < 0.15) {
          const glitchY = (totalTime * 300) % height;
          ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
          ctx.fillRect(0, glitchY, width, 12);
        }

        // Timestamp overlay
        ctx.font = "bold 24px monospace";
        ctx.fillStyle = "rgba(250, 204, 21, 0.85)";
        ctx.textAlign = "left";
        ctx.fillText("REC ● 00:" + String(Math.floor(totalTime)).padStart(2, "0") + ":00", 40, 80);
        ctx.fillText("PLAY ▷ SP", width - 180, 80);
        break;
      }

      case "cyberpunk_neon": {
        // Neon edge border glow
        ctx.strokeStyle = "rgba(6, 182, 212, 0.35)";
        ctx.lineWidth = 8;
        ctx.strokeRect(10, 10, width - 20, height - 20);

        ctx.strokeStyle = "rgba(236, 72, 153, 0.25)";
        ctx.lineWidth = 4;
        ctx.strokeRect(18, 18, width - 36, height - 36);
        break;
      }

      case "film_grain": {
        // Subtle noise pattern
        ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
        for (let i = 0; i < 400; i++) {
          const rx = Math.random() * width;
          const ry = Math.random() * height;
          ctx.fillRect(rx, ry, 2, 2);
        }
        break;
      }

      case "warm_sunset": {
        const warmGrad = ctx.createLinearGradient(0, 0, 0, height);
        warmGrad.addColorStop(0, "rgba(245, 158, 11, 0.12)");
        warmGrad.addColorStop(0.7, "rgba(239, 68, 68, 0.15)");
        warmGrad.addColorStop(1, "rgba(136, 19, 55, 0.25)");
        ctx.fillStyle = warmGrad;
        ctx.fillRect(0, 0, width, height);
        break;
      }

      case "cinematic_glow":
      default: {
        const glowGrad = ctx.createRadialGradient(width / 2, height / 2, width * 0.2, width / 2, height / 2, width * 0.8);
        glowGrad.addColorStop(0, "rgba(255, 255, 255, 0.04)");
        glowGrad.addColorStop(1, "rgba(0, 0, 0, 0.45)");
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, width, height);
        break;
      }
    }

    ctx.restore();
  }

  // Kinetic Animated Subtitles & Typography
  private drawKineticCaptions(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scene: VideoScene,
    progress: number,
    style: CaptionStyle
  ) {
    ctx.save();
    const caption = scene.caption;
    if (!caption || !caption.text) {
      ctx.restore();
      return;
    }

    const text = caption.text.trim();
    const words = text.split(/\s+/);
    const highlightWords = (caption.highlightWords || []).map((w) => w.toUpperCase());

    // Center area for subtitles
    const centerY = height * 0.58;

    // Badge at top of caption if present
    if (caption.badge) {
      ctx.save();
      const badgeY = centerY - 140;
      ctx.font = "bold 28px sans-serif";
      const badgeMetrics = ctx.measureText(caption.badge);
      const badgeW = badgeMetrics.width + 48;
      const badgeH = 50;

      // Badge pill background
      ctx.fillStyle = "rgba(239, 68, 68, 0.95)";
      this.roundRect(ctx, (width - badgeW) / 2, badgeY - 36, badgeW, badgeH, 25);
      ctx.fill();

      // Badge text
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(caption.badge, width / 2, badgeY - 11);
      ctx.restore();
    }

    // Render based on Caption Style
    switch (style) {
      case "hormozi_bold": {
        // Hormozi / MrBeast Style: Ultra Bold Yellow/Green highlights, punchy black shadow
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Punch scale entry in first 15% of scene
        const punchScale = progress < 0.15 ? 0.85 + Math.sin(progress * Math.PI * 3.3) * 0.25 : 1.0;
        ctx.translate(width / 2, centerY);
        ctx.scale(punchScale, punchScale);
        ctx.translate(-width / 2, -centerY);

        const fontSize = Math.min(68, Math.max(48, Math.floor(width / 14)));
        ctx.font = `900 ${fontSize}px system-ui, -apple-system, sans-serif`;

        // Measure words and split to lines if long
        const maxLineWidth = width * 0.86;
        const lines: string[][] = [];
        let currentLine: string[] = [];
        let currentLineWidth = 0;

        for (const word of words) {
          const wordW = ctx.measureText(word + " ").width;
          if (currentLineWidth + wordW > maxLineWidth && currentLine.length > 0) {
            lines.push(currentLine);
            currentLine = [word];
            currentLineWidth = wordW;
          } else {
            currentLine.push(word);
            currentLineWidth += wordW;
          }
        }
        if (currentLine.length > 0) lines.push(currentLine);

        const lineHeight = fontSize * 1.35;
        const startY = centerY - ((lines.length - 1) * lineHeight) / 2;

        lines.forEach((lineWords, lineIdx) => {
          const lineY = startY + lineIdx * lineHeight;
          const totalLineW = lineWords.reduce((sum, w) => sum + ctx.measureText(w + " ").width, 0) - ctx.measureText(" ").width;
          let currentX = (width - totalLineW) / 2;

          lineWords.forEach((word) => {
            const cleanWord = word.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
            const isHighlight = highlightWords.some((hw) => cleanWord.includes(hw) || hw.includes(cleanWord));
            const wordW = ctx.measureText(word).width;
            const spaceW = ctx.measureText(" ").width;

            // Word background pill if highlighted
            if (isHighlight) {
              ctx.save();
              ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
              this.roundRect(ctx, currentX - 8, lineY - fontSize * 0.55, wordW + 16, fontSize * 1.15, 12);
              ctx.fill();
              ctx.restore();
            }

            // Text Stroke (Heavy Black Outline)
            ctx.lineWidth = 14;
            ctx.strokeStyle = "#000000";
            ctx.strokeText(word, currentX + wordW / 2, lineY);

            // Text Fill (Bright Neon Yellow or Green for highlight, White for normal)
            ctx.fillStyle = isHighlight ? "#facc15" : "#ffffff";
            ctx.fillText(word, currentX + wordW / 2, lineY);

            currentX += wordW + spaceW;
          });
        });

        // Subtext if present
        if (caption.subtext) {
          ctx.font = `600 ${Math.floor(fontSize * 0.48)}px system-ui, sans-serif`;
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
          ctx.lineWidth = 6;
          const subY = startY + lines.length * lineHeight + 15;
          ctx.strokeText(caption.subtext, width / 2, subY);
          ctx.fillText(caption.subtext, width / 2, subY);
        }
        break;
      }

      case "neon_glow": {
        // Cyberpunk Glowing Subtitles
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const fontSize = 54;
        ctx.font = `800 ${fontSize}px sans-serif`;

        ctx.shadowColor = "#06b6d4";
        ctx.shadowBlur = 25;

        ctx.strokeStyle = "#083344";
        ctx.lineWidth = 8;
        ctx.strokeText(text, width / 2, centerY);

        ctx.fillStyle = "#a5f3fc";
        ctx.fillText(text, width / 2, centerY);

        if (caption.subtext) {
          ctx.shadowColor = "#ec4899";
          ctx.shadowBlur = 15;
          ctx.font = `600 28px sans-serif`;
          ctx.fillStyle = "#fbcfe8";
          ctx.fillText(caption.subtext, width / 2, centerY + 65);
        }
        break;
      }

      case "minimal_clean": {
        // Modern Clean Glassmorphism Pill
        ctx.font = `700 48px sans-serif`;
        const textMetrics = ctx.measureText(text);
        const pillW = Math.min(width * 0.9, textMetrics.width + 60);
        const pillH = 100;

        ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
        this.roundRect(ctx, (width - pillW) / 2, centerY - pillH / 2, pillW, pillH, 20);
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(text, width / 2, centerY);
        break;
      }

      case "pop_box":
      default: {
        // Punchy Pop Box
        const fontSize = 52;
        ctx.font = `800 ${fontSize}px sans-serif`;
        const textMetrics = ctx.measureText(text);
        const boxW = Math.min(width * 0.9, textMetrics.width + 50);
        const boxH = 90;

        ctx.fillStyle = "#f59e0b";
        ctx.fillRect((width - boxW) / 2 + 6, centerY - boxH / 2 + 6, boxW, boxH);

        ctx.fillStyle = "#000000";
        ctx.fillRect((width - boxW) / 2, centerY - boxH / 2, boxW, boxH);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(text, width / 2, centerY);
        break;
      }
    }

    ctx.restore();
  }

  // Top Progress Bar segments (Reels / Shorts style)
  private drawSegmentProgressBar(
    ctx: CanvasRenderingContext2D,
    width: number,
    _height: number,
    scenes: VideoScene[],
    totalTimeSec: number,
    _totalDurationSec: number
  ) {
    ctx.save();
    const barTop = 32;
    const barHeight = 6;
    const sideMargin = 24;
    const gap = 8;
    const availableWidth = width - sideMargin * 2 - (scenes.length - 1) * gap;
    const totalScenesDuration = scenes.reduce((acc, s) => acc + s.durationSec, 0) || 1;

    let accumulatedTime = 0;
    let currentX = sideMargin;

    scenes.forEach((scene) => {
      const segmentWidth = (scene.durationSec / totalScenesDuration) * availableWidth;
      const sceneStartTime = accumulatedTime;
      const sceneEndTime = accumulatedTime + scene.durationSec;

      let fillPercent = 0;
      if (totalTimeSec >= sceneEndTime) {
        fillPercent = 1;
      } else if (totalTimeSec > sceneStartTime) {
        fillPercent = (totalTimeSec - sceneStartTime) / scene.durationSec;
      }

      // Background uncompleted bar
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      this.roundRect(ctx, currentX, barTop, segmentWidth, barHeight, 3);
      ctx.fill();

      // Foreground completed fill
      if (fillPercent > 0) {
        ctx.fillStyle = "#ffffff";
        this.roundRect(ctx, currentX, barTop, segmentWidth * fillPercent, barHeight, 3);
        ctx.fill();
      }

      accumulatedTime += scene.durationSec;
      currentX += segmentWidth + gap;
    });

    ctx.restore();
  }

  // Instagram Shorts UI Overlay Simulation
  private drawInstagramUI(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    option: VideoOption,
    _totalTime: number
  ) {
    ctx.save();

    // Right Action Sidebar (Likes, Comments, Share, Audio Disc)
    const rightX = width - 70;
    const startY = height * 0.48;

    // Like Button Icon
    this.drawCircleIcon(ctx, rightX, startY, "❤️", "124K");
    this.drawCircleIcon(ctx, rightX, startY + 95, "💬", "1.8K");
    this.drawCircleIcon(ctx, rightX, startY + 190, "↗️", "45K");
    this.drawCircleIcon(ctx, rightX, startY + 285, "📌", "92K");

    // Spinning Vinyl Audio Disc at bottom right
    const discY = height - 120;
    ctx.save();
    ctx.translate(rightX, discY);
    ctx.rotate((_totalTime * 3) % (Math.PI * 2));
    ctx.fillStyle = "#18181b";
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#e11d48";
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Bottom Left Creator Info
    const bottomY = height - 140;
    ctx.font = "bold 26px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.fillText("@original.creator • Follow", 36, bottomY);

    ctx.font = "20px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    const shortTitle = option.title.slice(0, 45) + "...";
    ctx.fillText(shortTitle, 36, bottomY + 36);

    ctx.font = "18px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillText("🎵 Original Audio - " + option.musicSettings.genre.toUpperCase() + " Beat", 36, bottomY + 70);

    ctx.restore();
  }

  private drawCircleIcon(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    emoji: string,
    label: string
  ) {
    ctx.save();
    ctx.font = "32px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, x, y);

    ctx.font = "bold 18px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(label, x, y + 30);
    ctx.restore();
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}

export const globalVideoRenderer = new VideoRenderer();
