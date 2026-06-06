import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useWeb3AuthConnect,
  useWeb3Auth,
} from "@web3auth/modal/react";
import { useAuth } from "../context/AuthContext";
import { encryptText, decryptText } from "../utils/cryptoMood";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const { connect, isConnected } = useWeb3AuthConnect();
  const { provider } = useWeb3Auth();

  async function handleConnectWallet() {
    try {
      const connectedProvider = await connect();

      const accounts = await connectedProvider.request({
        method: "eth_accounts",
      });

      const address = accounts[0];

      console.log("我的完整錢包地址是：", address);

      if (!address) {
        alert("Wallet address not found.");
        return;
      }

      setWalletAddress(address);
    } catch (err) {
      console.error(err);
      alert("Wallet login failed.");
    }
  }
 

  function getPinVerifierKey(walletAddress: string) {
  return `pinVerifier:${walletAddress}`;
}

async function handleContinue() {
  if (!walletAddress|| !isConnected || !provider) {
    alert("Please connect wallet first.");
    return;
  }

  if (!pin.trim()) {
    alert("Please enter your PIN.");
    return;
  }

  const verifierKey = getPinVerifierKey(walletAddress);
  const savedVerifier = localStorage.getItem(verifierKey);
  //pin+salt=key
//pin被verify與wallet連結

  // 第一次使用這個 wallet：建立 PIN verifier
  if (!savedVerifier) {
    const verifier = encryptText("PIN_OK", pin);

    localStorage.setItem(
      verifierKey,
      JSON.stringify({
        encrypted: verifier.encrypted,
        salt: verifier.salt,
      })
    );

    login(walletAddress, pin);
    navigate("/home");
    return;
  }

  // 不是第一次：驗證 PIN
  try {
    const parsed = JSON.parse(savedVerifier);
    const result = decryptText(parsed.encrypted, pin, parsed.salt);

    if (result !== "PIN_OK") {
      alert("Wrong PIN.");
      return;
    }

    login(walletAddress, pin);
    navigate("/home");
  } catch {
    alert("Wrong PIN.");
  }
}

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Login</h1>

      {!walletAddress && (
        <button style={styles.button} onClick={handleConnectWallet}>
          Connect Wallet
        </button>
      )}

      {walletAddress && (
        <>
          <p style={styles.walletText}>
            Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>

          <input
            type="password"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={styles.input}
          />

          <button style={styles.button} onClick={handleContinue}>
            Continue
          </button>
        </>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: "100vw",
    height: "100vh",
    background: "#9EAD51",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "24px",
  },
  title: {
    color: "#6C5019",
    fontFamily: "Dokdo, cursive",
    fontSize: "96px",
    fontWeight: 400,
    margin: 0,
  },
  button: {
    padding: "14px 32px",
    borderRadius: "30px",
    border: "none",
    background: "rgba(255,255,255,0.8)",
    color: "#6C5019",
    fontSize: "18px",
    cursor: "pointer",
  },
  input: {
    width: "320px",
    height: "48px",
    borderRadius: "30px",
    border: "none",
    outline: "none",
    textAlign: "center",
    fontSize: "18px",
    color: "#6C5019",
    background: "rgba(255,255,255,0.8)",
  },
  walletText: {
    color: "#6C5019",
    fontSize: "18px",
  },
};