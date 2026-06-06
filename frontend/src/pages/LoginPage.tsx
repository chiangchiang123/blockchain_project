import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3AuthConnect, useWeb3Auth } from "@web3auth/modal/react";
import { createWalletClient, custom } from "viem";
import { hardhat } from "viem/chains";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);

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

  async function handleContinue() {
    if (!walletAddress || !isConnected || !provider) {
      alert("Please connect wallet first.");
      return;
    }

    try {
      setIsSigning(true);

      // 使用固定訊息，讓同一個錢包在任何裝置都能推導出相同的簽名
      // RFC 6979 確定性 ECDSA：相同私鑰 + 相同訊息 = 相同簽名
      const walletClient = createWalletClient({
        chain: hardhat,
        transport: custom(provider),
      });

      const signature = await walletClient.signMessage({
        account: walletAddress as `0x${string}`,
        message: "confession-encrypt-v1",
      });

      // signature 就是加密 key 的來源，不需要儲存在任何地方
      login(walletAddress, signature);
      navigate("/home");
    } catch (err) {
      console.error(err);
      alert("Signing failed. Please try again.");
    } finally {
      setIsSigning(false);
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

          <button style={styles.button} onClick={handleContinue} disabled={isSigning}>
            {isSigning ? "Signing..." : "Continue"}
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
  walletText: {
    color: "#6C5019",
    fontSize: "18px",
  },
};
