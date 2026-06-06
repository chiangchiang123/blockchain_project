import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3AuthConnect } from "@web3auth/modal/react";
import { createWalletClient, custom } from "viem";
import { hardhat } from "viem/chains";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { connect } = useWeb3AuthConnect();

  async function handleLogin() {
    try {
      setIsLoading(true);

      const connectedProvider = await connect();

      const accounts = await connectedProvider.request({ method: "eth_accounts" });
      const address = accounts[0];

      if (!address) {
        alert("Wallet address not found.");
        return;
      }

      const walletClient = createWalletClient({
        chain: hardhat,
        transport: custom(connectedProvider),
      });

      const signature = await walletClient.signMessage({
        account: address as `0x${string}`,
        message: "confession-encrypt-v1",
      });

      login(address, signature);
      navigate("/home");
    } catch (err) {
      console.error(err);
      alert("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Login</h1>

      <button style={styles.button} onClick={handleLogin} disabled={isLoading}>
        {isLoading ? "Connecting..." : "Connect Wallet"}
      </button>
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
};
