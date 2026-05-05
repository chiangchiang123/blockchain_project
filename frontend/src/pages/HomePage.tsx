import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pause, Play } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { encryptText } from "../utils/cryptoMood";
import { pickSong } from "../utils/pickSongs";

export default function HomePage() {
  const [mood, setMood] = useState("");
  const navigate = useNavigate();
  const { pin, walletAddress } = useAuth();

  function goPlayer() {
    if (!pin || !walletAddress) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    if (!mood.trim()) return;

    const encrypted = encryptText(mood.trim(), pin);

    const newRecord = {
    id: crypto.randomUUID(),
    walletAddress,
    encryptedMood: encrypted.encrypted,
    salt: encrypted.salt,
    song: pickSong(),
    createdAt: new Date().toISOString(),
    };

    const oldRecords = JSON.parse(localStorage.getItem("moodRecords") || "[]");
    const nextRecords = [...oldRecords, newRecord];

    localStorage.setItem("moodRecords", JSON.stringify(nextRecords));
    localStorage.setItem("currentMoodIndex", String(nextRecords.length - 1));

    navigate("/player");
  }

  function goHistory() {
  const records = JSON.parse(localStorage.getItem("moodRecords") || "[]");

  if (records.length === 0) {
    alert("No mood records yet.");
    return;
  }

  localStorage.setItem("currentMoodIndex", String(records.length - 1));
  navigate("/player");
}

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Say it out loud</h1>

        <div style={styles.moodBar}>
          <button style={styles.iconBtn} onClick={goHistory}>
            <Pause size={24} />
          </button>

          <input
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && goPlayer()}
            style={styles.input}
          />

          <button style={styles.iconBtn} onClick={goPlayer}>
            <Play size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
  position: "fixed",
  inset: 0,
  width: "100vw",
  height: "100vh",
  background: "#9EAD51",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
},
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "40px",
  },
  title: {
    color: "#6C5019",
    fontFamily: "Dokdo, cursive",
    fontSize: "128px",
    fontWeight: 400,
    textAlign: "center",
    lineHeight: 1,
  },
  moodBar: {
    width: "725px",
    padding: "15px 10px 14px 15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "rgba(255, 255, 255, 0.8)",
    borderRadius: "30px",
  },
  input: {
    flex: 1,
    margin: "0 10px",
    border: "none",
    outline: "none",
    textAlign: "center",
    fontSize: "20px",
    color: "#6C5019",
    backgroundColor: "transparent",
    // backgroundImage:
    //   "linear-gradient(#F4CFCF 1px, transparent 1px), linear-gradient(90deg, #F4CFCF 1px, transparent 1px)",
    backgroundSize: "12px 12px",
  },

  pinInput: {
  width: "320px",
  height: "42px",
  border: "none",
  borderRadius: "24px",
  padding: "0 18px",
  textAlign: "center",
  outline: "none",
  background: "rgba(255,255,255,0.65)",
  color: "#6C5019",
  fontSize: "16px",
},
  iconBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "#6C5019",
  },
};