import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, Pause, ExternalLink } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { decryptText } from "../utils/cryptoMood";
import { formatDate } from "../utils/formatDate";

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

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const record = records[index];

  useEffect(() => {
    if (records.length === 0) navigate("/home");
  }, [records, navigate]);

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

      {/* ── 上方：告解文字區 ── */}
      <div style={styles.textArea}>
        {/* 左右切換 */}
        <button
          onClick={() => setIndex(i => Math.max(i - 1, 0))}
          style={styles.navBtn("left")}
          disabled={index === 0}
        >
          <ChevronLeft size={32} />
        </button>

        {record?.timestamp && (
          <div style={styles.dateLabel}>{formatDate(record.timestamp)}</div>
        )}
        <p style={styles.confessionText}>{decryptedMood}</p>

        <button
          onClick={() => setIndex(i => Math.min(i + 1, records.length - 1))}
          style={styles.navBtn("right")}
          disabled={index === records.length - 1}
        >
          <ChevronRight size={32} />
        </button>
      </div>

      {/* ── 下方：播放器 bar ── */}
      {canShowPlayer && song && (
        <div style={styles.playerBar}>
          {/* 封面 */}
          <img src={song.cover} alt={song.album} style={styles.cover} />

          {/* 歌曲資訊 */}
          <div style={styles.meta}>
            <div style={styles.songTitle}>{song.title}</div>
            <div style={styles.songArtist}>{song.artist}</div>
          </div>

          {/* 進度條 + 時間 */}
          <div style={styles.progressArea}>
            <div style={styles.timeRow}>
              <span style={styles.time}>{formatTime(audioRef.current?.currentTime ?? 0)}</span>
              <span style={styles.time}>{formatTime(duration)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={handleSeek}
              style={styles.slider}
            />
          </div>

          {/* 播放鍵 */}
          <button onClick={togglePlay} style={styles.playBtn}>
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          {/* Spotify 連結 */}
          {song.spotifyUrl && (
            <a
              href={song.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.spotifyLink}
              title="在 Spotify 收聽"
            >
              <ExternalLink size={18} />
            </a>
          )}

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
    flexDirection: "column" as const,
    overflow: "hidden",
  },

  // 上方文字區：佔滿剩餘高度
  textArea: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative" as const,
    padding: "80px 160px",
  },

  dateLabel: {
    position: "absolute" as const,
    top: "28px",
    left: "50%",
    transform: "translateX(-50%)",
    color: "rgba(255,255,255,0.4)",
    fontSize: "13px",
    letterSpacing: "0.08em",
    whiteSpace: "nowrap" as const,
  },

  confessionText: {
    color: "#FFFFFF",
    opacity: 0.88,
    fontFamily: '"DM Serif Text", serif',
    fontSize: "clamp(28px, 4vw, 64px)",
    fontWeight: 400,
    lineHeight: 1.5,
    textAlign: "center" as const,
    maxWidth: "820px",
    margin: 0,
    wordBreak: "break-word" as const,
  },

  navBtn: (side: "left" | "right"): React.CSSProperties => ({
    position: "absolute",
    [side]: "40px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(98, 73, 23, 0.6)",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "opacity 0.2s",
  }),

  // 下方播放器 bar
  playerBar: {
    height: "90px",
    background: "rgba(10, 8, 4, 0.6)",
    backdropFilter: "blur(20px)",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    padding: "0 28px",
    gap: "20px",
    flexShrink: 0,
  },

  cover: {
    width: "58px",
    height: "58px",
    borderRadius: "8px",
    objectFit: "cover" as const,
    flexShrink: 0,
  },

  meta: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "3px",
    minWidth: "140px",
  },

  songTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#fff",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "160px",
  },

  songArtist: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.55)",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "160px",
  },

  progressArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    gap: "4px",
  },

  timeRow: {
    display: "flex",
    justifyContent: "space-between",
  },

  time: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.4)",
  },

  slider: {
    width: "100%",
    accentColor: "#37613C",
    cursor: "pointer",
  },

  playBtn: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    border: "none",
    background: "#37613C",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  spotifyLink: {
    color: "rgba(255,255,255,0.45)",
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    flexShrink: 0,
    transition: "color 0.2s",
  },
};
