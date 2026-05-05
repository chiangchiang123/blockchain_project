import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { decryptText } from "../utils/cryptoMood";


export default function PlayerPage() {
  const navigate = useNavigate();
  const {  pin, walletAddress } = useAuth();

  const [records] = useState(() => {
  const data = JSON.parse(localStorage.getItem("moodRecords") || "[]");

  return data.filter((record: any) => {
    return (
      record.walletAddress === walletAddress &&
      record.encryptedMood &&
      record.salt &&
      record.song
    );
  });
});

  const [index, setIndex] = useState(() => {
  const savedIndex = Number(localStorage.getItem("currentMoodIndex") || 0);
  return Math.max(0, Math.min(savedIndex, records.length - 1));
});

  const [decryptedMood, setDecryptedMood] = useState("");
  const [canShowPlayer, setCanShowPlayer] = useState(false);

  const record = records[index];

  useEffect(() => {
  setCanShowPlayer(false);

  if (!record) {
    setDecryptedMood("尚未有心情紀錄");
    return;
  }

  if (!pin) {
    alert("please log in again");
    return;
  }

//   if (!record.encryptedMood || !record.salt) {
//     setDecryptedMood("這筆紀錄沒有內容");
//     return;
//   }

  try {
    const mood = decryptText(record.encryptedMood, pin, record.salt);
    setDecryptedMood(mood);
    setCanShowPlayer(true);
  } catch {
    setDecryptedMood("You are too shy.");
    setCanShowPlayer(false);
  }
}, [record, pin]);

  return (
    <div style={styles.container}>
      <div style={styles.backgroundText}>
        {decryptedMood}
      </div>

      <button
        onClick={() => setIndex((i) => Math.max(i - 1, 0))}
        style={styles.leftBtn}
      >
        <ChevronLeft size={40} />
      </button>

      <button
        onClick={() => setIndex((i) => Math.min(i + 1, records.length - 1))}
        style={styles.rightBtn}
      >
        <ChevronRight size={40} />
      </button>

      {canShowPlayer && record && (
        <div style={styles.card}>
        <img src={record.song.cover} style={styles.image} />
        <h2>{record.song.title}</h2>
        <p>{record.song.artist}</p>
    </div>
)}

      {/* <div style={styles.card}>
        <img src={record.song.cover} style={styles.image} />
        <h2>{record.song.title}</h2>
        <p>{record.song.artist}</p>
      </div> */}
    </div>
  );
}


const styles: { [key: string]: React.CSSProperties } = {
  emptyPage: {
    width: "100%",
    height: "100vh",
    background: "#624917",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    width: "100%",
    height: "100vh",
    background: "#624917",
    position: "fixed",
    inset:0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  topLeft: {
    position: "absolute",
    top: "30px",
    left: "40px",
    fontSize: "28px",
    color: "#fff",
  },

  topRight: {
    position: "absolute",
    top: "30px",
    right: "40px",
    fontSize: "28px",
    color: "#fff",
  },

  backgroundText: {
    position: "absolute",
    width: "1137px",
    color: "#FFFFFF",
    opacity: 0.3,
    fontFamily: '"DM Serif Text", serif',
    fontSize: "128px",
    fontWeight: 400,
    lineHeight: "100px",
    textAlign: "center",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
  },

  leftBtn: {
    position: "absolute",
    left: "180px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(98, 73, 23, 0.7)",
    color: "#fff",
    cursor: "pointer",
  },

  rightBtn: {
    position: "absolute",
    right: "180px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(98, 73, 23, 0.7)",
    color: "#fff",
    cursor: "pointer",
  },

  card: {
    width: "260px",
    background: "#555",
    padding: "16px",
    borderRadius: "16px",
    color: "#fff",
    zIndex: 2,
    boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
  },

  image: {
    width: "100%",
    borderRadius: "10px",
    marginBottom: "10px",
  },

  title: {
    fontSize: "18px",
    fontWeight: "bold",
  },

  artist: {
    fontSize: "14px",
    opacity: 0.7,
  },

  spotify: {
    marginTop: "10px",
    fontSize: "12px",
    opacity: 0.5,
  },
};