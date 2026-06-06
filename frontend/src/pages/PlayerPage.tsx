import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { decryptText } from "../utils/cryptoMood";


export default function PlayerPage() {
  const navigate = useNavigate();
  const location = useLocation(); // 取得從 HomePage 傳遞過來的 state
  const { pin } = useAuth(); // walletAddress 這裡其實可以不用了，因為 HomePage 抓資料時已經過濾過了

  // 1. 直接從 location.state 初始化 records 與 index，不再依賴 localStorage
  const [records] = useState<any[]>(() => {
    return location.state?.records || [];
  });

  const [index, setIndex] = useState(() => {
    const passedIndex = location.state?.currentIndex || 0;
    // 確保 index 不會超出陣列範圍
    return Math.max(0, Math.min(passedIndex, records.length - 1));
  });

  const [decryptedMood, setDecryptedMood] = useState("");
  const [canShowPlayer, setCanShowPlayer] = useState(false);

  const record = records[index];

  // 2. 防呆機制：如果沒有資料（例如使用者直接在網址列輸入 /player），將其導回首頁
  useEffect(() => {
    if (records.length === 0) {
      navigate("/home");
    }
  }, [records, navigate]);

  // 3. 解密邏輯 (這部分你原本寫得很好，幾乎不用動)
  useEffect(() => {
    setCanShowPlayer(false);

    if (!record) {
      setDecryptedMood("尚未有心情紀錄");
      return;
    }

    if (!pin) {
      alert("Please log in again");
      navigate("/login"); // 如果遺失 pin，強制導回登入頁
      return;
    }

    try {
      // 使用從區塊鏈抓下來的 encryptedMood 與 salt 進行解密
      const mood = decryptText(record.encryptedMood, pin, record.salt);
      setDecryptedMood(mood);
      setCanShowPlayer(true);
    } catch {
      setDecryptedMood("You are too shy.");
      setCanShowPlayer(false);
    }
  }, [record, pin, navigate]);

  // 如果正在導向首頁，不渲染畫面避免報錯閃爍
  if (records.length === 0) return null;

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

      {canShowPlayer && record && record.song && (
        <div style={styles.card}>
          <img src={record.song.cover} style={styles.image} alt="album cover" />
          <h2>{record.song.title}</h2>
          <p>{record.song.artist}</p>
        </div>
      )}
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