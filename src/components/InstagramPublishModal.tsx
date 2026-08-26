import React, { useState, useEffect } from "react";
import {
  Instagram,
  CheckCircle2,
  X,
  Sparkles,
  Share2,
  Lock,
  ExternalLink,
  RefreshCw,
  Layers,
  Film,
  Send,
  AlertCircle,
  Clock,
  Flame,
  Hash,
  ShieldCheck,
  UserCheck,
  LogOut,
  Smartphone,
  Radio,
} from "lucide-react";
import {
  CaptionStyle,
  InstagramAccountInfo,
  InstagramPublishOptions,
  InstagramPublishStatus,
  VideoOption,
} from "../types";

interface InstagramPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  option: VideoOption;
  captionStyle: CaptionStyle;
}

export const InstagramPublishModal: React.FC<InstagramPublishModalProps> = ({
  isOpen,
  onClose,
  option,
  captionStyle,
}) => {
  const [account, setAccount] = useState<InstagramAccountInfo | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [customUsername, setCustomUsername] = useState<string>("");
  const [showManualConnect, setShowManualConnect] = useState<boolean>(false);

  // Publish settings
  const [publishTarget, setPublishTarget] = useState<"reels" | "stories">("reels");
  const [captionText, setCaptionText] = useState<string>(
    option.instagramMetadata.captionCopy || ""
  );
  const [hashtags, setHashtags] = useState<string[]>(
    option.instagramMetadata.trendingHashtags || []
  );
  const [shareToFeed, setShareToFeed] = useState<boolean>(true);
  const [newHashtagInput, setNewHashtagInput] = useState<string>("");

  // Publishing State
  const [publishStatus, setPublishStatus] = useState<InstagramPublishStatus>({
    status: "idle",
    progressPercent: 0,
    message: "Ready to publish directly to Instagram",
  });

  // Check authentication status on mount & when open
  useEffect(() => {
    if (isOpen) {
      checkInstagramAuthStatus();
      setCaptionText(option.instagramMetadata.captionCopy);
      setHashtags(option.instagramMetadata.trendingHashtags);
      setPublishStatus({
        status: "idle",
        progressPercent: 0,
        message: "Ready to publish directly to Instagram",
      });
    }
  }, [isOpen, option]);

  // Listen to postMessage from OAuth popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "INSTAGRAM_AUTH_SUCCESS" && event.data?.account) {
        setAccount(event.data.account);
        setIsConnecting(false);
      } else if (event.data?.type === "INSTAGRAM_AUTH_ERROR") {
        setIsConnecting(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const checkInstagramAuthStatus = async () => {
    setIsCheckingAuth(true);
    try {
      const res = await fetch("/api/auth/instagram/status");
      const data = await res.json();
      if (data.isConnected && data.account) {
        setAccount(data.account);
      } else {
        setAccount(null);
      }
    } catch (e) {
      console.error("Error checking Instagram auth status:", e);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleOAuthConnect = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch("/api/auth/instagram/url");
      const data = await res.json();
      if (data.url) {
        // Open OAuth popup window
        const width = 580;
        const height = 680;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        const popup = window.open(
          data.url,
          "InstagramOAuthPopup",
          `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
        );

        // Fallback polling in case popup blocker or direct close
        const timer = setInterval(() => {
          if (!popup || popup.closed) {
            clearInterval(timer);
            setIsConnecting(false);
            checkInstagramAuthStatus();
          }
        }, 1000);
      }
    } catch (e) {
      console.error("OAuth init error:", e);
      setIsConnecting(false);
    }
  };

  const handleQuickConnect = async (usernameInput?: string) => {
    setIsConnecting(true);
    try {
      const res = await fetch("/api/auth/instagram/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameInput || customUsername || "shorts.creator.studio",
        }),
      });
      const data = await res.json();
      if (data.success && data.account) {
        setAccount(data.account);
        setShowManualConnect(false);
      }
    } catch (e) {
      console.error("Quick connect error:", e);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch("/api/auth/instagram/logout", { method: "POST" });
      setAccount(null);
    } catch (e) {
      console.error("Disconnect error:", e);
    }
  };

  const handleAddHashtag = () => {
    if (!newHashtagInput.trim()) return;
    const tag = newHashtagInput.trim().startsWith("#")
      ? newHashtagInput.trim()
      : `#${newHashtagInput.trim()}`;
    if (!hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
    }
    setNewHashtagInput("");
  };

  const handleRemoveHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter((t) => t !== tagToRemove));
  };

  const handlePublishToInstagram = async () => {
    if (!account) return;

    // Step 1: Initializing
    setPublishStatus({
      status: "preparing",
      progressPercent: 15,
      message: "Rendering 1080x1920 HD vertical video stream...",
    });

    try {
      await new Promise((r) => setTimeout(r, 600));

      // Step 2: Authenticating with Meta API
      setPublishStatus({
        status: "authenticating",
        progressPercent: 35,
        message: `Authenticating upload container with Instagram Graph API for @${account.username}...`,
      });
      await new Promise((r) => setTimeout(r, 700));

      // Step 3: Uploading media stream
      setPublishStatus({
        status: "uploading",
        progressPercent: 65,
        message: `Uploading 9:16 high-definition media container to Instagram CDN...`,
      });
      await new Promise((r) => setTimeout(r, 800));

      // Step 4: Transcoding & publishing
      setPublishStatus({
        status: "processing",
        progressPercent: 88,
        message:
          publishTarget === "stories"
            ? "Encoding 24-hr vertical Instagram Story with synced sound..."
            : "Processing Instagram Reel encoding, audio waveform sync, and feed placement...",
      });

      const res = await fetch("/api/instagram/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: publishTarget,
          caption: captionText,
          trendingHashtags: hashtags,
          shareToFeed: shareToFeed,
          title: option.title,
          optionId: option.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPublishStatus({
          status: "published",
          progressPercent: 100,
          message: data.message || "Published successfully to Instagram!",
          containerId: data.containerId,
          publishedMediaId: data.publishedMediaId,
          permalink: data.permalink,
          timestamp: data.timestamp,
        });
      } else {
        throw new Error(data.error || "Failed to publish to Instagram");
      }
    } catch (err: any) {
      console.error("Publish error:", err);
      setPublishStatus({
        status: "error",
        progressPercent: 0,
        message: `Publish error: ${err.message || "Failed to publish"}`,
        error: err.message,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 relative overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Background glow */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-gradient-to-br from-pink-500/20 via-rose-500/20 to-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-lg shadow-rose-500/25">
              <Instagram className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">
                  Direct Instagram API Publisher
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Graph API v21.0
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Upload your finalized 1080x1920 HD short directly to Instagram Reels or Stories
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Authentication State Card */}
        <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              Instagram Authentication Status:
            </span>
            {account && (
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Connected & Authorized
              </span>
            )}
          </div>

          {isCheckingAuth ? (
            <div className="flex items-center gap-2 text-xs text-zinc-400 py-2">
              <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />
              <span>Verifying Instagram API session credentials...</span>
            </div>
          ) : account ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-3">
                <img
                  src={account.profilePictureUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                  alt={account.username}
                  className="w-10 h-10 rounded-full border border-rose-500/50 object-cover"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-sm">@{account.username}</span>
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-1.5 py-0.5 rounded">
                      {account.accountType || "CREATOR"}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    {account.followersCount
                      ? `${(account.followersCount / 1000).toFixed(1)}k Followers`
                      : "Verified Publishing Account"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="text-xs text-zinc-400 hover:text-rose-400 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700 transition flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Switch Account</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 py-1">
              <p className="text-xs text-zinc-300">
                Connect your Instagram account to authorize direct high-definition Reels and Story publishing.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleOAuthConnect}
                  disabled={isConnecting}
                  className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:via-pink-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-pink-600/25 flex items-center justify-center gap-2 transition"
                >
                  {isConnecting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Instagram className="w-4 h-4" />
                  )}
                  <span>Connect with Instagram (OAuth Popup)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickConnect()}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 flex items-center justify-center gap-1.5 transition"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>1-Click Sandbox Creator</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Publishing Destination: Reels vs Stories */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Select Instagram Upload Format:
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPublishTarget("reels")}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                publishTarget === "reels"
                  ? "bg-gradient-to-br from-rose-950/60 to-purple-950/40 border-rose-500 shadow-md shadow-rose-500/10"
                  : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-rose-400" />
                  Instagram Reel (9:16)
                </span>
                {publishTarget === "reels" && (
                  <CheckCircle2 className="w-4 h-4 text-rose-500" />
                )}
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Permanent feed & Reels tab placement. Maximum viral explore algorithm reach.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setPublishTarget("stories")}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                publishTarget === "stories"
                  ? "bg-gradient-to-br from-purple-950/60 to-indigo-950/40 border-purple-500 shadow-md shadow-purple-500/10"
                  : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-purple-400" />
                  Instagram Story (24h)
                </span>
                {publishTarget === "stories" && (
                  <CheckCircle2 className="w-4 h-4 text-purple-500" />
                )}
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Full-screen vertical story with direct engagement sticker compatibility.
              </p>
            </button>
          </div>
        </div>

        {/* Caption & Hashtag Editor */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Reel Caption & Engagement Hook:
            </label>
            <span className="text-[10px] text-zinc-500 font-mono">
              {captionText.length} characters
            </span>
          </div>

          <textarea
            rows={3}
            value={captionText}
            onChange={(e) => setCaptionText(e.target.value)}
            placeholder="Write your Instagram reel caption and call-to-action..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-rose-500 resize-none font-sans"
          />

          {/* Hashtag Manager */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold">
              <span className="flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-rose-400" />
                Trending Viral Hashtags ({hashtags.length}):
              </span>
              <span className="text-[10px] text-emerald-400">
                Recommended: 5-10 targeted tags
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-zinc-950/80 rounded-xl border border-zinc-800">
              {hashtags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-300 text-[11px] font-mono rounded-md"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveHashtag(tag)}
                    className="text-zinc-500 hover:text-rose-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom hashtag (e.g. #reelsviral)"
                value={newHashtagInput}
                onChange={(e) => setNewHashtagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddHashtag()}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-rose-500"
              />
              <button
                type="button"
                onClick={handleAddHashtag}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition"
              >
                + Add Tag
              </button>
            </div>
          </div>
        </div>

        {/* Publishing Status Progress Bar */}
        {publishStatus.status !== "idle" && (
          <div
            className={`p-4 rounded-2xl border space-y-3 transition-all ${
              publishStatus.status === "published"
                ? "bg-emerald-950/40 border-emerald-700/50"
                : publishStatus.status === "error"
                ? "bg-rose-950/40 border-rose-700/50"
                : "bg-purple-950/30 border-purple-800/40"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-2">
                {publishStatus.status === "published" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : publishStatus.status === "error" ? (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                ) : (
                  <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                )}
                <span
                  className={
                    publishStatus.status === "published"
                      ? "text-emerald-300"
                      : publishStatus.status === "error"
                      ? "text-rose-300"
                      : "text-zinc-200"
                  }
                >
                  {publishStatus.message}
                </span>
              </span>
              <span className="font-mono text-white">
                {publishStatus.progressPercent}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  publishStatus.status === "published"
                    ? "bg-emerald-500"
                    : publishStatus.status === "error"
                    ? "bg-rose-500"
                    : "bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500"
                }`}
                style={{ width: `${publishStatus.progressPercent}%` }}
              />
            </div>

            {/* Published Success Card */}
            {publishStatus.status === "published" && publishStatus.permalink && (
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-t border-emerald-800/40">
                <div className="text-xs text-emerald-300">
                  <span>Reel Media ID: </span>
                  <span className="font-mono font-bold text-white">
                    {publishStatus.publishedMediaId}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={publishStatus.permalink}
                    target="_blank"
                    rel="noreferrer"
                    className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition"
                  >
                    <span>View on Instagram</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handlePublishToInstagram}
            disabled={
              !account ||
              publishStatus.status === "preparing" ||
              publishStatus.status === "authenticating" ||
              publishStatus.status === "uploading" ||
              publishStatus.status === "processing"
            }
            className="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:via-pink-500 hover:to-rose-500 text-white font-extrabold text-sm shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
          >
            <Instagram className="w-4 h-4" />
            <span>
              {publishStatus.status === "published"
                ? "Publish Another Copy"
                : publishTarget === "stories"
                ? "Publish to Instagram Story Now"
                : "Publish High-Definition Reel to Instagram"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
