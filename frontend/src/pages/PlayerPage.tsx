import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, Pause, ExternalLink } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { decryptText } from "../utils/cryptoMood";

export default function PlayerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { encryptionKey } = useAuth();

  const [records] = useState<any[]>(() => location.state?.records || []);
  const [index, setIndex] = useState(() => {
    const passed = location.state?.currentIndex || 0;
    return Math.max(0, Math.min(passed, (location.state?.records?.length ?? 1) - 1));
  });

  const [decryptedMood, setDecryptedMood] = useState("");
  const [canShowPlayer, setCanShowPlayer] = useState(false);

  // 音訊播放狀態
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);      // 0–100
  const [duration, setDuration] = useState(0);

  const record = records[index];

  useEffect(() => {
    if (records.length === 0) navigate("/home");
  }, [records, navigate]);

  // 切換紀錄時重置解密結果與播放狀態
  useEffect(() => {
    setCanShowPlayer(false);
    setIsPlaying(false);
    setProgress(0);

    if (!record) { setDecryptedMood("尚未有心情紀錄"); return; }
    if (!encryptionKey) { alert("Please log in again"); navigate("/login"); return; }

    try {
      setDecryptedMood(decryptText(record.encryptedMood, encryptionKey, record.salt));
      setCanShowPlayer(true);
    } catch {
      setDecryptedMood("You are too shy.");
    }
  }, [record, encryptionKey, navigate]);

  // 切換紀錄時自動播放新歌
  useEffect(() => {
    if (!canShowPlayer || !audioRef.current) return;
    audioRef.current.load();
    audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
  }, [canShowPlayer, index]);

  function togglePlay() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }

  function handleTimeUpdate() {
    if (!audioRef.current) return;
    setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    if (!audioRef.current) return;
    const value = Number(e.target.value);
    audioRef.current.currentTime = (value / 100) * audioRef.current.duration;
    setProgress(value);
  }

  function formatTime(sec: number) {
    if (isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  if (records.length === 0) return null;

  const song = record?.song;

  return (
    <div style={styles.container}>
      {/* 背景文字：解密後的告解 */}
      <div style={styles.backgroundText}>{decryptedMood}</div>

      {/* 左右切換 */}
      <button onClick={() => setIndex(i => Math.max(i - 1, 0))} style={styles.navBtn("left")}>
        <ChevronLeft size={40} />
      </button>
      <button onClick={() => setIndex(i => Math.min(i + 1, records.length - 1))} style={styles.navBtn("right")}>
        <ChevronRight size={40} />
      </button>

      {/* 音樂卡片 */}
      {canShowPlayer && song && (
        <div style={styles.card}>
          {/* 封面圖 */}
          <img src={song.cover} alt={song.album} style={styles.cover} />

          {/* 歌曲資訊 */}
          <div style={styles.info}>
            <div style={styles.title}>{song.title}</div>
            <div style={styles.artist}>{song.artist}</div>
            <div style={styles.album}>{song.album}</div>
          </div>

          {/* 進度條 */}
          <div style={styles.progressRow}>
            <span style={styles.time}>{formatTime(audioRef.current?.currentTime ?? 0)}</span>
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={handleSeek}
              style={styles.slider}
            />
            <span style={styles.time}>{formatTime(duration)}</span>
          </div>

          {/* 播放 / 暫停 */}
          <button onClick={togglePlay} style={styles.playBtn}>
            {isPlaying ? <Pause size={22} /> : <Play size={22} />}
          </button>

          {/* Spotify 連結 */}
          {song.spotifyUrl && (
            <a href={song.spotifyUrl} target="_blank" rel="noopener noreferrer" style={styles.spotifyLink}>
              <ExternalLink size={14} />
              <span>在 Spotify 收聽</span>
            </a>
          )}

          {/* 隱藏的 audio 元素 */}
          <audio
            ref={audioRef}
            src={song.previewUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
            onEnded={() => setIsPlaying(false)}
          />
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    height: "100vh",
    background: "#624917",
    position: "fixed" as const,
    inset: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  backgroundText: {
    position: "absolute" as const,
    width: "1137px",
    color: "#FFFFFF",
    opacity: 0.3,
    fontFamily: '"DM Serif Text", serif',
    fontSize: "128px",
    fontWeight: 400,
    lineHeight: "100px",
    textAlign: "center" as const,
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none" as const,
  },

  navBtn: (side: "left" | "right"): React.CSSProperties => ({
    position: "absolute",
    [side]: "180px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(98, 73, 23, 0.7)",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }),

  card: {
    width: "280px",
    background: "rgba(30, 20, 10, 0.85)",
    backdropFilter: "blur(12px)",
    padding: "20px",
    borderRadius: "20px",
    color: "#fff",
    zIndex: 2,
    boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
    display: "flex",
    flexDirection: "column" as const,
    gap: "14px",
  },

  cover: {
    width: "100%",
    aspectRatio: "1 / 1",
    objectFit: "cover" as const,
    borderRadius: "12px",
  },

  info: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "4px",
  },

  title: {
    fontSize: "17px",
    fontWeight: 700,
    color: "#fff",
  },

  artist: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.75)",
  },

  album: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.4)",
  },

  progressRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  time: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.5)",
    minWidth: "30px",
  },

  slider: {
    flex: 1,
    accentColor: "#37613C",
    cursor: "pointer",
  },

  playBtn: {
    alignSelf: "center" as const,
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    border: "none",
    background: "#37613C",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  spotifyLink: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    fontSize: "12px",
    color: "#37613C",
    textDecoration: "none",
    opacity: 0.85,
  },
};
