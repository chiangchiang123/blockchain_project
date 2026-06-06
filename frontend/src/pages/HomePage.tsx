import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pause, Play } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { encryptText } from "../utils/cryptoMood";
import { pickSong } from "../utils/pickSongs";
import { useWeb3Auth } from "@web3auth/modal/react";
import { createWalletClient, createPublicClient, custom, http, encodePacked, keccak256 } from 'viem';
import { hardhat } from 'viem/chains';
import { CONTRACT_ADDRESS, ABI } from "../config/contract";

export default function HomePage() {
  const [mood, setMood] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { encryptionKey, walletAddress } = useAuth();

  const { provider } = useWeb3Auth();

  const publicClient = createPublicClient({
    chain: hardhat,
    transport: http('http://127.0.0.1:8545')
  });

  async function goPlayer() {
    if (!encryptionKey || !walletAddress) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    if (!mood.trim()) return;

    try {
      setIsProcessing(true); // 開始上鏈，顯示 Loading

      // 1. 本地加密：用錢包簽名推導出的 key 加密
      const encrypted = encryptText(mood.trim(), encryptionKey);

      // 2. 將密文與 salt 打包成一個 JSON 字串準備上鏈
      const payloadString = JSON.stringify({
        encryptedMood: encrypted.encrypted,
        salt: encrypted.salt,
        song: pickSong() // 把當下抽到的歌也一起封存進區塊鏈！
      });

      if (!provider) {
        alert("Please connect wallet first.");
        return;
      }

      // 3. 建立寫入用的 Wallet Client
      const walletClient = createWalletClient({
        chain: hardhat,
        transport: custom(provider)
      });

      // 2. 讓使用者對這包資料進行數位簽章 (不會花費 Gas！)
      // 先計算 keccak256 hash，使結果為 32 bytes
      // 讓前端與合約的 toEthSignedMessageHash(keccak256(...)) 完全一致
      const messageHash = keccak256(
        encodePacked(
          ['address', 'string'],
          [walletAddress as `0x${string}`, payloadString]
        )
      );
      const signature = await walletClient.signMessage({
        account: walletAddress as `0x${string}`,
        message: { raw: messageHash }
      });

      // 3. 將資料丟給你的 FastAPI 後端，請它幫忙上鏈
      const response = await fetch("http://localhost:8000/api/relay-confession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress: walletAddress,
          content: payloadString,
          signature: signature
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `後端錯誤 ${response.status}`);
      }

      // 4. 上鏈成功，導向播放頁並帶入剛剛這筆紀錄
      const payload = JSON.parse(payloadString);
      navigate("/player", {
        state: {
          records: [payload],
          currentIndex: 0,
        },
      });
    } catch (error) {
      console.error("上鏈失敗:", error);
      alert(`上鏈失敗：${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  }

  async function goHistory() {
    if (!walletAddress) {
      alert("Please login first.");
      return;
    }

    try {
      setIsProcessing(true);

      // 1. 從區塊鏈讀取原始紀錄
      const rawRecords = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'getMyConfessions',
        account: walletAddress as `0x${string}`,
      });

      if ((rawRecords as any[]).length === 0) {
        alert("No mood records yet on the blockchain.");
        return;
      }

      // 2. 將區塊鏈上的 JSON 字串解析回物件陣列
      const parsedRecords = (rawRecords as any[]).map(record => {
        // 區塊鏈上的 encryptedContent 是我們上傳的 JSON.stringify 字串
        const data = JSON.parse(record.encryptedContent);
        return {
          ...data, // 包含 encryptedMood, salt, song
          timestamp: Number(record.timestamp) // 區塊鏈的時間戳記是 BigInt，轉回 Number
        };
      });

      // 3. 透過 React Router state 傳遞給 Player 頁面
      // 我們將整個陣列傳過去，並指定從最後一筆（最新）開始播放
      navigate("/player", {
        state: {
          records: parsedRecords,
          currentIndex: parsedRecords.length - 1
        }
      });

    } catch (error) {
      console.error("讀取歷史紀錄失敗:", error);
      alert("無法連接到區塊鏈讀取歷史紀錄");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Say it out loud</h1>

        <div style={styles.moodBar}>
          <button style={styles.iconBtn} onClick={goHistory} disabled={isProcessing}>
            <Pause size={24} />
          </button>

          <input
            value={isProcessing ? "Encrypting & Storing on Blockchain..." : mood}
            disabled={isProcessing}
            onChange={(e) => setMood(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && goPlayer()}
            style={styles.input}
          />

          <button style={styles.iconBtn} onClick={goPlayer} disabled={isProcessing}>
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